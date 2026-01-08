/**
 * 🦑 INGEST PAIN SCRIPT
 * 
 * Topic: System Disruption & Testing
 * Provenance: hot_obsidian_sandbox/bronze/P4_DISRUPTION_KINETIC.md
 * 
 * Ingests historical pain from PAIN_REGISTRY_GEN88.md and obsidianblackboard.jsonl
 * into the Kraken Keeper DuckDB.
 */

import fs from 'fs';
import path from 'path';
import { KrakenKeeperAdapter } from '../../silver/P6_KRAKEN_KEEPER/kraken-adapter.ts';
import { Artifact } from '../../silver/P6_KRAKEN_KEEPER/kraken-contracts.ts';
import crypto from 'crypto';

const ROOT_DIR = process.cwd();
const DB_PATH = "C:\\Dev\\active\\hfo_gen88\\hot_obsidian_sandbox\\silver\\P6_KRAKEN_KEEPER\\kraken.db";
const PAIN_REGISTRY_PATH = "C:\\Dev\\active\\hfo_gen88\\hot_obsidian_sandbox\\bronze\\demoted_silver\\manifests\\PAIN_REGISTRY_GEN88.md";
const BLACKBOARD_PATH = "C:\\Dev\\active\\hfo_gen88\\obsidianblackboard.jsonl";

async function main() {
  const adapter = new KrakenKeeperAdapter(DB_PATH);
  await adapter.initialize();

  console.log('🦑 Kraken initialized. Starting ingestion...');

  // 1. Ingest PAIN_REGISTRY_GEN88.md
  if (fs.existsSync(PAIN_REGISTRY_PATH)) {
    const content = fs.readFileSync(PAIN_REGISTRY_PATH, 'utf-8');
    const artifact: Artifact = {
      id: 'ARTIFACT_PAIN_REGISTRY',
      era: 'ANCESTRAL',
      generation: 88,
      filename: 'PAIN_REGISTRY_GEN88.md',
      path: 'hot_obsidian_sandbox/bronze/demoted_silver/manifests/PAIN_REGISTRY_GEN88.md',
      content: content,
      contentHash: crypto.createHash('sha256').update(content).digest('hex'),
      createdAt: new Date().toISOString(),
    };
    await adapter.ingest(artifact);
    console.log('✅ Ingested PAIN_REGISTRY_GEN88.md');
  }

  // 2. Ingest individual pain points from the registry as separate artifacts for better FTS
  if (fs.existsSync(PAIN_REGISTRY_PATH)) {
    const content = fs.readFileSync(PAIN_REGISTRY_PATH, 'utf-8');
    const painPoints = content.split('###').slice(1);
    for (const point of painPoints) {
      const titleMatch = point.match(/Pain #(\d+): (.*)/);
      if (titleMatch) {
        const id = `PAIN_${titleMatch[1].padStart(3, '0')}`;
        const title = titleMatch[2].trim();
        const artifact: Artifact = {
          id: id,
          era: 'ANCESTRAL',
          generation: 88,
          filename: `PAIN_${id}.md`,
          path: `virtual/pain/${id}`,
          content: point.trim(),
          contentHash: crypto.createHash('sha256').update(point).digest('hex'),
          createdAt: new Date().toISOString(),
        };
        await adapter.ingest(artifact);
        console.log(`✅ Ingested ${id}: ${title}`);
      }
    }
  }

  // 3. Ingest Blackboard Pain Records
  if (fs.existsSync(BLACKBOARD_PATH)) {
    const lines = fs.readFileSync(BLACKBOARD_PATH, 'utf-8').split('\n');
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const entry = JSON.parse(line);
        if (entry.type === 'PAIN_RECORD' || entry.type === 'TRUST_VIOLATION') {
          const id = entry.mark || entry.id || `BB_${crypto.randomUUID().slice(0, 8)}`;
          const artifact: Artifact = {
            id: id,
            era: 'GEN88_ACTIVE',
            generation: entry.gen || 88,
            filename: `BLACKBOARD_${id}.json`,
            path: `virtual/blackboard/${id}`,
            content: JSON.stringify(entry, null, 2),
            contentHash: crypto.createHash('sha256').update(line).digest('hex'),
            createdAt: entry.ts || entry.timestamp || new Date().toISOString(),
          };
          await adapter.ingest(artifact);
          console.log(`✅ Ingested Blackboard entry: ${id}`);
        }
      } catch (e) {
        // Skip invalid JSON
      }
    }
  }

  console.log('🦑 Ingestion complete.');
}

main().catch(console.error);
