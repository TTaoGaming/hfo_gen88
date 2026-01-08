import fs from 'fs';
import path from 'path';
import { DbReader } from './db-reader';
import { RollupOrchestrator } from './orchestrator';
import { chat, CHEAP_PAID_MODELS } from '../../runner/model-client';

const DEFAULT_DB_PATH = 'C:/Dev/active/hfo_gen88/cold_obsidian_sandbox/silver/active_root/portable_hfo_memory_pre_hfo_to_gen84_2025-12-27T21-46-52/hfo_memory.duckdb';
const OUTPUT_ROOT = 'C:/Dev/active/hfo_gen88/cold_obsidian_sandbox/bronze/3_resources/chronicles';

async function runRollup(dateStr: string) {
  const dbPath = process.env.DB_PATH || DEFAULT_DB_PATH;
  
  if (!fs.existsSync(dbPath)) {
    console.warn(`⚠️ DuckDB not found at ${dbPath}.`);
  }

  const reader = new DbReader(dbPath);
  const orchestrator = new RollupOrchestrator(8); 

  console.log(`🚀 Starting Knowledge Crusher (P7 Consolidated) for ${dateStr}...`);
  const artifacts = reader.getArtifactsByDate(dateStr);
  console.log(`Retrieved ${artifacts.length} artifacts.`);

  if (artifacts.length > 0) {
    const finalMarkdown = await orchestrator.rollupDay(dateStr, artifacts);
    
    const [year, month, day] = dateStr.split('-');
    const dir = path.join(OUTPUT_ROOT, year, month);
    fs.mkdirSync(dir, { recursive: true });
    
    const filePath = path.join(dir, `${dateStr}.md`);
    fs.writeFileSync(filePath, finalMarkdown);
    console.log(`✅ Rollup saved to: ${filePath}`);
    
    // Stigmergy: Log to blackboard
    const logEntry = {
      ts: new Date().toISOString(),
      type: "KNOWLEDGE_ROLLUP",
      date: dateStr,
      artifacts: artifacts.length,
      status: "COMPLETED",
      commander: "Spider Sovereign"
    };
    fs.appendFileSync('C:/Dev/active/hfo_gen88/hot_obsidianblackboard.jsonl', JSON.stringify(logEntry) + '\n');
  }
}

const mode = process.argv[2]; 
const value = process.argv[3];

if (mode === 'day') {
  runRollup(value).catch(console.error);
} else {
  console.log('Usage: npx tsx main.ts day YYYY-MM-DD');
}
