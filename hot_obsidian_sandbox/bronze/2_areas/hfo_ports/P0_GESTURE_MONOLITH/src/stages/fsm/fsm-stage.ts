/**
 * 🎯 FSM STAGE
 * 
 * Combines GestureFSM + palm cone validation.
 * Subscribes to cursor events, dispatches FSM events.
 * 
 * @provenance .kiro/specs/gesture-pointer-monolith/design.md
 * Validates: Requirements 3.1-3.12
 */

import { GestureFSM } from './gesture-fsm.js';
import { calculatePalmAngle } from './palm-cone.js';
import type {
  LandmarkEventDetail,
  CursorEventDetail,
  FSMEventDetail,
  FSMStageConfig,
  GestureName,
} from '../../contracts/schemas.js';
import { FSMStageConfigSchema } from '../../contracts/schemas.js';

export class FSMStage {
  private fsm: GestureFSM;
  private config: FSMStageConfig;
  private eventTarget: EventTarget;
  private lastGesture: GestureName = 'None';
  private lastConfidence: number = 0;
  private lastPalmAngle: number = 90;

  constructor(config: Partial<FSMStageConfig> = {}, eventTarget?: EventTarget) {
    this.config = FSMStageConfigSchema.parse(config);
    this.eventTarget = eventTarget ?? (typeof window !== 'undefined' ? window : new EventTarget());
    this.fsm = new GestureFSM(this.config);
  }

  /**
   * Process landmark event (from Sensor Stage)
   * Updates gesture/confidence/palmAngle for FSM
   */
  processLandmark(detail: LandmarkEventDetail): void {
    this.lastGesture = detail.gesture;
    this.lastConfidence = detail.confidence;
    this.lastPalmAngle = detail.palmAngle;
  }

  /**
   * Process cursor event (from Physics Stage)
   * Runs FSM update and dispatches FSM event
   */
  processCursor(detail: CursorEventDetail): FSMEventDetail {
    const result = this.fsm.update(
      this.lastGesture,
      this.lastConfidence,
      this.lastPalmAngle,
      detail.physics, // Use physics cursor position
      detail.timestamp
    );

    const fsmDetail: FSMEventDetail = {
      state: result.state,
      action: result.action,
      position: result.position,
      timestamp: detail.timestamp,
    };

    this.dispatchFSMEvent(fsmDetail);

    return fsmDetail;
  }

  /**
   * Process no_hand event
   */
  processNoHand(timestamp: number): FSMEventDetail {
    const result = this.fsm.noHand(timestamp);

    const fsmDetail: FSMEventDetail = {
      state: result.state,
      action: result.action,
      position: result.position,
      timestamp,
    };

    this.dispatchFSMEvent(fsmDetail);

    return fsmDetail;
  }

  /**
   * Dispatch FSM CustomEvent
   */
  private dispatchFSMEvent(detail: FSMEventDetail): void {
    const event = new CustomEvent('fsm', { detail });
    this.eventTarget.dispatchEvent(event);
  }

  /**
   * Subscribe to sensor and physics events
   */
  subscribe(sensorSource: EventTarget, physicsSource: EventTarget): void {
    // Listen for landmark events to update gesture info
    sensorSource.addEventListener('landmarks', ((event: CustomEvent<LandmarkEventDetail>) => {
      this.processLandmark(event.detail);
    }) as EventListener);

    sensorSource.addEventListener('no_hand', ((event: CustomEvent<{ timestamp: number }>) => {
      this.processNoHand(event.detail.timestamp);
    }) as EventListener);

    // Listen for cursor events to run FSM
    physicsSource.addEventListener('cursor', ((event: CustomEvent<CursorEventDetail>) => {
      this.processCursor(event.detail);
    }) as EventListener);
  }

  /**
   * Get current FSM state
   */
  getState() {
    return this.fsm.getState();
  }

  /**
   * Reset FSM
   */
  reset(): void {
    this.fsm.reset();
    this.lastGesture = 'None';
    this.lastConfidence = 0;
    this.lastPalmAngle = 90;
  }

  /**
   * Update configuration
   */
  configure(config: Partial<FSMStageConfig>): void {
    this.config = FSMStageConfigSchema.parse({ ...this.config, ...config });
    this.fsm.configure(this.config);
  }

  /**
   * Get event target for subscribing to FSM events
   */
  getEventTarget(): EventTarget {
    return this.eventTarget;
  }
}
