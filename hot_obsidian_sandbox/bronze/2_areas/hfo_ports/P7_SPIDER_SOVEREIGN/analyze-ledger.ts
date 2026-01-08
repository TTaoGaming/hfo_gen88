import * as fs from 'fs';

const data = fs.readFileSync('./ollama_eval_ledger.jsonl', 'utf8');
const lines = data.trim().split('\n').filter(Boolean);
const entries = lines.map(l => JSON.parse(l));

// Pricing data ($/M input tokens) - from OpenRouter Jan 2026
const PRICING: Record<string, number> = {
  // Ultra-cheap ($0.01-0.05/M)
  'openai/gpt-oss-20b': 0.016,
  'google/gemma-3-4b-it': 0.017,
  'meta-llama/llama-3.1-8b-instruct': 0.02,
  'mistralai/mistral-nemo': 0.02,
  'google/gemma-3n-e4b-it': 0.02,
  'google/gemma-3-12b-it': 0.03,
  'deepseek/deepseek-r1-distill-llama-70b': 0.03,
  'mistralai/mistral-small-3.1-24b-instruct': 0.03,
  'qwen/qwen3-8b': 0.035,
  'google/gemma-3-27b-it': 0.036,
  'openai/gpt-5-nano': 0.05,
  'qwen/qwen3-14b': 0.05,
  'mistralai/devstral-2512': 0.05,
  'qwen/qwen3-30b-a3b-thinking-2507': 0.051,
  
  // Budget ($0.06-0.15/M)
  'deepseek/deepseek-r1-0528-qwen3-8b': 0.06,
  'mistralai/mistral-small-3.2-24b-instruct': 0.06,
  'qwen/qwen3-next-80b-a3b-instruct': 0.06,
  'qwen/qwen3-coder-30b-a3b-instruct': 0.07,
  'qwen/qwen3-32b': 0.08,
  'meta-llama/llama-4-scout': 0.08,
  'openai/gpt-4.1-nano': 0.10,
  'meta-llama/llama-3.3-70b-instruct': 0.10,
  'openai/gpt-4o-mini': 0.15,
  'deepseek/deepseek-chat-v3.1': 0.15,
  'meta-llama/llama-4-maverick': 0.15,
  
  // Value ($0.20-0.50/M)
  'x-ai/grok-4.1-fast': 0.20,
  'x-ai/grok-4-fast': 0.20,
  'openai/gpt-5-mini': 0.25,
  'deepseek/deepseek-v3.2': 0.25,
  'google/gemini-2.5-flash': 0.30,
  'mistralai/mistral-medium-3.1': 0.40,
  'google/gemini-3-flash-preview': 0.50,
  
  // Mid-tier ($0.80-$3/M)
  'anthropic/claude-3.5-haiku': 0.80,
  'anthropic/claude-haiku-4.5': 1.00,
  'openai/gpt-5': 1.25,
  'google/gemini-2.5-pro': 1.25,
  'x-ai/grok-3': 3.00,
  
  // Free
  'deepseek/deepseek-r1-0528:free': 0.00,
  'google/gemini-2.0-flash-exp:free': 0.00,
};

// Group by model, get latest scores per harness
const byModel = new Map<string, Map<string, number>>();
for (const e of entries) {
  if (!byModel.has(e.model)) byModel.set(e.model, new Map());
  byModel.get(e.model)!.set(e.harness_name, e.scores.normalized);
}

// Calculate fitness for each model
interface Result {
  model: string;
  fitness: number;
  harnesses: Record<string, number>;
  provider: string;
  price: number;
  valueRatio: number;
}

const results: Result[] = [];
for (const [model, harnesses] of byModel) {
  const scores = [...harnesses.values()];
  const fitness = scores.reduce((a, b) => a + b, 0) / scores.length;
  const provider = model.includes('/') ? 'openrouter' : 'ollama';
  const price = PRICING[model] ?? 0;
  const valueRatio = price > 0 ? fitness / price : Infinity;
  results.push({ model, fitness, harnesses: Object.fromEntries(harnesses), provider, price, valueRatio });
}

// Sort by fitness
results.sort((a, b) => b.fitness - a.fitness);

// Print matrix
console.log('\n═══════════════════════════════════════════════════════════════════════════════════════════════════════');
console.log('MODEL EVALUATION MATRIX - MAP-ELITE Gen 88');
console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════\n');

console.log('Model'.padEnd(40) + 'SENSE FUSE SHAPE DELIV DISRU IMMUN STORE DECID | FITNESS');
console.log('─'.repeat(100));

for (const r of results) {
  const h = r.harnesses;
  const row = r.model.padEnd(40) +
    ((h.SENSE || 0) * 100).toFixed(0).padStart(4) + '%' +
    ((h.FUSE || 0) * 100).toFixed(0).padStart(5) + '%' +
    ((h.SHAPE || 0) * 100).toFixed(0).padStart(5) + '%' +
    ((h.DELIVER || 0) * 100).toFixed(0).padStart(5) + '%' +
    ((h.DISRUPT || 0) * 100).toFixed(0).padStart(5) + '%' +
    ((h.IMMUNIZE || 0) * 100).toFixed(0).padStart(5) + '%' +
    ((h.STORE || 0) * 100).toFixed(0).padStart(5) + '%' +
    ((h.DECIDE || 0) * 100).toFixed(0).padStart(5) + '%' +
    ' | ' + (r.fitness * 100).toFixed(1) + '%';
  console.log(row);
}

// Score/Price Ratio Analysis
console.log('\n═══════════════════════════════════════════════════════════════════════════════════════════════════════');
console.log('SCORE/PRICE RATIO (Value Analysis) - Higher = Better Value');
console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════\n');

// Filter out free models and sort by value ratio
const paidModels = results.filter(r => r.price > 0).sort((a, b) => b.valueRatio - a.valueRatio);

console.log('Rank  Model'.padEnd(45) + 'Fitness   Price    Value Ratio');
console.log('─'.repeat(80));

paidModels.forEach((r, i) => {
  const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '  ';
  const row = `${medal} ${(i+1).toString().padStart(2)}. ${r.model.padEnd(38)} ${(r.fitness * 100).toFixed(1).padStart(5)}%  $${r.price.toFixed(3).padStart(5)}/M  ${r.valueRatio.toFixed(1).padStart(6)} pts/$`;
  console.log(row);
});

// Free models
const freeModels = results.filter(r => r.price === 0);
if (freeModels.length > 0) {
  console.log('\n─── FREE MODELS ───');
  for (const r of freeModels) {
    console.log(`  ${r.model.padEnd(40)} ${(r.fitness * 100).toFixed(1)}%`);
  }
}

// Summary
console.log('\n═══════════════════════════════════════════════════════════════════════════════════════════════════════');
console.log('SUMMARY');
console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════\n');

console.log(`OpenRouter models: ${results.filter(r => r.provider === 'openrouter').length}`);
console.log(`Ollama models: ${results.filter(r => r.provider === 'ollama').length}`);
console.log(`Total: ${results.length}`);

// Best value picks
console.log('\n🏆 TOP VALUE PICKS (Best Score/Price):');
paidModels.slice(0, 5).forEach((r, i) => {
  console.log(`   ${i+1}. ${r.model} - ${(r.fitness * 100).toFixed(1)}% @ $${r.price}/M`);
});

console.log('\n🎯 TOP PERFORMERS (Best Fitness):');
results.slice(0, 5).forEach((r, i) => {
  console.log(`   ${i+1}. ${r.model} - ${(r.fitness * 100).toFixed(1)}%`);
});

// Missing models from CHEAP_16
const CHEAP_16 = [
  'openai/gpt-oss-20b', 'meta-llama/llama-3.1-8b-instruct', 'mistralai/mistral-nemo',
  'qwen/qwen3-8b', 'openai/gpt-5-nano', 'qwen/qwen3-14b', 'qwen/qwen3-32b',
  'meta-llama/llama-4-scout', 'openai/gpt-4.1-nano', 'meta-llama/llama-3.3-70b-instruct',
  'openai/gpt-4o-mini', 'deepseek/deepseek-chat-v3.1', 'meta-llama/llama-4-maverick',
  'x-ai/grok-4.1-fast', 'openai/gpt-5-mini', 'deepseek/deepseek-v3.2',
  'google/gemini-2.5-flash', 'mistralai/mistral-medium-3.1', 'google/gemini-3-flash-preview'
];

const tested = new Set(results.map(r => r.model));
const missing = CHEAP_16.filter(m => !tested.has(m));

if (missing.length > 0) {
  console.log('\n❌ MISSING FROM CHEAP_16 LIST:');
  for (const m of missing) {
    console.log(`   ${m}`);
  }
}
console.log(`\nCoverage: ${CHEAP_16.length - missing.length}/${CHEAP_16.length} CHEAP_16 models tested`);

