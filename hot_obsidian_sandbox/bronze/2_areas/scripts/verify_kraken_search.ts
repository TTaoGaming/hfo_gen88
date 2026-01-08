import { KrakenKeeperAdapter } from '../adapters/kraken-adapter.js';

const DB_PATH = 'C:/Dev/active/hfo_gen88/cold_obsidian_sandbox/silver/active_root/portable_hfo_memory_pre_hfo_to_gen84_2025-12-27T21-46-52/hfo_memory.duckdb';

async function verify() {
  const adapter = new KrakenKeeperAdapter(DB_PATH);
  console.log('🔍 Searching for "Canalization" in Gen 88...');
  
  const response = await adapter.process({ query: 'Canalization', limit: 5, generation: 88 });
  
  console.log(`Found ${response.total} results.`);
  response.results.forEach((res, i) => {
    console.log(`[${i+1}] ${res.artifact.filename} (Gen: ${res.artifact.generation}) - ${res.artifact.path}`);
  });
}

verify().catch(console.error);
