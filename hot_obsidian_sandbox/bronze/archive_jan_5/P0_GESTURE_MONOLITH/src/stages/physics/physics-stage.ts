/**
 * 🎯 PHYSICS STAGE
 * 
 * Combines OneEuroFilter + PhysicsCursor for smooth cursor tracking.
 * Dispatches CustomEvents with raw/physics/predictive positions.
 * 
 * @provenance .kiro/specs/gesture-pointer-monolith/design.md
 * Validates: Requirements 2.1-2.9
 */

import { OneEuroFilter } from './one-euro-filter.js';
import { PhysicsCursor } from './physics-cursor.js';
import type {
  Point2D,
  LandmarkEventDetail,
  CursorEventDetail,
  PhysicsStageConfig,
} from '../../contracts/schemas.js';
import { LANDMARK, PhysicsStageConfigSchema } from '../../contracts/schemas.js';

export class PhysicsStage {
  private oneEuro: OneEuroFilter;
  private cursor: PhysicsCursor;
  private config: PhysicsStageConfig;
  private eventTarget: EventTarget;
  private lastRawPosition: Point2D = { x: 0.5, y: 0.5 };
  private initialized = false;
  private stepInterval: number | null = null;

  constructor(config: Partial<PhysicsStageConfig> = {}, eventTarget?: EventTarget) {
    this.config = PhysicsStageConfigSchema.parse(config);
    this.eventTarget = eventTarget ?? (typeof window !== 'undefined' ? window : new EventTarget());
    
    this.oneEuro = new OneEuroFilter({
      minCutoff: this.config.minCutoff,
      beta: this.config.beta,
    });
    
    this.cursor = new PhysicsCursor({
      stiffness: this.config.stiffness,
      damping: this.config.damping,
      snapLockThreshold: this.config.snapLockThreshold,
    });
  }

  /**
   * Initialize physics engine
   */
  async init(): Promise<void> {
    await this.cursor.init();
    this.initialized = true;
  }

  /**
   * Process landmark event from Sensor Stage
   */
  processLandmark(detail: LandmarkEventDetail): CursorEventDetail {
    if (!this.initialized) {
      throw new Error('PhysicsStage not initialized. Call init() first.');
    }

    // Extract index fingertip (landmark 8)
    const indexTip = detail.landmarks[LANDMARK.INDEX_TIP];
    this.lastRawPosition = { x: indexTip.x, y: indexTip.y };

    // Apply OneEuro filter
    const filtered = this.oneEuro.filter(indexTip.x, indexTip.y, detail.timestamp);

    // Update physics cursor target
    this.cursor.setTarget(filtered.position.x, filtered.position.y);

    // Step physics
    const dt = 1 / this.config.fps;
    const state = this.cursor.step(dt);

    // Calculate predictive position
    const predictive = this.cursor.getPredictivePosition(0.05);

    const cursorDetail: CursorEventDetail = {
      raw: this.lastRawPosition,
      physics: state.position,
      predictive,
      velocity: state.velocity,
      isCoasting: state.isCoasting,
      timestamp: detail.timestamp,
    };

    // Dispatch cursor event
    this.dispatchCursorEvent(cursorDetail);

    return cursorDetail;
  }

  /**
   * Process no_hand event - start coasting
   */
  processNoHand(timestamp: number): CursorEventDetail {
    if (!this.initialized) {
      throw new Error('PhysicsStage not initialized. Call init() first.');
    }

    // Start coasting (cursor continues on inertia)
    this.cursor.startCoasting(timestamp);

    // Step physics (coasting)
    const dt = 1 / this.config.fps;
    const state = this.cursor.step(dt);

    const predictive = this.cursor.getPredictivePosition(0.05);

    const cursorDetail: CursorEventDetail = {
      raw: this.lastRawPosition, // Keep last known raw position
      physics: state.position,
      predictive,
      velocity: state.velocity,
      isCoasting: true,
      timestamp,
    };

    this.dispatchCursorEvent(cursorDetail);

    return cursorDetail;
  }

  /**
   * Dispatch cursor CustomEvent
   */
  private dispatchCursorEvent(detail: CursorEventDetail): void {
    const event = new CustomEvent('cursor', { detail });
    this.eventTarget.dispatchEvent(event);
  }

  /**
   * Subscribe to landmark events
   */
  subscribeLandmarks(source: EventTarget): void {
    source.addEventListener('landmarks', ((event: CustomEvent<LandmarkEventDetail>) => {
      this.processLandmark(event.detail);
    }) as EventListener);

    source.addEventListener('no_hand', ((event: CustomEvent<{ timestamp: number }>) => {
      this.processNoHand(event.detail.timestamp);
    }) as EventListener);
  }

  /**
   * Start automatic physics stepping at configured FPS
   */
  startStepping(): void {
    if (this.stepInterval !== null) return;
    
    const intervalMs = 1000 / this.config.fps;
    this.stepInterval = setInterval(() => {
      if (this.cursor.getIsCoasting()) {
        const state = this.cursor.step(1 / this.config.fps);
        const predictive = this.cursor.getPredictivePosition(0.05);
        
        this.dispatchCursorEvent({
          raw: this.lastRawPosition,
          physics: state.position,
          predictive,
          velocity: state.velocity,
          isCoasting: true,
          timestamp: Date.now(),
        });
      }
    }, intervalMs) as unknown as number;
  }

  /**
   * Stop automatic physics stepping
   */
  stopStepping(): void {
    if (this.stepInterval !== null) {
      clearInterval(this.stepInterval);
      this.stepInterval = null;
    }
  }

  /**
   * Update configuration
   */
  configure(config: Partial<PhysicsStageConfig>): void {
    const newConfig = PhysicsStageConfigSchema.parse({ ...this.config, ...config });
    this.config = newConfig;
    
    this.oneEuro.configure({
      minCutoff: newConfig.minCutoff,
      beta: newConfig.beta,
    });
    
    this.cursor.configure({
      stiffness: newConfig.stiffness,
      damping: newConfig.damping,
      snapLockThreshold: newConfig.snapLockThreshold,
    });
  }

  /**
   * Reset physics state
   */
  reset(): void {
    this.oneEuro.reset();
    this.cursor.reset();
    this.lastRawPosition = { x: 0.5, y: 0.5 };
  }

  /**
   * Get current state
   */
  getState(): { position: Point2D; isCoasting: boolean } {
    return {
      position: this.cursor.getPosition(),
      isCoasting: this.cursor.getIsCoasting(),
    };
  }

  /**
   * Check if initialized
   */
  isReady(): boolean {
    return this.initialized;
  }

  /**
   * Get event target for subscribing to cursor events
   */
  getEventTarget(): EventTarget {
    return this.eventTarget;
  }
}
