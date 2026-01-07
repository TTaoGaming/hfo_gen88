/**
 * HIVE/8:10 - Atomic Scatter-Gather Pattern with Proposer-Critique
 * 
 * :01 = Scatter (18) - fan out to 8 parallel workers
 * :10 = Gather (81) - aggregate via proposer-critique pattern
 * 
 * Hypothesis: Multi-model BFT consensus > single agent at 8 cheap cost
 */

import { config } from 'dotenv';
import { resolve, dirname as pathDirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = pathDirname(__filename);
config({ path: resolve(__dirname, '../../../../.env') });

import { chat, ChatMessage } from '../runner/model-client';
import { Harness } from '../harnesses/harness.interface';
import { hleMath } from '../harnesses/hle-hard';
import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

const HIVE_LOG = './audit/hive-10.jsonl';

// 8 models from 4 families (2x each for BFT redundancy)
// Budget-friendly: all <$0.10/M tokens
const HIVE_8_MODELS = [
  // Google family (2x)
  'google/gemma-3n-e4b-it',           // $0.02/M
  'google/gemma-2-9b-it',             // $0.06/M
  // Meta family (2x)
  'meta-llama/llama-3.2-3b-instruct', // $0.02/M
  'meta-llama/llama-3.1-8b-instruct', // $0.06/M
  // Qwen/Alibaba family (2x)
  'qwen/qwen-2.5-7b-instruct',        // $0.03/M
  'qwen/qwen-2.5-32b-instruct',       // $0.08/M
  // DeepSeek + Mistral family (2x)
  'deepseek/deepseek-chat',           // $0.07/M
  'mistralai/mistral-7b-instruct',    // $0.03/M
];
interface HiveResult {
  pattern: string;
  prompt_idx: number;
  question: string;
  expected: string;
  responses: { model: string; response: string; score: number; confidence: number }[];
  consensus: string;
  consensus_score: number;
  agreement_ratio: number;
  duration_ms: number;
  critique?: string;
  method?: string;
}

function log(entry: object): void {
  const dir = dirname(HIVE_LOG);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  appendFileSync(HIVE_LOG, JSON.stringify({ ts: new Date().toISOString(), ...entry }) + '\n');
}

/**
 * :01 Scatter - Fan out to 8 models in parallel
 * Returns response + confidence (0-100) for each model
 */
async function scatter(
  models: string[],
  prompt: { system: string; user: string }
): Promise<{ model: string; response: string; confidence: number }[]> {
  const systemWithConfidence = `${prompt.system}

After your answer, on a new line, provide your confidence level as a number from 0-100.
Format: CONFIDENCE: <number>`;

  const msgs: ChatMessage[] = [
    { role: 'system', content: systemWithConfidence },
    { role: 'user', content: prompt.user },
  ];
  
  const results = await Promise.all(
    models.map(async (model) => {
      try {
        const { response } = await chat(model, msgs);
        const confMatch = response.match(/CONFIDENCE:\s*(\d+)/i);
        const confidence = confMatch ? Math.min(100, Math.max(0, parseInt(confMatch[1]))) : 50;
        const cleanResponse = response.replace(/CONFIDENCE:\s*\d+/gi, '').trim();
        return { model, response: cleanResponse, confidence };
      } catch (err) {
        console.error(`   ${model}: ${err}`);
        return { model, response: 'ERROR', confidence: 0 };
      }
    })
  );
  
  return results;
}

/**
 * :10 Gather - Hybrid Critique + Weighted Voting Consensus
 * 
 * Strategy:
 * 1. Compute weighted voting result (confidence-weighted majority)
 * 2. Get aggregator critique and pick
 * 3. If critique agrees with weighted vote → use critique (higher confidence)
 * 4. If critique disagrees → use weighted vote (more robust to hallucination)
 */
async function gather(
  responses: { model: string; response: string; confidence: number }[],
  harness: Harness,
  expected: string,
  prompt: { system: string; user: string }
): Promise<{ consensus: string; scores: number[]; agreement: number; confidences: number[]; critique: string; method: string }> {
  const scored = responses.map(r => ({
    ...r,
    score: harness.score(r.response, expected),
  }));
  
  const valid = scored.filter(s => s.response !== 'ERROR');
  
  if (valid.length === 0) {
    return {
      consensus: 'ERROR',
      scores: scored.map(s => s.score),
      agreement: 0,
      confidences: scored.map(s => s.confidence),
      critique: 'All models failed',
      method: 'none',
    };
  }
  
  // STEP 1: Compute weighted voting result FIRST
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 50);
  const grouped = new Map<string, { count: number; totalConf: number; original: string }>();
  
  for (const r of valid) {
    const key = normalize(r.response);
    if (!grouped.has(key)) grouped.set(key, { count: 0, totalConf: 0, original: r.response });
    const g = grouped.get(key)!;
    g.count++;
    g.totalConf += r.confidence;
  }
  
  const sortedGroups = [...grouped.values()].sort((a, b) => b.totalConf - a.totalConf);
  const weightedWinner = sortedGroups[0];
  const weightedAnswer = weightedWinner.original;
  const weightedAgreement = weightedWinner.count / valid.length;
  
  console.log(`\n   📊 Weighted Vote: "${weightedAnswer.slice(0, 30)}..." (${weightedWinner.count}/${valid.length} models, conf:${weightedWinner.totalConf})`);
  
  // STEP 2: Get aggregator critique
  const proposalList = valid.map((r, i) => 
    `[${i + 1}] Model: ${r.model.split('/')[1] || r.model}\n    Answer: ${r.response.slice(0, 200)}\n    Confidence: ${r.confidence}/100`
  ).join('\n\n');
  
  const critiquePrompt = `You are a critical evaluator. Review these ${valid.length} proposed answers.

QUESTION: ${prompt.user}

PROPOSALS:
${proposalList}

TASK:
1. Critique each proposal briefly (1 line each)
2. Identify which proposals agree
3. Pick the BEST answer
4. Give your final answer

Format:
CRITIQUES:
[1] ...

CONVERGENCE: Which agree?

BEST: [number] because...

FINAL ANSWER: [answer]
CONFIDENCE: [0-100]`;

  const aggregatorModel = 'deepseek/deepseek-chat';
  let critique = '';
  let critiqueAnswer = '';
  let aggregatorConfidence = 50;
  let method = 'weighted'; // Default to weighted voting
  
  try {
    const { response: critiqueResponse } = await chat(aggregatorModel, [
      { role: 'system', content: 'You are a critical evaluator who synthesizes multiple AI responses.' },
      { role: 'user', content: critiquePrompt },
    ]);
    
    critique = critiqueResponse;
    const answerMatch = critiqueResponse.match(/FINAL ANSWER:\s*(.+?)(?:\n|CONFIDENCE|$)/i);
    if (answerMatch) critiqueAnswer = answerMatch[1].trim();
    const confMatch = critiqueResponse.match(/CONFIDENCE:\s*(\d+)/i);
    if (confMatch) aggregatorConfidence = Math.min(100, Math.max(0, parseInt(confMatch[1])));
    
    console.log(`   🔍 Critique Pick: "${critiqueAnswer.slice(0, 30)}..." (conf:${aggregatorConfidence})`);
    
  } catch (err) {
    console.error(`   ❌ Aggregator failed: ${err}`);
    critique = 'Aggregator failed, using weighted voting';
  }
  
  // STEP 3: Hybrid decision - compare critique vs weighted vote
  let finalAnswer: string;
  
  if (!critiqueAnswer) {
    // No critique answer, use weighted
    finalAnswer = weightedAnswer;
    method = 'weighted_fallback';
    console.log(`   🎯 Decision: WEIGHTED (no critique answer)`);
  } else {
    const critiqueNorm = normalize(critiqueAnswer);
    const weightedNorm = normalize(weightedAnswer);
    
    if (critiqueNorm === weightedNorm) {
      // Critique agrees with weighted vote - high confidence!
      finalAnswer = critiqueAnswer;
      method = 'hybrid_agree';
      console.log(`   🎯 Decision: HYBRID AGREE (critique + weighted match)`);
    } else if (weightedAgreement >= 0.5) {
      // Strong weighted consensus (50%+), prefer weighted over critique
      finalAnswer = weightedAnswer;
      method = 'weighted_majority';
      console.log(`   🎯 Decision: WEIGHTED MAJORITY (${(weightedAgreement * 100).toFixed(0)}% agreement beats critique)`);
    } else if (aggregatorConfidence >= 80) {
      // Weak weighted consensus but high critique confidence
      finalAnswer = critiqueAnswer;
      method = 'critique_confident';
      console.log(`   🎯 Decision: CRITIQUE (high confidence ${aggregatorConfidence})`);
    } else {
      // Low confidence all around, prefer weighted (more robust)
      finalAnswer = weightedAnswer;
      method = 'weighted_default';
      console.log(`   🎯 Decision: WEIGHTED DEFAULT (low critique confidence)`);
    }
  }
  
  const finalNorm = normalize(finalAnswer);
  const agreementCount = valid.filter(r => normalize(r.response) === finalNorm).length;
  
  logStigmergy({
    event: 'GATHER_HYBRID',
    timestamp: new Date().toISOString(),
    aggregator: aggregatorModel,
    proposals: valid.length,
    method,
    weighted_answer: weightedAnswer.slice(0, 50),
    critique_answer: critiqueAnswer?.slice(0, 50) || 'none',
    final_answer: finalAnswer.slice(0, 50),
    agreement: agreementCount / responses.length,
    aggregator_confidence: aggregatorConfidence,
    weighted_agreement: weightedAgreement,
    model_scores: scored.map(s => ({ model: s.model, score: s.score, confidence: s.confidence })),
  });
  
  return {
    consensus: finalAnswer,
    scores: scored.map(s => s.score),
    agreement: agreementCount / responses.length,
    confidences: scored.map(s => s.confidence),
    critique,
    method,
  };
}

function logStigmergy(entry: object): void {
  try {
    const stigmergyPath = resolve(__dirname, '../../../../obsidianblackboard.jsonl');
    appendFileSync(stigmergyPath, JSON.stringify(entry) + '\n');
  } catch (err) { /* Silently fail */ }
}

/**
 * HIVE/8:10 - Full scatter-gather pattern with confidence-weighted consensus
 */
async function runHive10(
  promptIdx: number,
  harness: Harness,
  models: string[] = HIVE_8_MODELS
): Promise<HiveResult> {
  const p = harness.prompts[promptIdx];
  const expected = p.expected ?? '';
  const start = Date.now();
  
  console.log(`\n HIVE/8:10 - Prompt ${promptIdx}`);
  console.log(`   Q: "${p.user.slice(0, 60)}..."`);
  console.log(`   Expected: ${expected}`);
  
  // :01 Scatter (with confidence)
  console.log(`\n   :01 Scatter  ${models.length} models (requesting confidence)...`);
  const scattered = await scatter(models, p);
  
  // :10 Gather (weighted consensus with proposer-critique)
  console.log(`   :10 Gather  zero-trust weighted consensus with critique...`);
  const { consensus, scores, agreement, confidences, critique, method } = await gather(scattered, harness, expected, p);
  
  // Score consensus
  const consensusScore = harness.score(consensus, expected);
  
  // Log individual responses with confidence
  console.log(`\n   Responses:`);
  scattered.forEach((r, i) => {
    const short = r.model.split('/')[1]?.slice(0, 15) || r.model;
    const score = scores[i];
    const conf = r.confidence;
    const mark = score > 0 ? '' : '';
    console.log(`     ${mark} ${short}: "${r.response.slice(0, 25)}..." (${score}/10, conf:${conf})`);
  });
  
  console.log(`\n    Consensus: "${consensus.slice(0, 40)}..."`);
  console.log(`    Method: ${method}`);
  console.log(`    Agreement: ${(agreement * 100).toFixed(0)}% (${Math.round(agreement * models.length)}/${models.length})`);
  console.log(`    Score: ${consensusScore}/10`);
  console.log(`    Avg Confidence: ${(confidences.reduce((a, b) => a + b, 0) / confidences.length).toFixed(0)}/100`);
  
  const result: HiveResult = {
    pattern: 'HIVE/8:10',
    prompt_idx: promptIdx,
    question: p.user,
    expected,
    responses: scattered.map((r, i) => ({ 
      model: r.model, 
      response: r.response, 
      score: scores[i],
      confidence: r.confidence 
    })),
    consensus,
    consensus_score: consensusScore,
    agreement_ratio: agreement,
    duration_ms: Date.now() - start,
    critique,
    method,
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
  
  console.log('\n' + ''.repeat(60));
  console.log(' SINGLE vs HIVE/8:10 COMPARISON');
  console.log(''.repeat(60));
  
  // Single agent
  console.log(`\n Single Agent (${singleModel.split('/')[1]})`);
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
  console.log('\n' + ''.repeat(60));
  console.log(' RESULT');
  console.log(''.repeat(60));
  console.log(`   Single:    ${singleScore}/10`);
  console.log(`   HIVE/8:10: ${hiveResult.consensus_score}/10`);
  const delta = hiveResult.consensus_score - singleScore;
  console.log(`   Δ = ${delta > 0 ? '+' : ''}${delta}`);
  console.log(`   Agreement: ${(hiveResult.agreement_ratio * 100).toFixed(0)}%`);
}

// CLI entry
if (process.argv[1]?.includes('hive-10')) {
  const promptIdx = parseInt(process.argv[2] || '0');
  
  console.log('\n HIVE/8:10 Atomic Pattern Test');
  console.log('   Testing BFT consensus vs single agent');
  console.log('   Harness: HLE_MATH (HARD - models score <10%)');
  
  compareSingleVsHive(promptIdx, hleMath)
    .then(() => {
      console.log('\n Test complete');
      process.exit(0);
    })
    .catch(err => {
      console.error(' Error:', err);
      process.exit(1);
    });
}

export { runHive10, compareSingleVsHive, scatter, gather, HIVE_8_MODELS };
