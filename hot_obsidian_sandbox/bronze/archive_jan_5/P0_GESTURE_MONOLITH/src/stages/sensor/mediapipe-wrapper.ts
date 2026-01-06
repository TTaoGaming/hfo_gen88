/**
 * 🎯 MEDIAPIPE WRAPPER
 * 
 * Wraps MediaPipe GestureRecognizer for hand tracking.
 * 
 * @provenance .kiro/specs/gesture-pointer-monolith/design.md
 * Validates: Requirements 1.2, 1.3
 */

import type { Point3D, GestureName, LandmarkEventDetail } from '../../contracts/schemas.js';
import { LANDMARK } from '../../contracts/schemas.js';
import { calculatePalmAngle } from '../fsm/palm-cone.js';

export interface MediaPipeWrapperConfig {
  modelComplexity: 'lite' | 'full';
  minDetectionConfidence: number;
  minTrackingConfidence: number;
}

// MediaPipe types (simplified)
interface GestureRecognizerResult {
  landmarks: Array<Array<{ x: number; y: number; z: number }>>;
  gestures: Array<Array<{ categoryName: string; score: number }>>;
  handedness: Array<Array<{ categoryName: string }>>;
}

/**
 * MediaPipeWrapper - wraps the MediaPipe GestureRecognizer
 * 
 * Note: In browser, this requires loading MediaPipe from CDN.
 * For testing, we provide a mock implementation.
 */
export class MediaPipeWrapper {
  private config: MediaPipeWrapperConfig;
  private recognizer: any = null;
  private initialized = false;

  constructor(config: Partial<MediaPipeWrapperConfig> = {}) {
    this.config = {
      modelComplexity: config.modelComplexity ?? 'lite',
      minDetectionConfidence: config.minDetectionConfidence ?? 0.5,
      minTrackingConfidence: config.minTrackingConfidence ?? 0.5,
    };
  }

  /**
   * Initialize MediaPipe GestureRecognizer
   * Must be called in browser environment with MediaPipe loaded
   */
  async init(): Promise<void> {
    // Check if MediaPipe is available (browser only)
    if (typeof window !== 'undefined' && (window as any).GestureRecognizer) {
      const { GestureRecognizer, FilesetResolver } = (window as any);
      
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );
      
      this.recognizer = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 1,
        minHandDetectionConfidence: this.config.minDetectionConfidence,
        minHandPresenceConfidence: this.config.minTrackingConfidence,
        minTrackingConfidence: this.config.minTrackingConfidence,
      });
      
      this.initialized = true;
    } else {
      // Mock mode for testing
      console.warn('MediaPipe not available, using mock mode');
      this.initialized = true;
    }
  }

  /**
   * Process a video frame and extract landmarks/gestures
   */
  processFrame(video: HTMLVideoElement, timestamp: number): LandmarkEventDetail | null {
    if (!this.initialized) {
      throw new Error('MediaPipeWrapper not initialized');
    }

    // If recognizer is available, use it
    if (this.recognizer) {
      const result = this.recognizer.recognizeForVideo(video, timestamp);
      return this.parseResult(result, timestamp);
    }

    // Mock mode - return null (no hand detected)
    return null;
  }

  /**
   * Parse MediaPipe result into LandmarkEventDetail
   */
  private parseResult(result: GestureRecognizerResult, timestamp: number): LandmarkEventDetail | null {
    if (!result.landmarks || result.landmarks.length === 0) {
      return null;
    }

    const landmarks: Point3D[] = result.landmarks[0].map(lm => ({
      x: lm.x,
      y: lm.y,
      z: lm.z,
    }));

    // Get gesture
    let gesture: GestureName = 'None';
    let confidence = 0;
    
    if (result.gestures && result.gestures.length > 0 && result.gestures[0].length > 0) {
      const topGesture = result.gestures[0][0];
      gesture = this.mapGestureName(topGesture.categoryName);
      confidence = topGesture.score;
    }

    // Calculate palm angle
    const palmAngle = calculatePalmAngle(landmarks);

    return {
      landmarks,
      gesture,
      confidence,
      palmAngle,
      timestamp,
    };
  }

  /**
   * Map MediaPipe gesture name to our GestureName type
   */
  private mapGestureName(name: string): GestureName {
    const mapping: Record<string, GestureName> = {
      'Open_Palm': 'Open_Palm',
      'Pointing_Up': 'Pointing_Up',
      'Closed_Fist': 'Closed_Fist',
      'Thumb_Up': 'Thumb_Up',
      'Thumb_Down': 'Thumb_Down',
      'Victory': 'Victory',
      'ILoveYou': 'ILoveYou',
    };
    return mapping[name] ?? 'None';
  }

  /**
   * Check if initialized
   */
  isReady(): boolean {
    return this.initialized;
  }

  /**
   * Close and cleanup
   */
  close(): void {
    if (this.recognizer) {
      this.recognizer.close();
      this.recognizer = null;
    }
    this.initialized = false;
  }
}

/**
 * Mock MediaPipe wrapper for testing without browser
 */
export class MockMediaPipeWrapper {
  private sequence: (LandmarkEventDetail | null)[] = [];
  private index = 0;

  /**
   * Set the sequence of results to return
   */
  setSequence(sequence: (LandmarkEventDetail | null)[]): void {
    this.sequence = sequence;
    this.index = 0;
  }

  async init(): Promise<void> {
    // No-op for mock
  }

  processFrame(_video: any, timestamp: number): LandmarkEventDetail | null {
    if (this.index >= this.sequence.length) {
      return null;
    }
    const result = this.sequence[this.index++];
    if (result) {
      return { ...result, timestamp };
    }
    return null;
  }

  isReady(): boolean {
    return true;
  }

  close(): void {
    this.sequence = [];
    this.index = 0;
  }
}
