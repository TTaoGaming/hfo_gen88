/**
 * Hash-chained JSONL Ledger for evaluation results
 * @provenance hfo-testing-promotion/13.1
 * Validates: Requirements 1.1 (delegates to silver/ledger-core)
 */

import { appendFileSync, readFileSync, existsSync } from 'fs';
import { HarnessResult } from '../schemas';
import {
  computeHash,
  verifyChain,
  GENESIS_HASH,
  type LedgerEntry as SilverLedgerEntry,
} from '../../../silver/ledger/ledger-core';

// Re-export silver types for bronze consumers
export type LedgerEntry = SilverLedgerEntry;

export function appendToLedger(path: string, result: Omit<HarnessResult, 'prev_hash' | 'hash'>): HarnessResult {
  let prevHash = GENESIS_HASH;
  
  if (existsSync(path)) {
    const lines = readFileSync(path, 'utf-8').trim().split('\n').filter(Boolean);
    if (lines.length > 0) {
      const last = JSON.parse(lines[lines.length - 1]) as LedgerEntry;
      prevHash = last.hash;
    }
  }

  // Use silver computeHash for hash computation
  const hash = computeHash(result, prevHash);
  const entry: LedgerEntry = { ...result, prev_hash: prevHash, hash };
  
  appendFileSync(path, JSON.stringify(entry) + '\n');
  return entry;
}

export function readLedger(path: string): LedgerEntry[] {
  if (!existsSync(path)) return [];
  return readFileSync(path, 'utf-8')
    .trim()
    .split('\n')
    .filter(Boolean)
    .map(line => JSON.parse(line));
}

export function verifyLedger(path: string): { valid: boolean; entries: number; firstCorrupt?: number } {
  const entries = readLedger(path);
  // Delegate to silver verifyChain
  const result = verifyChain(entries as SilverLedgerEntry[]);
  return { valid: result.valid, entries: result.entries, firstCorrupt: result.firstCorrupt };
}
