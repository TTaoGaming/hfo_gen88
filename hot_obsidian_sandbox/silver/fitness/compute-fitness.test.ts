/**
 * Fitness Calculator Unit Tests
 * @provenance hfo-testing-promotion/6.2
 * Validates: Requirements 3.1, 3.2, 3.3
 */

import { describe, it, expect } from 'vitest';
import {
  computeFitness,
  weightedAverage,
  arithmeticMean,
  isValidFitness,
  DEFAULT_FITNESS_CONFIG,
  HarnessScore,
} from './compute-fitness';

describe('Fitness Calculator', () => {
  describe('weightedAverage', () => {
    it('should return 0 for empty arrays', () => {
      expect(weightedAverage([], [])).toBe(0);
    });

    it('should compute simple average with equal weights', () => {
      const scores = [0.8, 0.6, 0.4];
      const weights = [1, 1, 1];
      expect(weightedAverage(scores, weights)).toBeCloseTo(0.6, 5);
    });

    it('should compute weighted average correctly', () => {
      const scores = [1.0, 0.0];
      const weights = [3, 1]; // 3:1 ratio
      // (1.0 * 3 + 0.0 * 1) / (3 + 1) = 3/4 = 0.75
      expect(weightedAverage(scores, weights)).toBeCloseTo(0.75, 5);
    });

    it('should handle zero total weight', () => {
      const scores = [0.5, 0.5];
      const weights = [0, 0];
      expect(weightedAverage(scores, weights)).toBe(0);
    });

    it('should throw for mismatched lengths', () => {
      expect(() => weightedAverage([1, 2], [1])).toThrow();
    });
  });

  describe('arithmeticMean', () => {
    it('should return 0 for empty array', () => {
      expect(arithmeticMean([])).toBe(0);
    });

    it('should compute mean correctly', () => {
      expect(arithmeticMean([0.2, 0.4, 0.6, 0.8])).toBeCloseTo(0.5, 5);
    });

    it('should handle single value', () => {
      expect(arithmeticMean([0.7])).toBe(0.7);
    });
  });

  describe('computeFitness', () => {
    it('should return 0 for empty results', () => {
      const report = computeFitness([]);
      expect(report.fitness).toBe(0);
      expect(report.total_duration_ms).toBe(0);
    });

    it('should compute arithmetic mean with default config', () => {
      const results: HarnessScore[] = [
        { harness_name: 'SENSE', normalized: 0.8 },
        { harness_name: 'FUSE', normalized: 0.6 },
      ];
      const report = computeFitness(results);
      expect(report.fitness).toBeCloseTo(0.7, 5);
    });

    it('should use custom weights', () => {
      const results: HarnessScore[] = [
        { harness_name: 'SENSE', normalized: 1.0 },
        { harness_name: 'FUSE', normalized: 0.0 },
      ];
      const config = {
        harness_weights: { SENSE: 3, FUSE: 1 },
      };
      const report = computeFitness(results, config);
      expect(report.fitness).toBeCloseTo(0.75, 5);
    });

    it('should sum durations', () => {
      const results: HarnessScore[] = [
        { harness_name: 'SENSE', normalized: 0.8, duration_ms: 100 },
        { harness_name: 'FUSE', normalized: 0.6, duration_ms: 200 },
      ];
      const report = computeFitness(results);
      expect(report.total_duration_ms).toBe(300);
    });

    it('should record individual harness scores', () => {
      const results: HarnessScore[] = [
        { harness_name: 'SENSE', normalized: 0.8 },
        { harness_name: 'FUSE', normalized: 0.6 },
      ];
      const report = computeFitness(results);
      expect(report.harness_scores['SENSE']).toBe(0.8);
      expect(report.harness_scores['FUSE']).toBe(0.6);
    });

    it('should include timestamp', () => {
      const report = computeFitness([]);
      expect(report.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('should use default weight of 1.0 for unknown harness', () => {
      const results: HarnessScore[] = [
        { harness_name: 'UNKNOWN', normalized: 0.5 },
      ];
      const report = computeFitness(results);
      expect(report.fitness).toBe(0.5);
    });
  });

  describe('isValidFitness', () => {
    it('should return true for 0', () => {
      expect(isValidFitness(0)).toBe(true);
    });

    it('should return true for 1', () => {
      expect(isValidFitness(1)).toBe(true);
    });

    it('should return true for 0.5', () => {
      expect(isValidFitness(0.5)).toBe(true);
    });

    it('should return false for negative', () => {
      expect(isValidFitness(-0.1)).toBe(false);
    });

    it('should return false for > 1', () => {
      expect(isValidFitness(1.1)).toBe(false);
    });

    it('should return false for NaN', () => {
      expect(isValidFitness(NaN)).toBe(false);
    });
  });

  describe('DEFAULT_FITNESS_CONFIG', () => {
    it('should have equal weights for all 8 harnesses', () => {
      const names = ['SENSE', 'FUSE', 'SHAPE', 'DELIVER', 'DISRUPT', 'IMMUNIZE', 'STORE', 'DECIDE'];
      for (const name of names) {
        expect(DEFAULT_FITNESS_CONFIG.harness_weights[name]).toBe(1.0);
      }
    });
  });
});
