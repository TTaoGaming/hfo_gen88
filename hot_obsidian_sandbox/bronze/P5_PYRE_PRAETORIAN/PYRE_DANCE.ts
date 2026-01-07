/**
 * PYRE_DANCE - The Dance of Shiva (Demotion/Rebirth)
 * @provenance P5_PYRE_PRAETORIAN
 * Validates: AGENTS.md Rule 5 - Pyre Dance
 */

import { appendFileSync, existsSync, mkdirSync, renameSync, unlinkSync } from 'fs';
import { dirname, join, basename } from 'path';

const BLOOD_BOOK = 'hot_obsidian_sandbox/bronze/P4_RED_REGNANT/RED_BOOK_OF_BLOOD_GRUDGES.jsonl';
const QUARANTINE_DIR = 'hot_obsidian_sandbox/bronze/quarantine';

export interface DanceResult {
  file: string;
  action: 'demoted' | 'purged' | 'skipped';
  reason: string;
  timestamp: string;
}

/**
 * Demote a file from silver/gold to bronze quarantine.
 */
export function demote(filePath: string, reason: string): DanceResult {
  const timestamp = new Date().toISOString();
  
  // Check for escape hatches
  if (filePath.includes('@permitted') || filePath.includes('@bespoke')) {
    return { file: filePath, action: 'skipped', reason: 'Has escape hatch', timestamp };
  }

  // Ensure quarantine exists
  if (!existsSync(QUARANTINE_DIR)) {
    mkdirSync(QUARANTINE_DIR, { recursive: true });
  }

  const destPath = join(QUARANTINE_DIR, basename(filePath));
  
  try {
    if (existsSync(filePath)) {
      renameSync(filePath, destPath);
      logToBloodBook({ file: filePath, action: 'demoted', reason, timestamp });
      return { file: filePath, action: 'demoted', reason, timestamp };
    }
  } catch (e) {
    // File may already be gone
  }

  return { file: filePath, action: 'skipped', reason: 'File not found', timestamp };
}

/**
 * Purge a file completely (for severe violations).
 */
export function purge(filePath: string, reason: string): DanceResult {
  const timestamp = new Date().toISOString();
  
  try {
    if (existsSync(filePath)) {
      unlinkSync(filePath);
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
    // Check for permitted files
    if (v.file.includes('@permitted') || v.file.includes('@bespoke')) {
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
      // Log bronze violations but don't demote
      results.push({
        file: v.file,
        action: 'skipped',
        reason: 'Bronze tier - logged only',
        timestamp: new Date().toISOString(),
      });
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
