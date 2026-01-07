#!/usr/bin/env npx tsx
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '../../../../.env') });

import { runEvaluation, runBatch } from '../runner/run-evaluation';
import { verifyLedger, readLedger } from '../ledger/eval-ledger';
import { CHEAP_MODELS, CHEAP_8_MODELS, ALL_CHEAP_MODELS, CHEAP_16_MODELS, PREMIUM_CHEAP, UNTESTED_LATEST_CHEAP, MAP_ELITE_TIER1, MAP_ELITE_TIER2, MAP_ELITE_TIER3, MAP_ELITE_BEST_8 } from '../runner/model-client';

async function main() {
  const [cmd, ...args] = process.argv.slice(2);

  switch (cmd) {
    case 'eval': {
      const model = args[0];
      if (!model) {
        console.error('Usage: map-elite eval <model>');
        process.exit(1);
      }
      await runEvaluation({ model });
      break;
    }

    case 'batch': {
      const set = args[0];
      let models: string[];
      
      switch (set) {
        case '4':
        case 'cheap4':
          models = [...CHEAP_MODELS];
          break;
        case '8':
        case 'cheap8':
          models = [...CHEAP_8_MODELS];
          break;
        case '16':
        case 'cheap16':
          models = [...CHEAP_16_MODELS];
          break;
        case 'premium':
          models = [...PREMIUM_CHEAP];
          break;
        case 'latest':
        case 'untested':
          models = [...UNTESTED_LATEST_CHEAP];
          break;
        case 'tier1':
        case 't1':
          models = [...MAP_ELITE_TIER1];
          break;
        case 'tier2':
        case 't2':
          models = [...MAP_ELITE_TIER2];
          break;
        case 'tier3':
        case 't3':
          models = [...MAP_ELITE_TIER3];
          break;
        case 'best8':
        case 'elite':
          models = [...MAP_ELITE_BEST_8];
          break;
        case 'all':
          models = [...ALL_CHEAP_MODELS];
          break;
        default:
          console.log('Usage: map-elite batch <set>');
          console.log('\nSets:');
          console.log('  4/cheap4   - 4 core families');
          console.log('  8/cheap8   - 8 families');
          console.log('  16/cheap16 - 16 cheap models');
          console.log('  premium    - Premium cheap (Claude Haiku)');
          console.log('  latest     - Untested latest cheap models');
          console.log('\nMAP-ELITE Archive Sets (cost-optimized):');
          console.log('  tier1/t1   - Ultra-cheap ($0.01-0.05/M)');
          console.log('  tier2/t2   - Budget ($0.06-0.15/M)');
          console.log('  tier3/t3   - Value ($0.20-0.50/M)');
          console.log('  best8/elite - Best 8 for archives');
          console.log('  all        - All cheap models');
          process.exit(1);
      }
      
      await runBatch(models);
      break;
    }

    case 'compare': {
      if (args.length < 2) {
        console.error('Usage: map-elite compare <m1> <m2> [m3...]');
        process.exit(1);
      }
      await runBatch(args);
      break;
    }

    case 'verify': {
      const path = args[0] || './ollama_eval_ledger.jsonl';
      const r = verifyLedger(path);
      console.log(r.valid ? `✓ Ledger OK: ${r.entries} entries` : `✗ Corrupt at ${r.firstCorrupt}`);
      break;
    }

    case 'history': {
      const entries = readLedger(args[0] || './ollama_eval_ledger.jsonl');
      const byModel = new Map<string, Map<string, number>>();
      
      for (const e of entries) {
        if (!byModel.has(e.model)) byModel.set(e.model, new Map());
        byModel.get(e.model)!.set(e.harness_name, e.scores.normalized);
      }
      
      for (const [model, harnesses] of byModel) {
        const scores = [...harnesses.values()];
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        console.log(`\n${model} (avg: ${(avg*100).toFixed(0)}%)`);
        for (const [name, score] of harnesses) {
          const bar = '█'.repeat(Math.round(score * 10)) + '░'.repeat(10 - Math.round(score * 10));
          console.log(`  ${name.padEnd(10)} ${bar} ${(score*100).toFixed(0)}%`);
        }
      }
      break;
    }

    default:
      console.log('MAP-ELITE v0.4 - LLM Evaluation Harness');
      console.log('\nCommands:');
      console.log('  eval <model>           Evaluate single model');
      console.log('  batch <4|8|all>        Batch evaluate cheap models');
      console.log('  compare <m1> <m2>...   Compare specific models');
      console.log('  verify [ledger]        Verify ledger integrity');
      console.log('  history [ledger]       Show history');
  }
}

main().catch(console.error);
