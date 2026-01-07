/**
 * Hash-chained JSONL Ledger for evaluation results
 */

import { createHash } from 'crypto';
import { appendFileSync, readFileSync, existsSync } from 'fs';
import { HarnessResult } from '../schemas';

export interface LedgerEntry extends HarnessResult {
  prev_hash: string;
  hash: string;
}

function computeHash(data: object, prevHash: string): string {
  const payload = JSON.stringify({ ...data, prev_hash: prevHash });
  return createHash('sha256').update(payload).digest('hex').slice(0, 16);
}

export function appendToLedger(path: string, result: Omit<HarnessResult, 'prev_hash' | 'hash'>): HarnessResult {
  let prevHash = '0000000000000000';
  
  if (existsSync(path)) {
    const lines = readFileSync(path, 'utf-8').trim().split('\n').filter(Boolean);
    if (lines.length > 0) {
      const last = JSON.parse(lines[lines.length - 1]) as LedgerEntry;
      prevHash = last.hash;
    }
  }

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
  let prevHash = '0000000000000000';
  
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    if (e.prev_hash !== prevHash) {
      return { valid: false, entries: entries.length, firstCorrupt: i };
    }
    const { hash, ...data } = e;
    const computed = computeHash(data, prevHash);
    if (computed !== hash) {
      return { valid: false, entries: entries.length, firstCorrupt: i };
    }
    prevHash = hash;
  }
  
  return { valid: true, entries: entries.length };
}
