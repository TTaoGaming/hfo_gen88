/**
 * 📹 WEBCAM PREVIEW PANEL
 * 
 * Displays video feed with landmark overlay.
 * 
 * @provenance .kiro/specs/gesture-pointer-monolith/design.md
 * Validates: Requirements 5.6
 */

import type { ComponentContainer } from 'golden-layout';
import type { PanelFactory } from '../golden-layout-shell.js';
import type { LandmarkEventDetail, Point3D } from '../../contracts/schemas.js';
import { LANDMARK } from '../../contracts/schemas.js';

export interface WebcamPreviewConfig {
  showLandmarks: boolean;
  showConnections: boolean;
  landmarkColor: string;
  connectionColor: string;
}

const DEFAULT_CONFIG: WebcamPreviewConfig = {
  showLandmarks: true,
  showConnections: true,
  landmarkColor: '#00ff00',
  connectionColor: '#00aa00',
};

// Hand landmark connections for drawing skeleton
const CONNECTIONS: [number, number][] = [
  [LANDMARK.WRIST, LANDMARK.THUMB_CMC],
  [LANDMARK.THUMB_CMC, LANDMARK.THUMB_MCP],
  [LANDMARK.THUMB_MCP, LANDMARK.THUMB_IP],
  [LANDMARK.THUMB_IP, LANDMARK.THUMB_TIP],
  [LANDMARK.WRIST, LANDMARK.INDEX_MCP],
  [LANDMARK.INDEX_MCP, LANDMARK.INDEX_PIP],
  [LANDMARK.INDEX_PIP, LANDMARK.INDEX_DIP],
  [LANDMARK.INDEX_DIP, LANDMARK.INDEX_TIP],
  [LANDMARK.WRIST, LANDMARK.MIDDLE_MCP],
  [LANDMARK.MIDDLE_MCP, LANDMARK.MIDDLE_PIP],
  [LANDMARK.MIDDLE_PIP, LANDMARK.MIDDLE_DIP],
  [LANDMARK.MIDDLE_DIP, LANDMARK.MIDDLE_TIP],
  [LANDMARK.WRIST, LANDMARK.RING_MCP],
  [LANDMARK.RING_MCP, LANDMARK.RING_PIP],
  [LANDMARK.RING_PIP, LANDMARK.RING_DIP],
  [LANDMARK.RING_DIP, LANDMARK.RING_TIP],
  [LANDMARK.WRIST, LANDMARK.PINKY_MCP],
  [LANDMARK.PINKY_MCP, LANDMARK.PINKY_PIP],
  [LANDMARK.PINKY_PIP, LANDMARK.PINKY_DIP],
  [LANDMARK.PINKY_DIP, LANDMARK.PINKY_TIP],
  [LANDMARK.INDEX_MCP, LANDMARK.MIDDLE_MCP],
  [LANDMARK.MIDDLE_MCP, LANDMARK.RING_MCP],
  [LANDMARK.RING_MCP, LANDMARK.PINKY_MCP],
];

export class WebcamPreviewPanel implements PanelFactory {
  private container: ComponentContainer | null = null;
  private video: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private config: WebcamPreviewConfig;
  private lastLandmarks: Point3D[] | null = null;
  private animationId: number | null = null;
  private eventSource: EventTarget | null = null;

  constructor(config: Partial<WebcamPreviewConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  create(container: ComponentContainer): void {
    this.container = container;
    const element = container.element;
    element.style.cssText = 'position:relative;background:#0f0f23;overflow:hidden;';

    // Create video element
    this.video = document.createElement('video');
    this.video.style.cssText = 'width:100%;height:100%;object-fit:cover;transform:scaleX(-1);';
    this.video.autoplay = true;
    this.video.playsInline = true;
    this.video.muted = true;
    element.appendChild(this.video);

    // Create canvas overlay for landmarks
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;transform:scaleX(-1);';
    element.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    // Handle resize
    container.on('resize', () => this.handleResize());
    this.handleResize();

    // Start render loop
    this.startRenderLoop();
  }


  /**
   * Set video stream
   */
  setStream(stream: MediaStream): void {
    if (this.video) {
      this.video.srcObject = stream;
    }
  }

  /**
   * Subscribe to landmark events
   */
  subscribe(source: EventTarget): void {
    this.eventSource = source;
    source.addEventListener('landmarks', ((event: CustomEvent<LandmarkEventDetail>) => {
      this.lastLandmarks = event.detail.landmarks;
    }) as EventListener);
    source.addEventListener('no_hand', () => {
      this.lastLandmarks = null;
    });
  }

  /**
   * Update landmarks directly (for synthetic data)
   */
  updateLandmarks(landmarks: Point3D[] | null): void {
    this.lastLandmarks = landmarks;
  }

  private handleResize(): void {
    if (!this.canvas || !this.container) return;
    const rect = this.container.element.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  private startRenderLoop(): void {
    const render = () => {
      this.drawLandmarks();
      this.animationId = requestAnimationFrame(render);
    };
    this.animationId = requestAnimationFrame(render);
  }

  private drawLandmarks(): void {
    if (!this.ctx || !this.canvas || !this.lastLandmarks) {
      if (this.ctx && this.canvas) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
      return;
    }

    const { width, height } = this.canvas;
    this.ctx.clearRect(0, 0, width, height);

    // Draw connections
    if (this.config.showConnections) {
      this.ctx.strokeStyle = this.config.connectionColor;
      this.ctx.lineWidth = 2;
      for (const [i, j] of CONNECTIONS) {
        const p1 = this.lastLandmarks[i];
        const p2 = this.lastLandmarks[j];
        this.ctx.beginPath();
        this.ctx.moveTo(p1.x * width, p1.y * height);
        this.ctx.lineTo(p2.x * width, p2.y * height);
        this.ctx.stroke();
      }
    }

    // Draw landmarks
    if (this.config.showLandmarks) {
      this.ctx.fillStyle = this.config.landmarkColor;
      for (const point of this.lastLandmarks) {
        this.ctx.beginPath();
        this.ctx.arc(point.x * width, point.y * height, 4, 0, Math.PI * 2);
        this.ctx.fill();
      }

      // Highlight index tip
      const indexTip = this.lastLandmarks[LANDMARK.INDEX_TIP];
      this.ctx.fillStyle = '#ff0000';
      this.ctx.beginPath();
      this.ctx.arc(indexTip.x * width, indexTip.y * height, 8, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  configure(config: Partial<WebcamPreviewConfig>): void {
    this.config = { ...this.config, ...config };
  }

  destroy(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.video?.srcObject) {
      const stream = this.video.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  }
}
