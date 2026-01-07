/**
 * HIVE/8:10 - Atomic Scatter-Gather Pattern
 * 
 * :01 = Scatter (1→8) - fan out to 8 parallel workers
 * :10 = Gather (8→1) - aggregate 8 responses into 1 via majority vote
 * 
 * Hypothesis: Multi-model BFT consensus > single agent at 8× cheap cost
 */

import { config } from 'dotenv';
import { resolve, dirname as pathDirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = pathDirname(__filename);
config({ path: resolve(__dirname, '../../../../.env') });

import { chat, ChatMessage, MAP_ELITE_TIER1, MAP_ELITE_TIER2 } from '../runner/model-client';
import { Harness } from '../harnesses/harness.interface';
import { hleMath } from '../harnesses/hle-hard';
import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

const HIVE_LOG = './audit/hive-10.jsonl';

// 8 diverse model families for BFT
const HIVE_8_MODELS = [
  'google/gemma-3n-e4b-it',           // Google
  'meta-llama/llama-3.2-3b-instruct', // Meta
  'qwen/qwen-2.5-7b-instruct',        // Alibaba
  'mistralai/mistral-7b-instruct',    // Mistral
  'microsoft/phi-3-mini-128k-instruct', // Microsoft
  'deepseek/deepseek-chat',           // DeepSeek
  'nvidia/llama-3.1-nemotron-nano-8b-v1', // Nvidia
  'cohere/command-r7b-12-2024',       // Cohere
];

interface HiveResult {
  pattern: string;
  prompt_idx: number;
  question: string;
  expected: string;
  responses: { model: string; response: string; score: number }[];
  consensus: string;
  consensus_score: number;
  agreement_ratio: number;
  duration_ms: number;
}

function log(entry: object): void {
  const dir = dirname(HIVE_LOG);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  appendFileSync(HIVE_LOG, JSON.stringify({ ts: new Date().toISOString(), ...entry }) + '\n');
}

/**
 * :01 Scatter - Fan out to 8 models in parallel
 */
async function scatter(
  models: string[],
  prompt: { system: string; user: string }
): Promise<{ model: string; response: string }[]> {
  const msgs: ChatMessage[] = [
    { role: 'system', content: prompt.system },
    { role: 'user', content: prompt.user },
  ];
  
  const results = await Promise.all(
    models.map(async (model) => {
      try {
        const { response } = await chat(model, msgs);
        return { model, response };
      } catch (err) {
        console.error(`  ❌ ${model}: ${err}`);
        return { model, response: 'ERROR' };
      }
    })
  );
  
  return results;
}

/**
 * :10 Gather - Aggregate 8 responses via majority vote
 */
function gather(
  responses: { model: string; response: string }[],
  harness: Harness,
  expected: string
): { consensus: string; scores: number[]; agreement: number } {
  // Score each response
  const scored = responses.map(r => ({
    ...r,
    score: harness.score(r.response, expected),
  }));
  
  // Find majority answer (by normalized response)
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20);
  const votes = new Map<string, { count: number; original: string; score: number }>();
  
  for (const r of scored) {
    const key = normalize(r.response);
    if (!votes.has(key)) {
      votes.set(key, { count: 0, original: r.response, score: r.score });
    }
    votes.get(key)!.count++;
  }
  
  // Get majority
  const sorted = [...votes.values()].sort((a, b) => b.count - a.count);
  const majority = sorted[0];
  
  return {
    consensus: majority.original,
    scores: scored.map(s => s.score),
    agreement: majority.count / responses.length,
  };
}

/**
 * HIVE/8:10 - Full scatter-gather pattern
 */
async function runHive10(
  promptIdx: number,
  harness: Harness,
  models: string[] = HIVE_8_MODELS
): Promise<HiveResult> {
  const p = harness.prompts[promptIdx];
  const start = Date.now();
  
  console.log(`\n🐝 HIVE/8:10 - Prompt ${promptIdx}`);
  console.log(`   Q: "${p.user.slice(0, 60)}..."`);
  console.log(`   Expected: ${p.expected}`);
  
  // :01 Scatter
  console.log(`\n   :01 Scatter → ${models.length} models...`);
  const scattered = await scatter(models, p);
  
  // :10 Gather
  console.log(`   :10 Gather → majority vote...`);
  const { consensus, scores, agreement } = gather(scattered, harness, p.expected);
  
  // Score consensus
  const consensusScore = harness.score(consensus, p.expected);
  
  // Log individual responses
  console.log(`\n   Responses:`);
  scattered.forEach((r, i) => {
    const short = r.model.split('/')[1]?.slice(0, 15) || r.model;
    const score = scores[i];
    const mark = score > 0 ? '✅' : '❌';
    console.log(`     ${mark} ${short}: "${r.response.slice(0, 30)}..." (${score}/10)`);
  });
  
  console.log(`\n   📊 Consensus: "${consensus.slice(0, 40)}..."`);
  console.log(`   📊 Agreement: ${(agreement * 100).toFixed(0)}% (${Math.round(agreement * models.length)}/${models.length})`);
  console.log(`   📊 Score: ${consensusScore}/10`);
  
  const result: HiveResult = {
    pattern: 'HIVE/8:10',
    prompt_idx: promptIdx,
    question: p.user,
    expected: p.expected,
    responses: scattered.map((r, i) => ({ ...r, score: scores[i] })),
    consensus,
    consensus_score: consensusScore,
    agreement_ratio: agreement,
    duration_ms: Date.now() - start,
  };
  
  log(result);
  return result;
}

/**
 * Compare single agent vs HIVE/8:10
 */
async function compareSingleVsHive(
  promptIdx: number,
  harness: Harness,
  singleModel: string = 'google/gemma-3n-e4b-it'
): Promise<void> {
  const p = harness.prompts[promptIdx];
  
  console.log('\n' + '═'.repeat(60));
  console.log('🔬 SINGLE vs HIVE/8:10 COMPARISON');
  console.log('═'.repeat(60));
  
  // Single agent
  console.log(`\n📍 Single Agent (${singleModel.split('/')[1]})`);
  const msgs: ChatMessage[] = [
    { role: 'system', content: p.system },
    { role: 'user', content: p.user },
  ];
  const { response: singleResp } = await chat(singleModel, msgs);
  const singleScore = harness.score(singleResp, p.expected);
  console.log(`   Response: "${singleResp.slice(0, 40)}..."`);
  console.log(`   Score: ${singleScore}/10`);
  
  // HIVE/8:10
  const hiveResult = await runHive10(promptIdx, harness);
  
  // Summary
  console.log('\n' + '─'.repeat(60));
  console.log('📈 RESULT');
  console.log('─'.repeat(60));
  console.log(`   Single:    ${singleScore}/10`);
  console.log(`   HIVE/8:10: ${hiveResult.consensus_score}/10`);
  const delta = hiveResult.consensus_score - singleScore;
  console.log(`   Δ = ${delta > 0 ? '+' : ''}${delta}`);
  console.log(`   Agreement: ${(hiveResult.agreement_ratio * 100).toFixed(0)}%`);
}

// CLI entry
if (process.argv[1]?.includes('hive-10')) {
  const promptIdx = parseInt(process.argv[2] || '0');
  
  console.log('\n🐝 HIVE/8:10 Atomic Pattern Test');
  console.log('   Testing BFT consensus vs single agent');
  console.log('   Harness: HLE_MATH (HARD - models score <10%)');
  
  compareSingleVsHive(promptIdx, hleMath)
    .then(() => {
      console.log('\n✅ Test complete');
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Error:', err);
      process.exit(1);
    });
}

export { runHive10, compareSingleVsHive, scatter, gather, HIVE_8_MODELS };
