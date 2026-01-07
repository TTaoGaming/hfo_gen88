/**
 * Ledger Core Property Tests
 * @provenance hfo-testing-promotion/2.3, 2.4
 * Feature: hfo-testing-promotion
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  computeHash,
  createEntry,
  verifyChain,
  getLastHash,
  GENESIS_HASH,
  LedgerEntry,
} from './ledger-core';

// Arbitrary for valid harness data
const arbitraryHarnessData = () =>
  fc.record({
    harness_id: fc.integer({ min: 0, max: 7 }),
    harness_name: fc.constantFrom('SENSE', 'FUSE', 'SHAPE', 'DELIVER', 'DISRUPT', 'IMMUNIZE', 'STORE', 'DECIDE'),
    model: fc.string({ minLength: 1, maxLength: 50 }),
    scores: fc.record({
      raw: fc.integer({ min: 0, max: 100 }),
      normalized: fc.float({ min: 0, max: 1, noNaN: true }),
    }),
    // Generate ISO timestamp directly to avoid Date issues
    timestamp: fc.tuple(
      fc.integer({ min: 2020, max: 2030 }),
      fc.integer({ min: 1, max: 12 }),
      fc.integer({ min: 1, max: 28 }),
      fc.integer({ min: 0, max: 23 }),
      fc.integer({ min: 0, max: 59 }),
      fc.integer({ min: 0, max: 59 })
    ).map(([y, m, d, h, min, s]) => 
      `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}T${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(s).padStart(2, '0')}.000Z`
    ),
    duration_ms: fc.integer({ min: 0, max: 100000 }),
  });

// Arbitrary for 16-char hex string (hash)
const arbitraryHash = () =>
  fc.array(fc.integer({ min: 0, max: 15 }), { minLength: 16, maxLength: 16 })
    .map(arr => arr.map(n => n.toString(16)).join(''));

// Arbitrary for a chain of entries
const arbitraryChain = (maxLength: number = 10) =>
  fc.array(arbitraryHarnessData(), { minLength: 0, maxLength }).map(dataList => {
    const entries: LedgerEntry[] = [];
    let prevHash = GENESIS_HASH;
    for (const data of dataList) {
      const entry = createEntry(data, prevHash);
      entries.push(entry);
      prevHash = entry.hash;
    }
    return entries;
  });

describe('Ledger Core Properties', () => {
  /**
   * Property 1: Ledger Append-Read Round-Trip
   * For any valid HarnessResult, creating an entry and extracting data
   * SHALL return the original fields.
   * Validates: Requirements 1.4
   */
  describe('Property 1: Ledger Append-Read Round-Trip', () => {
    it('createEntry preserves all input data', () => {
      fc.assert(
        fc.property(arbitraryHarnessData(), (data) => {
          const entry = createEntry(data);
          
          // All original fields should be preserved
          expect(entry.harness_id).toBe(data.harness_id);
          expect(entry.harness_name).toBe(data.harness_name);
          expect(entry.model).toBe(data.model);
          expect(entry.scores.raw).toBe(data.scores.raw);
          expect(entry.scores.normalized).toBe(data.scores.normalized);
          expect(entry.timestamp).toBe(data.timestamp);
          expect(entry.duration_ms).toBe(data.duration_ms);
          
          // Hash fields should be added
          expect(entry.prev_hash).toBe(GENESIS_HASH);
          expect(entry.hash).toHaveLength(16);
        }),
        { numRuns: 100 }
      );
    });

    it('chain building preserves all entries', () => {
      fc.assert(
        fc.property(
          fc.array(arbitraryHarnessData(), { minLength: 1, maxLength: 20 }),
          (dataList) => {
            const entries: LedgerEntry[] = [];
            let prevHash = GENESIS_HASH;
            
            for (const data of dataList) {
              const entry = createEntry(data, prevHash);
              entries.push(entry);
              prevHash = entry.hash;
            }
            
            // All entries should be present
            expect(entries).toHaveLength(dataList.length);
            
            // Each entry should have correct data
            for (let i = 0; i < dataList.length; i++) {
              expect(entries[i].harness_id).toBe(dataList[i].harness_id);
              expect(entries[i].model).toBe(dataList[i].model);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 2: Ledger Hash-Chain Integrity
   * For any sequence of ledger entries, verification SHALL pass if and only if
   * no entries have been modified.
   * Validates: Requirements 1.1, 1.2, 1.5
   */
  describe('Property 2: Ledger Hash-Chain Integrity', () => {
    it('valid chains always verify', () => {
      fc.assert(
        fc.property(arbitraryChain(20), (chain) => {
          const result = verifyChain(chain);
          expect(result.valid).toBe(true);
          expect(result.entries).toBe(chain.length);
        }),
        { numRuns: 100 }
      );
    });

    it('corrupted hash is always detected', () => {
      fc.assert(
        fc.property(
          arbitraryChain(10).filter(c => c.length > 0),
          fc.integer({ min: 0, max: 9 }),
          arbitraryHash(),
          (chain, corruptIdx, fakeHash) => {
            const idx = corruptIdx % chain.length;
            
            // Only corrupt if the fake hash is different
            if (fakeHash === chain[idx].hash) return;
            
            const corrupted = [...chain];
            corrupted[idx] = { ...corrupted[idx], hash: fakeHash };
            
            const result = verifyChain(corrupted);
            expect(result.valid).toBe(false);
            expect(result.firstCorrupt).toBeLessThanOrEqual(idx);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('broken chain link is always detected', () => {
      fc.assert(
        fc.property(
          arbitraryChain(10).filter(c => c.length > 1),
          fc.integer({ min: 1, max: 9 }),
          arbitraryHash(),
          (chain, breakIdx, fakePrevHash) => {
            const idx = breakIdx % (chain.length - 1) + 1; // Ensure idx >= 1
            
            // Only break if the fake prev_hash is different
            if (fakePrevHash === chain[idx].prev_hash) return;
            
            const broken = [...chain];
            broken[idx] = { ...broken[idx], prev_hash: fakePrevHash };
            
            const result = verifyChain(broken);
            expect(result.valid).toBe(false);
            expect(result.firstCorrupt).toBe(idx);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('hash computation is deterministic', () => {
      fc.assert(
        fc.property(
          arbitraryHarnessData(),
          arbitraryHash(),
          (data, prevHash) => {
            const hash1 = computeHash(data, prevHash);
            const hash2 = computeHash(data, prevHash);
            expect(hash1).toBe(hash2);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('getLastHash returns correct hash', () => {
      fc.assert(
        fc.property(arbitraryChain(10), (chain) => {
          const lastHash = getLastHash(chain);
          if (chain.length === 0) {
            expect(lastHash).toBe(GENESIS_HASH);
          } else {
            expect(lastHash).toBe(chain[chain.length - 1].hash);
          }
        }),
        { numRuns: 100 }
      );
    });
  });
});
