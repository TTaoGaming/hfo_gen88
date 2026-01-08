import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import crypto from 'crypto';
import { KrakenKeeperAdapter } from '../adapters/kraken-adapter.js';
import { Artifact } from '../contracts/kraken-contracts.js';

const DB_PATH = 'C:/Dev/active/hfo_gen88/cold_obsidian_sandbox/silver/active_root/portable_hfo_memory_pre_hfo_to_gen84_2025-12-27T21-46-52/hfo_memory.duckdb';

async function ingest() {
  const adapter = new KrakenKeeperAdapter(DB_PATH);
  console.log('🦑 Kraken Keeper initiating ingestion of Gen 85-88...');

  const targets = [
    {
      path: 'C:/Dev/active/hfo_gen88/cold_obsidian_sandbox/silver/active_root/context_payload_gen85/**/*.{md,ts,json,txt}',
      gen: 85,
      era: 'Medallion'
    },
    {
      path: 'C:/Dev/active/hfo_gen88/cold_obsidian_sandbox/silver/active_root/hfo_gen87_x3/**/*.{md,ts,json,txt}',
      gen: 87,
      era: 'Medallion'
    },
    {
      path: 'C:/Dev/active/hfo_gen88/hot_obsidian_sandbox/**/*.{md,ts,json,txt}',
      gen: 88,
      era: 'Canalization'
    }
  ];

  for (const target of targets) {
    console.log(`\n📂 Processing Gen ${target.gen} from ${target.path}...`);
    const files = await glob(target.path, { ignore: '**/node_modules/**' });
    console.log(`Found ${files.length} files.`);

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const stats = fs.statSync(file);
        const filename = path.basename(file);
        const relativePath = path.relative('C:/Dev/active/hfo_gen88', file);
        const contentHash = crypto.createHash('sha256').update(content).digest('hex');

        const artifact: Artifact = {
          id: `gen${target.gen}-${contentHash.substring(0, 12)}`,
          era: target.era,
          generation: target.gen,
          filename,
          path: relativePath,
          content,
          contentHash,
          modified: stats.mtime.toISOString(),
          charCount: content.length,
          createdAt: stats.birthtime.toISOString()
        };

        await adapter.ingest(artifact);
        process.stdout.write('.');
      } catch (err) {
        console.error(`\n❌ Error ingesting ${file}:`, err);
      }
    }
  }

  console.log('\n\n✅ Ingestion complete.');
}

ingest().catch(console.error);
