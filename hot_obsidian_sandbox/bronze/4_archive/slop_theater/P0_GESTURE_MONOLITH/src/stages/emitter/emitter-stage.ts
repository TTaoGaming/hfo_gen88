/**
 * 🎯 EMITTER STAGE
 * 
 * Subscribes to FSM events, dispatches native PointerEvents to DOM.
 * 
 * @provenance .kiro/specs/gesture-pointer-monolith/design.md
 * Validates: Requirements 4.1-4.4
 */

import { PointerEventFactory, toNativePointerEvent } from './pointer-event-factory.js';
import type { FSMEventDetail, PointerEventData } from '../../contracts/schemas.js';

export class EmitterStage {
  private factory: PointerEventFactory;
  private target: Element | null = null;
  private eventLog: PointerEventData[] = [];
  private maxLogSize: number = 100;

  constructor(viewportWidth: number = 1920, viewportHeight: number = 1080) {
    this.factory = new PointerEventFactory(viewportWidth, viewportHeight);
  }

  /**
   * Set the DOM element to dispatch events to
   */
  setTarget(element: Element): void {
    this.target = element;
  }

  /**
   * Process FSM event and dispatch pointer event
   */
  processFSMEvent(detail: FSMEventDetail): PointerEventData | null {
    const data = this.factory.create(detail);
    if (data === null) return null;

    // Log event
    this.eventLog.push(data);
    if (this.eventLog.length > this.maxLogSize) {
      this.eventLog.shift();
    }

    // Dispatch to DOM if target is set
    if (this.target !== null) {
      const nativeEvent = toNativePointerEvent(data);
      this.target.dispatchEvent(nativeEvent);
    }

    return data;
  }

  /**
   * Subscribe to FSM events
   */
  subscribe(fsmSource: EventTarget): void {
    fsmSource.addEventListener('fsm', ((event: CustomEvent<FSMEventDetail>) => {
      this.processFSMEvent(event.detail);
    }) as EventListener);
  }

  /**
   * Update viewport dimensions
   */
  setViewport(width: number, height: number): void {
    this.factory.setViewport(width, height);
  }

  /**
   * Get event log
   */
  getEventLog(): PointerEventData[] {
    return [...this.eventLog];
  }

  /**
   * Clear event log
   */
  clearEventLog(): void {
    this.eventLog = [];
  }

  /**
   * Get factory for direct access
   */
  getFactory(): PointerEventFactory {
    return this.factory;
  }
}
