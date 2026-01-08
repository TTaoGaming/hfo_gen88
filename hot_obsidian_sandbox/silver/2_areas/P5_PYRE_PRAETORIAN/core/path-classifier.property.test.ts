/**
 * P5 PYRE PRAETORIAN - Path Classifier Property Tests
 * 
 * @port 5
 * @commander PYRE_PRAETORIAN
 * @provenance: p4-p5-silver-sprint/design.md
 * Validates: Requirements 2.1, 2.2, 2.3, 2.6
 * 
 * Property-based tests using fast-check to verify universal properties
 * across all valid inputs.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  classifyPath,
  evaluatePolicy,
  createPolicyReceipt,
  verifyPolicyReceipt,
  Medallion,
  Temperature,
} from './path-classifier.js';

// --- Arbitraries for path generation ---

const bronzePathArb = fc.constantFrom(
  'hot_obsidian_sandbox/bronze/',
  'cold_obsidian_sandbox/bronze/'
).chain(prefix => 
  fc.string({ minLength: 1, maxLength: 50 }).map(suffix => prefix + suffix.replace(/[\/\\]/g, '_'))
);

const silverPathArb = fc.constantFrom(
  'hot_obsidian_sandbox/silver/',
  'cold_obsidian_sandbox/silver/'
).chain(prefix => 
  fc.string({ minLength: 1, maxLength: 50 }).map(suffix => prefix + suffix.replace(/[\/\\]/g, '_'))
);

const goldPathArb = fc.constantFrom(
  'hot_obsidian_sandbox/gold/',
  'cold_obsidian_sandbox/gold/'
).chain(prefix => 
  fc.string({ minLength: 1, maxLength: 50 }).map(suffix => prefix + suffix.replace(/[\/\\]/g, '_'))
);

const rootPathArb = fc.string({ minLength: 1, maxLength: 50 })
  .filter(s => !s.startsWith('hot_obsidian_sandbox') && !s.startsWith('cold_obsidian_sandbox'))
  .map(s => s.replace(/[\/\\]/g, '_'));

describe('P5 Path Classifier - Property Tests', () => {
  /**
   * Feature: p4-p5-silver-sprint, Property 4: Path Classification Determinism
   * 
   * For any file path, classifyPath SHALL return exactly one medallion
   * (BRONZE, SILVER, GOLD, ROOT) and the same path SHALL always return
   * the same classification.
   */
  describe('Property 4: Path Classification Determinism', () => {
    it('same path always returns same classification', () => {
      fc.assert(
        fc.property(
          fc.oneof(bronzePathArb, silverPathArb, goldPathArb, rootPathArb),
          (path) => {
            const result1 = classifyPath(path);
            const result2 = classifyPath(path);
            return result1.medallion === result2.medallion &&
                   result1.temperature === result2.temperature;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('classification medallion is always one of four valid values', () => {
      fc.assert(
        fc.property(
          fc.oneof(bronzePathArb, silverPathArb, goldPathArb, rootPathArb),
          (path) => {
            const result = classifyPath(path);
            return ['BRONZE', 'SILVER', 'GOLD', 'ROOT'].includes(result.medallion);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('temperature is HOT, COLD, or null', () => {
      fc.assert(
        fc.property(
          fc.oneof(bronzePathArb, silverPathArb, goldPathArb, rootPathArb),
          (path) => {
            const result = classifyPath(path);
            return result.temperature === 'HOT' || 
                   result.temperature === 'COLD' || 
                   result.temperature === null;
          }
        ),
        { numRuns: 100 }
      );
    });
  });


  /**
   * Feature: p4-p5-silver-sprint, Property 5: Policy Enforcement Correctness
   * 
   * For any path in hot_obsidian_sandbox/bronze/*, decision SHALL be ALLOWED.
   * For any path in hot_obsidian_sandbox/silver/* or gold/*, decision SHALL be DENIED.
   * For any root path not in whitelist, decision SHALL be DENIED.
   */
  describe('Property 5: Policy Enforcement Correctness', () => {
    it('bronze paths are always ALLOWED', () => {
      fc.assert(
        fc.property(
          bronzePathArb,
          (path) => {
            const result = evaluatePolicy(path);
            return result.decision === 'ALLOWED';
          }
        ),
        { numRuns: 100 }
      );
    });

    it('silver paths are always DENIED', () => {
      fc.assert(
        fc.property(
          silverPathArb,
          (path) => {
            const result = evaluatePolicy(path);
            return result.decision === 'DENIED';
          }
        ),
        { numRuns: 100 }
      );
    });

    it('gold paths are always DENIED', () => {
      fc.assert(
        fc.property(
          goldPathArb,
          (path) => {
            const result = evaluatePolicy(path);
            return result.decision === 'DENIED';
          }
        ),
        { numRuns: 100 }
      );
    });

    it('non-whitelisted root paths are DENIED', () => {
      // Generate paths that are definitely not whitelisted
      const nonWhitelistedArb = fc.string({ minLength: 5, maxLength: 30 })
        .filter(s => 
          !s.startsWith('hot_') && 
          !s.startsWith('cold_') &&
          !s.startsWith('.') &&
          !s.includes('AGENTS') &&
          !s.includes('llms') &&
          !s.includes('obsidian') &&
          !s.includes('package') &&
          !s.includes('ttao') &&
          !s.includes('vitest') &&
          !s.includes('stryker') &&
          !s.includes('node_modules')
        )
        .map(s => s.replace(/[\/\\]/g, '_') + '.txt');

      fc.assert(
        fc.property(
          nonWhitelistedArb,
          (path) => {
            const result = evaluatePolicy(path);
            return result.decision === 'DENIED';
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: p4-p5-silver-sprint, Property 6: Policy Receipt Integrity
   * 
   * For any policy receipt, verifyPolicyReceipt(receipt) SHALL return true.
   * For any tampered receipt, verifyPolicyReceipt SHALL return false.
   */
  describe('Property 6: Policy Receipt Integrity', () => {
    it('valid receipts always verify correctly', () => {
      fc.assert(
        fc.property(
          fc.oneof(bronzePathArb, silverPathArb, goldPathArb),
          (path) => {
            const receipt = createPolicyReceipt(path);
            return verifyPolicyReceipt(receipt) === true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('tampered path always fails verification', () => {
      fc.assert(
        fc.property(
          bronzePathArb,
          fc.string({ minLength: 1, maxLength: 20 }),
          (path, suffix) => {
            const receipt = createPolicyReceipt(path);
            const tampered = { ...receipt, path: path + suffix };
            return verifyPolicyReceipt(tampered) === false;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('tampered timestamp always fails verification', () => {
      fc.assert(
        fc.property(
          bronzePathArb,
          fc.integer({ min: 1, max: 1000000 }),
          (path, delta) => {
            const receipt = createPolicyReceipt(path);
            const tampered = { ...receipt, timestamp: receipt.timestamp + delta };
            return verifyPolicyReceipt(tampered) === false;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('tampered reason always fails verification', () => {
      fc.assert(
        fc.property(
          bronzePathArb,
          fc.string({ minLength: 1, maxLength: 50 }),
          (path, newReason) => {
            const receipt = createPolicyReceipt(path);
            fc.pre(newReason !== receipt.reason);
            const tampered = { ...receipt, reason: newReason };
            return verifyPolicyReceipt(tampered) === false;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
