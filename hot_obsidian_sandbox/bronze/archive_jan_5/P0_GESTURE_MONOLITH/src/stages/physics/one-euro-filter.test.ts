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
  });

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
