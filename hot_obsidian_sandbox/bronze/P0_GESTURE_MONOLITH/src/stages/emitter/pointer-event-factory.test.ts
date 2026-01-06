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
import type { FSMAction, FSMEventDetail, FSMState, Point2D } from '../../contracts/schemas.js';

// Polyfill PointerEvent for Node environment
if (typeof (global as any).PointerEvent === 'undefined') {
  (global as any).PointerEvent = class {
    constructor(public type: string, public init: any = {}) {
      Object.assign(this, init);
    }
  };
}

describe('PointerEventFactory', () => {
  const defaultPos: Point2D = { x: 0.5, y: 0.5 };

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

    it('should create valid PointerEventData for pointerdown', () => {
      const fsmEvent: FSMEventDetail = {
        state: 'ENGAGED',
        action: 'DOWN',
        position: { x: 0.4, y: 0.6 },
        timestamp: 1000,
      };

      const data = createPointerEventData(fsmEvent, 1000, 1000);
      expect(data!.type).toBe('pointerdown');
      expect(data!.button).toBe(0);
      expect(data!.buttons).toBe(1);
      expect(data!.pressure).toBeGreaterThan(0);
      expect(data!.clientX).toBe(400);
      expect(data!.clientY).toBe(600);
    });

    it('should create valid PointerEventData for pointerup', () => {
      const fsmEvent: FSMEventDetail = {
        state: 'ARMED',
        action: 'UP',
        position: { x: 0.5, y: 0.5 },
        timestamp: 1000,
      };

      const data = createPointerEventData(fsmEvent, 1920, 1080);
      expect(data!.type).toBe('pointerup');
      expect(data!.button).toBe(0);
      expect(data!.buttons).toBe(0);
      expect(data!.pressure).toBe(0);
    });

    it('should create valid PointerEventData for pointercancel', () => {
      const fsmEvent: FSMEventDetail = {
        state: 'IDLE',
        action: 'CANCEL',
        position: { x: 0.5, y: 0.5 },
        timestamp: 1000,
      };

      const data = createPointerEventData(fsmEvent, 1920, 1080);
      expect(data!.type).toBe('pointercancel');
      expect(data!.button).toBe(-1);
    });

    it('should kill the scaling arithmetic mutants', () => {
      // Use non-round numbers and non-square aspect ratio
      const v1 = scaleToViewport({ x: 0.123, y: 0.456 }, 1000, 2000);
      expect(v1.clientX).toBeCloseTo(123, 5);
      expect(v1.clientY).toBeCloseTo(912, 5);
      
      const v2 = scaleToViewport({ x: 0.5, y: 0.25 }, 1920, 1080);
      expect(v2.clientX).toBe(960);
      expect(v2.clientY).toBe(270);
    });

    it('should kill pointermove button/pressure survivors', () => {
      // Case 1: pointermove in ARMED (buttons=0, pressure=0)
      const armedEvent: FSMEventDetail = {
        state: 'ARMED',
        action: 'MOVE',
        position: defaultPos,
        timestamp: 1000,
      };
      const d1 = createPointerEventData(armedEvent, 1000, 1000);
      expect(d1!.buttons).toBe(0);
      expect(d1!.pressure).toBe(0);

      // Case 2: pointermove in ENGAGED (buttons=1, pressure=0.5)
      const engagedEvent: FSMEventDetail = {
        state: 'ENGAGED',
        action: 'MOVE',
        position: defaultPos,
        timestamp: 1000,
      };
      const d2 = createPointerEventData(engagedEvent, 1000, 1000);
      expect(d2!.buttons).toBe(1);
      expect(d2!.pressure).toBe(0.5);
    });

    it('should kill the button/buttons survivors for pointerdown/up/cancel', () => {
      const p = { x: 0, y: 0 };
      
      // Down
      const d = createPointerEventData({ state: 'ENGAGED', action: 'DOWN', position: p, timestamp: 0 }, 1, 1);
      expect(d!.button).toBe(0);
      expect(d!.buttons).toBe(1);
      expect(d!.pressure).toBe(0.5);

      // Up
      const u = createPointerEventData({ state: 'ARMED', action: 'UP', position: p, timestamp: 0 }, 1, 1);
      expect(u!.button).toBe(0);
      expect(u!.buttons).toBe(0);
      expect(u!.pressure).toBe(0);

      // Cancel
      const c = createPointerEventData({ state: 'IDLE', action: 'CANCEL', position: p, timestamp: 0 }, 1, 1);
      expect(c!.button).toBe(-1);
      expect(c!.buttons).toBe(0);
      expect(c!.pressure).toBe(0);
    });

    it('should kill createNative and native event survivors', () => {
      const factory = new PointerEventFactory();
      const event: FSMEventDetail = {
        state: 'ARMED',
        action: 'MOVE',
        position: { x: 0.5, y: 0.5 },
        timestamp: 1000,
      };
      
      const native = factory.createNative(event);
      expect(native).not.toBeNull();
      expect(native!.type).toBe('pointermove');
      expect(native!.bubbles).toBe(true);
      expect(native!.cancelable).toBe(true);
      
      // Test null case for action=NONE
      const noneEvent: FSMEventDetail = { ...event, action: 'NONE' };
      expect(factory.createNative(noneEvent)).toBeNull();
    });

    it('should create correct PointerEventData for pointermove in IDLE', () => {
      const fsmEvent: FSMEventDetail = {
        state: 'IDLE',
        action: 'MOVE',
        position: { x: 0.5, y: 0.5 },
        timestamp: 1000,
      };
      const data = createPointerEventData(fsmEvent, 1000, 1000);
      expect(data!.buttons).toBe(0); // Not dragging
      expect(data!.pressure).toBe(0);
      expect(data!.button).toBe(-1);
    });

    it('should create correct PointerEventData for pointermove in ENGAGED', () => {
      const fsmEvent: FSMEventDetail = {
        state: 'ENGAGED',
        action: 'MOVE',
        position: { x: 0.5, y: 0.5 },
        timestamp: 1000,
      };
      const data = createPointerEventData(fsmEvent, 1000, 1000);
      expect(data!.buttons).toBe(1); // Dragging
      expect(data!.pressure).toBe(0.5);
      expect(data!.button).toBe(-1);
    });

    it('should handle all button values exactly', () => {
      const down = createPointerEventData({ state: 'ARMED', action: 'DOWN', position: defaultPos, timestamp: 0 }, 1, 1);
      expect(down!.button).toBe(0);
      expect(down!.buttons).toBe(1);

      const up = createPointerEventData({ state: 'ARMED', action: 'UP', position: defaultPos, timestamp: 0 }, 1, 1);
      expect(up!.button).toBe(0);
      expect(up!.buttons).toBe(0);

      const cancel = createPointerEventData({ state: 'IDLE', action: 'CANCEL', position: defaultPos, timestamp: 0 }, 1, 1);
      expect(cancel!.button).toBe(-1);
      expect(cancel!.buttons).toBe(0);
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
