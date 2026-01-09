/**
 * P4 RED REGNANT - Score Classifier Property Tests
 * 
 * @port 4
 * @commander RED_REGNANT
 * @provenance: p4-p5-silver-sprint/design.md
 * Validates: Requirements 1.1, 1.5
 * 
 * Property-based tests using fast-check to verify universal properties
 * across all valid inputs.
 */

import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import {
  classifyScore,
  createScreamReceipt,
  verifyScreamReceipt,
} from './score-classifier.js';

describe('P4 Score Classifier - Property Tests', () => {
  /**
   * Feature: p4-p5-silver-sprint, Property 1: Score Classification Determinism
   * 
   * For any mutation score between 0 and 100, classifyScore SHALL return
   * exactly one of FAILURE, GOLDILOCKS, or THEATER, and the same score
   * SHALL always return the same classification.
   */
  describe('Property 1: Score Classification Determinism', () => {
    it('same score always returns same classification', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 100, noNaN: true }),
          (score) => {
            const result1 = classifyScore(score);
            const result2 = classifyScore(score);
            return result1 === result2;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('classification is always one of three valid values', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 100, noNaN: true }),
          (score) => {
            const result = classifyScore(score);
            return ['FAILURE', 'GOLDILOCKS', 'THEATER'].includes(result);
          }
        ),
        { numRuns: 100 }
      );
    });
  });


  /**
   * Feature: p4-p5-silver-sprint, Property 2: Score Classification Boundaries
   * 
   * For any score < 80, classification SHALL be FAILURE.
   * For any score >= 80 AND < 99, classification SHALL be GOLDILOCKS.
   * For any score >= 99, classification SHALL be THEATER.
   */
  describe('Property 2: Score Classification Boundaries', () => {
    it('scores < 80 are always FAILURE', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 79 }).map(n => n + Math.random() * 0.99),
          (score) => {
            return classifyScore(score) === 'FAILURE';
          }
        ),
        { numRuns: 100 }
      );
    });

    it('scores 80-98.99 are always GOLDILOCKS', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 80, max: 98 }).map(n => n + Math.random() * 0.99),
          (score) => {
            return classifyScore(score) === 'GOLDILOCKS';
          }
        ),
        { numRuns: 100 }
      );
    });

    it('scores >= 99 are always THEATER', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 99, max: 100 }).map(n => Math.min(100, n + Math.random() * 0.99)),
          (score) => {
            return classifyScore(score) === 'THEATER';
          }
        ),
        { numRuns: 100 }
      );
    });

    it('correctly classifies all scores in full range', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100 }).map(n => Math.min(100, n + Math.random() * 0.99)),
          (score) => {
            const result = classifyScore(score);
            if (score < 80) return result === 'FAILURE';
            if (score >= 99) return result === 'THEATER';
            return result === 'GOLDILOCKS';
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: p4-p5-silver-sprint, Property 3: SCREAM Receipt Integrity
   * 
   * For any SCREAM receipt, verifyScreamReceipt(receipt) SHALL return true.
   * For any tampered receipt (any field modified), verifyScreamReceipt SHALL return false.
   * 
   * NOTE: Uses integer-based score generation to avoid fast-check 32-bit float constraints.
   */
  describe('Property 3: SCREAM Receipt Integrity', () => {
    it('valid receipts always verify correctly', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 79 }).map(n => n + Math.random() * 0.99), // FAILURE range
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          (score, artifact) => {
            const receipt = createScreamReceipt(score, artifact);
            return verifyScreamReceipt(receipt) === true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('THEATER receipts also verify correctly', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 99, max: 100 }).map(n => Math.min(100, n + Math.random() * 0.99)), // THEATER range
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          (score, artifact) => {
            const receipt = createScreamReceipt(score, artifact);
            return verifyScreamReceipt(receipt) === true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('tampered score always fails verification', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 79 }).map(n => n + Math.random() * 0.99),
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          fc.integer({ min: 1, max: 10 }), // delta to add (integer-based)
          (score, artifact, delta) => {
            const receipt = createScreamReceipt(score, artifact);
            const tampered = { ...receipt, score: score + delta };
            return verifyScreamReceipt(tampered) === false;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('tampered artifact always fails verification', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 79 }).map(n => n + Math.random() * 0.99),
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          (score, artifact, tamperedArtifact) => {
            fc.pre(artifact !== tamperedArtifact); // Ensure different
            const receipt = createScreamReceipt(score, artifact);
            const tampered = { ...receipt, artifact: tamperedArtifact };
            return verifyScreamReceipt(tampered) === false;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('tampered timestamp always fails verification', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 79 }).map(n => n + Math.random() * 0.99),
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          fc.integer({ min: 1, max: 1000000 }), // delta to add
          (score, artifact, delta) => {
            const receipt = createScreamReceipt(score, artifact);
            const tampered = { ...receipt, timestamp: receipt.timestamp + delta };
            return verifyScreamReceipt(tampered) === false;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
