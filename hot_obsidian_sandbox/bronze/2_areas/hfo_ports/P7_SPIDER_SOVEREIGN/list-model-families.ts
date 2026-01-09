import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load from workspace root .env
config({ path: resolve(__dirname, '../../../../../.env') });

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

interface ModelInfo {
  id: string;
  name: string;
  pricing: { prompt: string; completion: string };
  context_length: number;
  created?: number;
}

interface FamilyModel {
  id: string;
  price: number;
  context: number;
  isFree: boolean;
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

async function main() {
  const models = await getModels();
  
  // Define model families we care about
  const families: Record<string, { prefix: string; keywords: string[] }> = {
    'OpenAI': { prefix: 'openai/', keywords: ['gpt', 'o1', 'o3'] },
    'Anthropic': { prefix: 'anthropic/', keywords: ['claude'] },
    'Google': { prefix: 'google/', keywords: ['gemini'] },
    'Meta': { prefix: 'meta-llama/', keywords: ['llama'] },
    'DeepSeek': { prefix: 'deepseek/', keywords: ['deepseek'] },
    'Qwen': { prefix: 'qwen/', keywords: ['qwen', 'qwq'] },
    'Mistral': { prefix: 'mistralai/', keywords: ['mistral', 'codestral', 'pixtral'] },
    'xAI': { prefix: 'x-ai/', keywords: ['grok'] },
  };

  const familyModels: Record<string, FamilyModel[]> = {};
  
  for (const m of models) {
    const price = parseFloat(m.pricing.prompt) * 1000000;
    const isFree = price === 0;
    
    for (const [family, config] of Object.entries(families)) {
      if (m.id.startsWith(config.prefix)) {
        if (!familyModels[family]) familyModels[family] = [];
        familyModels[family].push({
          id: m.id,
          price,
          context: m.context_length,
          isFree,
        });
        break;
      }
    }
  }

  // Sort each family by price
  for (const family of Object.keys(familyModels)) {
    familyModels[family].sort((a, b) => a.price - b.price);
  }

  console.log('\n═══════════════════════════════════════════════════════════════════════════════════════════════════════');
  console.log('MODEL FAMILY ANALYSIS - Cheap vs Expensive (Jan 2026)');
  console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════\n');

  const cheapThreshold = 0.50; // $0.50/M input
  const recommendedCheap: string[] = [];

  for (const [family, models] of Object.entries(familyModels)) {
    console.log(`\n┌─── ${family.toUpperCase()} ───────────────────────────────────────────────────────────────────────`);
    
    const paid = models.filter(m => !m.isFree);
    const free = models.filter(m => m.isFree);
    const cheap = paid.filter(m => m.price <= cheapThreshold);
    const expensive = paid.filter(m => m.price > cheapThreshold);
    
    // Show cheapest paid (recommended)
    if (cheap.length > 0) {
      console.log('│ 🟢 CHEAP (≤$0.50/M) - RECOMMENDED:');
      cheap.slice(0, 5).forEach(m => {
        const marker = m.price <= 0.20 ? '⭐' : '';
        console.log(`│    ${marker} ${m.id.padEnd(45)} $${m.price.toFixed(3)}/M  ${(m.context/1000).toFixed(0)}k ctx`);
        if (m.price <= cheapThreshold && !m.isFree) {
          recommendedCheap.push(m.id);
        }
      });
    }
    
    // Show most expensive (avoid)
    if (expensive.length > 0) {
      console.log('│ 🔴 EXPENSIVE (>$0.50/M) - AVOID FOR BULK TESTING:');
      expensive.slice(-3).reverse().forEach(m => {
        console.log(`│    ❌ ${m.id.padEnd(45)} $${m.price.toFixed(2)}/M`);
      });
    }
    
    // Show free (rate-limited)
    if (free.length > 0) {
      console.log('│ ⚪ FREE (rate-limited):');
      free.slice(0, 2).forEach(m => {
        console.log(`│    ⚠️  ${m.id.padEnd(45)} FREE`);
      });
    }
    
    console.log(`│ Total: ${models.length} models (${cheap.length} cheap, ${expensive.length} expensive, ${free.length} free)`);
    console.log('└────────────────────────────────────────────────────────────────────────────────────────────────────');
  }

  // Final recommendations
  console.log('\n═══════════════════════════════════════════════════════════════════════════════════════════════════════');
  console.log('RECOMMENDED CHEAP MODELS FOR TESTING (≤$0.50/M, no free tier)');
  console.log('═══════════════════════════════════════════════════════════════════════════════════════════════════════\n');

  // Pick best from each family (prefer instruct/chat models, not guard/safety)
  const bestPerFamily: Record<string, FamilyModel> = {};
  for (const [family, models] of Object.entries(familyModels)) {
    const paid = models.filter(m => 
      !m.isFree && 
      m.price <= cheapThreshold &&
      !m.id.includes('guard') &&  // Skip safety models
      !m.id.includes('safeguard') &&
      !m.id.includes(':exacto') &&  // Skip exacto variants
      !m.id.includes('vision') &&  // Skip vision models
      !m.id.includes('-vl-')  // Skip vision-language
    );
    if (paid.length > 0) {
      // Prefer instruct models, then larger context, then lower price
      paid.sort((a, b) => {
        const aInstruct = a.id.includes('instruct') || a.id.includes('chat') ? 1 : 0;
        const bInstruct = b.id.includes('instruct') || b.id.includes('chat') ? 1 : 0;
        if (aInstruct !== bInstruct) return bInstruct - aInstruct;
        if (Math.abs(a.price - b.price) < 0.05) return b.context - a.context;
        return a.price - b.price;
      });
      bestPerFamily[family] = paid[0];
    }
  }

  console.log('BEST CHEAP MODEL PER FAMILY:');
  console.log('─'.repeat(80));
  for (const [family, model] of Object.entries(bestPerFamily)) {
    console.log(`  ${family.padEnd(12)} → ${model.id.padEnd(45)} $${model.price.toFixed(3)}/M`);
  }

  // Export format for model-client.ts
  console.log('\n\n// Copy this to model-client.ts:');
  console.log('export const CHEAP_FAMILY_MODELS = [');
  for (const model of Object.values(bestPerFamily)) {
    console.log(`  '${model.id}',  // $${model.price.toFixed(3)}/M`);
  }
  console.log('] as const;');
}

main().catch(console.error);
