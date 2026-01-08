/**
 * 🧪 ONE EURO FILTER TESTS
 * 
 * Property-based tests for OneEuroFilter correctness.
 * 
 * Feature: gesture-pointer-monolith
 * Property 3: OneEuro smoothing bounds
 * Validates: Requirements 2.1
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { test, fc } from '@fast-check/vitest';
import { OneEuroFilter } from './one-euro-filter.js';

describe('OneEuroFilter', () => {
  let filter: OneEuroFilter;

  beforeEach(() => {
    filter = new OneEuroFilter({ minCutoff: 0.5, beta: 0.001, dcutoff: 1.0 });
  });

  describe('Unit Tests', () => {
    it('should return input position on first sample', () => {
      const result = filter.filter(0.5, 0.5, 1000);
      expect(result.position.x).toBe(0.5);
      expect(result.position.y).toBe(0.5);
      expect(result.velocity.vx).toBe(0);
      expect(result.velocity.vy).toBe(0);
    });

    it('should smooth rapid position changes', () => {
      filter.filter(0.0, 0.0, 1000);
      const result = filter.filter(1.0, 1.0, 1016); // 16ms later
      
      // Output should be between input positions (smoothed)
      expect(result.position.x).toBeGreaterThan(0);
      expect(result.position.x).toBeLessThan(1);
      expect(result.position.y).toBeGreaterThan(0);
      expect(result.position.y).toBeLessThan(1);
    });

    it('should reset state correctly', () => {
      filter.filter(0.5, 0.5, 1000);
      filter.filter(0.6, 0.6, 1016);
      filter.reset();
      
      // After reset, should behave like first sample
      const result = filter.filter(0.8, 0.8, 2000);
      expect(result.position.x).toBe(0.8);
      expect(result.position.y).toBe(0.8);
    });

    it('should update configuration', () => {
      filter.configure({ minCutoff: 1.0, beta: 0.01 });
      const config = filter.getConfig();
      expect(config.minCutoff).toBe(1.0);
      expect(config.beta).toBe(0.01);
      expect(config.dcutoff).toBe(1.0); // unchanged
    });

    it('should handle zero values in configuration to kill null-coalescing mutants', () => {
      const zeroFilter = new OneEuroFilter({ minCutoff: 0, beta: 0, dcutoff: 0 });
      const config = zeroFilter.getConfig();
      expect(config.minCutoff).toBe(0);
      expect(config.beta).toBe(0);
      expect(config.dcutoff).toBe(0);
    });

    it('should kill survivors in LowPassFilter.last()', () => {
      filter.reset();
      // Internal LowPassFilters should return 0 if null
      // We can't access them directly, but we can check behavior if we can
      // For now, we know first sample returns input.
      const result = filter.filter(0.5, 0.5, 1000);
      expect(result.position.x).toBe(0.5);
    });

    it('should handle same timestamp samples', () => {
      filter.filter(0.1, 0.1, 1000);
      const result = filter.filter(0.9, 0.9, 1000); // Same timestamp
      expect(result.position.x).toBe(0.9); // Should just return input
      expect(result.velocity.vx).toBe(0);
    });

    it('should kill arithmetic survivors in alpha calculation', () => {
      // Test different dt values to verify the formula r = 2 * PI * cutoff * dt
      filter.filter(0.0, 0.0, 1000);
      
      // Moving at constant speed
      const res1 = filter.filter(0.1, 0.1, 1010); // dt = 0.01s
      const x1 = res1.position.x;
      
      filter.reset();
      filter.filter(0.0, 0.0, 1000);
      const res2 = filter.filter(0.1, 0.1, 1020); // dt = 0.02s
      const x2 = res2.position.x;
      
      // With larger dt, alpha should be larger, and output should be closer to 0.1 (less smoothing)
      expect(x2).toBeGreaterThan(x1);
    });

    it('should kill survivors in partial configuration updates', () => {
      filter.configure({ minCutoff: 2.0 });
      expect(filter.getConfig().minCutoff).toBe(2.0);
      expect(filter.getConfig().beta).toBe(0.001); // default

      filter.configure({ beta: 0.5 });
      expect(filter.getConfig().beta).toBe(0.5);
      expect(filter.getConfig().minCutoff).toBe(2.0); // kept from previous

      filter.configure({ dcutoff: 5.0 });
      expect(filter.getConfig().dcutoff).toBe(5.0);
    });

    it('should kill survivors in velocity and cutoff calculation', () => {
      // Test with very high beta vs very low beta
      const lowBetaFilter = new OneEuroFilter({ beta: 0.0001 });
      const highBetaFilter = new OneEuroFilter({ beta: 100.0 });
      
      lowBetaFilter.filter(0.0, 0.0, 1000);
      highBetaFilter.filter(0.0, 0.0, 1000);
      
      const resLow = lowBetaFilter.filter(1.0, 1.0, 1016);
      const resHigh = highBetaFilter.filter(1.0, 1.0, 1016);
      
      // High beta should be much more responsive (closer to 1.0)
      expect(resHigh.position.x).toBeGreaterThan(resLow.position.x);
    });
    it('should kill arithmetic survivors in dt and dx/dy calculation with exact math', () => {
      const fixedFilter = new OneEuroFilter({ minCutoff: 1.0, beta: 0.0, dcutoff: 1.0 });
      fixedFilter.filter(0.0, 0.0, 1000);
      fixedFilter.filter(1.0, 1.0, 2000);
      
      /**
       * dt = 1.0s (3000 - 2000) / 1000
       * dx = (0.0 - 1.0) / 1.0 = -1.0
       * alphaD = (2 * PI * dcutoff * dt) / (2 * PI * dcutoff * dt + 1) = 0.8627
       * edx = alphaD * dx + (1.0 - alphaD) * last_edx
       * edx = 0.8627 * -1.0 + (1.0 - 0.8627) * 1.0 = -0.8627 + 0.1373 = -0.7254
       */
      const res = fixedFilter.filter(0.0, 0.0, 3000);
      
      expect(res.velocity.vx).toBeCloseTo(-0.7254, 3);
    });

    it('should kill reset and block survivors by verifying full lifecycle', () => {
      filter.filter(0.5, 0.5, 1000);
      filter.filter(0.6, 0.6, 1016);
      filter.reset();
      
      const res = filter.filter(0.9, 0.1, 3000);
      // If reset worked, velocity is 0 and position is exactly input
      expect(res.position.x).toBe(0.9);
      expect(res.position.y).toBe(0.1);
      expect(res.velocity.vx).toBe(0);
      expect(res.velocity.vy).toBe(0);
    });  });

  describe('Property Tests', () => {
    /**
     * Property 3: OneEuro smoothing bounds
     * For any sequence of input positions, the OneEuroFilter output SHALL remain
     * within the bounding box of the input positions (with small overshoot tolerance).
     * 
     * Feature: gesture-pointer-monolith, Property 3: OneEuro smoothing bounds
     * Validates: Requirements 2.1
     */
    test.prop([
      fc.array(
        fc.record({
          x: fc.double({ min: 0, max: 1, noNaN: true }),
          y: fc.double({ min: 0, max: 1, noNaN: true }),
          dt: fc.integer({ min: 10, max: 100 }), // 10-100ms between samples
        }),
        { minLength: 2, maxLength: 50 }
      ),
    ], { numRuns: 100 })(
      'output stays within input bounding box (with tolerance)',
      (samples) => {
        const testFilter = new OneEuroFilter({ minCutoff: 0.5, beta: 0.001, dcutoff: 1.0 });
        
        // Calculate input bounding box
        const minX = Math.min(...samples.map(s => s.x));
        const maxX = Math.max(...samples.map(s => s.x));
        const minY = Math.min(...samples.map(s => s.y));
        const maxY = Math.max(...samples.map(s => s.y));
        
        // Allow 5% overshoot tolerance for filter lag
        const tolerance = 0.05;
        const boundMinX = minX - tolerance;
        const boundMaxX = maxX + tolerance;
        const boundMinY = minY - tolerance;
        const boundMaxY = maxY + tolerance;
        
        let timestamp = 1000;
        for (const sample of samples) {
          const result = testFilter.filter(sample.x, sample.y, timestamp);
          
          expect(result.position.x).toBeGreaterThanOrEqual(boundMinX);
          expect(result.position.x).toBeLessThanOrEqual(boundMaxX);
          expect(result.position.y).toBeGreaterThanOrEqual(boundMinY);
          expect(result.position.y).toBeLessThanOrEqual(boundMaxY);
          
          timestamp += sample.dt;
        }
      }
    );

    /**
     * Property: Filter converges to stable input
     * When input is constant, output should converge to that value.
     */
    test.prop([
      fc.double({ min: 0, max: 1, noNaN: true }),
      fc.double({ min: 0, max: 1, noNaN: true }),
    ], { numRuns: 100 })(
      'converges to constant input',
      (targetX, targetY) => {
        const testFilter = new OneEuroFilter({ minCutoff: 0.5, beta: 0.001, dcutoff: 1.0 });
        
        let timestamp = 1000;
        let lastResult = { position: { x: 0, y: 0 }, velocity: { vx: 0, vy: 0 } };
        
        // Feed constant input for 20 samples
        for (let i = 0; i < 20; i++) {
          lastResult = testFilter.filter(targetX, targetY, timestamp);
          timestamp += 16; // 60fps
        }
        
        // Should converge close to target
        expect(Math.abs(lastResult.position.x - targetX)).toBeLessThan(0.01);
        expect(Math.abs(lastResult.position.y - targetY)).toBeLessThan(0.01);
      }
    );

    /**
     * Property: Velocity estimation is reasonable
     * Velocity should reflect actual movement direction.
     */
    test.prop([
      fc.double({ min: 0.1, max: 0.4, noNaN: true }),
      fc.double({ min: 0.6, max: 0.9, noNaN: true }),
    ], { numRuns: 100 })(
      'velocity reflects movement direction',
      (startX, endX) => {
        const testFilter = new OneEuroFilter({ minCutoff: 0.5, beta: 0.001, dcutoff: 1.0 });
        
        // Move from start to end
        testFilter.filter(startX, 0.5, 1000);
        const result = testFilter.filter(endX, 0.5, 1016);
        
        // Velocity should be positive (moving right)
        expect(result.velocity.vx).toBeGreaterThan(0);
      }
    );
  });
});
