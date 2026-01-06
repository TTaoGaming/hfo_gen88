/**
 * 🧪 SYNTHETIC LANDMARK GENERATOR
 * 
 * Generates realistic hand movement sequences for testing.
 * Simulates tracking loss, gesture transitions, and movement patterns.
 * 
 * @provenance .kiro/specs/gesture-pointer-monolith/design.md
 * Validates: Requirements 6.4, 6.5, 6.6, 6.7
 */

import type { Point3D, GestureName, LandmarkEventDetail } from '../contracts/schemas.js';
import { LANDMARK } from '../contracts/schemas.js';

export interface SyntheticMovementConfig {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  duration: number; // ms
  fps: number;
  gesture: GestureName;
  confidence: number;
  palmAngle: number;
}

export interface TrackingLossConfig {
  startFrame: number;
  duration: number; // frames
}

export interface GestureTransitionConfig {
  frame: number;
  fromGesture: GestureName;
  toGesture: GestureName;
  transitionFrames: number; // frames with low confidence during transition
}

/**
 * Generate a single hand landmark array at a given position
 */
export function generateLandmarksAtPosition(
  x: number,
  y: number,
  palmAngle: number = 30
): Point3D[] {
  const landmarks: Point3D[] = [];
  
  // Base hand structure (normalized 0-1 coordinates)
  // Wrist at base
  landmarks[LANDMARK.WRIST] = { x, y: y + 0.1, z: 0 };
  
  // Thumb
  landmarks[LANDMARK.THUMB_CMC] = { x: x - 0.03, y: y + 0.08, z: 0 };
  landmarks[LANDMARK.THUMB_MCP] = { x: x - 0.05, y: y + 0.06, z: 0 };
  landmarks[LANDMARK.THUMB_IP] = { x: x - 0.06, y: y + 0.04, z: 0 };
  landmarks[LANDMARK.THUMB_TIP] = { x: x - 0.07, y: y + 0.02, z: 0 };
  
  // Index finger
  landmarks[LANDMARK.INDEX_MCP] = { x: x - 0.02, y: y + 0.05, z: 0 };
  landmarks[LANDMARK.INDEX_PIP] = { x: x - 0.02, y: y + 0.02, z: 0 };
  landmarks[LANDMARK.INDEX_DIP] = { x: x - 0.02, y: y - 0.01, z: 0 };
  landmarks[LANDMARK.INDEX_TIP] = { x, y, z: 0 }; // Index tip at target position
  
  // Middle finger (controls palm angle)
  const palmZ = -0.1 * Math.cos(palmAngle * Math.PI / 180);
  landmarks[LANDMARK.MIDDLE_MCP] = { x, y: y + 0.05, z: palmZ };
  landmarks[LANDMARK.MIDDLE_PIP] = { x, y: y + 0.02, z: palmZ * 0.8 };
  landmarks[LANDMARK.MIDDLE_DIP] = { x, y: y - 0.01, z: palmZ * 0.6 };
  landmarks[LANDMARK.MIDDLE_TIP] = { x, y: y - 0.04, z: palmZ * 0.4 };
  
  // Ring finger
  landmarks[LANDMARK.RING_MCP] = { x: x + 0.02, y: y + 0.05, z: 0 };
  landmarks[LANDMARK.RING_PIP] = { x: x + 0.02, y: y + 0.02, z: 0 };
  landmarks[LANDMARK.RING_DIP] = { x: x + 0.02, y: y - 0.01, z: 0 };
  landmarks[LANDMARK.RING_TIP] = { x: x + 0.02, y: y - 0.04, z: 0 };
  
  // Pinky finger
  landmarks[LANDMARK.PINKY_MCP] = { x: x + 0.04, y: y + 0.06, z: 0 };
  landmarks[LANDMARK.PINKY_PIP] = { x: x + 0.04, y: y + 0.03, z: 0 };
  landmarks[LANDMARK.PINKY_DIP] = { x: x + 0.04, y: y, z: 0 };
  landmarks[LANDMARK.PINKY_TIP] = { x: x + 0.04, y: y - 0.03, z: 0 };
  
  return landmarks;
}

/**
 * Generate a sequence of landmark events for a movement
 */
export function generateMovementSequence(
  config: SyntheticMovementConfig
): LandmarkEventDetail[] {
  const frames = Math.floor(config.duration / (1000 / config.fps));
  const events: LandmarkEventDetail[] = [];
  
  for (let i = 0; i < frames; i++) {
    const t = i / (frames - 1);
    const x = config.startX + (config.endX - config.startX) * t;
    const y = config.startY + (config.endY - config.startY) * t;
    
    const landmarks = generateLandmarksAtPosition(x, y, config.palmAngle);
    
    events.push({
      landmarks,
      gesture: config.gesture,
      confidence: config.confidence,
      palmAngle: config.palmAngle,
      timestamp: i * (1000 / config.fps),
    });
  }
  
  return events;
}

/**
 * Apply tracking loss to a sequence (remove frames)
 */
export function applyTrackingLoss(
  events: LandmarkEventDetail[],
  config: TrackingLossConfig
): (LandmarkEventDetail | null)[] {
  return events.map((event, index) => {
    if (index >= config.startFrame && index < config.startFrame + config.duration) {
      return null; // Tracking lost
    }
    return event;
  });
}

/**
 * Apply gesture transition to a sequence
 */
export function applyGestureTransition(
  events: LandmarkEventDetail[],
  config: GestureTransitionConfig
): LandmarkEventDetail[] {
  return events.map((event, index) => {
    if (index < config.frame) {
      return { ...event, gesture: config.fromGesture };
    } else if (index < config.frame + config.transitionFrames) {
      // Low confidence during transition
      return {
        ...event,
        gesture: config.toGesture,
        confidence: 0.3 + Math.random() * 0.2, // 0.3-0.5 confidence
      };
    } else {
      return { ...event, gesture: config.toGesture };
    }
  });
}

/**
 * SyntheticLandmarkGenerator class for complex test scenarios
 */
export class SyntheticLandmarkGenerator {
  private events: (LandmarkEventDetail | null)[] = [];
  private currentIndex = 0;
  private baseTimestamp = 0;

  /**
   * Generate a linear movement sequence
   */
  generateLinearMovement(config: SyntheticMovementConfig): this {
    const newEvents = generateMovementSequence(config);
    this.events.push(...newEvents);
    return this;
  }

  /**
   * Generate a circular movement sequence
   */
  generateCircularMovement(
    centerX: number,
    centerY: number,
    radius: number,
    duration: number,
    fps: number,
    gesture: GestureName = 'Open_Palm'
  ): this {
    const frames = Math.floor(duration / (1000 / fps));
    
    for (let i = 0; i < frames; i++) {
      const angle = (i / frames) * 2 * Math.PI;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      const landmarks = generateLandmarksAtPosition(x, y, 30);
      
      this.events.push({
        landmarks,
        gesture,
        confidence: 0.9,
        palmAngle: 30,
        timestamp: this.getNextTimestamp(fps),
      });
    }
    
    return this;
  }

  /**
   * Add tracking loss (null frames)
   */
  addTrackingLoss(frames: number): this {
    for (let i = 0; i < frames; i++) {
      this.events.push(null);
    }
    return this;
  }

  /**
   * Add a gesture transition
   */
  addGestureTransition(
    fromGesture: GestureName,
    toGesture: GestureName,
    x: number,
    y: number,
    transitionFrames: number = 5,
    fps: number = 30
  ): this {
    // Low confidence frames during transition
    for (let i = 0; i < transitionFrames; i++) {
      const landmarks = generateLandmarksAtPosition(x, y, 0);
      this.events.push({
        landmarks,
        gesture: i < transitionFrames / 2 ? fromGesture : toGesture,
        confidence: 0.3 + Math.random() * 0.2,
        palmAngle: 0,
        timestamp: this.getNextTimestamp(fps),
      });
    }
    return this;
  }

  /**
   * Add stable frames at a position
   */
  addStableFrames(
    x: number,
    y: number,
    frames: number,
    gesture: GestureName = 'Open_Palm',
    fps: number = 30
  ): this {
    for (let i = 0; i < frames; i++) {
      const landmarks = generateLandmarksAtPosition(x, y, 0);
      this.events.push({
        landmarks,
        gesture,
        confidence: 0.9,
        palmAngle: 0,
        timestamp: this.getNextTimestamp(fps),
      });
    }
    return this;
  }

  /**
   * Get all generated events
   */
  getEvents(): (LandmarkEventDetail | null)[] {
    return [...this.events];
  }

  /**
   * Get next event (iterator pattern)
   */
  next(): { event: LandmarkEventDetail | null; done: boolean } {
    if (this.currentIndex >= this.events.length) {
      return { event: null, done: true };
    }
    const event = this.events[this.currentIndex++];
    return { event, done: false };
  }

  /**
   * Reset iterator
   */
  reset(): void {
    this.currentIndex = 0;
  }

  /**
   * Clear all events
   */
  clear(): void {
    this.events = [];
    this.currentIndex = 0;
    this.baseTimestamp = 0;
  }

  private getNextTimestamp(fps: number): number {
    const timestamp = this.baseTimestamp;
    this.baseTimestamp += 1000 / fps;
    return timestamp;
  }
}
