/**
 * MAP-ELITE Evaluation Runner - High Concurrency (Powers of 8)
 */

import { ALL_HARNESSES, Harness } from '../harnesses';
import { HarnessResult } from '../schemas';
import { appendToLedger } from '../ledger/eval-ledger';
import { computeFitness, FitnessReport } from '../fitness/compute-fitness';
import { chat, ChatMessage, detectProvider, ModelProvider } from './model-client';
import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

const DEFAULT_LEDGER = './ollama_eval_ledger.jsonl';
const DEFAULT_AUDIT = './audit/eval-audit.jsonl';

// Powers of 8 concurrency
const CONCURRENCY = { ollama: 8, openrouter: 8 };

export interface EvalOptions {
  model: string;
  ledgerPath?: string;
  auditPath?: string;
  verbose?: boolean;
}

interface PromptResult {
  idx: number;
  score: number;
  ms: number;
  ok: boolean;
}

function audit(path: string, entry: object): void {
  const dir = dirname(path);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  appendFileSync(path, JSON.stringify({ ts: new Date().toISOString(), ...entry }) + '\n');
}

class Semaphore {
  private permits: number;
  private queue: (() => void)[] = [];
  constructor(n: number) { this.permits = n; }
  async acquire() {
    if (this.permits > 0) { this.permits--; return; }
    await new Promise<void>(r => this.queue.push(r));
  }
  release() {
    if (this.queue.length) this.queue.shift()!();
    else this.permits++;
  }
}

async function runPrompt(
  h: Harness, idx: number, model: string, sem: Semaphore, audit_path: string, verbose: boolean
): Promise<PromptResult> {
  const p = h.prompts[idx];
  const start = Date.now();
  await sem.acquire();
  
  try {
    const msgs: ChatMessage[] = [
      { role: 'system', content: p.system },
      { role: 'user', content: p.user },
    ];
    const { response } = await chat(model, msgs);
    const score = h.score(response, p.expected);
    const ms = Date.now() - start;
    
    if (verbose) console.log(`  ✓ [${h.name}:${idx}] ${score}/10 (${ms}ms)`);
    audit(audit_path, { e: 'prompt', model, h: h.id, idx, score, ms });
    return { idx, score, ms, ok: true };
  } catch (err) {
    const ms = Date.now() - start;
    if (verbose) console.log(`  ✗ [${h.name}:${idx}] ERR`);
    audit(audit_path, { e: 'err', model, h: h.id, idx, ms, err: String(err) });
    return { idx, score: 0, ms, ok: false };
  } finally {
    sem.release();
  }
}

async function runHarness(
  h: Harness, model: string, sem: Semaphore, audit_path: string, verbose: boolean
): Promise<{ id: number; name: string; score: number; ms: number; results: PromptResult[] }> {
  const start = Date.now();
  
  // Run all prompts concurrently
  const results = await Promise.all(
    h.prompts.map((_, i) => runPrompt(h, i, model, sem, audit_path, verbose))
  );
  
  const total = results.reduce((s, r) => s + r.score, 0);
  const max = h.prompts.length * 10;
  const score = max > 0 ? total / max : 0;
  const ms = Date.now() - start;
  
  audit(audit_path, { e: 'harness', model, h: h.id, name: h.name, score, ms });
  return { id: h.id, name: h.name, score, ms, results };
}

export async function runEvaluation(opts: EvalOptions): Promise<FitnessReport> {
  const { model, ledgerPath = DEFAULT_LEDGER, auditPath = DEFAULT_AUDIT, verbose = true } = opts;
  const provider = detectProvider(model);
  const sem = new Semaphore(CONCURRENCY[provider]);

  console.log(`\n🎯 ${model} | ${provider.toUpperCase()} | concurrency=${CONCURRENCY[provider]}`);
  console.log('═'.repeat(60));

  const t0 = Date.now();
  audit(auditPath, { e: 'start', model, provider });

  // Run ALL 8 harnesses concurrently
  const harnessResults = await Promise.all(
    ALL_HARNESSES.map(h => runHarness(h, model, sem, auditPath, verbose))
  );
  harnessResults.sort((a, b) => a.id - b.id);

  const totalMs = Date.now() - t0;

  // Log to ledger
  const ledgerResults: HarnessResult[] = harnessResults.map(r =>
    appendToLedger(ledgerPath, {
      harness_id: r.id,
      harness_name: r.name,
      model,
      scores: { raw: r.results.reduce((s, p) => s + p.score, 0), normalized: r.score },
      timestamp: new Date().toISOString(),
      duration_ms: r.ms,
    })
  );

  const report = computeFitness(ledgerResults);
  audit(auditPath, { e: 'done', model, fitness: report.fitness, ms: totalMs });

  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log(`📊 ${model}`);
  console.log(`   Fitness: ${(report.fitness * 100).toFixed(1)}% | Time: ${(totalMs/1000).toFixed(1)}s`);
  console.log('');
  for (const r of harnessResults) {
    const bar = '█'.repeat(Math.round(r.score * 10)) + '░'.repeat(10 - Math.round(r.score * 10));
    const ok = r.results.filter(p => p.ok).length;
    console.log(`   ${r.name.padEnd(10)} ${bar} ${(r.score*100).toFixed(0).padStart(3)}% (${ok}/${r.results.length})`);
  }

  return report;
}

export async function runBatch(
  models: string[],
  opts: Omit<EvalOptions, 'model'> = {}
): Promise<Map<string, FitnessReport>> {
  const results = new Map<string, FitnessReport>();
  
  console.log(`\n🚀 BATCH: ${models.length} models`);
  console.log('═'.repeat(60));
  
  const t0 = Date.now();

  for (const model of models) {
    try {
      const report = await runEvaluation({ ...opts, model, verbose: false });
      results.set(model, report);
    } catch (err) {
      console.error(`❌ ${model}: ${err}`);
    }
  }

  // Rankings
  console.log('\n' + '═'.repeat(60));
  console.log('🏆 RANKINGS');
  console.log('═'.repeat(60));
  
  const sorted = [...results.entries()].sort((a, b) => b[1].fitness - a[1].fitness);
  sorted.forEach(([m, r], i) => {
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '  ';
    console.log(`${medal} ${(i+1).toString().padStart(2)}. ${m.padEnd(35)} ${(r.fitness*100).toFixed(1)}%`);
  });

  console.log(`\nTotal: ${((Date.now()-t0)/1000).toFixed(1)}s`);
  return results;
}
