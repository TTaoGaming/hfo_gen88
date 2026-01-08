/**
 * PYRE_DANCE - The Dance of Shiva (Demotion/Rebirth)
 * @provenance P5_PYRE_PRAETORIAN
 * Validates: AGENTS.md Rule 5 - Pyre Dance
 */

import { appendFileSync, existsSync, mkdirSync, renameSync, unlinkSync, readFileSync } from 'fs';
import { dirname, join, basename, resolve, relative } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = resolve(__dirname, '../../../../'); // Ascend from 2_areas/hfo_ports/P5_PYRE_PRAETORIAN/

const BLOOD_BOOK = join(ROOT_DIR, 'hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P4_RED_REGNANT/RED_BOOK_OF_BLOOD_GRUDGES.jsonl');

/**
 * PARA Medallion Destinations
 */
const MEDALLIONS = ['gold', 'silver', 'bronze'];

function getParaDest(filePath: string): string {
  const absPath = resolve(ROOT_DIR, filePath);
  const relPath = relative(ROOT_DIR, absPath);
  const parts = relPath.split(/[\\\/]/);
  
  // Find which medallion we are in
  // Case 1: hot_obsidian_sandbox/medallion/...
  if (parts[0] === 'hot_obsidian_sandbox' && MEDALLIONS.includes(parts[1])) {
    const medallion = parts[1];
    return join(ROOT_DIR, 'hot_obsidian_sandbox', medallion, '4_archive');
  }
  
  // Default to Bronze Archive
  return join(ROOT_DIR, 'hot_obsidian_sandbox/bronze/4_archive');
}

export interface DanceResult {
  file: string;
  action: 'demoted' | 'purged' | 'skipped' | 'stabilized';
  reason: string;
  timestamp: string;
}

/**
 * Demote a file to the appropriate PARA Archive.
 */
export function demote(filePath: string, reason: string): DanceResult {
  const timestamp = new Date().toISOString();
  const absPath = resolve(ROOT_DIR, filePath);
  
  if (!existsSync(absPath)) {
     return { file: filePath, action: 'skipped', reason: 'File not found', timestamp };
  }

  const content = readFileSync(absPath, 'utf8');
  if (content.includes('@permitted') || content.includes('@bespoke')) {
    return { file: filePath, action: 'skipped', reason: 'Has escape hatch', timestamp };
  }

  const archiveDir = getParaDest(filePath);
  if (!existsSync(archiveDir)) {
    mkdirSync(archiveDir, { recursive: true });
  }

  const destPath = join(archiveDir, basename(filePath));
  
  try {
    renameSync(absPath, destPath);
    logToBloodBook({ file: filePath, action: 'demoted', reason, timestamp });
    return { file: filePath, action: 'demoted', reason, timestamp };
  } catch (e) {
    return { file: filePath, action: 'skipped', reason: `Move failed: ${(e as Error).message}`, timestamp };
  }
}

/**
 * Purge a file completely (for severe violations).
 */
export function purge(filePath: string, reason: string): DanceResult {
  const timestamp = new Date().toISOString();
  const absPath = resolve(ROOT_DIR, filePath);
  
  try {
    if (existsSync(absPath)) {
      unlinkSync(absPath);
      logToBloodBook({ file: filePath, action: 'purged', reason, timestamp });
      return { file: filePath, action: 'purged', reason, timestamp };
    }
  } catch (e) {
    // File may already be gone
  }

  return { file: filePath, action: 'skipped', reason: 'File not found', timestamp };
}

/**
 * Execute the Dance of Shiva on a list of violations.
 */
export function danceDie(violations: Array<{ file: string; type: string; message: string }>): DanceResult[] {
  const results: DanceResult[] = [];
  
  for (const v of violations) {
    const absPath = resolve(ROOT_DIR, v.file);
    if (!existsSync(absPath)) continue;

    const content = readFileSync(absPath, 'utf8');
    
    // Check for permitted files
    if (content.includes('@permitted') || content.includes('@bespoke')) {
      results.push({
        file: v.file,
        action: 'skipped',
        reason: `Protected by escape hatch`,
        timestamp: new Date().toISOString(),
      });
      continue;
    }

    // Demote silver/gold violations
    if (v.file.includes('/silver/') || v.file.includes('/gold/')) {
      results.push(demote(v.file, `${v.type}: ${v.message}`));
    } else {
      // For Bronze, if it is a severe "Theater" violation, we might still archive it
      if (v.type === 'THEATER' || v.type === 'POLLUTION') {
         results.push(demote(v.file, `Bronze Disruption: ${v.message}`));
      } else {
        results.push({
          file: v.file,
          action: 'skipped',
          reason: 'Bronze tier - logged only',
          timestamp: new Date().toISOString(),
        });
      }
    }
  }

  return results;
}

function logToBloodBook(entry: DanceResult): void {
  const dir = dirname(BLOOD_BOOK);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  appendFileSync(BLOOD_BOOK, JSON.stringify(entry) + '\n');
}

export default { demote, purge, danceDie };
