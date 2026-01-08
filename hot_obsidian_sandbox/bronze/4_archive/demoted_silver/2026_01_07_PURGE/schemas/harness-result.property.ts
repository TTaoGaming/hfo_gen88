/**
 * Harness Result Schema Property Tests
 * @provenance hfo-testing-promotion/4.3, 4.4
 * Feature: hfo-testing-promotion
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  HarnessResultSchema,
  validateHarnessResult,
  serializeResult,
  parseResult,
  isValidHarnessId,
  isValidNormalizedScore,
  isValidTimestamp,
  HARNESS_NAMES,
  HarnessResult,
} from './harness-result';

// Arbitrary for valid ISO timestamp
const arbitraryTimestamp = () =>
  fc.tuple(
    fc.integer({ min: 2020, max: 2030 }),
    fc.integer({ min: 1, max: 12 }),
    fc.integer({ min: 1, max: 28 }),
    fc.integer({ min: 0, max: 23 }),
    fc.integer({ min: 0, max: 59 }),
    fc.integer({ min: 0, max: 59 })
  ).map(([y, m, d, h, min, s]) => 
    `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}T${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(s).padStart(2, '0')}.000Z`
  );

// Arbitrary for 16-char hex string
const arbitraryHash = () =>
  fc.array(fc.integer({ min: 0, max: 15 }), { minLength: 16, maxLength: 16 })
    .map(arr => arr.map(n => n.toString(16)).join(''));

// Arbitrary for valid HarnessResult
const arbitraryHarnessResult = (): fc.Arbitrary<HarnessResult> =>
  fc.record({
    harness_id: fc.integer({ min: 0, max: 7 }),
    harness_name: fc.constantFrom(...HARNESS_NAMES),
    model: fc.string({ minLength: 1, maxLength: 50 }),
    scores: fc.record({
      raw: fc.integer({ min: 0, max: 100 }),
      normalized: fc.float({ min: 0, max: 1, noNaN: true }),
    }),
    timestamp: arbitraryTimestamp(),
    duration_ms: fc.integer({ min: 0, max: 100000 }),
    prev_hash: arbitraryHash(),
    hash: arbitraryHash(),
  });

describe('Harness Result Schema Properties', () => {
  /**
   * Property 3: Schema Validation Boundaries
   * For any harness_id outside [0,7], for any normalized score outside [0,1],
   * or for any malformed timestamp, the Schema SHALL reject the input.
   * Validates: Requirements 2.1, 2.2, 2.3
   */
  describe('Property 3: Schema Validation Boundaries', () => {
    it('rejects harness_id outside [0,7]', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.integer({ max: -1 }),
            fc.integer({ min: 8 })
          ),
          (invalidId) => {
            expect(isValidHarnessId(invalidId)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('accepts harness_id inside [0,7]', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 7 }),
          (validId) => {
            expect(isValidHarnessId(validId)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('rejects normalized score outside [0,1]', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.float({ max: Math.fround(-0.001), noNaN: true }),
            fc.float({ min: Math.fround(1.001), noNaN: true })
          ),
          (invalidScore) => {
            expect(isValidNormalizedScore(invalidScore)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('accepts normalized score inside [0,1]', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 1, noNaN: true }),
          (validScore) => {
            expect(isValidNormalizedScore(validScore)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('rejects malformed timestamps', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.string({ minLength: 1, maxLength: 20 }).filter(s => !s.includes('T')),
            fc.constant('not-a-date'),
            fc.constant('2026-01-07'), // date only
            fc.constant('12:00:00'), // time only
          ),
          (invalidTimestamp) => {
            expect(isValidTimestamp(invalidTimestamp)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('accepts valid ISO 8601 timestamps', () => {
      fc.assert(
        fc.property(
          arbitraryTimestamp(),
          (validTimestamp) => {
            expect(isValidTimestamp(validTimestamp)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 4: Schema Round-Trip
   * For any valid HarnessResult object, serializing to JSON and parsing back
   * SHALL produce an object that passes schema validation and equals the original.
   * Validates: Requirements 2.5
   */
  describe('Property 4: Schema Round-Trip', () => {
    it('serialize then parse produces equivalent object', () => {
      fc.assert(
        fc.property(
          arbitraryHarnessResult(),
          (result) => {
            const json = serializeResult(result);
            const parsed = parseResult(json);
            
            expect(parsed.success).toBe(true);
            if (parsed.success) {
              expect(parsed.data.harness_id).toBe(result.harness_id);
              expect(parsed.data.harness_name).toBe(result.harness_name);
              expect(parsed.data.model).toBe(result.model);
              expect(parsed.data.scores.raw).toBe(result.scores.raw);
              // Float comparison with tolerance
              expect(parsed.data.scores.normalized).toBeCloseTo(result.scores.normalized, 5);
              expect(parsed.data.timestamp).toBe(result.timestamp);
              expect(parsed.data.duration_ms).toBe(result.duration_ms);
              expect(parsed.data.prev_hash).toBe(result.prev_hash);
              expect(parsed.data.hash).toBe(result.hash);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('parsed result passes schema validation', () => {
      fc.assert(
        fc.property(
          arbitraryHarnessResult(),
          (result) => {
            const json = serializeResult(result);
            const parsed = parseResult(json);
            
            expect(parsed.success).toBe(true);
            if (parsed.success) {
              const validation = validateHarnessResult(parsed.data);
              expect(validation.success).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('double serialization is idempotent', () => {
      fc.assert(
        fc.property(
          arbitraryHarnessResult(),
          (result) => {
            const json1 = serializeResult(result);
            const parsed1 = parseResult(json1);
            
            if (parsed1.success) {
              const json2 = serializeResult(parsed1.data);
              expect(json1).toBe(json2);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
