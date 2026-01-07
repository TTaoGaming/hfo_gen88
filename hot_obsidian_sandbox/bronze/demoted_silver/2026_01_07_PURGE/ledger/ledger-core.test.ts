/**
 * Ledger Core Unit Tests
 * @provenance hfo-testing-promotion/2.2
 * Validates: Requirements 1.1, 1.2, 1.3
 */

import { describe, it, expect } from 'vitest';
import {
  computeHash,
  createEntry,
  verifyChain,
  getLastHash,
  GENESIS_HASH,
  LedgerEntry,
} from './ledger-core';

describe('Ledger Core', () => {
  const sampleData = {
    harness_id: 0,
    harness_name: 'SENSE',
    model: 'test-model',
    scores: { raw: 80, normalized: 0.8 },
    timestamp: '2026-01-07T00:00:00.000Z',
    duration_ms: 1000,
  };

  describe('computeHash', () => {
    it('should return 16 character hex string', () => {
      const hash = computeHash(sampleData, GENESIS_HASH);
      expect(hash).toHaveLength(16);
      expect(hash).toMatch(/^[0-9a-f]{16}$/);
    });

    it('should be deterministic - same input produces same hash', () => {
      const hash1 = computeHash(sampleData, GENESIS_HASH);
      const hash2 = computeHash(sampleData, GENESIS_HASH);
      expect(hash1).toBe(hash2);
    });

    it('should produce different hash for different data', () => {
      const hash1 = computeHash(sampleData, GENESIS_HASH);
      const hash2 = computeHash({ ...sampleData, harness_id: 1 }, GENESIS_HASH);
      expect(hash1).not.toBe(hash2);
    });

    it('should produce different hash for different prev_hash', () => {
      const hash1 = computeHash(sampleData, GENESIS_HASH);
      const hash2 = computeHash(sampleData, 'abcdef0123456789');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('createEntry', () => {
    it('should use genesis hash when no prev_hash provided', () => {
      const entry = createEntry(sampleData);
      expect(entry.prev_hash).toBe(GENESIS_HASH);
    });

    it('should compute hash correctly', () => {
      const entry = createEntry(sampleData);
      const expectedHash = computeHash(sampleData, GENESIS_HASH);
      expect(entry.hash).toBe(expectedHash);
    });

    it('should preserve all input data', () => {
      const entry = createEntry(sampleData);
      expect(entry.harness_id).toBe(sampleData.harness_id);
      expect(entry.harness_name).toBe(sampleData.harness_name);
      expect(entry.model).toBe(sampleData.model);
      expect(entry.scores).toEqual(sampleData.scores);
    });
  });

  describe('verifyChain', () => {
    it('should return valid for empty chain', () => {
      const result = verifyChain([]);
      expect(result.valid).toBe(true);
      expect(result.entries).toBe(0);
    });

    it('should return valid for single correct entry', () => {
      const entry = createEntry(sampleData);
      const result = verifyChain([entry]);
      expect(result.valid).toBe(true);
      expect(result.entries).toBe(1);
    });

    it('should return valid for correct chain of multiple entries', () => {
      const entry1 = createEntry(sampleData);
      const entry2 = createEntry({ ...sampleData, harness_id: 1 }, entry1.hash);
      const entry3 = createEntry({ ...sampleData, harness_id: 2 }, entry2.hash);
      
      const result = verifyChain([entry1, entry2, entry3]);
      expect(result.valid).toBe(true);
      expect(result.entries).toBe(3);
    });

    it('should detect corrupted hash', () => {
      const entry = createEntry(sampleData);
      const corrupted: LedgerEntry = { ...entry, hash: 'corrupted1234567' };
      
      const result = verifyChain([corrupted]);
      expect(result.valid).toBe(false);
      expect(result.firstCorrupt).toBe(0);
    });

    it('should detect broken chain link', () => {
      const entry1 = createEntry(sampleData);
      const entry2 = createEntry({ ...sampleData, harness_id: 1 }, entry1.hash);
      const brokenEntry2: LedgerEntry = { ...entry2, prev_hash: 'wrong_prev_hash00' };
      
      const result = verifyChain([entry1, brokenEntry2]);
      expect(result.valid).toBe(false);
      expect(result.firstCorrupt).toBe(1);
    });

    it('should detect corruption in middle of chain', () => {
      const entry1 = createEntry(sampleData);
      const entry2 = createEntry({ ...sampleData, harness_id: 1 }, entry1.hash);
      const entry3 = createEntry({ ...sampleData, harness_id: 2 }, entry2.hash);
      
      // Corrupt entry2's hash but keep entry3's prev_hash pointing to original
      const corrupted2: LedgerEntry = { ...entry2, hash: 'corrupted1234567' };
      
      const result = verifyChain([entry1, corrupted2, entry3]);
      expect(result.valid).toBe(false);
      expect(result.firstCorrupt).toBe(1);
    });
  });

  describe('getLastHash', () => {
    it('should return genesis hash for empty chain', () => {
      expect(getLastHash([])).toBe(GENESIS_HASH);
    });

    it('should return last entry hash for non-empty chain', () => {
      const entry1 = createEntry(sampleData);
      const entry2 = createEntry({ ...sampleData, harness_id: 1 }, entry1.hash);
      
      expect(getLastHash([entry1, entry2])).toBe(entry2.hash);
    });
  });

  describe('GENESIS_HASH', () => {
    it('should be 16 zeros', () => {
      expect(GENESIS_HASH).toBe('0000000000000000');
      expect(GENESIS_HASH).toHaveLength(16);
    });
  });
});
