/**
 * 🎯 SENSOR STAGE
 * 
 * Combines WebcamCapture + MediaPipeWrapper.
 * Dispatches landmark events or no_hand events.
 * 
 * @provenance .kiro/specs/gesture-pointer-monolith/design.md
 * Validates: Requirements 1.1-1.6
 */

import { WebcamCapture } from './webcam-capture.js';
import { MediaPipeWrapper, MockMediaPipeWrapper } from './mediapipe-wrapper.js';
import type { LandmarkEventDetail, SensorStageConfig } from '../../contracts/schemas.js';
import { SensorStageConfigSchema } from '../../contracts/schemas.js';

export class SensorStage {
  private webcam: WebcamCapture;
  private mediapipe: MediaPipeWrapper | MockMediaPipeWrapper;
  private config: SensorStageConfig;
  private eventTarget: EventTarget;
  private frameLoop: number | null = null;
  private lastFrameTime = 0;
  private targetFps = 30;

  constructor(
    config: Partial<SensorStageConfig> = {},
    eventTarget?: EventTarget,
    useMock = false
  ) {
    this.config = SensorStageConfigSchema.parse(config);
    this.eventTarget = eventTarget ?? (typeof window !== 'undefined' ? window : new EventTarget());
    this.webcam = new WebcamCapture({ resolution: this.config.resolution });
    this.mediapipe = useMock ? new MockMediaPipeWrapper() : new MediaPipeWrapper({
      modelComplexity: this.config.modelComplexity,
    });
  }

  async init(): Promise<void> {
    await this.mediapipe.init();
  }

  async startCapture(): Promise<MediaStream> {
    await this.webcam.start();
    this.startFrameLoop();
    return this.webcam.getStream()!;
  }

  private startFrameLoop(): void {
    const processFrame = (timestamp: number) => {
      if (timestamp - this.lastFrameTime >= 1000 / this.targetFps) {
        this.lastFrameTime = timestamp;
        const video = this.webcam.getVideo();
        if (video && video.readyState >= 2) {
          const result = this.mediapipe.processFrame(video, timestamp);
          if (result) {
            this.dispatchLandmarkEvent(result);
          } else {
            this.dispatchNoHandEvent(timestamp);
          }
        }
      }
      this.frameLoop = requestAnimationFrame(processFrame);
    };
    this.frameLoop = requestAnimationFrame(processFrame);
  }

  stop(): void {
    if (this.frameLoop !== null) {
      cancelAnimationFrame(this.frameLoop);
      this.frameLoop = null;
    }
    this.webcam.stop();
  }

  private dispatchLandmarkEvent(detail: LandmarkEventDetail): void {
    const event = new CustomEvent('landmarks', { detail });
    this.eventTarget.dispatchEvent(event);
  }

  private dispatchNoHandEvent(timestamp: number): void {
    const event = new CustomEvent('no_hand', { detail: { timestamp } });
    this.eventTarget.dispatchEvent(event);
  }

  getEventTarget(): EventTarget {
    return this.eventTarget;
  }

  getMockWrapper(): MockMediaPipeWrapper | null {
    return this.mediapipe instanceof MockMediaPipeWrapper ? this.mediapipe : null;
  }
}
