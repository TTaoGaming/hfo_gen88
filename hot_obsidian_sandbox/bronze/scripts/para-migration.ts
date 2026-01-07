/**
 * PARA Migration Script with OBSIDIAN Stigmergy Events
 * 
 * Migrates hot_obsidian_sandbox/bronze to PARA format while emitting
 * OBSIDIAN stigmergy events to obsidianblackboard.jsonl
 * 
 * Uses silver-promoted schema from:
 * hot_obsidian_sandbox/silver/contracts/obsidian-stigmergy.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { 
  createObsidianEvent, 
  toJsonl,
  type ObsidianStigmergy 
} from '../../silver/contracts/obsidian-stigmergy.js';

// === ESM __dirname equivalent ===
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === Configuration ===
const BRONZE_ROOT = path.resolve(__dirname, '..');
const BLACKBOARD_PATH = path.resolve(__dirname, '../../../obsidianblackboard.jsonl');
const MANIFEST_PATH = path.join(BRONZE_ROOT, '_migration_manifest.jsonl');
const GEN = 88;
const LAYER = 'bronze' as const;

// === Types ===
type ParaCategory = 'project' | 'area' | 'resource' | 'archive';
type HfoPort = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 'cross' | null;

interface MigrationEntry {
  id: string;
  timestamp: string;
  originalPath: string;
  newPath: string;
  paraCategory: ParaCategory;
  hfoPort: HfoPort;
  reason: string;
  fileType: 'file' | 'directory';
}

// === Classification Rules ===
const classificationRules = {
  projects: {
    patterns: [
      /gen89/i,
      /w3c.*gesture/i,
      /silver.*baton/i,
      /HANDOFF.*CONSOLIDATED/i,
      /kiro_gen89/i,
      /hfo_vertical_slice_2026/i,
    ],
    subfolders: {
      'gen89_phoenix': [/gen89/i, /HANDOFF.*CONSOLIDATED/i, /kiro_gen89/i],
      'w3c_gesture_pipeline': [/w3c.*gesture/i, /w3c.*pointer/i, /P0_GESTURE/i, /P0_UNIVERSAL/i],
      'silver_baton_quine': [/silver.*baton/i, /baton.*validator/i],
    }
  },
  areas: {
    patterns: [
      /^P[0-7]_.*LEDGER/i,
      /^P[0-7]_.*KINETIC/i,
      /contracts\//i,
      /adapters\//i,
      /scripts\//i,
      /infra\//i,
      /tests\//i,
      /P4_RED_REGNANT\//i,
      /P5_PYRE_PRAETORIAN\//i,
    ],
    subfolders: {
      'hfo_ports': [/^P[0-7]_/i],
      'infrastructure': [/scripts\//i, /infra\//i, /adapters\//i],
      'contracts': [/contracts\//i],
      'enforcement': [/P4_RED_REGNANT\//i, /P5_PYRE_PRAETORIAN\//i],
    }
  },
  resources: {
    patterns: [
      /STRATEGY/i,
      /REPORT/i,
      /MATRIX/i,
      /TEMPLATE/i,
      /exemplars\//i,
      /one.*euro/i,
      /sensor.*fusion/i,
      /LEGENDARY_COMMANDERS/i,
      /provenance\//i,
    ],
    subfolders: {
      'strategy': [/STRATEGY/i, /PLAN/i, /OPTIONS/i],
      'analysis': [/REPORT/i, /MATRIX/i, /ANALYSIS/i, /FORENSIC/i],
      'templates': [/TEMPLATE/i, /exemplars\//i],
      'algorithms': [/one.*euro/i, /sensor.*fusion/i, /ttv-sensor/i],
    }
  },
  archive: {
    patterns: [
      /archive/i,
      /quarantine/i,
      /demoted/i,
      /vertical.*spike.*summary.*v[1-4]/i,
      /hfo_vertical_spike_summary_v[1-4]/i,
    ],
    subfolders: {
      'gen88_2026_01_06': [/archive_2026_1_6/i],
      'gen88_jan_5': [/archive_jan_5/i],
      'vertical_spikes': [/vertical.*spike.*summary.*v[1-4]/i, /hfo_vertical_spike_summary_v[1-4]/i],
      'quarantine': [/quarantine/i],
      'demoted': [/demoted/i],
    }
  },
};

// === Port Extraction ===
function extractPort(filePath: string): HfoPort {
  const portMatch = filePath.match(/P([0-7])_/i);
  if (portMatch) {
    return parseInt(portMatch[1], 10) as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
  }
  // Cross-port files
  if (/scripts|infra|archive|demoted|quarantine/i.test(filePath)) {
    return 'cross';
  }
  return null;
}

// === Classification ===
function classifyFile(relativePath: string): { category: ParaCategory; subfolder: string; reason: string } {
  // Check projects first (highest priority for active work)
  for (const [subfolder, patterns] of Object.entries(classificationRules.projects.subfolders)) {
    for (const pattern of patterns) {
      if (pattern.test(relativePath)) {
        return { category: 'project', subfolder, reason: `Matches project pattern: ${pattern}` };
      }
    }
  }
  
  // Check archive (before areas to catch archive folders)
  for (const [subfolder, patterns] of Object.entries(classificationRules.archive.subfolders)) {
    for (const pattern of patterns) {
      if (pattern.test(relativePath)) {
        return { category: 'archive', subfolder, reason: `Matches archive pattern: ${pattern}` };
      }
    }
  }
  
  // Check areas
  for (const [subfolder, patterns] of Object.entries(classificationRules.areas.subfolders)) {
    for (const pattern of patterns) {
      if (pattern.test(relativePath)) {
        return { category: 'area', subfolder, reason: `Matches area pattern: ${pattern}` };
      }
    }
  }
  
  // Check resources
  for (const [subfolder, patterns] of Object.entries(classificationRules.resources.subfolders)) {
    for (const pattern of patterns) {
      if (pattern.test(relativePath)) {
        return { category: 'resource', subfolder, reason: `Matches resource pattern: ${pattern}` };
      }
    }
  }
  
  // Default to archive/_uncategorized
  return { category: 'archive', subfolder: '_uncategorized', reason: 'No matching pattern found' };
}

// === Event Emission ===
const events: ObsidianStigmergy[] = [];

function emitObserveEvent(filePath: string, stats: fs.Stats): void {
  const event = createObsidianEvent(
    0, // Port 0: OBSERVE
    'file',
    'sensed',
    GEN,
    LAYER,
    { path: filePath, size: stats.size, isDirectory: stats.isDirectory() },
    {
      given: `file at ${filePath}`,
      when: 'migration scan started',
      then: 'file metadata extracted',
    }
  );
  events.push(event);
}

function emitShapeEvent(filePath: string, classification: { category: ParaCategory; subfolder: string }): void {
  const event = createObsidianEvent(
    2, // Port 2: SHAPE
    'data',
    'transformed',
    GEN,
    LAYER,
    { path: filePath, para: classification.category, subfolder: classification.subfolder },
    {
      given: 'file metadata available',
      when: 'classification rules applied',
      then: `PARA category assigned: ${classification.category}/${classification.subfolder}`,
    }
  );
  events.push(event);
}

function emitNavigateEvent(entry: MigrationEntry): void {
  const event = createObsidianEvent(
    7, // Port 7: NAVIGATE
    'decision',
    'made',
    GEN,
    LAYER,
    { from: entry.originalPath, to: entry.newPath, reason: entry.reason },
    {
      given: `file classified as ${entry.paraCategory}`,
      when: 'migration decision evaluated',
      then: `decided to move to ${entry.newPath}`,
    }
  );
  events.push(event);
}

function emitInjectEvent(entry: MigrationEntry): void {
  const event = createObsidianEvent(
    3, // Port 3: INJECT
    'artifact',
    'promoted',
    GEN,
    LAYER,
    { from: entry.originalPath, to: entry.newPath },
    {
      given: 'migration decision made',
      when: 'file move executed',
      then: `file moved to ${entry.newPath}`,
    }
  );
  events.push(event);
}

function emitAssimilateEvent(sourceFile: string, targetFile: string, relationship: string): void {
  const event = createObsidianEvent(
    6, // Port 6: ASSIMILATE
    'relationship',
    'linked',
    GEN,
    LAYER,
    { source: sourceFile, target: targetFile, relationship },
    {
      given: `files ${sourceFile} and ${targetFile} exist`,
      when: 'relationship analysis completed',
      then: `relationship ${relationship} recorded`,
    }
  );
  events.push(event);
}

// === File Scanning ===
function scanDirectory(dir: string, relativeTo: string): MigrationEntry[] {
  const entries: MigrationEntry[] = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    const relativePath = path.relative(relativeTo, fullPath);
    
    // Skip PARA folders if they already exist, node_modules, .stryker-tmp
    if (/^[1-4]_|node_modules|\.stryker-tmp|\.venv|hot_obsidian_sandbox\/bronze\/hot_obsidian_sandbox/.test(relativePath)) {
      continue;
    }
    
    const stats = fs.statSync(fullPath);
    
    // Emit OBSERVE event
    emitObserveEvent(relativePath, stats);
    
    // Classify
    const classification = classifyFile(relativePath);
    
    // Emit SHAPE event
    emitShapeEvent(relativePath, classification);
    
    // Build new path
    const categoryPrefix = {
      'project': '1_projects',
      'area': '2_areas',
      'resource': '3_resources',
      'archive': '4_archive',
    }[classification.category];
    
    const newPath = path.join(categoryPrefix, classification.subfolder, item.name);
    
    const entry: MigrationEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      originalPath: relativePath,
      newPath,
      paraCategory: classification.category,
      hfoPort: extractPort(relativePath),
      reason: classification.reason,
      fileType: item.isDirectory() ? 'directory' : 'file',
    };
    
    // Emit NAVIGATE event
    emitNavigateEvent(entry);
    
    entries.push(entry);
    
    // Recurse into directories (but don't add their contents to top-level manifest)
    if (item.isDirectory()) {
      // We track directories as units, not individual files within
    }
  }
  
  return entries;
}

// === Main ===
async function main() {
  console.log('🔍 PARA Migration Scanner with OBSIDIAN Stigmergy');
  console.log('================================================\n');
  
  // Scan bronze directory
  console.log('📂 Scanning bronze directory...');
  const entries = scanDirectory(BRONZE_ROOT, BRONZE_ROOT);
  
  console.log(`\n📊 Found ${entries.length} items to migrate`);
  
  // Group by category
  const byCategory = entries.reduce((acc, e) => {
    acc[e.paraCategory] = (acc[e.paraCategory] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('\nBy PARA Category:');
  for (const [cat, count] of Object.entries(byCategory)) {
    console.log(`  ${cat}: ${count}`);
  }
  
  // Group by port
  const byPort = entries.reduce((acc, e) => {
    const key = e.hfoPort === null ? 'none' : String(e.hfoPort);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('\nBy HFO Port:');
  for (const [port, count] of Object.entries(byPort)) {
    console.log(`  P${port}: ${count}`);
  }
  
  // Write manifest
  console.log(`\n📝 Writing manifest to ${MANIFEST_PATH}...`);
  const manifestLines = entries.map(e => JSON.stringify(e)).join('\n');
  fs.writeFileSync(MANIFEST_PATH, manifestLines + '\n');
  
  // Write events to blackboard
  console.log(`\n📡 Emitting ${events.length} OBSIDIAN stigmergy events to blackboard...`);
  const eventLines = events.map(toJsonl).join('\n');
  fs.appendFileSync(BLACKBOARD_PATH, eventLines + '\n');
  
  console.log('\n✅ Migration manifest generated. Review before executing.');
  console.log('   Run with --execute flag to perform actual file moves.');
}

// Run if called directly
main().catch(console.error);
