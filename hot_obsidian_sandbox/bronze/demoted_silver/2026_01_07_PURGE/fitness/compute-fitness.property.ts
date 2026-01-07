/**
 * Fitness Calculator Property Tests
 * @provenance hfo-testing-promotion/6.3, 6.4, 6.5
 * Feature: hfo-testing-promotion
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  computeFitness,
  weightedAverage,
  isValidFitness,
  HarnessScore,
  FitnessConfig,
} from './compute-fitness';

const HARNESS_NAMES = ['SENSE', 'FUSE', 'SHAPE', 'DELIVER', 'DISRUPT', 'IMMUNIZE', 'STORE', 'DECIDE'];

// Arbitrary for valid harness score
const arbitraryHarnessScore = (): fc.Arbitrary<HarnessScore> =>
  fc.record({
    harness_name: fc.constantFrom(...HARNESS_NAMES),
    normalized: fc.float({ min: 0, max: 1, noNaN: true }),
    duration_ms: fc.integer({ min: 0, max: 100000 }),
  });

// Arbitrary for fitness config with positive weights
const arbitraryFitnessConfig = (): fc.Arbitrary<FitnessConfig> =>
  fc.record({
    harness_weights: fc.record(
      Object.fromEntries(
        HARNESS_NAMES.map(name => [name, fc.float({ min: Math.fround(0.1), max: Math.fround(10), noNaN: true })])
      ) as Record<string, fc.Arbitrary<number>>
    ),
  });

describe('Fitness Calculator Properties', () => {
  /**
   * Property 5: Fitness Weighted Average Correctness
   * For any set of harness results and for any weight configuration,
   * the computed fitness SHALL equal the sum of (score × weight) divided by sum of weights.
   * Validates: Requirements 3.1, 3.2
   */
  describe('Property 5: Fitness Weighted Average Correctness', () => {
    it('weighted average matches manual computation', () => {
      fc.assert(
        fc.property(
          fc.array(fc.float({ min: 0, max: 1, noNaN: true }), { minLength: 1, maxLength: 10 }),
          fc.array(fc.float({ min: Math.fround(0.1), max: Math.fround(10), noNaN: true }), { minLength: 1, maxLength: 10 }),
          (scores, weights) => {
            // Ensure same length
            const len = Math.min(scores.length, weights.length);
            const s = scores.slice(0, len);
            const w = weights.slice(0, len);

            const result = weightedAverage(s, w);

            // Manual computation
            let weightedSum = 0;
            let totalWeight = 0;
            for (let i = 0; i < len; i++) {
              weightedSum += s[i] * w[i];
              totalWeight += w[i];
            }
            const expected = totalWeight > 0 ? weightedSum / totalWeight : 0;

            expect(result).toBeCloseTo(expected, 5);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('equal weights produce arithmetic mean', () => {
      fc.assert(
        fc.property(
          fc.array(fc.float({ min: 0, max: 1, noNaN: true }), { minLength: 1, maxLength: 10 }),
          (scores) => {
            const weights = scores.map(() => 1);
            const result = weightedAverage(scores, weights);

            // Arithmetic mean
            const expected = scores.reduce((a, b) => a + b, 0) / scores.length;

            expect(result).toBeCloseTo(expected, 5);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 6: Fitness Bounded Output
   * For any set of valid harness results (scores in [0,1]),
   * the computed fitness SHALL be in the range [0,1].
   * Validates: Requirements 3.4
   */
  describe('Property 6: Fitness Bounded Output', () => {
    it('fitness is always in [0,1] for valid inputs', () => {
      fc.assert(
        fc.property(
          fc.array(arbitraryHarnessScore(), { minLength: 0, maxLength: 8 }),
          (results) => {
            const report = computeFitness(results);
            expect(report.fitness).toBeGreaterThanOrEqual(0);
            expect(report.fitness).toBeLessThanOrEqual(1);
            expect(isValidFitness(report.fitness)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('fitness is always in [0,1] with custom weights', () => {
      fc.assert(
        fc.property(
          fc.array(arbitraryHarnessScore(), { minLength: 1, maxLength: 8 }),
          arbitraryFitnessConfig(),
          (results, config) => {
            const report = computeFitness(results, config);
            expect(report.fitness).toBeGreaterThanOrEqual(0);
            expect(report.fitness).toBeLessThanOrEqual(1);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('all 1.0 scores produce fitness 1.0', () => {
      fc.assert(
        fc.property(
          fc.array(fc.constantFrom(...HARNESS_NAMES), { minLength: 1, maxLength: 8 }),
          (names) => {
            const results: HarnessScore[] = names.map(name => ({
              harness_name: name,
              normalized: 1.0,
            }));
            const report = computeFitness(results);
            expect(report.fitness).toBeCloseTo(1.0, 5);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('all 0.0 scores produce fitness 0.0', () => {
      fc.assert(
        fc.property(
          fc.array(fc.constantFrom(...HARNESS_NAMES), { minLength: 1, maxLength: 8 }),
          (names) => {
            const results: HarnessScore[] = names.map(name => ({
              harness_name: name,
              normalized: 0.0,
            }));
            const report = computeFitness(results);
            expect(report.fitness).toBeCloseTo(0.0, 5);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 7: Fitness Idempotence
   * For any set of harness results, computing fitness twice with the same inputs
   * SHALL produce identical results.
   * Validates: Requirements 3.5
   */
  describe('Property 7: Fitness Idempotence', () => {
    it('computing fitness twice produces same result', () => {
      fc.assert(
        fc.property(
          fc.array(arbitraryHarnessScore(), { minLength: 0, maxLength: 8 }),
          (results) => {
            const report1 = computeFitness(results);
            const report2 = computeFitness(results);

            expect(report1.fitness).toBe(report2.fitness);
            expect(report1.total_duration_ms).toBe(report2.total_duration_ms);
            expect(report1.harness_scores).toEqual(report2.harness_scores);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('weightedAverage is idempotent', () => {
      fc.assert(
        fc.property(
          fc.array(fc.float({ min: 0, max: 1, noNaN: true }), { minLength: 1, maxLength: 10 }),
          fc.array(fc.float({ min: Math.fround(0.1), max: Math.fround(10), noNaN: true }), { minLength: 1, maxLength: 10 }),
          (scores, weights) => {
            const len = Math.min(scores.length, weights.length);
            const s = scores.slice(0, len);
            const w = weights.slice(0, len);

            const result1 = weightedAverage(s, w);
            const result2 = weightedAverage(s, w);

            expect(result1).toBe(result2);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
