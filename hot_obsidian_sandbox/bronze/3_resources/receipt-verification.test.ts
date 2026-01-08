/**
 * Receipt Verification - Property Tests
 * 
 * @provenance: p4-p5-silver-sprint/design.md
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  verifyReceipt,
  detectTampering,
  createReceiptHash,
  isValidHashFormat,
} from './receipt-verification.js';
import { createScreamReceipt } from '../2_areas/hfo_ports/P4_RED_REGNANT/core/score-classifier.js';
import { createPolicyReceipt } from '../2_areas/hfo_ports/P5_PYRE_PRAETORIAN/core/path-classifier.js';

describe('Receipt Verification', () => {
  // --- Unit Tests ---
  describe('Unit Tests', () => {
    describe('verifyReceipt', () => {
      it('verifies valid SCREAM receipt', () => {
        const receipt = createScreamReceipt(75, 'test.ts');
        expect(verifyReceipt(receipt)).toBe(true);
      });

      it('verifies valid Policy receipt', () => {
        const receipt = createPolicyReceipt('hot_obsidian_sandbox/bronze/test.ts');
        expect(verifyReceipt(receipt)).toBe(true);
      });

      it('detects tampered receipt', () => {
        const receipt = createScreamReceipt(75, 'test.ts');
        const tampered = { ...receipt, score: 80 };
        expect(verifyReceipt(tampered)).toBe(false);
      });
    });

    describe('detectTampering', () => {
      it('returns tampered=false for valid receipt', () => {
        const receipt = createScreamReceipt(75, 'test.ts');
        const result = detectTampering(receipt);
        expect(result.tampered).toBe(false);
        expect(result.expected).toBe(result.actual);
      });

      it('returns tampered=true for modified receipt', () => {
        const receipt = createScreamReceipt(75, 'test.ts');
        const tampered = { ...receipt, score: 80 };
        const result = detectTampering(tampered);
        expect(result.tampered).toBe(true);
        expect(result.expected).not.toBe(result.actual);
      });
    });

    describe('createReceiptHash', () => {
      it('creates valid hash format', () => {
        const hash = createReceiptHash({ test: 'data' });
        expect(hash).toMatch(/^sha256:[a-f0-9]{64}$/);
      });

      it('same content produces same hash', () => {
        const content = { a: 1, b: 'test' };
        const hash1 = createReceiptHash(content);
        const hash2 = createReceiptHash(content);
        expect(hash1).toBe(hash2);
      });

      it('different content produces different hash', () => {
        const hash1 = createReceiptHash({ a: 1 });
        const hash2 = createReceiptHash({ a: 2 });
        expect(hash1).not.toBe(hash2);
      });
    });

    describe('isValidHashFormat', () => {
      it('returns true for valid hash', () => {
        expect(isValidHashFormat('sha256:' + 'a'.repeat(64))).toBe(true);
      });

      it('returns false for invalid prefix', () => {
        expect(isValidHashFormat('md5:' + 'a'.repeat(64))).toBe(false);
      });

      it('returns false for wrong length', () => {
        expect(isValidHashFormat('sha256:' + 'a'.repeat(32))).toBe(false);
      });
    });
  });


  // --- Property Tests ---
  describe('Property Tests', () => {
    /**
     * Feature: p4-p5-silver-sprint, Property 3: SCREAM Receipt Integrity (via generic verifier)
     */
    describe('SCREAM Receipt Integrity', () => {
      it('all valid SCREAM receipts verify correctly', () => {
        fc.assert(
          fc.property(
            fc.float({ min: 0, max: 79.99, noNaN: true }),
            fc.string({ minLength: 1, maxLength: 100 }),
            (score, artifact) => {
              const receipt = createScreamReceipt(score, artifact);
              return verifyReceipt(receipt) === true;
            }
          ),
          { numRuns: 100 }
        );
      });

      it('tampered SCREAM receipts always fail', () => {
        fc.assert(
          fc.property(
            fc.float({ min: 0, max: 79.99, noNaN: true }),
            fc.string({ minLength: 1, maxLength: 100 }),
            fc.float({ min: 0.01, max: 10, noNaN: true }),
            (score, artifact, delta) => {
              const receipt = createScreamReceipt(score, artifact);
              const tampered = { ...receipt, score: score + delta };
              return verifyReceipt(tampered) === false;
            }
          ),
          { numRuns: 100 }
        );
      });
    });

    /**
     * Feature: p4-p5-silver-sprint, Property 6: Policy Receipt Integrity (via generic verifier)
     */
    describe('Policy Receipt Integrity', () => {
      const bronzePathArb = fc.constantFrom(
        'hot_obsidian_sandbox/bronze/',
        'cold_obsidian_sandbox/bronze/'
      ).chain(prefix => 
        fc.string({ minLength: 1, maxLength: 50 }).map(suffix => prefix + suffix.replace(/[\/\\]/g, '_'))
      );

      it('all valid Policy receipts verify correctly', () => {
        fc.assert(
          fc.property(
            bronzePathArb,
            (path) => {
              const receipt = createPolicyReceipt(path);
              return verifyReceipt(receipt) === true;
            }
          ),
          { numRuns: 100 }
        );
      });

      it('tampered Policy receipts always fail', () => {
        fc.assert(
          fc.property(
            bronzePathArb,
            fc.string({ minLength: 1, maxLength: 20 }),
            (path, suffix) => {
              const receipt = createPolicyReceipt(path);
              const tampered = { ...receipt, path: path + suffix };
              return verifyReceipt(tampered) === false;
            }
          ),
          { numRuns: 100 }
        );
      });
    });

    /**
     * Hash determinism property
     */
    describe('Hash Determinism', () => {
      it('same content always produces same hash', () => {
        fc.assert(
          fc.property(
            fc.dictionary(fc.string(), fc.jsonValue()),
            (content) => {
              const hash1 = createReceiptHash(content);
              const hash2 = createReceiptHash(content);
              return hash1 === hash2;
            }
          ),
          { numRuns: 100 }
        );
      });

      it('all generated hashes have valid format', () => {
        fc.assert(
          fc.property(
            fc.dictionary(fc.string(), fc.jsonValue()),
            (content) => {
              const hash = createReceiptHash(content);
              return isValidHashFormat(hash);
            }
          ),
          { numRuns: 100 }
        );
      });
    });
  });
});
