/**
 * Hash-Chained Ledger Core - Pure Functions
 * @provenance hfo-testing-promotion/2.1
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5
 */

import { createHash } from 'crypto';

/** Genesis hash for empty ledger */
export const GENESIS_HASH = '0000000000000000';

/** Ledger entry with hash chain */
export interface LedgerEntry {
  harness_id: number;
  harness_name: string;
  model: string;
  scores: { raw: number; normalized: number };
  timestamp: string;
  duration_ms: number;
  prev_hash: string;
  hash: string;
  metadata?: Record<string, unknown>;
}

/** Result of ledger verification */
export interface VerifyResult {
  valid: boolean;
  entries: number;
  firstCorrupt?: number;
  error?: string;
}

/**
 * Compute SHA-256 hash of entry data combined with previous hash.
 * Returns first 16 hex characters for compact storage.
 * Validates: Requirements 1.1
 */
export function computeHash(data: object, prevHash: string): string {
  const payload = JSON.stringify({ ...data, prev_hash: prevHash });
  return createHash('sha256').update(payload).digest('hex').slice(0, 16);
}

/**
 * Create a new ledger entry with computed hash.
 * Validates: Requirements 1.1, 1.3
 */
export function createEntry(
  data: Omit<LedgerEntry, 'prev_hash' | 'hash'>,
  prevHash: string = GENESIS_HASH
): LedgerEntry {
  const hash = computeHash(data, prevHash);
  return { ...data, prev_hash: prevHash, hash };
}

/**
 * Verify integrity of a hash chain.
 * Returns valid=true if all hashes are correct, otherwise returns index of first corrupt entry.
 * Validates: Requirements 1.2, 1.5
 */
export function verifyChain(entries: LedgerEntry[]): VerifyResult {
  if (entries.length === 0) {
    return { valid: true, entries: 0 };
  }

  let prevHash = GENESIS_HASH;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];

    // Check prev_hash links correctly
    if (entry.prev_hash !== prevHash) {
      return {
        valid: false,
        entries: entries.length,
        firstCorrupt: i,
        error: `Entry ${i}: prev_hash mismatch (expected ${prevHash}, got ${entry.prev_hash})`,
      };
    }

    // Recompute hash and verify
    const { hash, ...data } = entry;
    const computed = computeHash(data, prevHash);
    if (computed !== hash) {
      return {
        valid: false,
        entries: entries.length,
        firstCorrupt: i,
        error: `Entry ${i}: hash mismatch (expected ${computed}, got ${hash})`,
      };
    }

    prevHash = hash;
  }

  return { valid: true, entries: entries.length };
}

/**
 * Get the last hash from a chain, or genesis hash if empty.
 * Validates: Requirements 1.3
 */
export function getLastHash(entries: LedgerEntry[]): string {
  if (entries.length === 0) return GENESIS_HASH;
  return entries[entries.length - 1].hash;
}
