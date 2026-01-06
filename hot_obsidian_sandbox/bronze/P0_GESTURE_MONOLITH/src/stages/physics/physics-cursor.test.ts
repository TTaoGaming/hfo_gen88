/**
 * 🧪 PHYSICS CURSOR TESTS
 * 
 * Property-based tests for PhysicsCursor correctness.
 * 
 * Feature: gesture-pointer-monolith
 * Property 4: Physics coasting during tracking loss
 * Property 5: Snap-lock on tracking resumption
 * Validates: Requirements 2.6, 2.7
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { test, fc } from '@fast-check/vitest';
import { PhysicsCursor } from './physics-cursor.js';

describe('PhysicsCursor', () => {
  let cursor: PhysicsCursor;

  beforeEach(async () => {
    cursor = new PhysicsCursor({ stiffness: 50, damping: 5, snapLockThreshold: 0.1 });
    await cursor.init();
  });

  describe('Unit Tests', () => {
    it('should initialize at center position', () => {
      const pos = cursor.getPosition();
      expect(pos.x).toBeCloseTo(0.5, 1);
      expect(pos.y).toBeCloseTo(0.5, 1);
    });

    it('should move toward target when stepping', async () => {
      cursor.setTarget(0.8, 0.8);
      
      // Step multiple times
      for (let i = 0; i < 10; i++) {
        cursor.step(1 / 30);
      }
      
      const pos = cursor.getPosition();
      expect(pos.x).toBeGreaterThan(0.5);
      expect(pos.y).toBeGreaterThan(0.5);
    });

    it('should report coasting state correctly', () => {
      expect(cursor.getIsCoasting()).toBe(false);
      cursor.startCoasting(1000);
      expect(cursor.getIsCoasting()).toBe(true);
      cursor.setTarget(0.5, 0.5);
      expect(cursor.getIsCoasting()).toBe(false);
    });

    it('should reset to center', async () => {
      cursor.setTarget(0.9, 0.9);
      for (let i = 0; i < 20; i++) cursor.step();
      
      cursor.reset();
      const pos = cursor.getPosition();
      expect(pos.x).toBeCloseTo(0.5, 1);
      expect(pos.y).toBeCloseTo(0.5, 1);
    });

    it('should handle uninitialized state gracefully', () => {
      const uninitCursor = new PhysicsCursor();
      expect(uninitCursor.isReady()).toBe(false);
      
      const pos = uninitCursor.getPosition();
      expect(pos).toEqual({ x: 0.5, y: 0.5 });
      
      const vel = uninitCursor.getVelocity();
      expect(vel).toEqual({ vx: 0, vy: 0 });
      
      // Should not crash and should return expected defaults
      uninitCursor.setTarget(0.8, 0.8);
      uninitCursor.startCoasting(1000);
      uninitCursor.reset();
      uninitCursor.configure({ stiffness: 100 });

      const state = uninitCursor.step();
      expect(state.position).toEqual({ x: 0.5, y: 0.5 });
      expect(state.isCoasting).toBe(false);

      expect(uninitCursor.getPredictivePosition()).toEqual({ x: 0.5, y: 0.5 });
    });

    it('should provide predictive position based on velocity', async () => {
      // Build some velocity
      cursor.setTarget(1.0, 1.0);
      for (let i = 0; i < 5; i++) cursor.step(1/30);
      
      const pos = cursor.getPosition();
      const vel = cursor.getVelocity();
      const pred = cursor.getPredictivePosition(0.1);
      
      expect(pred.x).toBeCloseTo(pos.x + vel.vx * 0.1, 5);
      expect(pred.y).toBeCloseTo(pos.y + vel.vy * 0.1, 5);
    });

    it('should track coasting duration', () => {
      const start = 1000;
      cursor.startCoasting(start);
      expect(cursor.getCoastingDuration(start + 500)).toBe(500);
      expect(cursor.getCoastingDuration(start)).toBe(0);
      
      cursor.setTarget(0.5, 0.5);
      expect(cursor.getCoastingDuration(start + 500)).toBeNull();
    });

    it('should allow reconfiguration of physics parameters and affect behavior', async () => {
      cursor.configure({ stiffness: 10, damping: 1 });
      cursor.setTarget(1.0, 1.0);
      cursor.step(1/30);
      const posLow = cursor.getPosition();
      
      cursor.reset();
      cursor.configure({ stiffness: 1000, damping: 5 });
      cursor.setTarget(1.0, 1.0);
      cursor.step(1/30);
      const posHigh = cursor.getPosition();
      
      // High stiffness should move much further in one step
      expect(posHigh.x).toBeGreaterThan(posLow.x);
    });

    it('should support specific mass via constructor', async () => {
      const heavyCursor = new PhysicsCursor({ mass: 10 });
      await heavyCursor.init();
      heavyCursor.setTarget(1.0, 1.0);
      heavyCursor.step(1/30);
      const posHeavy = heavyCursor.getPosition();

      const lightCursor = new PhysicsCursor({ mass: 0.1 });
      await lightCursor.init();
      lightCursor.setTarget(1.0, 1.0);
      lightCursor.step(1/30);
      const posLight = lightCursor.getPosition();

      // Light cursor should move further than heavy cursor with same impulse
      expect(posLight.x).toBeGreaterThan(posHeavy.x);
    });

    it('should respect snap-lock threshold boundary', async () => {
      // Set snapLockThreshold to 0.5
      cursor.configure({ snapLockThreshold: 0.5 });
      
      // Move to 0.0
      cursor.setTarget(0, 0);
      for (let i = 0; i < 50; i++) cursor.step();
      
      const posAtStart = cursor.getPosition();
      cursor.startCoasting(1000);
      
      // Resume with distance 0.4 (less than threshold)
      cursor.setTarget(0.4, 0);
      // Position should NOT have snapped (no blending yet, just target set)
      expect(cursor.getPosition().x).toBeCloseTo(posAtStart.x, 3);

      cursor.startCoasting(2000);
      // Resume with distance 0.6 (greater than threshold)
      cursor.setTarget(0.6, 0);
      // Position SHOULD have snapped
      expect(cursor.getPosition().x).toBeGreaterThan(0.1);
    });


    it('should kill nullish coalescing mutants for config', async () => {
      // Test ?? by passing 0 (falsy) which should NOT be overridden by default
      const configCursor = new PhysicsCursor({ stiffness: 10, damping: 0, snapLockThreshold: 0 });
      await configCursor.init();
      
      // If damping was overridden to 5 (default), it would slow down quickly.
      // If it's 0, it should preserve velocity better.
      configCursor.setTarget(1, 1);
      configCursor.step(1); 
      const vel = configCursor.getVelocity();
      
      configCursor.startCoasting(1000);
      configCursor.step(1);
      const velAfter = configCursor.getVelocity();
      
      // With 0 damping, velocity should be exactly the same after world step
      expect(velAfter.vx).toBeCloseTo(vel.vx, 5);
    });

    it('should respect exact snap-lock threshold boundary', async () => {
      cursor.reset();
      cursor.configure({ snapLockThreshold: 0.1 });
      
      cursor.startCoasting(1000);
      // Resume with exact threshold distance (0.1)
      // 0.6 - 0.5 = 0.1. 0.1 > 0.1 is false. 
      cursor.setTarget(0.6, 0.5); 
      // Should NOT have snapped, position stays 0.5
      expect(cursor.getPosition().x).toBeCloseTo(0.5, 5);

      cursor.startCoasting(2000);
      // Resume with distance > threshold (0.101)
      cursor.setTarget(0.601, 0.5);
      // Should have snapped
      expect(cursor.getPosition().x).toBeGreaterThan(0.51);
    });


    it('should handle getVelocity when uninitialized', () => {
      const uninit = new PhysicsCursor();
      expect(uninit.getVelocity()).toEqual({ vx: 0, vy: 0 });
    });

    it('should handle coasting start time null edge cases', () => {
       // isCoasting is true but startTime is null (force this state via internal if we could, 
       // but we can just call getCoastingDuration)
       expect(cursor.getCoastingDuration(1000)).toBeNull();
    });


    it('should apply snap-lock blending when resuming from coasting', async () => {
      cursor.setTarget(0.1, 0.1);
      for (let i = 0; i < 30; i++) cursor.step();
      
      cursor.startCoasting(1000);
      const posBeforeResuming = cursor.getPosition();
      cursor.setTarget(0.9, 0.9); // Resume
      
      const posAfterResuming = cursor.getPosition();
      
      // Blend factor is 0.7: pos + (target - pos) * 0.7
      const expectedX = posBeforeResuming.x + (0.9 - posBeforeResuming.x) * 0.7;
      const expectedY = posBeforeResuming.y + (0.9 - posBeforeResuming.y) * 0.7;
      
      expect(posAfterResuming.x).toBeCloseTo(expectedX, 3);
      expect(posAfterResuming.y).toBeCloseTo(expectedY, 3);
    });
  });

  describe('Property Tests', () => {
    /**
     * Property 4: Physics coasting during tracking loss
     * For any tracking loss (no landmark events), the physics cursor SHALL
     * continue moving based on its last velocity (inertia), not jump to default.
     * 
     * Feature: gesture-pointer-monolith, Property 4: Physics coasting during tracking loss
     * Validates: Requirements 2.6
     */
    test.prop([
      fc.double({ min: 0.1, max: 0.9, noNaN: true }),
      fc.double({ min: 0.1, max: 0.9, noNaN: true }),
      fc.integer({ min: 5, max: 20 }), // steps before coasting
      fc.integer({ min: 5, max: 20 }), // steps during coasting
    ], { numRuns: 100 })(
      'cursor continues on inertia during coasting',
      async (targetX, targetY, stepsBeforeCoast, coastSteps) => {
        const testCursor = new PhysicsCursor({ stiffness: 50, damping: 2, snapLockThreshold: 0.1 });
        await testCursor.init();
        
        // Move toward target to build velocity
        testCursor.setTarget(targetX, targetY);
        for (let i = 0; i < stepsBeforeCoast; i++) {
          testCursor.step(1 / 30);
        }
        
        const posBeforeCoast = testCursor.getPosition();
        const velBeforeCoast = testCursor.getVelocity();
        
        // Start coasting
        testCursor.startCoasting(1000);
        
        // Step during coast
        const coastPositions: { x: number; y: number }[] = [];
        for (let i = 0; i < coastSteps; i++) {
          const state = testCursor.step(1 / 30);
          coastPositions.push(state.position);
        }
        
        // Verify: cursor did NOT jump to default (0.5, 0.5)
        // It should have continued from posBeforeCoast
        const firstCoastPos = coastPositions[0];
        const distanceFromStart = Math.sqrt(
          Math.pow(firstCoastPos.x - posBeforeCoast.x, 2) +
          Math.pow(firstCoastPos.y - posBeforeCoast.y, 2)
        );
        
        // Should be close to where it was (moved by velocity, not jumped)
        expect(distanceFromStart).toBeLessThan(0.2);
        
        // If had velocity, should have moved in that direction
        if (Math.abs(velBeforeCoast.vx) > 0.1 || Math.abs(velBeforeCoast.vy) > 0.1) {
          const lastCoastPos = coastPositions[coastPositions.length - 1];
          // Position should have changed (not frozen)
          const totalMovement = Math.sqrt(
            Math.pow(lastCoastPos.x - posBeforeCoast.x, 2) +
            Math.pow(lastCoastPos.y - posBeforeCoast.y, 2)
          );
          // With damping, it will slow down but should have moved some
          expect(totalMovement).toBeGreaterThan(0);
        }
      }
    );

    /**
     * Property 5: Snap-lock on tracking resumption
     * For any tracking resumption after loss, the physics cursor SHALL
     * converge toward the new detected position within bounded steps.
     * 
     * Feature: gesture-pointer-monolith, Property 5: Snap-lock on tracking resumption
     * Validates: Requirements 2.7
     */
    test.prop([
      fc.double({ min: 0.1, max: 0.4, noNaN: true }),
      fc.double({ min: 0.1, max: 0.4, noNaN: true }),
      fc.double({ min: 0.6, max: 0.9, noNaN: true }),
      fc.double({ min: 0.6, max: 0.9, noNaN: true }),
    ], { numRuns: 100 })(
      'cursor converges to new position after snap-lock',
      async (startX, startY, resumeX, resumeY) => {
        const testCursor = new PhysicsCursor({ stiffness: 50, damping: 5, snapLockThreshold: 0.1 });
        await testCursor.init();
        
        // Move to start position
        testCursor.setTarget(startX, startY);
        for (let i = 0; i < 30; i++) testCursor.step(1 / 30);
        
        // Start coasting
        testCursor.startCoasting(1000);
        for (let i = 0; i < 10; i++) testCursor.step(1 / 30);
        
        // Resume tracking at new position (snap-lock)
        testCursor.setTarget(resumeX, resumeY);
        
        // Step to converge
        const maxSteps = 60; // 2 seconds at 30fps
        for (let i = 0; i < maxSteps; i++) {
          testCursor.step(1 / 30);
        }
        
        const finalPos = testCursor.getPosition();
        const distanceToTarget = Math.sqrt(
          Math.pow(finalPos.x - resumeX, 2) +
          Math.pow(finalPos.y - resumeY, 2)
        );
        
        // Should have converged close to target within bounded steps
        expect(distanceToTarget).toBeLessThan(0.05);
      }
    );

    /**
     * Property: Predictive position extrapolates correctly
     */
    test.prop([
      fc.double({ min: 0.2, max: 0.8, noNaN: true }),
      fc.double({ min: 0.2, max: 0.8, noNaN: true }),
    ], { numRuns: 100 })(
      'predictive position is ahead of physics position',
      async (targetX, targetY) => {
        const testCursor = new PhysicsCursor({ stiffness: 50, damping: 5 });
        await testCursor.init();
        
        // Build up velocity
        testCursor.setTarget(targetX, targetY);
        for (let i = 0; i < 5; i++) testCursor.step(1 / 30);
        
        const physicsPos = testCursor.getPosition();
        const predictivePos = testCursor.getPredictivePosition(0.05);
        const vel = testCursor.getVelocity();
        
        // Predictive should be offset by velocity * lookahead
        if (Math.abs(vel.vx) > 0.01) {
          const expectedX = physicsPos.x + vel.vx * 0.05;
          expect(predictivePos.x).toBeCloseTo(expectedX, 2);
        }
      }
    );
  });
});
