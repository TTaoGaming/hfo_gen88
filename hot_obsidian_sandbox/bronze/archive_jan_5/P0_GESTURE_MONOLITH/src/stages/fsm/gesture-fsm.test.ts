/**
 * 🧪 GESTURE FSM TESTS
 * 
 * Property-based tests for GestureFSM correctness.
 * 
 * Feature: gesture-pointer-monolith
 * Property 6: Gesture vocabulary constraint
 * Property 7: Dwell time gates state transitions
 * Property 8: Hysteresis prevents oscillation
 * Property 10: State transitions emit correct pointer events
 * 
 * Validates: Requirements 3.2, 3.4, 3.6, 3.7, 3.9, 3.10, 3.11
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { test, fc } from '@fast-check/vitest';
import { GestureFSM } from './gesture-fsm.js';
import type { GestureName, Point2D } from '../../contracts/schemas.js';

describe('GestureFSM', () => {
  let fsm: GestureFSM;
  const defaultPos: Point2D = { x: 0.5, y: 0.5 };

  beforeEach(() => {
    fsm = new GestureFSM({
      dwellTime: 100,
      enterThreshold: 0.7,
      exitThreshold: 0.5,
      coneAngle: 45,
      timeout: 2000,
    });
  });

  describe('Unit Tests', () => {
    it('should start in IDLE state', () => {
      expect(fsm.getState()).toBe('IDLE');
    });

    it('should transition IDLE → ARMED with Open_Palm after dwell', () => {
      // Start dwell
      fsm.update('Open_Palm', 0.8, 30, defaultPos, 1000);
      expect(fsm.getState()).toBe('IDLE'); // Still dwelling
      
      // Complete dwell
      fsm.update('Open_Palm', 0.8, 30, defaultPos, 1200);
      expect(fsm.getState()).toBe('ARMED');
    });

    it('should transition ARMED → ENGAGED with Pointing_Up after dwell', () => {
      // Get to ARMED
      fsm.update('Open_Palm', 0.8, 30, defaultPos, 1000);
      fsm.update('Open_Palm', 0.8, 30, defaultPos, 1200);
      expect(fsm.getState()).toBe('ARMED');
      
      // Start Pointing_Up dwell
      fsm.update('Pointing_Up', 0.8, 30, defaultPos, 1300);
      expect(fsm.getState()).toBe('ARMED'); // Still dwelling
      
      // Complete dwell
      const result = fsm.update('Pointing_Up', 0.8, 30, defaultPos, 1500);
      expect(fsm.getState()).toBe('ENGAGED');
      expect(result.action).toBe('DOWN');
    });

    it('should transition ENGAGED → ARMED with Open_Palm (pointerup)', () => {
      // Get to ENGAGED
      fsm.update('Open_Palm', 0.8, 30, defaultPos, 1000);
      fsm.update('Open_Palm', 0.8, 30, defaultPos, 1200);
      fsm.update('Pointing_Up', 0.8, 30, defaultPos, 1300);
      fsm.update('Pointing_Up', 0.8, 30, defaultPos, 1500);
      expect(fsm.getState()).toBe('ENGAGED');
      
      // Release with Open_Palm
      const result = fsm.update('Open_Palm', 0.8, 30, defaultPos, 1600);
      expect(fsm.getState()).toBe('ARMED');
      expect(result.action).toBe('UP');
    });

    it('should emit CANCEL when palm leaves cone', () => {
      // Get to ARMED
      fsm.update('Open_Palm', 0.8, 30, defaultPos, 1000);
      fsm.update('Open_Palm', 0.8, 30, defaultPos, 1200);
      expect(fsm.getState()).toBe('ARMED');
      
      // Palm leaves cone (angle > 45)
      const result = fsm.update('Open_Palm', 0.8, 60, defaultPos, 1300);
      expect(fsm.getState()).toBe('IDLE');
      expect(result.action).toBe('CANCEL');
    });

    it('should reset to IDLE', () => {
      fsm.update('Open_Palm', 0.8, 30, defaultPos, 1000);
      fsm.update('Open_Palm', 0.8, 30, defaultPos, 1200);
      expect(fsm.getState()).toBe('ARMED');
      
      fsm.reset();
      expect(fsm.getState()).toBe('IDLE');
    });
  });

  describe('Property Tests', () => {
    /**
     * Property 6: Gesture vocabulary constraint
     * For any gesture not in {Open_Palm, Pointing_Up}, the FSM SHALL NOT
     * transition to ARMED or ENGAGED states.
     * 
     * Feature: gesture-pointer-monolith, Property 6: Gesture vocabulary constraint
     * Validates: Requirements 3.2
     */
    test.prop([
      fc.constantFrom<GestureName>('Closed_Fist', 'Thumb_Up', 'Thumb_Down', 'Victory', 'ILoveYou', 'None'),
      fc.double({ min: 0.7, max: 1.0, noNaN: true }),
      fc.double({ min: 0, max: 44, noNaN: true }), // Within cone
      fc.integer({ min: 1, max: 10 }), // Number of updates
    ], { numRuns: 100 })(
      'invalid gestures cannot transition to ARMED or ENGAGED',
      (gesture, confidence, palmAngle, numUpdates) => {
        const testFsm = new GestureFSM({
          dwellTime: 10, // Short dwell for testing
          enterThreshold: 0.7,
          exitThreshold: 0.5,
          coneAngle: 45,
          timeout: 2000,
        });
        
        let timestamp = 1000;
        for (let i = 0; i < numUpdates; i++) {
          testFsm.update(gesture, confidence, palmAngle, defaultPos, timestamp);
          timestamp += 50; // Enough for dwell
        }
        
        // Should never leave IDLE with invalid gestures
        expect(testFsm.getState()).toBe('IDLE');
      }
    );

    /**
     * Property 7: Dwell time gates state transitions
     * For any gesture held for less than dwell time, the FSM SHALL NOT
     * transition to the next state.
     * 
     * Feature: gesture-pointer-monolith, Property 7: Dwell time gates state transitions
     * Validates: Requirements 3.4, 3.6
     */
    test.prop([
      fc.integer({ min: 100, max: 500 }), // Dwell time config
      fc.integer({ min: 1, max: 50 }), // Time held (less than dwell)
    ], { numRuns: 100 })(
      'gesture held less than dwell time does not transition',
      (dwellTime, timeHeld) => {
        // Ensure timeHeld is less than dwellTime
        const actualTimeHeld = Math.min(timeHeld, dwellTime - 1);
        
        const testFsm = new GestureFSM({
          dwellTime,
          enterThreshold: 0.7,
          exitThreshold: 0.5,
          coneAngle: 45,
          timeout: 2000,
        });
        
        // Try to transition with insufficient dwell
        testFsm.update('Open_Palm', 0.8, 30, defaultPos, 1000);
        testFsm.update('Open_Palm', 0.8, 30, defaultPos, 1000 + actualTimeHeld);
        
        // Should still be in IDLE (dwelling)
        expect(testFsm.getState()).toBe('IDLE');
      }
    );

    /**
     * Property 8: Hysteresis prevents oscillation
     * For any confidence value between exit threshold and enter threshold,
     * the FSM SHALL maintain its current state (no transition).
     * 
     * Feature: gesture-pointer-monolith, Property 8: Hysteresis prevents oscillation
     * Validates: Requirements 3.7
     */
    test.prop([
      fc.double({ min: 0.51, max: 0.69, noNaN: true }), // Between exit (0.5) and enter (0.7)
    ], { numRuns: 100 })(
      'confidence in hysteresis band maintains state',
      (confidence) => {
        const testFsm = new GestureFSM({
          dwellTime: 10,
          enterThreshold: 0.7,
          exitThreshold: 0.5,
          coneAngle: 45,
          timeout: 2000,
        });
        
        // Get to ARMED with high confidence
        testFsm.update('Open_Palm', 0.8, 30, defaultPos, 1000);
        testFsm.update('Open_Palm', 0.8, 30, defaultPos, 1100);
        expect(testFsm.getState()).toBe('ARMED');
        
        // Update with confidence in hysteresis band
        testFsm.update('Open_Palm', confidence, 30, defaultPos, 1200);
        
        // Should stay ARMED (not drop to IDLE)
        expect(testFsm.getState()).toBe('ARMED');
      }
    );

    /**
     * Property 10: State transitions emit correct pointer events
     * For any FSM transition:
     * - ARMED → ENGAGED: pointerdown (DOWN)
     * - ENGAGED → ARMED: pointerup (UP)
     * - Any → IDLE (from active): pointercancel (CANCEL)
     * 
     * Feature: gesture-pointer-monolith, Property 10: State transitions emit correct pointer events
     * Validates: Requirements 3.6, 3.9, 3.10, 3.11
     */
    it('ARMED → ENGAGED emits DOWN', () => {
      const testFsm = new GestureFSM({ dwellTime: 10 });
      
      // Get to ARMED
      testFsm.update('Open_Palm', 0.8, 30, defaultPos, 1000);
      testFsm.update('Open_Palm', 0.8, 30, defaultPos, 1100);
      
      // Transition to ENGAGED
      testFsm.update('Pointing_Up', 0.8, 30, defaultPos, 1200);
      const result = testFsm.update('Pointing_Up', 0.8, 30, defaultPos, 1300);
      
      expect(result.action).toBe('DOWN');
    });

    it('ENGAGED → ARMED emits UP', () => {
      const testFsm = new GestureFSM({ dwellTime: 10 });
      
      // Get to ENGAGED
      testFsm.update('Open_Palm', 0.8, 30, defaultPos, 1000);
      testFsm.update('Open_Palm', 0.8, 30, defaultPos, 1100);
      testFsm.update('Pointing_Up', 0.8, 30, defaultPos, 1200);
      testFsm.update('Pointing_Up', 0.8, 30, defaultPos, 1300);
      
      // Transition back to ARMED
      const result = testFsm.update('Open_Palm', 0.8, 30, defaultPos, 1400);
      
      expect(result.action).toBe('UP');
    });

    it('ARMED → IDLE emits CANCEL', () => {
      const testFsm = new GestureFSM({ dwellTime: 10 });
      
      // Get to ARMED
      testFsm.update('Open_Palm', 0.8, 30, defaultPos, 1000);
      testFsm.update('Open_Palm', 0.8, 30, defaultPos, 1100);
      
      // Leave cone (palm angle > 45)
      const result = testFsm.update('Open_Palm', 0.8, 60, defaultPos, 1200);
      
      expect(result.action).toBe('CANCEL');
    });

    it('ENGAGED → IDLE emits CANCEL', () => {
      const testFsm = new GestureFSM({ dwellTime: 10 });
      
      // Get to ENGAGED
      testFsm.update('Open_Palm', 0.8, 30, defaultPos, 1000);
      testFsm.update('Open_Palm', 0.8, 30, defaultPos, 1100);
      testFsm.update('Pointing_Up', 0.8, 30, defaultPos, 1200);
      testFsm.update('Pointing_Up', 0.8, 30, defaultPos, 1300);
      
      // Leave cone
      const result = testFsm.update('Pointing_Up', 0.8, 60, defaultPos, 1400);
      
      expect(result.action).toBe('CANCEL');
    });

    /**
     * Property: Active states emit MOVE
     */
    test.prop([
      fc.integer({ min: 1, max: 10 }),
    ], { numRuns: 100 })(
      'ARMED state emits MOVE on updates',
      (numUpdates) => {
        const testFsm = new GestureFSM({ dwellTime: 10 });
        
        // Get to ARMED
        testFsm.update('Open_Palm', 0.8, 30, defaultPos, 1000);
        testFsm.update('Open_Palm', 0.8, 30, defaultPos, 1100);
        
        // Subsequent updates should emit MOVE
        let timestamp = 1200;
        for (let i = 0; i < numUpdates; i++) {
          const result = testFsm.update('Open_Palm', 0.8, 30, defaultPos, timestamp);
          expect(result.action).toBe('MOVE');
          timestamp += 16;
        }
      }
    );
  });
});
