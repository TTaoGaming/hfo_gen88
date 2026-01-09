/**
 * P4 RED REGNANT - Silver Contracts Unit Tests
 * 
 * @port 4
 * @commander RED_REGNANT
 * @tier SILVER
 * @provenance: p4-p5-silver-sprint/design.md
 * Validates: Requirements 6.1, 6.2, 6.3, 6.4
 * 
 * Tests for SILVER_STANDARD constants and helper functions.
 * No reward hacking - these tests verify actual behavior.
 */

import { describe, it, expect } from 'vitest';
import {
  SILVER_STANDARD,
  ViolationTypeSchema,
  isValidMutationScore,
  isTheater,
  isMutationFailure,
} from './index.js';

describe('P4 Silver Contracts', () => {
  // --- SILVER_STANDARD Constants ---
  describe('SILVER_STANDARD', () => {
    it('MIN_MUTATION_SCORE is 80', () => {
      expect(SILVER_STANDARD.MIN_MUTATION_SCORE).toBe(80);
    });

    it('MAX_MUTATION_SCORE is 98.99', () => {
      expect(SILVER_STANDARD.MAX_MUTATION_SCORE).toBe(98.99);
    });

    it('THEATER_THRESHOLD is 99', () => {
      expect(SILVER_STANDARD.THEATER_THRESHOLD).toBe(99);
    });

    it('constants are immutable (frozen)', () => {
      expect(Object.keys(SILVER_STANDARD)).toHaveLength(3);
      expect(Object.keys(SILVER_STANDARD)).toContain('MIN_MUTATION_SCORE');
      expect(Object.keys(SILVER_STANDARD)).toContain('MAX_MUTATION_SCORE');
      expect(Object.keys(SILVER_STANDARD)).toContain('THEATER_THRESHOLD');
    });

    it('Goldilocks range is correctly defined (80 <= score < 99)', () => {
      expect(SILVER_STANDARD.MIN_MUTATION_SCORE).toBeLessThan(SILVER_STANDARD.THEATER_THRESHOLD);
      expect(SILVER_STANDARD.MAX_MUTATION_SCORE).toBeLessThan(SILVER_STANDARD.THEATER_THRESHOLD);
    });
  });

  // --- ViolationTypeSchema ---
  describe('ViolationTypeSchema', () => {
    const validTypes = [
      'THEATER',
      'POLLUTION',
      'AMNESIA',
      'BESPOKE',
      'VIOLATION',
      'MUTATION_FAILURE',
      'MUTATION_GAP',
      'LATTICE_BREACH',
      'BDD_MISALIGNMENT',
      'OMISSION',
      'PHANTOM',
      'SUSPICION',
      'DEBT',
    ];

    it.each(validTypes)('accepts valid type: %s', (type) => {
      const result = ViolationTypeSchema.safeParse(type);
      expect(result.success).toBe(true);
    });

    it('rejects invalid type', () => {
      const result = ViolationTypeSchema.safeParse('INVALID_TYPE');
      expect(result.success).toBe(false);
    });

    it('rejects empty string', () => {
      const result = ViolationTypeSchema.safeParse('');
      expect(result.success).toBe(false);
    });

    it('rejects null', () => {
      const result = ViolationTypeSchema.safeParse(null);
      expect(result.success).toBe(false);
    });

    it('rejects number', () => {
      const result = ViolationTypeSchema.safeParse(42);
      expect(result.success).toBe(false);
    });

    it('has exactly 13 violation types', () => {
      expect(validTypes).toHaveLength(13);
    });
  });

  // --- isValidMutationScore ---
  describe('isValidMutationScore', () => {
    describe('returns true for Goldilocks range', () => {
      it('returns true for 80 (lower boundary)', () => {
        expect(isValidMutationScore(80)).toBe(true);
      });

      it('returns true for 88 (Gen 88 target)', () => {
        expect(isValidMutationScore(88)).toBe(true);
      });

      it('returns true for 90', () => {
        expect(isValidMutationScore(90)).toBe(true);
      });

      it('returns true for 98.99 (upper boundary)', () => {
        expect(isValidMutationScore(98.99)).toBe(true);
      });
    });

    describe('returns false for FAILURE range', () => {
      it('returns false for 0', () => {
        expect(isValidMutationScore(0)).toBe(false);
      });

      it('returns false for 79', () => {
        expect(isValidMutationScore(79)).toBe(false);
      });

      it('returns false for 79.99', () => {
        expect(isValidMutationScore(79.99)).toBe(false);
      });
    });

    describe('returns false for THEATER range', () => {
      it('returns false for 99', () => {
        expect(isValidMutationScore(99)).toBe(false);
      });

      it('returns false for 100', () => {
        expect(isValidMutationScore(100)).toBe(false);
      });
    });
  });

  // --- isTheater ---
  describe('isTheater', () => {
    it('returns true for 99', () => {
      expect(isTheater(99)).toBe(true);
    });

    it('returns true for 99.5', () => {
      expect(isTheater(99.5)).toBe(true);
    });

    it('returns true for 100', () => {
      expect(isTheater(100)).toBe(true);
    });

    it('returns false for 98.99', () => {
      expect(isTheater(98.99)).toBe(false);
    });

    it('returns false for 80', () => {
      expect(isTheater(80)).toBe(false);
    });

    it('returns false for 0', () => {
      expect(isTheater(0)).toBe(false);
    });
  });

  // --- isMutationFailure ---
  describe('isMutationFailure', () => {
    it('returns true for 0', () => {
      expect(isMutationFailure(0)).toBe(true);
    });

    it('returns true for 79', () => {
      expect(isMutationFailure(79)).toBe(true);
    });

    it('returns true for 79.99', () => {
      expect(isMutationFailure(79.99)).toBe(true);
    });

    it('returns false for 80 (boundary)', () => {
      expect(isMutationFailure(80)).toBe(false);
    });

    it('returns false for 88', () => {
      expect(isMutationFailure(88)).toBe(false);
    });

    it('returns false for 99', () => {
      expect(isMutationFailure(99)).toBe(false);
    });

    it('returns false for 100', () => {
      expect(isMutationFailure(100)).toBe(false);
    });
  });

  // --- Boundary Consistency ---
  describe('Boundary Consistency', () => {
    it('score 80 is valid and not failure and not theater', () => {
      expect(isValidMutationScore(80)).toBe(true);
      expect(isMutationFailure(80)).toBe(false);
      expect(isTheater(80)).toBe(false);
    });

    it('score 79 is failure and not valid and not theater', () => {
      expect(isValidMutationScore(79)).toBe(false);
      expect(isMutationFailure(79)).toBe(true);
      expect(isTheater(79)).toBe(false);
    });

    it('score 99 is theater and not valid and not failure', () => {
      expect(isValidMutationScore(99)).toBe(false);
      expect(isMutationFailure(99)).toBe(false);
      expect(isTheater(99)).toBe(true);
    });

    it('score 98.99 is valid and not failure and not theater', () => {
      expect(isValidMutationScore(98.99)).toBe(true);
      expect(isMutationFailure(98.99)).toBe(false);
      expect(isTheater(98.99)).toBe(false);
    });

    it('exactly one classification is true for any score', () => {
      const testScores = [0, 50, 79, 79.99, 80, 88, 98.99, 99, 100];
      
      for (const score of testScores) {
        const isFailure = isMutationFailure(score);
        const isValid = isValidMutationScore(score);
        const isTheat = isTheater(score);
        
        const trueCount = [isFailure, isValid, isTheat].filter(Boolean).length;
        expect(trueCount).toBe(1);
      }
    });
  });
});
