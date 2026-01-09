/**
 * P4 RED REGNANT - Score Classifier Unit Tests
 * 
 * @port 4
 * @commander RED_REGNANT
 * @tier SILVER
 * @provenance: p4-p5-silver-sprint/design.md
 * Validates: Requirements 1.1, 5.1
 */

import { describe, it, expect } from 'vitest';
import {
  classifyScore,
  createScreamReceipt,
  verifyScreamReceipt,
  requiresScream,
  ScoreClassification,
  ScreamReceiptSchema,
} from './score-classifier.js';

describe('P4 Score Classifier', () => {
  // --- classifyScore ---
  describe('classifyScore', () => {
    describe('FAILURE boundary (<80)', () => {
      it('returns FAILURE for score 0', () => {
        expect(classifyScore(0)).toBe('FAILURE');
      });

      it('returns FAILURE for score 79', () => {
        expect(classifyScore(79)).toBe('FAILURE');
      });

      it('returns FAILURE for score 79.99', () => {
        expect(classifyScore(79.99)).toBe('FAILURE');
      });
    });

    describe('GOLDILOCKS range (80-98.99)', () => {
      it('returns GOLDILOCKS for score 80 (boundary)', () => {
        expect(classifyScore(80)).toBe('GOLDILOCKS');
      });

      it('returns GOLDILOCKS for score 88 (Gen 88 target)', () => {
        expect(classifyScore(88)).toBe('GOLDILOCKS');
      });

      it('returns GOLDILOCKS for score 90', () => {
        expect(classifyScore(90)).toBe('GOLDILOCKS');
      });

      it('returns GOLDILOCKS for score 98.99 (upper boundary)', () => {
        expect(classifyScore(98.99)).toBe('GOLDILOCKS');
      });
    });

    describe('THEATER boundary (>=99)', () => {
      it('returns THEATER for score 99', () => {
        expect(classifyScore(99)).toBe('THEATER');
      });

      it('returns THEATER for score 99.5', () => {
        expect(classifyScore(99.5)).toBe('THEATER');
      });

      it('returns THEATER for score 100', () => {
        expect(classifyScore(100)).toBe('THEATER');
      });
    });

    describe('Error handling', () => {
      it('throws TypeError for NaN', () => {
        expect(() => classifyScore(NaN)).toThrow(TypeError);
      });

      it('throws RangeError for negative score', () => {
        expect(() => classifyScore(-1)).toThrow(RangeError);
      });

      it('throws RangeError for score > 100', () => {
        expect(() => classifyScore(101)).toThrow(RangeError);
      });
    });
  });


  // --- createScreamReceipt ---
  describe('createScreamReceipt', () => {
    it('creates MUTATION_FAILURE receipt for score < 80', () => {
      const receipt = createScreamReceipt(75, 'test-artifact.ts');
      expect(receipt.violationType).toBe('MUTATION_FAILURE');
      expect(receipt.score).toBe(75);
      expect(receipt.artifact).toBe('test-artifact.ts');
      expect(receipt.port).toBe(4);
      expect(receipt.type).toBe('SCREAM');
    });

    it('creates THEATER receipt for score >= 99', () => {
      const receipt = createScreamReceipt(99.5, 'theater-artifact.ts');
      expect(receipt.violationType).toBe('THEATER');
      expect(receipt.score).toBe(99.5);
    });

    it('throws error for GOLDILOCKS score', () => {
      expect(() => createScreamReceipt(88, 'good-artifact.ts'))
        .toThrow('Cannot create SCREAM for GOLDILOCKS score');
    });

    it('throws TypeError for empty artifact', () => {
      expect(() => createScreamReceipt(75, '')).toThrow(TypeError);
    });

    it('throws TypeError for whitespace-only artifact', () => {
      expect(() => createScreamReceipt(75, '   ')).toThrow(TypeError);
    });

    it('receipt has valid SHA-256 hash format', () => {
      const receipt = createScreamReceipt(50, 'artifact.ts');
      expect(receipt.receiptHash).toMatch(/^sha256:[a-f0-9]{64}$/);
    });

    it('receipt validates against schema', () => {
      const receipt = createScreamReceipt(70, 'artifact.ts');
      const result = ScreamReceiptSchema.safeParse(receipt);
      expect(result.success).toBe(true);
    });

    it('receipt has timestamp', () => {
      const before = Date.now();
      const receipt = createScreamReceipt(60, 'artifact.ts');
      const after = Date.now();
      expect(receipt.timestamp).toBeGreaterThanOrEqual(before);
      expect(receipt.timestamp).toBeLessThanOrEqual(after);
    });
  });

  // --- verifyScreamReceipt ---
  describe('verifyScreamReceipt', () => {
    it('returns true for valid receipt', () => {
      const receipt = createScreamReceipt(75, 'artifact.ts');
      expect(verifyScreamReceipt(receipt)).toBe(true);
    });

    it('returns false for tampered score', () => {
      const receipt = createScreamReceipt(75, 'artifact.ts');
      const tampered = { ...receipt, score: 80 };
      expect(verifyScreamReceipt(tampered)).toBe(false);
    });

    it('returns false for tampered artifact', () => {
      const receipt = createScreamReceipt(75, 'original.ts');
      const tampered = { ...receipt, artifact: 'tampered.ts' };
      expect(verifyScreamReceipt(tampered)).toBe(false);
    });

    it('returns false for tampered violationType', () => {
      const receipt = createScreamReceipt(75, 'artifact.ts');
      const tampered = { ...receipt, violationType: 'THEATER' as const };
      expect(verifyScreamReceipt(tampered)).toBe(false);
    });

    it('returns false for tampered timestamp', () => {
      const receipt = createScreamReceipt(75, 'artifact.ts');
      const tampered = { ...receipt, timestamp: receipt.timestamp + 1000 };
      expect(verifyScreamReceipt(tampered)).toBe(false);
    });
  });

  // --- requiresScream ---
  describe('requiresScream', () => {
    it('returns true for FAILURE scores', () => {
      expect(requiresScream(0)).toBe(true);
      expect(requiresScream(79)).toBe(true);
    });

    it('returns false for GOLDILOCKS scores', () => {
      expect(requiresScream(80)).toBe(false);
      expect(requiresScream(88)).toBe(false);
      expect(requiresScream(98)).toBe(false);
    });

    it('returns true for THEATER scores', () => {
      expect(requiresScream(99)).toBe(true);
      expect(requiresScream(100)).toBe(true);
    });
  });
});
