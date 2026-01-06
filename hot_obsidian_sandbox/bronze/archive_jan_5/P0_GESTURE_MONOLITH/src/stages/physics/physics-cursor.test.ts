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
