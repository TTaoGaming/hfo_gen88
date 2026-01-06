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
      fsm.update('Open_Palm', 0.8, 10, defaultPos, 1000);
      expect(fsm.getState()).toBe('IDLE'); // Still dwelling
      
      // Complete dwell
      fsm.update('Open_Palm', 0.8, 10, defaultPos, 1200);
      expect(fsm.getState()).toBe('ARMED');
    });

    it('should transition ARMED → ENGAGED with Pointing_Up after dwell', () => {
      // Get to ARMED
      fsm.update('Open_Palm', 0.8, 10, defaultPos, 1000);
      fsm.update('Open_Palm', 0.8, 10, defaultPos, 1200);
      expect(fsm.getState()).toBe('ARMED');
      
      // Start Pointing_Up dwell
      fsm.update('Pointing_Up', 0.8, 10, defaultPos, 1300);
      expect(fsm.getState()).toBe('ARMED'); // Still dwelling
      
      // Complete dwell
      const result = fsm.update('Pointing_Up', 0.8, 10, defaultPos, 1500);
      expect(fsm.getState()).toBe('ENGAGED');
      expect(result.action).toBe('DOWN');
    });

    it('should transition ENGAGED → ARMED with Open_Palm (pointerup)', () => {
      // Get to ENGAGED
      fsm.update('Open_Palm', 0.8, 10, defaultPos, 1000);
      fsm.update('Open_Palm', 0.8, 10, defaultPos, 1200);
      fsm.update('Pointing_Up', 0.8, 10, defaultPos, 1300);
      fsm.update('Pointing_Up', 0.8, 10, defaultPos, 1500);
      expect(fsm.getState()).toBe('ENGAGED');
      
      // Release with Open_Palm
      const result = fsm.update('Open_Palm', 0.8, 10, defaultPos, 1600);
      expect(fsm.getState()).toBe('ARMED');
      expect(result.action).toBe('UP');
    });

    it('should emit CANCEL when palm leaves cone', () => {
      // Get to ARMED
      fsm.update('Open_Palm', 0.8, 10, defaultPos, 1000);
      fsm.update('Open_Palm', 0.8, 10, defaultPos, 1200);
      expect(fsm.getState()).toBe('ARMED');
      
      // Palm leaves cone (angle > 45)
      const result = fsm.update('Open_Palm', 0.8, 60, defaultPos, 1300);
      expect(fsm.getState()).toBe('IDLE');
      expect(result.action).toBe('CANCEL');
    });

    it('should reset to IDLE', () => {
      fsm.update('Open_Palm', 0.8, 10, defaultPos, 1000);
      fsm.update('Open_Palm', 0.8, 10, defaultPos, 1200);
      expect(fsm.getState()).toBe('ARMED');
      
      fsm.reset();
      expect(fsm.getState()).toBe('IDLE');
    });

    it('should track internal dwell states and kill survivors', () => {
      // IDLE -> ARMED_DWELL
      fsm.update('Open_Palm', 0.8, 10, defaultPos, 1000);
      expect(fsm.getInternalState()).toBe('ARMED_DWELL');
      expect(fsm.getState()).toBe('IDLE');
      
      // Still in ARMED_DWELL
      fsm.update('Open_Palm', 0.8, 10, defaultPos, 1050);
      expect(fsm.getInternalState()).toBe('ARMED_DWELL');
      
      // ARMED_DWELL -> ARMED
      fsm.update('Open_Palm', 0.8, 10, defaultPos, 1100);
      expect(fsm.getInternalState()).toBe('ARMED');
      
      // ARMED -> ENGAGED_DWELL
      fsm.update('Pointing_Up', 0.8, 10, defaultPos, 1200);
      expect(fsm.getInternalState()).toBe('ENGAGED_DWELL');
      expect(fsm.getState()).toBe('ARMED');
      
      // ENGAGED_DWELL -> ENGAGED
      fsm.update('Pointing_Up', 0.8, 10, defaultPos, 1300);
      expect(fsm.getInternalState()).toBe('ENGAGED');
    });

    it('should handle gesture cancel during ARMED_DWELL', () => {
      fsm.update('Open_Palm', 0.8, 10, defaultPos, 1000);
      expect(fsm.getInternalState()).toBe('ARMED_DWELL');
      
      // Lose hand during dwell
      fsm.noHand(1050);
      expect(fsm.getInternalState()).toBe('IDLE');
    });

    it('should handle gesture cancel during ENGAGED_DWELL', () => {
      // Get to ARMED
      fsm.update('Open_Palm', 0.8, 10, defaultPos, 1000);
      fsm.update('Open_Palm', 0.8, 10, defaultPos, 1100);
      
      // Start Engaged Dwell
      fsm.update('Pointing_Up', 0.8, 10, defaultPos, 1200);
      expect(fsm.getInternalState()).toBe('ENGAGED_DWELL');
      
      // Gesture changed back to Open_Palm
      fsm.update('Open_Palm', 0.8, 10, defaultPos, 1250);
      expect(fsm.getInternalState()).toBe('ARMED');
    });

    it('should handle timeout in ARMED state', () => {
      // Get to ARMED
      fsm.update('Open_Palm', 0.8, 10, defaultPos, 1000);
      fsm.update('Open_Palm', 0.8, 10, defaultPos, 1100);
      
      // Lose hand
      fsm.noHand(1200);
      expect(fsm.getInternalState()).toBe('ARMED'); // Within timeout
      
      // Wait past timeout (default 2000ms)
      fsm.noHand(3300);
      expect(fsm.getInternalState()).toBe('IDLE');
    });

    it('should kill hysteresis survivors with edge cases', () => {
      fsm.update('Open_Palm', 0.7001, 10, defaultPos, 1000);
      expect(fsm.getInternalState()).toBe('ARMED_DWELL');
      fsm.reset();
      fsm.update('Open_Palm', 0.6999, 10, defaultPos, 1000);
      expect(fsm.getInternalState()).toBe('IDLE');
      
      // ARMED -> IDLE via threshold
      fsm.update('Open_Palm', 0.8, 10, defaultPos, 1100);
      fsm.update('Open_Palm', 0.8, 10, defaultPos, 1200);
      expect(fsm.getInternalState()).toBe('ARMED');
      fsm.update('Open_Palm', 0.4999, 10, defaultPos, 1300);
      expect(fsm.getInternalState()).toBe('IDLE');
    });

    it('should kill cone angle survivors with edge cases', () => {
      fsm.update('Open_Palm', 0.8, 22.4, defaultPos, 1000);
      expect(fsm.getInternalState()).toBe('ARMED_DWELL');
      fsm.reset();
      fsm.update('Open_Palm', 0.8, 22.6, defaultPos, 1000);
      expect(fsm.getInternalState()).toBe('IDLE');
    });

    it('should kill context assignment survivors in all transitions', () => {
      // Transition factors
      const cases = [
        { gesture: 'Open_Palm' as GestureName, conf: 0.9, angle: 10, pos: { x: 0.1, y: 0.2 }, ts: 3000, expected: 'ARMED_DWELL' },
        { gesture: 'Pointing_Up' as GestureName, conf: 0.9, angle: 10, pos: { x: 0.3, y: 0.4 }, ts: 4000, expected: 'IDLE' }, 
      ];

      for (const c of cases) {
        fsm.reset();
        fsm.update(c.gesture, c.conf, c.angle, c.pos, c.ts);
        const ctx = fsm.getContext();
        if (fsm.getInternalState() === c.expected) {
          expect(ctx.gesture).toBe(c.gesture);
          expect(ctx.confidence).toBe(c.conf);
          expect(ctx.palmAngle).toBe(c.angle);
          expect(ctx.position).toEqual(c.pos);
          expect(ctx.lastActiveTime).toBe(c.ts);
        }
      }
    });

    it('should handle hysteresis thresholds correctly', () => {
      // Set distinct thresholds
      fsm.configure({ enterThreshold: 0.8, exitThreshold: 0.4 });
      
      // Below enter but above exit -> stays IDLE
      fsm.update('Open_Palm', 0.6, 10, defaultPos, 1000);
      expect(fsm.getState()).toBe('IDLE');
      
      // Above enter -> ARMED_DWELL
      fsm.update('Open_Palm', 0.8, 10, defaultPos, 1100);
      expect(fsm.getInternalState()).toBe('ARMED_DWELL');
      
      // Transition to ARMED
      fsm.update('Open_Palm', 0.8, 10, defaultPos, 1200);
      expect(fsm.getState()).toBe('ARMED');
      
      // Drop below enter but stay above exit -> stay ARMED
      fsm.update('Open_Palm', 0.5, 10, defaultPos, 1300);
      expect(fsm.getState()).toBe('ARMED');
      
      // Drop below exit -> IDLE
      fsm.update('Open_Palm', 0.3, 10, defaultPos, 1400);
      expect(fsm.getState()).toBe('IDLE');
    });

    it('should kill survivors in complex guards', () => {
      // Test the "Open_Palm in cone" guard in ARMED
      fsm.update('Open_Palm', 0.9, 5, defaultPos, 1000);
      fsm.update('Open_Palm', 0.9, 5, defaultPos, 1100);
      expect(fsm.getInternalState()).toBe('ARMED');
      
      // Case: Open_Palm but out of cone -> IDLE
      fsm.update('Open_Palm', 0.9, 80, defaultPos, 1200);
      expect(fsm.getInternalState()).toBe('IDLE');
    });

    it('should kill survivors in configure and reset', () => {
      fsm.configure({ timeout: 5000 });
      expect((fsm as any).config.timeout).toBe(5000);
      
      fsm.update('Open_Palm', 0.9, 5, defaultPos, 1000);
      fsm.reset();
      expect(fsm.getState()).toBe('IDLE');
    });

    it('should kill the NO_HAND timeout survivor in ENGAGED', () => {
      // Get to ENGAGED
      fsm.update('Open_Palm', 0.9, 5, defaultPos, 1000);
      fsm.update('Open_Palm', 0.9, 5, defaultPos, 1100);
      fsm.update('Pointing_Up', 0.9, 5, defaultPos, 1200);
      fsm.update('Pointing_Up', 0.9, 5, defaultPos, 1300);
      expect(fsm.getInternalState()).toBe('ENGAGED');
      
      // No hand
      fsm.noHand(1400);
      expect(fsm.getInternalState()).toBe('ENGAGED'); // within timeout
      
      // Past timeout
      fsm.noHand(1400 + 2001);
      expect(fsm.getInternalState()).toBe('IDLE');
    });

    it('should kill the LogicalOperator survivors in IDLE -> ARMED gap', () => {
      // Need gesture=Open_Palm AND isInCone AND meetsThreshold
      
      // Case: Wrong gesture
      fsm.update('Pointing_Up', 0.8, 10, defaultPos, 1000);
      expect(fsm.getInternalState()).toBe('IDLE');
      
      // Case: Wrong angle
      fsm.reset();
      fsm.update('Open_Palm', 0.8, 60, defaultPos, 1000);
      expect(fsm.getInternalState()).toBe('IDLE');
      
      // Case: Low confidence
      fsm.reset();
      fsm.update('Open_Palm', 0.4, 10, defaultPos, 1000);
      expect(fsm.getInternalState()).toBe('IDLE');
      
      // Case: Exact threshold (boundary) - kills >= mutants
      fsm.reset();
      fsm.configure({ enterThreshold: 0.7 });
      fsm.update('Open_Palm', 0.7, 5, defaultPos, 1000);
      expect(fsm.getInternalState()).toBe('ARMED_DWELL');
    });

    it('should kill action survivors with exact outputs', () => {
      // DOWN (ARMED -> ENGAGED)
      fsm.update('Open_Palm', 0.9, 5, defaultPos, 1000);
      fsm.update('Open_Palm', 0.9, 5, defaultPos, 1100);
      const d = fsm.update('Pointing_Up', 0.9, 5, defaultPos, 1200);
      const d2 = fsm.update('Pointing_Up', 0.9, 5, defaultPos, 1300);
      expect(d2.action).toBe('DOWN');

      // UP (ENGAGED -> ARMED)
      const u = fsm.update('Open_Palm', 0.9, 5, defaultPos, 1400);
      expect(u.action).toBe('UP');

      // CANCEL (ENGAGED -> IDLE)
      fsm.update('Pointing_Up', 0.9, 5, defaultPos, 1500);
      fsm.update('Pointing_Up', 0.9, 5, defaultPos, 1600); // Re-engage
      const c = fsm.update('Open_Palm', 0.9, 80, defaultPos, 1700); // Leave cone
      expect(c.action).toBe('CANCEL');
    });

    it('should update context even when staying in IDLE', () => {
      // Even in IDLE, it should record lastActiveTime if gesture is valid but other conditions fail
      fsm.update('Open_Palm', 0.9, 80, { x: 0.1, y: 0.1 }, 1000);
      expect(fsm.getContext().lastActiveTime).toBe(1000);
      expect(fsm.getContext().position).toEqual({ x: 0.1, y: 0.1 });
    });

    it('should kill context survivors in ARMED -> ENGAGED transition', () => {
      // Get to ARMED
      fsm.update('Open_Palm', 0.8, 10, defaultPos, 1000);
      fsm.update('Open_Palm', 0.8, 10, defaultPos, 1200);
      
      // Transition to ENGAGED_DWELL
      const p = { x: 0.9, y: 0.1 };
      fsm.update('Pointing_Up', 0.85, 5, p, 1500);
      
      const ctx = fsm.getContext();
      expect(ctx.gesture).toBe('Pointing_Up');
      expect(ctx.confidence).toBe(0.85);
      expect(ctx.palmAngle).toBe(5);
      expect(ctx.position).toEqual(p);
      expect(ctx.lastActiveTime).toBe(1500);
      expect(fsm.getInternalState()).toBe('ENGAGED_DWELL');
      
      // Case: Wrong gesture (should stay in ARMED)
      fsm.update('Open_Palm', 0.85, 5, p, 1600);
      expect(fsm.getInternalState()).toBe('ARMED');
    });

    it('should kill the VALID_GESTURES and isValidGesture survivors', () => {
      // Pass a gesture that is technically allowed by type but not in set
      const result = fsm.update('None' as any, 0.9, 5, defaultPos, 1000);
      expect(fsm.getInternalState()).toBe('IDLE');
      expect(result.action).toBe('NONE');
    });

    it('should kill boundary survivors for isInCone and meetsThreshold', () => {
      fsm.configure({ coneAngle: 40, enterThreshold: 0.8, exitThreshold: 0.4 });
      
      // Boundary isInCone: palmAngle = 20 (exactly half of 40)
      fsm.update('Open_Palm', 0.9, 20.0, defaultPos, 1000);
      expect(fsm.getInternalState()).toBe('ARMED_DWELL');
      
      fsm.reset();
      fsm.update('Open_Palm', 0.9, 20.001, defaultPos, 1000);
      expect(fsm.getInternalState()).toBe('IDLE');
      
      // Boundary meetsThreshold (entering): confidence = 0.8
      fsm.reset();
      fsm.update('Open_Palm', 0.8, 10, defaultPos, 1000);
      expect(fsm.getInternalState()).toBe('ARMED_DWELL');
      
      fsm.update('Open_Palm', 0.8, 10, defaultPos, 1100);
      expect(fsm.getState()).toBe('ARMED');
      
      // Boundary meetsThreshold (exiting): confidence = 0.4
      fsm.update('Open_Palm', 0.4, 10, defaultPos, 1200);
      expect(fsm.getState()).toBe('ARMED');
      
      fsm.update('Open_Palm', 0.399, 10, defaultPos, 1300);
      expect(fsm.getState()).toBe('IDLE');
    });

    it('should kill context assignment survivors with deep equality', () => {
      const pos1 = { x: 0.123, y: 0.456 };
      fsm.update('Open_Palm', 0.85, 12, pos1, 1500);
      
      let ctx = fsm.getContext();
      expect(ctx.gesture).toBe('Open_Palm');
      expect(ctx.confidence).toBe(0.85);
      expect(ctx.palmAngle).toBe(12);
      expect(ctx.position).toEqual(pos1);
      expect(ctx.lastActiveTime).toBe(1500);

      const pos2 = { x: 0.789, y: 0.012 };
      fsm.update('Open_Palm', 0.86, 13, pos2, 1600);
      ctx = fsm.getContext();
      expect(ctx.gesture).toBe('Open_Palm');
      expect(ctx.confidence).toBe(0.86);
      expect(ctx.palmAngle).toBe(13);
      expect(ctx.position).toEqual(pos2);
      expect(ctx.lastActiveTime).toBe(1600);
    });

    it('should kill survivors in ENGAGED state updates', () => {
      // Get to ENGAGED
      fsm.update('Open_Palm', 0.8, 10, defaultPos, 1000);
      fsm.update('Open_Palm', 0.8, 10, defaultPos, 1200);
      fsm.update('Pointing_Up', 0.85, 5, defaultPos, 1300);
      fsm.update('Pointing_Up', 0.85, 5, defaultPos, 1500);
      expect(fsm.getInternalState()).toBe('ENGAGED');
      
      // Move in ENGAGED
      const p2 = { x: 0.2, y: 0.8 };
      fsm.update('Pointing_Up', 0.9, 2, p2, 2000);
      
      const ctx = fsm.getContext();
      expect(ctx.gesture).toBe('Pointing_Up');
      expect(ctx.confidence).toBe(0.9);
      expect(ctx.palmAngle).toBe(2);
      expect(ctx.position).toEqual(p2);
      expect(ctx.lastActiveTime).toBe(2000);
    });

    it('should kill LogicalOperator survivors in cancelling transitions', () => {
      // ARMED -> IDLE via gesture change (neither Open_Palm nor Pointing_Up)
      fsm.update('Open_Palm', 0.8, 10, defaultPos, 1000);
      fsm.update('Open_Palm', 0.8, 10, defaultPos, 1100);
      expect(fsm.getInternalState()).toBe('ARMED');
      
      // Use an unhandled gesture to force IDLE
      fsm.update('Victory' as any, 0.8, 10, defaultPos, 1200);
      expect(fsm.getInternalState()).toBe('IDLE');
      
      // ARMED -> IDLE via angle
      fsm.reset();
      fsm.update('Open_Palm', 0.8, 10, defaultPos, 1000);
      fsm.update('Open_Palm', 0.8, 10, defaultPos, 1100);
      fsm.update('Open_Palm', 0.8, 50, defaultPos, 1200);
      expect(fsm.getInternalState()).toBe('IDLE');
    });

    it('should kill survivors in complex guards', () => {
      // Guard: event.gesture === 'Open_Palm' && isInCone && meetsThreshold
      // Need to fail EXACTLY one part of the AND chain to kill "||" mutants
      
      // Fail gesture
      fsm.reset();
      fsm.update('Pointing_Up', 0.9, 0, defaultPos, 1000);
      expect(fsm.getInternalState()).toBe('IDLE');

      // Fail cone
      fsm.reset();
      fsm.update('Open_Palm', 0.9, 45, defaultPos, 1000);
      expect(fsm.getInternalState()).toBe('IDLE');

      // Fail threshold
      fsm.reset();
      fsm.update('Open_Palm', 0.6, 0, defaultPos, 1000);
      expect(fsm.getInternalState()).toBe('IDLE');
      
      // Pass all
      fsm.update('Open_Palm', 0.8, 10, defaultPos, 1100);
      expect(fsm.getInternalState()).toBe('ARMED_DWELL');
    });

    it('should update context even when staying in IDLE', () => {
      fsm.update('Pointing_Up', 0.1, 10, { x: 0.7, y: 0.8 }, 1000);
      const ctx = fsm.getContext();
      expect(ctx.gesture).toBe('Pointing_Up');
      expect(ctx.confidence).toBe(0.1);
      expect(ctx.palmAngle).toBe(10);
      expect(ctx.position).toEqual({ x: 0.7, y: 0.8 });
    });

    it('should handle hysteresis thresholds correctly', () => {
      // Enter threshold is 0.7
      fsm.update('Open_Palm', 0.65, 10, defaultPos, 1000);
      expect(fsm.getInternalState()).toBe('IDLE');
      
      fsm.update('Open_Palm', 0.7, 10, defaultPos, 1050);
      expect(fsm.getInternalState()).toBe('ARMED_DWELL');
      
      // Exit threshold is 0.5. 0.6 should stay in dwell.
      fsm.update('Open_Palm', 0.6, 10, defaultPos, 1060);
      expect(fsm.getInternalState()).toBe('ARMED_DWELL');
      
      // 0.45 should cancel
      fsm.update('Open_Palm', 0.45, 10, defaultPos, 1070);
      expect(fsm.getInternalState()).toBe('IDLE');
    });

    it('should kill action survivors with exact outputs', () => {
      // Get to ENGAGED
      fsm.update('Open_Palm', 0.8, 10, defaultPos, 1000);
      fsm.update('Open_Palm', 0.8, 10, defaultPos, 1100);
      fsm.update('Pointing_Up', 0.8, 10, defaultPos, 1200);
      const resDown = fsm.update('Pointing_Up', 0.8, 10, { x: 0.1, y: 0.2 }, 1300);
      
      expect(resDown.action).toBe('DOWN');
      expect(resDown.state).toBe('ENGAGED');
      expect(resDown.position).toEqual({ x: 0.1, y: 0.2 });
      
      const resMove = fsm.update('Pointing_Up', 0.8, 10, { x: 0.3, y: 0.4 }, 1350);
      expect(resMove.action).toBe('MOVE');
      
      const resUp = fsm.update('Open_Palm', 0.8, 10, { x: 0.5, y: 0.5 }, 1400);
      expect(resUp.action).toBe('UP');
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
        testFsm.update('Open_Palm', 0.8, 10, defaultPos, 1000);
        testFsm.update('Open_Palm', 0.8, 10, defaultPos, 1000 + actualTimeHeld);
        
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
        testFsm.update('Open_Palm', 0.8, 10, defaultPos, 1000);
        testFsm.update('Open_Palm', 0.8, 10, defaultPos, 1100);
        expect(testFsm.getState()).toBe('ARMED');
        
        // Update with confidence in hysteresis band
        testFsm.update('Open_Palm', confidence, 10, defaultPos, 1200);
        
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
      testFsm.update('Open_Palm', 0.8, 10, defaultPos, 1000);
      testFsm.update('Open_Palm', 0.8, 10, defaultPos, 1100);
      
      // Transition to ENGAGED
      testFsm.update('Pointing_Up', 0.8, 10, defaultPos, 1200);
      const result = testFsm.update('Pointing_Up', 0.8, 10, defaultPos, 1300);
      
      expect(result.action).toBe('DOWN');
    });

    it('ENGAGED → ARMED emits UP', () => {
      const testFsm = new GestureFSM({ dwellTime: 10 });
      
      // Get to ENGAGED
      testFsm.update('Open_Palm', 0.8, 10, defaultPos, 1000);
      testFsm.update('Open_Palm', 0.8, 10, defaultPos, 1100);
      testFsm.update('Pointing_Up', 0.8, 10, defaultPos, 1200);
      testFsm.update('Pointing_Up', 0.8, 10, defaultPos, 1300);
      
      // Transition back to ARMED
      const result = testFsm.update('Open_Palm', 0.8, 10, defaultPos, 1400);
      
      expect(result.action).toBe('UP');
    });

    it('ARMED → IDLE emits CANCEL', () => {
      const testFsm = new GestureFSM({ dwellTime: 10 });
      
      // Get to ARMED
      testFsm.update('Open_Palm', 0.8, 10, defaultPos, 1000);
      testFsm.update('Open_Palm', 0.8, 10, defaultPos, 1100);
      
      // Leave cone (palm angle > 45)
      const result = testFsm.update('Open_Palm', 0.8, 60, defaultPos, 1200);
      
      expect(result.action).toBe('CANCEL');
    });

    it('ENGAGED → IDLE emits CANCEL', () => {
      const testFsm = new GestureFSM({ dwellTime: 10 });
      
      // Get to ENGAGED
      testFsm.update('Open_Palm', 0.8, 10, defaultPos, 1000);
      testFsm.update('Open_Palm', 0.8, 10, defaultPos, 1100);
      testFsm.update('Pointing_Up', 0.8, 10, defaultPos, 1200);
      testFsm.update('Pointing_Up', 0.8, 10, defaultPos, 1300);
      
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
        testFsm.update('Open_Palm', 0.8, 10, defaultPos, 1000);
        testFsm.update('Open_Palm', 0.8, 10, defaultPos, 1100);
        
        // Subsequent updates should emit MOVE
        let timestamp = 1200;
        for (let i = 0; i < numUpdates; i++) {
          const result = testFsm.update('Open_Palm', 0.8, 10, defaultPos, timestamp);
          expect(result.action).toBe('MOVE');
          timestamp += 16;
        }
      }
    );
  });
});
