/**
 * 🎯 POINTER EVENT FACTORY
 * 
 * Creates W3C Pointer Events from FSM actions.
 * 
 * @provenance .kiro/specs/gesture-pointer-monolith/design.md
 * 
 * Property 11: FSM action to pointer event mapping
 * Property 12: Pointer event coordinate scaling
 * Property 13: Pointer event type consistency
 * 
 * Validates: Requirements 4.1-4.4
 */

import type {
  FSMAction,
  FSMEventDetail,
  PointerEventData,
  PointerEventType,
  Point2D,
} from '../../contracts/schemas.js';

/**
 * Map FSM action to pointer event type
 * 
 * Property 11: FSM action to pointer event mapping
 * - MOVE → pointermove
 * - DOWN → pointerdown
 * - UP → pointerup
 * - CANCEL → pointercancel
 */
export function mapActionToEventType(action: FSMAction): PointerEventType | null {
  switch (action) {
    case 'MOVE':
      return 'pointermove';
    case 'DOWN':
      return 'pointerdown';
    case 'UP':
      return 'pointerup';
    case 'CANCEL':
      return 'pointercancel';
    case 'NONE':
      return null;
  }
}

/**
 * Scale normalized position (0-1) to viewport coordinates
 * 
 * Property 12: Pointer event coordinate scaling
 * For any normalized position (0-1), clientX/clientY = position * viewport dimension
 */
export function scaleToViewport(
  position: Point2D,
  viewportWidth: number,
  viewportHeight: number
): { clientX: number; clientY: number } {
  return {
    clientX: position.x * viewportWidth,
    clientY: position.y * viewportHeight,
  };
}

/**
 * Create PointerEventData from FSM event
 * 
 * Property 13: Pointer event type consistency
 * pointerType = "touch", pointerId = 1
 */
export function createPointerEventData(
  fsmEvent: FSMEventDetail,
  viewportWidth: number,
  viewportHeight: number
): PointerEventData | null {
  const eventType = mapActionToEventType(fsmEvent.action);
  if (eventType === null) return null;

  const { clientX, clientY } = scaleToViewport(
    fsmEvent.position,
    viewportWidth,
    viewportHeight
  );

  // Determine button and buttons based on event type
  let button: number;
  let buttons: number;
  let pressure: number;

  switch (eventType) {
    case 'pointerdown':
      button = 0; // Primary button
      buttons = 1; // Primary button pressed
      pressure = 0.5;
      break;
    case 'pointerup':
      button = 0;
      buttons = 0; // No buttons pressed
      pressure = 0;
      break;
    case 'pointermove':
      button = -1; // No button change
      buttons = fsmEvent.state === 'ENGAGED' ? 1 : 0; // Buttons if dragging
      pressure = fsmEvent.state === 'ENGAGED' ? 0.5 : 0;
      break;
    case 'pointercancel':
      button = 0;
      buttons = 0;
      pressure = 0;
      break;
  }

  return {
    type: eventType,
    clientX,
    clientY,
    pointerId: 1,
    pointerType: 'touch',
    button,
    buttons,
    pressure,
    isPrimary: true,
  };
}

/**
 * Create a native PointerEvent from PointerEventData
 * (Browser environment only)
 */
export function toNativePointerEvent(data: PointerEventData): PointerEvent {
  return new PointerEvent(data.type, {
    clientX: data.clientX,
    clientY: data.clientY,
    pointerId: data.pointerId,
    pointerType: data.pointerType,
    button: data.button,
    buttons: data.buttons,
    pressure: data.pressure,
    isPrimary: data.isPrimary,
    bubbles: true,
    cancelable: true,
  });
}

/**
 * PointerEventFactory class for stateful event creation
 */
export class PointerEventFactory {
  private viewportWidth: number;
  private viewportHeight: number;

  constructor(viewportWidth: number = 1920, viewportHeight: number = 1080) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
  }

  /**
   * Create PointerEventData from FSM event
   */
  create(fsmEvent: FSMEventDetail): PointerEventData | null {
    return createPointerEventData(fsmEvent, this.viewportWidth, this.viewportHeight);
  }

  /**
   * Create native PointerEvent from FSM event
   */
  createNative(fsmEvent: FSMEventDetail): PointerEvent | null {
    const data = this.create(fsmEvent);
    if (data === null) return null;
    return toNativePointerEvent(data);
  }

  /**
   * Update viewport dimensions
   */
  setViewport(width: number, height: number): void {
    this.viewportWidth = width;
    this.viewportHeight = height;
  }

  /**
   * Get current viewport dimensions
   */
  getViewport(): { width: number; height: number } {
    return { width: this.viewportWidth, height: this.viewportHeight };
  }
}
