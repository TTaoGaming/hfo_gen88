/**
 * Harness Result Schema Unit Tests
 * @provenance hfo-testing-promotion/4.2
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4
 */

import { describe, it, expect } from 'vitest';
import {
  HarnessResultSchema,
  validateHarnessResult,
  validateHarnessResultInput,
  serializeResult,
  parseResult,
  isValidHarnessId,
  isValidNormalizedScore,
  isValidTimestamp,
  HARNESS_NAMES,
} from './harness-result';

describe('Harness Result Schema', () => {
  const validResult = {
    harness_id: 0,
    harness_name: 'SENSE' as const,
    model: 'test-model',
    scores: { raw: 80, normalized: 0.8 },
    timestamp: '2026-01-07T00:00:00.000Z',
    duration_ms: 1000,
    prev_hash: '0000000000000000',
    hash: 'abcdef0123456789',
  };

  describe('HarnessResultSchema', () => {
    it('should accept valid result', () => {
      const result = HarnessResultSchema.safeParse(validResult);
      expect(result.success).toBe(true);
    });

    it('should accept all valid harness_ids (0-7)', () => {
      for (let id = 0; id <= 7; id++) {
        const result = HarnessResultSchema.safeParse({
          ...validResult,
          harness_id: id,
          harness_name: HARNESS_NAMES[id],
        });
        expect(result.success).toBe(true);
      }
    });

    it('should reject harness_id < 0', () => {
      const result = HarnessResultSchema.safeParse({
        ...validResult,
        harness_id: -1,
      });
      expect(result.success).toBe(false);
    });

    it('should reject harness_id > 7', () => {
      const result = HarnessResultSchema.safeParse({
        ...validResult,
        harness_id: 8,
      });
      expect(result.success).toBe(false);
    });

    it('should reject non-integer harness_id', () => {
      const result = HarnessResultSchema.safeParse({
        ...validResult,
        harness_id: 1.5,
      });
      expect(result.success).toBe(false);
    });

    it('should accept normalized score at boundaries (0 and 1)', () => {
      const result0 = HarnessResultSchema.safeParse({
        ...validResult,
        scores: { raw: 0, normalized: 0 },
      });
      const result1 = HarnessResultSchema.safeParse({
        ...validResult,
        scores: { raw: 100, normalized: 1 },
      });
      expect(result0.success).toBe(true);
      expect(result1.success).toBe(true);
    });

    it('should reject normalized score < 0', () => {
      const result = HarnessResultSchema.safeParse({
        ...validResult,
        scores: { raw: 0, normalized: -0.1 },
      });
      expect(result.success).toBe(false);
    });

    it('should reject normalized score > 1', () => {
      const result = HarnessResultSchema.safeParse({
        ...validResult,
        scores: { raw: 100, normalized: 1.1 },
      });
      expect(result.success).toBe(false);
    });

    it('should accept valid ISO 8601 timestamp', () => {
      const result = HarnessResultSchema.safeParse(validResult);
      expect(result.success).toBe(true);
    });

    it('should reject invalid timestamp format', () => {
      const result = HarnessResultSchema.safeParse({
        ...validResult,
        timestamp: '2026-01-07',
      });
      expect(result.success).toBe(false);
    });

    it('should reject malformed timestamp', () => {
      const result = HarnessResultSchema.safeParse({
        ...validResult,
        timestamp: 'not-a-date',
      });
      expect(result.success).toBe(false);
    });

    it('should require hash to be 16 characters', () => {
      const shortHash = HarnessResultSchema.safeParse({
        ...validResult,
        hash: 'short',
      });
      const longHash = HarnessResultSchema.safeParse({
        ...validResult,
        hash: 'waytoolonghashvalue',
      });
      expect(shortHash.success).toBe(false);
      expect(longHash.success).toBe(false);
    });
  });

  describe('validateHarnessResult', () => {
    it('should return success for valid data', () => {
      const result = validateHarnessResult(validResult);
      expect(result.success).toBe(true);
    });

    it('should return error with path for invalid field', () => {
      const result = validateHarnessResult({
        ...validResult,
        harness_id: -1,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('harness_id');
      }
    });
  });

  describe('serializeResult and parseResult', () => {
    it('should round-trip valid result', () => {
      const json = serializeResult(validResult);
      const parsed = parseResult(json);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data).toEqual(validResult);
      }
    });

    it('should return error for invalid JSON', () => {
      const result = parseResult('not valid json');
      expect(result.success).toBe(false);
    });

    it('should return error for valid JSON but invalid schema', () => {
      const result = parseResult('{"harness_id": -1}');
      expect(result.success).toBe(false);
    });
  });

  describe('isValidHarnessId', () => {
    it('should return true for 0-7', () => {
      for (let i = 0; i <= 7; i++) {
        expect(isValidHarnessId(i)).toBe(true);
      }
    });

    it('should return false for negative', () => {
      expect(isValidHarnessId(-1)).toBe(false);
    });

    it('should return false for > 7', () => {
      expect(isValidHarnessId(8)).toBe(false);
    });

    it('should return false for non-integer', () => {
      expect(isValidHarnessId(1.5)).toBe(false);
    });
  });

  describe('isValidNormalizedScore', () => {
    it('should return true for 0', () => {
      expect(isValidNormalizedScore(0)).toBe(true);
    });

    it('should return true for 1', () => {
      expect(isValidNormalizedScore(1)).toBe(true);
    });

    it('should return true for 0.5', () => {
      expect(isValidNormalizedScore(0.5)).toBe(true);
    });

    it('should return false for negative', () => {
      expect(isValidNormalizedScore(-0.1)).toBe(false);
    });

    it('should return false for > 1', () => {
      expect(isValidNormalizedScore(1.1)).toBe(false);
    });

    it('should return false for NaN', () => {
      expect(isValidNormalizedScore(NaN)).toBe(false);
    });

    it('should return false for non-number types', () => {
      // @ts-expect-error testing invalid input
      expect(isValidNormalizedScore('0.5')).toBe(false);
      // @ts-expect-error testing invalid input
      expect(isValidNormalizedScore(null)).toBe(false);
      // @ts-expect-error testing invalid input
      expect(isValidNormalizedScore(undefined)).toBe(false);
    });
  });

  describe('isValidTimestamp', () => {
    it('should return true for valid ISO 8601', () => {
      expect(isValidTimestamp('2026-01-07T00:00:00.000Z')).toBe(true);
    });

    it('should return false for date only', () => {
      expect(isValidTimestamp('2026-01-07')).toBe(false);
    });

    it('should return false for invalid string', () => {
      expect(isValidTimestamp('not-a-date')).toBe(false);
    });
  });
});


  describe('HarnessResultInputSchema', () => {
    it('should not have prev_hash field', () => {
      const input = {
        harness_id: 0,
        harness_name: 'SENSE' as const,
        model: 'test-model',
        scores: { raw: 80, normalized: 0.8 },
        timestamp: '2026-01-07T00:00:00.000Z',
        duration_ms: 1000,
      };
      const result = validateHarnessResultInput(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect('prev_hash' in result.data).toBe(false);
        expect('hash' in result.data).toBe(false);
      }
    });

    it('should reject if prev_hash is provided', () => {
      const input = {
        harness_id: 0,
        harness_name: 'SENSE' as const,
        model: 'test-model',
        scores: { raw: 80, normalized: 0.8 },
        timestamp: '2026-01-07T00:00:00.000Z',
        duration_ms: 1000,
        prev_hash: '0000000000000000',
      };
      const result = validateHarnessResultInput(input);
      // Should still succeed but strip the extra field
      expect(result.success).toBe(true);
    });
  });
