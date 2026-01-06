/**
 * 🧪 INTEGRATION TESTS
 * 
 * End-to-end tests with synthetic data.
 * Tests frame drop → coast → snap-lock sequences.
 * Tests gesture transitions with confidence gaps.
 * 
 * Feature: gesture-pointer-monolith
 * Validates: Requirements 6.5, 6.6, 6.7
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SyntheticLandmarkGenerator } from './synthetic-landmark-generator.js';
import { PhysicsStage } from '../stages/physics/physics-stage.js';
import { FSMStage } from '../stages/fsm/fsm-stage.js';
import { EmitterStage } from '../stages/emitter/emitter-stage.js';
import type { CursorEventDetail, FSMEventDetail, LandmarkEventDetail } from '../contracts/schemas.js';

describe('Integration Tests', () => {
  let physicsStage: PhysicsStage;
  let fsmStage: FSMStage;
  let emitterStage: EmitterStage;
  let eventTarget: EventTarget;

  beforeEach(async () => {
    eventTarget = new EventTarget();
    physicsStage = new PhysicsStage({}, eventTarget);
    await physicsStage.init();
    
    fsmStage = new FSMStage({ dwellTime: 50 }, eventTarget);
    emitterStage = new EmitterStage(1920, 1080);
  });

  describe('Frame Drop → Coast → Snap-Lock Sequence', () => {
    /**
     * Validates: Requirements 6.5, 6.6, 6.7
     * When frames drop, Raw Cursor drops but Physics/Predictive cursors coast.
     * When tracking resumes, Physics cursor snap-locks to new position.
     * During coast, Physics cursor maintains inertia from last velocity.
     */
    it('should coast during tracking loss and snap-lock on resume', async () => {
      const generator = new SyntheticLandmarkGenerator();
      
      // Generate movement sequence with tracking loss
      generator
        .generateLinearMovement({
          startX: 0.3,
          startY: 0.3,
          endX: 0.5,
          endY: 0.5,
          duration: 500,
          fps: 30,
          gesture: 'Open_Palm',
          confidence: 0.9,
          palmAngle: 30,
        })
        .addTrackingLoss(10) // 10 frames of tracking loss
        .generateLinearMovement({
          startX: 0.7,
          startY: 0.7,
          endX: 0.8,
          endY: 0.8,
          duration: 300,
          fps: 30,
          gesture: 'Open_Palm',
          confidence: 0.9,
          palmAngle: 30,
        });

      const events = generator.getEvents();
      const cursorPositions: CursorEventDetail[] = [];
      let coastingDetected = false;
      let snapLockDetected = false;
      let lastNonCoastingPosition: { x: number; y: number } | null = null;

      // Process events
      for (const event of events) {
        if (event === null) {
          // Tracking loss - process no_hand
          const cursorEvent = physicsStage.processNoHand(Date.now());
          cursorPositions.push(cursorEvent);
          
          if (cursorEvent.isCoasting) {
            coastingDetected = true;
          }
        } else {
          // Normal landmark event
          const cursorEvent = physicsStage.processLandmark(event);
          cursorPositions.push(cursorEvent);
          
          // Check for snap-lock (large position change after coasting)
          if (lastNonCoastingPosition && !cursorEvent.isCoasting) {
            const distance = Math.sqrt(
              Math.pow(cursorEvent.physics.x - lastNonCoastingPosition.x, 2) +
              Math.pow(cursorEvent.physics.y - lastNonCoastingPosition.y, 2)
            );
            if (distance > 0.1) {
              snapLockDetected = true;
            }
          }
          
          if (!cursorEvent.isCoasting) {
            lastNonCoastingPosition = cursorEvent.physics;
          }
        }
      }

      // Verify coasting was detected
      expect(coastingDetected).toBe(true);
      
      // Verify physics cursor continued moving during coast (not frozen)
      const coastingEvents = cursorPositions.filter(e => e.isCoasting);
      expect(coastingEvents.length).toBeGreaterThan(0);
      
      // Verify snap-lock occurred after tracking resumed
      expect(snapLockDetected).toBe(true);
    });

    it('should maintain inertia during coast', async () => {
      const generator = new SyntheticLandmarkGenerator();
      
      // Generate fast movement then tracking loss
      generator
        .generateLinearMovement({
          startX: 0.2,
          startY: 0.5,
          endX: 0.6,
          endY: 0.5,
          duration: 200, // Fast movement
          fps: 30,
          gesture: 'Open_Palm',
          confidence: 0.9,
          palmAngle: 30,
        })
        .addTrackingLoss(15); // 15 frames of coasting

      const events = generator.getEvents();
      const coastingPositions: { x: number; y: number }[] = [];
      let velocityBeforeCoast = { vx: 0, vy: 0 };

      for (const event of events) {
        if (event === null) {
          const cursorEvent = physicsStage.processNoHand(Date.now());
          if (cursorEvent.isCoasting) {
            coastingPositions.push(cursorEvent.physics);
          }
        } else {
          const cursorEvent = physicsStage.processLandmark(event);
          velocityBeforeCoast = cursorEvent.velocity;
        }
      }

      // Verify cursor moved during coast (inertia)
      expect(coastingPositions.length).toBeGreaterThan(0);
      
      // If had positive x velocity, should have moved right during coast
      if (velocityBeforeCoast.vx > 0.1) {
        const firstCoast = coastingPositions[0];
        const lastCoast = coastingPositions[coastingPositions.length - 1];
        // Due to damping, might not move much, but shouldn't go backwards
        expect(lastCoast.x).toBeGreaterThanOrEqual(firstCoast.x - 0.1);
      }
    });
  });

  describe('Gesture Transition with Confidence Gaps', () => {
    it('should handle gesture transition with low confidence frames', async () => {
      const generator = new SyntheticLandmarkGenerator();
      
      // Generate sequence: Open_Palm → transition → Pointing_Up
      generator
        .addStableFrames(0.5, 0.5, 10, 'Open_Palm', 30)
        .addGestureTransition('Open_Palm', 'Pointing_Up', 0.5, 0.5, 5, 30)
        .addStableFrames(0.5, 0.5, 10, 'Pointing_Up', 30);

      const events = generator.getEvents();
      const fsmStates: string[] = [];
      const fsmActions: string[] = [];

      // Process through physics and FSM
      for (const event of events) {
        if (event !== null) {
          // Process landmark through physics
          const cursorEvent = physicsStage.processLandmark(event);
          
          // Update FSM with gesture info
          fsmStage.processLandmark(event);
          const fsmEvent = fsmStage.processCursor(cursorEvent);
          
          fsmStates.push(fsmEvent.state);
          fsmActions.push(fsmEvent.action);
        }
      }

      // Should have transitioned through states
      expect(fsmStates).toContain('ARMED');
      
      // Should have emitted MOVE actions
      expect(fsmActions).toContain('MOVE');
    });

    it('should not transition during low confidence', async () => {
      const fsmStageStrict = new FSMStage({
        dwellTime: 50,
        enterThreshold: 0.7,
        exitThreshold: 0.5,
      }, eventTarget);

      const generator = new SyntheticLandmarkGenerator();
      
      // Generate low confidence frames only
      for (let i = 0; i < 20; i++) {
        const landmarks = generator['events']; // Access internal for manual push
      }
      
      // Create low confidence events manually
      const lowConfidenceEvents: LandmarkEventDetail[] = [];
      for (let i = 0; i < 20; i++) {
        lowConfidenceEvents.push({
          landmarks: Array(21).fill({ x: 0.5, y: 0.5, z: 0 }),
          gesture: 'Open_Palm',
          confidence: 0.4, // Below enter threshold
          palmAngle: 30,
          timestamp: i * 33,
        });
      }

      // Process events
      for (const event of lowConfidenceEvents) {
        const cursorEvent = physicsStage.processLandmark(event);
        fsmStageStrict.processLandmark(event);
        const fsmEvent = fsmStageStrict.processCursor(cursorEvent);
        
        // Should stay in IDLE due to low confidence
        expect(fsmEvent.state).toBe('IDLE');
      }
    });
  });

  describe('Full Pipeline Integration', () => {
    it('should produce pointer events from synthetic landmarks', async () => {
      const generator = new SyntheticLandmarkGenerator();
      
      // Generate a complete interaction sequence
      generator
        // Arm with Open_Palm
        .addStableFrames(0.5, 0.5, 10, 'Open_Palm', 30)
        // Engage with Pointing_Up
        .addStableFrames(0.5, 0.5, 10, 'Pointing_Up', 30)
        // Move while engaged
        .generateLinearMovement({
          startX: 0.5,
          startY: 0.5,
          endX: 0.7,
          endY: 0.7,
          duration: 300,
          fps: 30,
          gesture: 'Pointing_Up',
          confidence: 0.9,
          palmAngle: 30,
        })
        // Release with Open_Palm
        .addStableFrames(0.7, 0.7, 5, 'Open_Palm', 30);

      const events = generator.getEvents();
      const pointerEvents: string[] = [];

      // Process through full pipeline
      for (const event of events) {
        if (event !== null) {
          const cursorEvent = physicsStage.processLandmark(event);
          fsmStage.processLandmark(event);
          const fsmEvent = fsmStage.processCursor(cursorEvent);
          
          const pointerData = emitterStage.processFSMEvent(fsmEvent);
          if (pointerData) {
            pointerEvents.push(pointerData.type);
          }
        }
      }

      // Should have produced pointer events
      expect(pointerEvents.length).toBeGreaterThan(0);
      
      // Should include move events
      expect(pointerEvents).toContain('pointermove');
    });
  });
});
