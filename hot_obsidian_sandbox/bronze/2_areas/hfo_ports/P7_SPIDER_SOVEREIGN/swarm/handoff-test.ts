/**
 * HFO Sequential Handoff Test
 * 
 * Compares:
 * - HFO:0 (8^0 = 1 agent) - single model evaluation
 * - HFO/8:00 (1→1 sequential) - model A generates, model B refines
 * 
 * Tests if 1+1 sequential handoff improves over single agent.
 */

import { chat, ChatMessage, MAP_ELITE_TIER1 } from '../runner/model-client';
import { h0Sense } from '../harnesses/h0-sense';
import { h4Disrupt } from '../harnesses/h4-disrupt';
import { h7Decide } from '../harnesses/h7-decide';
import { 
  sotaSimpleQA, 
  sotaGSM8K, 
  sotaGPQA, 
  sotaHumanEval, 
  sotaBBH 
} from '../harnesses/sota-benchmarks';
import {
  hleMath,
  hlePhysics,
  hleChemistry,
  hleCS,
  hleBiology,
  hleHard,
} from '../harnesses/hle-hard';
import { Harness } from '../harnesses/harness.interface';
import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

// Harness selection - includes SOTA benchmarks for harder tests
const HARNESSES: Record<string, Harness> = {
  // Original HFO harnesses
  sense: h0Sense,
  disrupt: h4Disrupt,
  decide: h7Decide,
  // SOTA benchmarks (harder, more differentiation)
  simpleqa: sotaSimpleQA,
  gsm8k: sotaGSM8K,
  gpqa: sotaGPQA,
  humaneval: sotaHumanEval,
  bbh: sotaBBH,
  // HLE benchmarks (HARDEST - models score <10%)
  hle_math: hleMath,
  hle_physics: hlePhysics,
  hle_chemistry: hleChemistry,
  hle_cs: hleCS,
  hle_biology: hleBiology,
  hle: hleHard,
};

const HANDOFF_LOG = './audit/handoff-test.jsonl';

interface HandoffResult {
  pattern: 'HFO:0' | 'HFO/8:00';
  model_a: string;
  model_b?: string;
  prompt_idx: number;
  question: string;
  expected: string;
  response_a: string;
  response_b?: string;
  final_response: string;
  score: number;
  duration_ms: number;
}

function log(entry: object): void {
  const dir = dirname(HANDOFF_LOG);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  appendFileSync(HANDOFF_LOG, JSON.stringify({ ts: new Date().toISOString(), ...entry }) + '\n');
}

/**
 * HFO:0 - Single agent (8^0 = 1)
 */
async function runSingleAgent(model: string, promptIdx: number, harness: Harness): Promise<HandoffResult> {
  const p = harness.prompts[promptIdx];
  const start = Date.now();
  
  const msgs: ChatMessage[] = [
    { role: 'system', content: p.system },
    { role: 'user', content: p.user },
  ];
  
  const { response } = await chat(model, msgs);
  const score = harness.score(response, p.expected);
  
  const result: HandoffResult = {
    pattern: 'HFO:0',
    model_a: model,
    prompt_idx: promptIdx,
    question: p.user,
    expected: p.expected,
    response_a: response,
    final_response: response,
    score,
    duration_ms: Date.now() - start,
  };
  
  log(result);
  return result;
}

/**
 * HFO/8:00 - Sequential handoff (1→1)
 * Model A generates initial answer, Model B refines it
 */
async function runSequentialHandoff(
  modelA: string,
  modelB: string,
  promptIdx: number,
  harness: Harness
): Promise<HandoffResult> {
  const p = harness.prompts[promptIdx];
  const start = Date.now();
  
  // Stage 1: Model A generates initial answer
  const msgsA: ChatMessage[] = [
    { role: 'system', content: p.system },
    { role: 'user', content: p.user },
  ];
  const { response: responseA } = await chat(modelA, msgsA);
  
  // Stage 2: Model B refines the answer
  const msgsB: ChatMessage[] = [
    { role: 'system', content: 'You are a fact-checker. Review the previous answer and provide the correct answer. Be brief.' },
    { role: 'user', content: `Question: ${p.user}\n\nPrevious answer: ${responseA}\n\nProvide the correct answer:` },
  ];
  const { response: responseB } = await chat(modelB, msgsB);
  
  const score = harness.score(responseB, p.expected);
  
  const result: HandoffResult = {
    pattern: 'HFO/8:00',
    model_a: modelA,
    model_b: modelB,
    prompt_idx: promptIdx,
    question: p.user,
    expected: p.expected,
    response_a: responseA,
    response_b: responseB,
    final_response: responseB,
    score,
    duration_ms: Date.now() - start,
  };
  
  log(result);
  return result;
}

interface ComparisonResult {
  model_a: string;
  model_b: string;
  single_score: number;
  handoff_score: number;
  improvement: number;
  single_ms: number;
  handoff_ms: number;
}

/**
 * Compare single agent vs sequential handoff for a model pair
 */
async function comparePatterns(
  modelA: string,
  modelB: string,
  promptIdx: number,
  harness: Harness
): Promise<ComparisonResult> {
  console.log(`\n  Testing prompt ${promptIdx}: "${harness.prompts[promptIdx].user.slice(0, 40)}..."`);
  
  // Run single agent (model A only)
  const single = await runSingleAgent(modelA, promptIdx, harness);
  console.log(`    HFO:0    (${modelA.split('/')[1]?.slice(0, 15) || modelA}): ${single.score}/10`);
  
  // Run sequential handoff (A → B)
  const handoff = await runSequentialHandoff(modelA, modelB, promptIdx, harness);
  console.log(`    HFO/8:00 (${modelA.split('/')[1]?.slice(0, 8) || modelA}→${modelB.split('/')[1]?.slice(0, 8) || modelB}): ${handoff.score}/10`);
  
  const improvement = handoff.score - single.score;
  const sign = improvement > 0 ? '+' : '';
  console.log(`    Δ = ${sign}${improvement}`);
  
  return {
    model_a: modelA,
    model_b: modelB,
    single_score: single.score,
    handoff_score: handoff.score,
    improvement,
    single_ms: single.duration_ms,
    handoff_ms: handoff.duration_ms,
  };
}

/**
 * Run full handoff test across TIER1 models
 */
export async function runHandoffTest(
  models: string[] = [...MAP_ELITE_TIER1].slice(0, 4),
  harnessName: string = 'disrupt'
): Promise<void> {
  const harness = HARNESSES[harnessName] || h4Disrupt;
  
  console.log('\n' + '═'.repeat(70));
  console.log('🔄 HFO SEQUENTIAL HANDOFF TEST');
  console.log(`   Harness: ${harness.name} (${harnessName})`);
  console.log('   Comparing HFO:0 (1 agent) vs HFO/8:00 (1→1 handoff)');
  console.log('═'.repeat(70));
  
  const results: ComparisonResult[] = [];
  const t0 = Date.now();
  
  // Test each model pair (A→B where A≠B)
  for (let i = 0; i < models.length; i++) {
    for (let j = 0; j < models.length; j++) {
      if (i === j) continue; // Skip same model
      
      const modelA = models[i];
      const modelB = models[j];
      
      console.log(`\n📊 ${modelA.split('/')[1] || modelA} → ${modelB.split('/')[1] || modelB}`);
      
      // Test on first 3 prompts for speed
      for (let p = 0; p < Math.min(3, harness.prompts.length); p++) {
        try {
          const result = await comparePatterns(modelA, modelB, p, harness);
          results.push(result);
        } catch (err) {
          console.error(`    ❌ Error: ${err}`);
        }
      }
    }
  }
  
  // Summary
  console.log('\n' + '═'.repeat(70));
  console.log('📈 SUMMARY');
  console.log('═'.repeat(70));
  
  const avgImprovement = results.reduce((s, r) => s + r.improvement, 0) / results.length;
  const improved = results.filter(r => r.improvement > 0).length;
  const same = results.filter(r => r.improvement === 0).length;
  const worse = results.filter(r => r.improvement < 0).length;
  
  console.log(`\nTotal comparisons: ${results.length}`);
  console.log(`  ✅ Improved: ${improved} (${(improved/results.length*100).toFixed(1)}%)`);
  console.log(`  ➖ Same:     ${same} (${(same/results.length*100).toFixed(1)}%)`);
  console.log(`  ❌ Worse:    ${worse} (${(worse/results.length*100).toFixed(1)}%)`);
  console.log(`\nAverage improvement: ${avgImprovement > 0 ? '+' : ''}${avgImprovement.toFixed(2)} points`);
  
  // Best handoff pairs
  const byPair = new Map<string, number[]>();
  for (const r of results) {
    const key = `${r.model_a} → ${r.model_b}`;
    if (!byPair.has(key)) byPair.set(key, []);
    byPair.get(key)!.push(r.improvement);
  }
  
  const pairAvgs = [...byPair.entries()].map(([pair, imps]) => ({
    pair,
    avg: imps.reduce((a, b) => a + b, 0) / imps.length,
  })).sort((a, b) => b.avg - a.avg);
  
  console.log('\n🏆 Best handoff pairs:');
  pairAvgs.slice(0, 5).forEach((p, i) => {
    const sign = p.avg > 0 ? '+' : '';
    console.log(`  ${i + 1}. ${p.pair}: ${sign}${p.avg.toFixed(2)}`);
  });
  
  console.log('\n💀 Worst handoff pairs:');
  pairAvgs.slice(-3).forEach((p, i) => {
    const sign = p.avg > 0 ? '+' : '';
    console.log(`  ${pairAvgs.length - 2 + i}. ${p.pair}: ${sign}${p.avg.toFixed(2)}`);
  });
  
  console.log(`\nTotal time: ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  console.log(`Results logged to: ${HANDOFF_LOG}`);
}

// CLI entry
if (process.argv[1]?.includes('handoff-test')) {
  // Parse args: handoff-test [harness] [model1] [model2] ...
  const args = process.argv.slice(2);
  let harness = 'disrupt';
  let models: string[] = [];
  
  for (const arg of args) {
    if (HARNESSES[arg]) {
      harness = arg;
    } else {
      models.push(arg);
    }
  }
  
  runHandoffTest(models.length > 0 ? models : undefined, harness)
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}
