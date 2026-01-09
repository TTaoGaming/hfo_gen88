/**
 * P2 MIRROR MAGUS - Property Tests
 * 
 * @port 2
 * @commander MIRROR_MAGUS
 * @verb SHAPE / TRANSFORM
 * @provenance: LEGENDARY_COMMANDERS_V9.md
 * Validates: Property 5 (Schema Transformation Round-Trip), Property 6 (One Euro Filter Smoothing)
 */

import { describe, it, expect } from 'vitest';
import {
  TransformationSchema,
  OneEuroFilterConfigSchema,
  OneEuroFilterStateSchema,
  ShapeResultSchema,
  createTransformation,
  createFilterState,
  applyOneEuroFilter,
  smoothingFactor,
  exponentialSmoothing,
  isRoundTripValid,
  type OneEuroFilterConfig,
  type OneEuroFilterState,
} from './contracts/index.js';

describe('P2 MIRROR MAGUS - Property Tests', () => {
  // --- Property 5: Schema Transformation Round-Trip ---
  describe('Property 5: Schema Transformation Round-Trip', () => {
    it('invertible transformations round-trip correctly', () => {
      // Simple invertible transform: multiply by 2
      const transform = (x: number) => x * 2;
      const inverse = (x: number) => x / 2;
      const equals = (a: number, b: number) => Math.abs(a - b) < 0.0001;
      
      expect(isRoundTripValid(5, transform, inverse, equals)).toBe(true);
      expect(isRoundTripValid(0, transform, inverse, equals)).toBe(true);
      expect(isRoundTripValid(-10, transform, inverse, equals)).toBe(true);
    });

    it('non-invertible transformations fail round-trip', () => {
      // Non-invertible: floor function
      const transform = (x: number) => Math.floor(x);
      const inverse = (x: number) => x; // Can't truly invert floor
      const equals = (a: number, b: number) => a === b;
      
      expect(isRoundTripValid(5.7, transform, inverse, equals)).toBe(false);
    });

    it('transformation records validate against schema', () => {
      const t = createTransformation('NORMALIZE', { raw: 100 }, { normalized: 0.5 }, true, { scale: 200 });
      
      const result = TransformationSchema.safeParse(t);
      expect(result.success).toBe(true);
      expect(t.invertible).toBe(true);
    });

    it('transformation has valid UUID', () => {
      const t = createTransformation('SCHEMA_MORPH', {}, {}, false);
      expect(t.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it('transformation has timestamp', () => {
      const before = Date.now();
      const t = createTransformation('AGGREGATE', [], {}, false);
      const after = Date.now();
      
      expect(t.timestamp).toBeGreaterThanOrEqual(before);
      expect(t.timestamp).toBeLessThanOrEqual(after);
    });
  });

  // --- Property 6: One Euro Filter Smoothing ---
  describe('Property 6: One Euro Filter Smoothing', () => {
    const defaultConfig: OneEuroFilterConfig = {
      minCutoff: 1.0,
      beta: 0.007,
      dCutoff: 1.0,
      frequency: 120,
    };

    it('filter state initializes correctly', () => {
      const state = createFilterState();
      expect(state.initialized).toBe(false);
      expect(state.x).toBe(0);
      expect(state.dx).toBe(0);
    });

    it('first value passes through unchanged', () => {
      const state = createFilterState();
      const [filtered, newState] = applyOneEuroFilter(100, 0, state, defaultConfig);
      
      expect(filtered).toBe(100);
      expect(newState.initialized).toBe(true);
      expect(newState.x).toBe(100);
    });

    it('smoothing factor is bounded (0, 1)', () => {
      // Various te and cutoff values
      const testCases = [
        { te: 0.001, cutoff: 1 },
        { te: 0.01, cutoff: 10 },
        { te: 0.1, cutoff: 100 },
      ];
      
      for (const { te, cutoff } of testCases) {
        const sf = smoothingFactor(te, cutoff);
        expect(sf).toBeGreaterThan(0);
        expect(sf).toBeLessThan(1);
      }
    });

    it('exponential smoothing interpolates between values', () => {
      // a=0 → returns xPrev
      expect(exponentialSmoothing(0, 100, 50)).toBe(50);
      // a=1 → returns x
      expect(exponentialSmoothing(1, 100, 50)).toBe(100);
      // a=0.5 → returns midpoint
      expect(exponentialSmoothing(0.5, 100, 50)).toBe(75);
    });

    it('filter reduces noise (smoothed values closer to mean)', () => {
      let state = createFilterState();
      const noisySignal = [100, 105, 95, 102, 98, 103, 97, 101, 99, 100];
      const filtered: number[] = [];
      
      let t = 0;
      for (const value of noisySignal) {
        const [f, newState] = applyOneEuroFilter(value, t, state, defaultConfig);
        filtered.push(f);
        state = newState;
        t += 1 / defaultConfig.frequency;
      }
      
      // Calculate variance of original vs filtered
      const mean = 100;
      const originalVariance = noisySignal.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / noisySignal.length;
      const filteredVariance = filtered.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / filtered.length;
      
      // Filtered should have lower variance (smoother)
      expect(filteredVariance).toBeLessThan(originalVariance);
    });

    it('filter config validates against schema', () => {
      const result = OneEuroFilterConfigSchema.safeParse(defaultConfig);
      expect(result.success).toBe(true);
    });

    it('filter state validates against schema', () => {
      const state: OneEuroFilterState = {
        x: 50,
        dx: 0.1,
        lastTime: 1000,
        initialized: true,
      };
      
      const result = OneEuroFilterStateSchema.safeParse(state);
      expect(result.success).toBe(true);
    });

    it('zero time delta returns previous value', () => {
      let state = createFilterState();
      const [, newState] = applyOneEuroFilter(100, 0, state, defaultConfig);
      
      // Same timestamp should return previous value
      const [filtered, _] = applyOneEuroFilter(200, 0, newState, defaultConfig);
      expect(filtered).toBe(100);
    });
  });

  // --- Shape Result Validation ---
  describe('Shape Result Validation', () => {
    it('successful shape result validates', () => {
      const result = {
        success: true,
        transformation: createTransformation('NORMALIZE', 100, 0.5, true),
        canInvert: true,
      };
      
      const parsed = ShapeResultSchema.safeParse(result);
      expect(parsed.success).toBe(true);
    });

    it('failed shape result validates', () => {
      const result = {
        success: false,
        error: 'Invalid input schema',
        canInvert: false,
      };
      
      const parsed = ShapeResultSchema.safeParse(result);
      expect(parsed.success).toBe(true);
    });
  });
});
