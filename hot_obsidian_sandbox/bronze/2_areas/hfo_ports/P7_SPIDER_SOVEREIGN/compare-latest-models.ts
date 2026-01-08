import { config } from 'dotenv';
import { resolve } from 'path';
import * as fs from 'fs';

config({ path: resolve(process.cwd(), '../../../.env') });

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

interface ModelInfo {
  id: string;
  name: string;
  pricing: { prompt: string; completion: string };
  context_length: number;
  created?: number;
}

interface LedgerEntry {
  model: string;
  harness_name: string;
  scores: { normalized: number };
}

async function getModels(): Promise<ModelInfo[]> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) { console.error('OPENROUTER_API_KEY not set'); return []; }
  
  const res = await fetch(`${OPENROUTER_BASE_URL}/models`, {
    headers: { 'Authorization': `Bearer ${apiKey}` },
  });
  
  if (!res.ok) { console.error('Failed:', res.status); return []; }
  const data = await res.json();
  return data.data || [];
}

function loadLedger(): Map<string, number> {
  const data = fs.readFileSync('./ollama_eval_ledger.jsonl', 'utf8');
  const lines = data.trim().split('\n').filter(Boolean);
  const entries: LedgerEntry[] = lines.map(l => JSON.parse(l));
  
  // Get average fitness per model
  const byModel = new Map<string, number[]>();
  for (const e of entries) {
    if (!byModel.has(e.model)) byModel.set(e.model, []);
    byModel.get(e.model)!.push(e.scores.normalized);
  }
  
  const fitness = new Map<string, number>();
  for (const [model, scores] of byModel) {
    fitness.set(model, scores.reduce((a, b) => a + b, 0) / scores.length);
  }
  return fitness;
}

async function main() {
  const models = await getModels();
  const testedFitness = loadLedger();
  const testedModels = new Set(testedFitness.keys());
  
  // Define families with version detection patterns
  const families: Record<string, { 
    prefix: string; 
    versionPatterns: RegExp[];
    latestIndicators: string[];
  }> = {
    'OpenAI': { 
      prefix: 'openai/', 
      versionPatterns: [/gpt-5\.?(\d)?/, /gpt-4\.?1/, /gpt-4o/, /o3/, /o1/],
      latestIndicators: ['gpt-5', 'gpt-4.1', 'o3']
    },
    'Anthropic': { 
      prefix: 'anthropic/', 
      versionPatterns: [/claude-(\d+\.?\d?)/, /claude-opus-4/, /claude-sonnet-4/],
      latestIndicators: ['claude-4', 'claude-3.7', 'haiku-4']
    },
    'Google': { 
      prefix: 'google/', 
      versionPatterns: [/gemini-(\d+\.?\d?)/, /gemma-3/],
      latestIndicators: ['gemini-3', 'gemini-2.5', 'gemma-3']
    },
    'Meta': { 
      prefix: 'meta-llama/', 
      versionPatterns: [/llama-(\d+)/, /llama-4/],
      latestIndicators: ['llama-4', 'llama-3.3']
    },
    'DeepSeek': { 
      prefix: 'deepseek/', 
      versionPatterns: [/v(\d+\.?\d?)/, /r1/],
      latestIndicators: ['v3.2', 'v3.1', 'r1']
    },
    'Qwen': { 
      prefix: 'qwen/', 
      versionPatterns: [/qwen(\d+)/, /qwen3/],
      latestIndicators: ['qwen3', 'qwq']
    },
    'Mistral': { 
      prefix: 'mistralai/', 
      versionPatterns: [/(\d+\.?\d?)-instruct/, /medium-3/],
      latestIndicators: ['3.1', '3.2', '2512', '2507']
    },
    'xAI': { 
      prefix: 'x-ai/', 
      versionPatterns: [/grok-(\d+\.?\d?)/],
      latestIndicators: ['grok-4', 'grok-4.1']
    },
  };

  const cheapThreshold = 0.50;
  
  console.log('\n═══════════════════════════════════════════════════════════════════════════════════════════════════════');
  console.log('LATEST CHEAP MODELS vs TESTED PERFORMANCE (Jan 2026)');
  console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════\n');

  interface ModelAnalysis {
    id: string;
    family: string;
    price: number;
    context: number;
    isLatest: boolean;
    isTested: boolean;
    fitness: number | null;
    valueRatio: number | null;
  }

  const allAnalysis: ModelAnalysis[] = [];

  for (const [family, config] of Object.entries(families)) {
    const familyModels = models.filter(m => 
      m.id.startsWith(config.prefix) &&
      !m.id.includes(':free') &&
      !m.id.includes('guard') &&
      !m.id.includes('safeguard') &&
      !m.id.includes(':exacto') &&
      !m.id.includes('vision') &&
      !m.id.includes('-vl-')
    );

    for (const m of familyModels) {
      const price = parseFloat(m.pricing.prompt) * 1000000;
      if (price > cheapThreshold) continue;
      
      const isLatest = config.latestIndicators.some(ind => m.id.includes(ind));
      const isTested = testedModels.has(m.id);
      const fitness = testedFitness.get(m.id) ?? null;
      const valueRatio = fitness !== null && price > 0 ? fitness / price : null;

      allAnalysis.push({
        id: m.id,
        family,
        price,
        context: m.context_length,
        isLatest,
        isTested,
        fitness,
        valueRatio,
      });
    }
  }

  // Sort by family, then by latest, then by price
  allAnalysis.sort((a, b) => {
    if (a.family !== b.family) return a.family.localeCompare(b.family);
    if (a.isLatest !== b.isLatest) return b.isLatest ? 1 : -1;
    return a.price - b.price;
  });

  // Print by family
  let currentFamily = '';
  for (const m of allAnalysis) {
    if (m.family !== currentFamily) {
      currentFamily = m.family;
      console.log(`\n┌─── ${currentFamily.toUpperCase()} ───────────────────────────────────────────────────────────────────────`);
      console.log('│ Model'.padEnd(50) + 'Price'.padStart(10) + 'Tested'.padStart(10) + 'Fitness'.padStart(10) + 'Value'.padStart(10) + 'Latest'.padStart(8));
      console.log('│' + '─'.repeat(95));
    }
    
    const latestMark = m.isLatest ? '🆕' : '  ';
    const testedMark = m.isTested ? '✅' : '❌';
    const fitnessStr = m.fitness !== null ? `${(m.fitness * 100).toFixed(1)}%` : '---';
    const valueStr = m.valueRatio !== null ? m.valueRatio.toFixed(1) : '---';
    
    console.log(`│ ${latestMark} ${m.id.padEnd(45)} $${m.price.toFixed(3).padStart(6)}/M  ${testedMark.padStart(6)}  ${fitnessStr.padStart(8)}  ${valueStr.padStart(8)}  ${m.isLatest ? 'YES' : ''}`);
  }

  // Summary: Untested LATEST cheap models
  console.log('\n═══════════════════════════════════════════════════════════════════════════════════════════════════════');
  console.log('🎯 UNTESTED LATEST CHEAP MODELS (Priority for Testing)');
  console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════\n');

  const untestedLatest = allAnalysis.filter(m => m.isLatest && !m.isTested);
  untestedLatest.sort((a, b) => a.price - b.price);

  if (untestedLatest.length === 0) {
    console.log('All latest cheap models have been tested! ✅');
  } else {
    console.log('Model'.padEnd(50) + 'Family'.padStart(12) + 'Price'.padStart(10));
    console.log('─'.repeat(75));
    for (const m of untestedLatest) {
      console.log(`${m.id.padEnd(50)} ${m.family.padStart(12)} $${m.price.toFixed(3)}/M`);
    }
  }

  // Best tested models by value ratio
  console.log('\n═══════════════════════════════════════════════════════════════════════════════════════════════════════');
  console.log('🏆 BEST VALUE TESTED MODELS (Fitness/Price Ratio)');
  console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════\n');

  const testedWithValue = allAnalysis.filter(m => m.valueRatio !== null);
  testedWithValue.sort((a, b) => (b.valueRatio ?? 0) - (a.valueRatio ?? 0));

  console.log('Rank  Model'.padEnd(55) + 'Fitness'.padStart(10) + 'Price'.padStart(10) + 'Value Ratio'.padStart(12));
  console.log('─'.repeat(90));
  testedWithValue.slice(0, 10).forEach((m, i) => {
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '  ';
    console.log(`${medal} ${(i+1).toString().padStart(2)}. ${m.id.padEnd(48)} ${((m.fitness ?? 0) * 100).toFixed(1).padStart(6)}%  $${m.price.toFixed(3).padStart(6)}/M  ${(m.valueRatio ?? 0).toFixed(1).padStart(8)} pts/$`);
  });

  // Export recommended test list
  console.log('\n\n// RECOMMENDED: Test these untested latest cheap models');
  console.log('export const UNTESTED_LATEST_CHEAP = [');
  for (const m of untestedLatest.slice(0, 10)) {
    console.log(`  '${m.id}',  // ${m.family} $${m.price.toFixed(3)}/M`);
  }
  console.log('] as const;');
}

main().catch(console.error);
