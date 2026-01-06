/**
 * 🎯 WEBCAM CAPTURE
 * 
 * Captures video frames from webcam for MediaPipe processing.
 * 
 * @provenance .kiro/specs/gesture-pointer-monolith/design.md
 * Validates: Requirements 1.1, 1.2
 */

export interface WebcamCaptureConfig {
  resolution: '480p' | '720p' | '1080p';
}

const RESOLUTIONS = {
  '480p': { width: 640, height: 480 },
  '720p': { width: 1280, height: 720 },
  '1080p': { width: 1920, height: 1080 },
};

export class WebcamCapture {
  private stream: MediaStream | null = null;
  private video: HTMLVideoElement | null = null;
  private config: WebcamCaptureConfig;

  constructor(config: Partial<WebcamCaptureConfig> = {}) {
    this.config = {
      resolution: config.resolution ?? '720p',
    };
  }

  /**
   * Start webcam capture
   */
  async start(): Promise<HTMLVideoElement> {
    const resolution = RESOLUTIONS[this.config.resolution];
    
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: resolution.width },
          height: { ideal: resolution.height },
          facingMode: 'user',
        },
        audio: false,
      });

      this.video = document.createElement('video');
      this.video.srcObject = this.stream;
      this.video.autoplay = true;
      this.video.playsInline = true;
      
      await new Promise<void>((resolve) => {
        this.video!.onloadedmetadata = () => {
          this.video!.play();
          resolve();
        };
      });

      return this.video;
    } catch (error) {
      throw new Error(`Failed to access webcam: ${error}`);
    }
  }

  /**
   * Stop webcam capture
   */
  stop(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.video) {
      this.video.srcObject = null;
      this.video = null;
    }
  }

  /**
   * Get current video element
   */
  getVideo(): HTMLVideoElement | null {
    return this.video;
  }

  /**
   * Check if capturing
   */
  isCapturing(): boolean {
    return this.stream !== null && this.video !== null;
  }

  /**
   * Get video dimensions
   */
  getDimensions(): { width: number; height: number } {
    if (!this.video) {
      return RESOLUTIONS[this.config.resolution];
    }
    return {
      width: this.video.videoWidth,
      height: this.video.videoHeight,
    };
  }
}
