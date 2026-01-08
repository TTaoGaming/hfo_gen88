import { config } from 'dotenv';
import { resolve } from 'path';

// Load from workspace root .env
const result = config({ path: resolve(process.cwd(), '../../../.env') });
if (!result.parsed) {
  // Try one more level up
  config({ path: resolve(process.cwd(), '../../../../.env') });
}

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

interface ModelInfo {
  id: string;
  name: string;
  pricing: {
    prompt: string;
    completion: string;
  };
  context_length: number;
}

async function getModels(): Promise<ModelInfo[]> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error('OPENROUTER_API_KEY not set');
    return [];
  }
  
  const res = await fetch(`${OPENROUTER_BASE_URL}/models`, {
    headers: { 'Authorization': `Bearer ${apiKey}` },
  });
  
  if (!res.ok) {
    console.error('Failed to fetch models:', res.status);
    return [];
  }
  
  const data = await res.json();
  return data.data || [];
}

async function main() {
  const models = await getModels();
  
  // Filter for interesting models
  const keywords = [
    'gpt-4o', 'gpt-4', 'gpt-5', 'claude', 'gemini', 'llama', 'deepseek', 
    'qwen', 'mistral', 'grok', 'o1', 'o3'
  ];
  
  const interesting = models.filter((m: ModelInfo) => 
    keywords.some(k => m.id.toLowerCase().includes(k))
  );
  
  // Sort by prompt price
  interesting.sort((a: ModelInfo, b: ModelInfo) => 
    parseFloat(a.pricing.prompt) - parseFloat(b.pricing.prompt)
  );
  
  console.log('\n═══════════════════════════════════════════════════════════════════════════════════════════════════════');
  console.log('OPENROUTER MODEL PRICING (Live API Query)');
  console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════\n');
  
  console.log('Model ID'.padEnd(45) + 'Input $/M'.padStart(12) + 'Output $/M'.padStart(12) + 'Context'.padStart(10));
  console.log('─'.repeat(80));
  
  for (const m of interesting) {
    const inputPrice = parseFloat(m.pricing.prompt) * 1000000;
    const outputPrice = parseFloat(m.pricing.completion) * 1000000;
    console.log(
      m.id.padEnd(45) + 
      `$${inputPrice.toFixed(2)}`.padStart(12) +
      `$${outputPrice.toFixed(2)}`.padStart(12) +
      `${(m.context_length / 1000).toFixed(0)}k`.padStart(10)
    );
  }
  
  // Categorize
  console.log('\n═══════════════════════════════════════════════════════════════════════════════════════════════════════');
  console.log('RECOMMENDED MODEL TIERS');
  console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════\n');
  
  const cheap = interesting.filter((m: ModelInfo) => parseFloat(m.pricing.prompt) * 1000000 < 0.5);
  const mid = interesting.filter((m: ModelInfo) => {
    const p = parseFloat(m.pricing.prompt) * 1000000;
    return p >= 0.5 && p < 3;
  });
  const expensive = interesting.filter((m: ModelInfo) => parseFloat(m.pricing.prompt) * 1000000 >= 3);
  
  console.log('🟢 CHEAP (<$0.50/M input):');
  cheap.slice(0, 10).forEach((m: ModelInfo) => {
    const p = parseFloat(m.pricing.prompt) * 1000000;
    console.log(`   ${m.id.padEnd(45)} $${p.toFixed(3)}/M`);
  });
  
  console.log('\n🟡 MID-TIER ($0.50-$3/M input):');
  mid.slice(0, 10).forEach((m: ModelInfo) => {
    const p = parseFloat(m.pricing.prompt) * 1000000;
    console.log(`   ${m.id.padEnd(45)} $${p.toFixed(2)}/M`);
  });
  
  console.log('\n🔴 EXPENSIVE/SOTA (>$3/M input):');
  expensive.slice(0, 10).forEach((m: ModelInfo) => {
    const p = parseFloat(m.pricing.prompt) * 1000000;
    console.log(`   ${m.id.padEnd(45)} $${p.toFixed(2)}/M`);
  });
  
  console.log(`\nTotal models found: ${models.length}`);
  console.log(`Filtered interesting: ${interesting.length}`);
}

main().catch(console.error);
