/**
 * 🧪 POINTER EVENT FACTORY TESTS
 * 
 * Property-based tests for PointerEventFactory correctness.
 * 
 * Feature: gesture-pointer-monolith
 * Property 11: FSM action to pointer event mapping
 * Property 12: Pointer event coordinate scaling
 * Property 13: Pointer event type consistency
 * 
 * Validates: Requirements 4.1, 4.2, 4.3, 4.4
 */

import { describe, it, expect } from 'vitest';
import { test, fc } from '@fast-check/vitest';
import {
  mapActionToEventType,
  scaleToViewport,
  createPointerEventData,
  PointerEventFactory,
} from './pointer-event-factory.js';
import type { FSMAction, FSMEventDetail, FSMState } from '../../contracts/schemas.js';

describe('PointerEventFactory', () => {
  describe('Unit Tests', () => {
    it('should map MOVE to pointermove', () => {
      expect(mapActionToEventType('MOVE')).toBe('pointermove');
    });

    it('should map DOWN to pointerdown', () => {
      expect(mapActionToEventType('DOWN')).toBe('pointerdown');
    });

    it('should map UP to pointerup', () => {
      expect(mapActionToEventType('UP')).toBe('pointerup');
    });

    it('should map CANCEL to pointercancel', () => {
      expect(mapActionToEventType('CANCEL')).toBe('pointercancel');
    });

    it('should map NONE to null', () => {
      expect(mapActionToEventType('NONE')).toBe(null);
    });

    it('should scale coordinates correctly', () => {
      const result = scaleToViewport({ x: 0.5, y: 0.5 }, 1920, 1080);
      expect(result.clientX).toBe(960);
      expect(result.clientY).toBe(540);
    });

    it('should create valid PointerEventData', () => {
      const fsmEvent: FSMEventDetail = {
        state: 'ARMED',
        action: 'MOVE',
        position: { x: 0.5, y: 0.5 },
        timestamp: 1000,
      };

      const data = createPointerEventData(fsmEvent, 1920, 1080);
      
      expect(data).not.toBeNull();
      expect(data!.type).toBe('pointermove');
      expect(data!.clientX).toBe(960);
      expect(data!.clientY).toBe(540);
      expect(data!.pointerId).toBe(1);
      expect(data!.pointerType).toBe('touch');
      expect(data!.isPrimary).toBe(true);
    });

    it('should return null for NONE action', () => {
      const fsmEvent: FSMEventDetail = {
        state: 'IDLE',
        action: 'NONE',
        position: { x: 0.5, y: 0.5 },
        timestamp: 1000,
      };

      const data = createPointerEventData(fsmEvent, 1920, 1080);
      expect(data).toBeNull();
    });
  });

  describe('Property Tests', () => {
    /**
     * Property 11: FSM action to pointer event mapping
     * For any FSM action, the Emitter SHALL produce the corresponding pointer event type.
     * 
     * Feature: gesture-pointer-monolith, Property 11: FSM action to pointer event mapping
     * Validates: Requirements 4.1, 4.2, 4.3
     */
    test.prop([
      fc.constantFrom<FSMAction>('MOVE', 'DOWN', 'UP', 'CANCEL'),
    ], { numRuns: 100 })(
      'action maps to correct event type',
      (action) => {
        const eventType = mapActionToEventType(action);
        
        switch (action) {
          case 'MOVE':
            expect(eventType).toBe('pointermove');
            break;
          case 'DOWN':
            expect(eventType).toBe('pointerdown');
            break;
          case 'UP':
            expect(eventType).toBe('pointerup');
            break;
          case 'CANCEL':
            expect(eventType).toBe('pointercancel');
            break;
        }
      }
    );

    /**
     * Property 12: Pointer event coordinate scaling
     * For any normalized position (0-1), clientX/clientY = position * viewport dimension.
     * 
     * Feature: gesture-pointer-monolith, Property 12: Pointer event coordinate scaling
     * Validates: Requirements 4.1, 4.2, 4.3
     */
    test.prop([
      fc.double({ min: 0, max: 1, noNaN: true }),
      fc.double({ min: 0, max: 1, noNaN: true }),
      fc.integer({ min: 100, max: 4000 }), // viewport width
      fc.integer({ min: 100, max: 4000 }), // viewport height
    ], { numRuns: 100 })(
      'coordinates scale correctly to viewport',
      (x, y, width, height) => {
        const result = scaleToViewport({ x, y }, width, height);
        
        expect(result.clientX).toBeCloseTo(x * width, 5);
        expect(result.clientY).toBeCloseTo(y * height, 5);
      }
    );

    /**
     * Property 13: Pointer event type consistency
     * For any emitted pointer event, pointerType = "touch" and pointerId = 1.
     * 
     * Feature: gesture-pointer-monolith, Property 13: Pointer event type consistency
     * Validates: Requirements 4.4
     */
    test.prop([
      fc.constantFrom<FSMAction>('MOVE', 'DOWN', 'UP', 'CANCEL'),
      fc.constantFrom<FSMState>('IDLE', 'ARMED', 'ENGAGED'),
      fc.double({ min: 0, max: 1, noNaN: true }),
      fc.double({ min: 0, max: 1, noNaN: true }),
    ], { numRuns: 100 })(
      'pointer events have consistent type and id',
      (action, state, x, y) => {
        const fsmEvent: FSMEventDetail = {
          state,
          action,
          position: { x, y },
          timestamp: Date.now(),
        };

        const data = createPointerEventData(fsmEvent, 1920, 1080);
        
        if (data !== null) {
          expect(data.pointerType).toBe('touch');
          expect(data.pointerId).toBe(1);
          expect(data.isPrimary).toBe(true);
        }
      }
    );

    /**
     * Property: Button state is correct for event type
     */
    test.prop([
      fc.constantFrom<FSMAction>('DOWN', 'UP', 'MOVE', 'CANCEL'),
    ], { numRuns: 100 })(
      'button state matches event type',
      (action) => {
        const fsmEvent: FSMEventDetail = {
          state: action === 'DOWN' ? 'ENGAGED' : 'ARMED',
          action,
          position: { x: 0.5, y: 0.5 },
          timestamp: Date.now(),
        };

        const data = createPointerEventData(fsmEvent, 1920, 1080);
        
        if (data !== null) {
          if (action === 'DOWN') {
            expect(data.button).toBe(0);
            expect(data.buttons).toBe(1);
          } else if (action === 'UP' || action === 'CANCEL') {
            expect(data.buttons).toBe(0);
          }
        }
      }
    );
  });

  describe('PointerEventFactory Class', () => {
    it('should create events with configured viewport', () => {
      const factory = new PointerEventFactory(800, 600);
      
      const fsmEvent: FSMEventDetail = {
        state: 'ARMED',
        action: 'MOVE',
        position: { x: 0.5, y: 0.5 },
        timestamp: 1000,
      };

      const data = factory.create(fsmEvent);
      
      expect(data!.clientX).toBe(400);
      expect(data!.clientY).toBe(300);
    });

    it('should update viewport', () => {
      const factory = new PointerEventFactory(800, 600);
      factory.setViewport(1920, 1080);
      
      const viewport = factory.getViewport();
      expect(viewport.width).toBe(1920);
      expect(viewport.height).toBe(1080);
    });
  });
});
