/**
 * 🎯 TARGET CANVAS PANEL
 * 
 * Receives pointer events, displays triple cursors.
 * Raw (red), Physics (green), Predictive (blue)
 * 
 * @provenance .kiro/specs/gesture-pointer-monolith/design.md
 * Validates: Requirements 5.9, 5.10, 5.11
 */

import type { ComponentContainer } from 'golden-layout';
import type { PanelFactory } from '../golden-layout-shell.js';
import type { CursorEventDetail } from '../../contracts/schemas.js';

export interface TargetCanvasConfig {
  showRawCursor: boolean;
  showPhysicsCursor: boolean;
  showPredictiveCursor: boolean;
  rawColor: string;
  physicsColor: string;
  predictiveColor: string;
  cursorSize: number;
}

const DEFAULT_CONFIG: TargetCanvasConfig = {
  showRawCursor: true,
  showPhysicsCursor: true,
  showPredictiveCursor: true,
  rawColor: 'rgba(255, 0, 0, 0.6)',
  physicsColor: 'rgba(0, 255, 0, 0.7)',
  predictiveColor: 'rgba(0, 150, 255, 0.5)',
  cursorSize: 20,
};

export class TargetCanvasPanel implements PanelFactory {
  private container: ComponentContainer | null = null;
  private element: HTMLElement | null = null;
  private rawCursor: HTMLDivElement | null = null;
  private physicsCursor: HTMLDivElement | null = null;
  private predictiveCursor: HTMLDivElement | null = null;
  private config: TargetCanvasConfig;
  private eventLog: string[] = [];

  constructor(config: Partial<TargetCanvasConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  create(container: ComponentContainer): void {
    this.container = container;
    this.element = container.element;
    this.element.style.cssText = `
      position: relative;
      background: #0f0f23;
      border: 2px solid #0f3460;
      overflow: hidden;
    `;
    this.element.id = 'target-canvas';

    // Create cursors
    this.rawCursor = this.createCursor('cursor-raw', this.config.rawColor, 'red');
    this.physicsCursor = this.createCursor('cursor-physics', this.config.physicsColor, 'lime');
    this.predictiveCursor = this.createCursor('cursor-predictive', this.config.predictiveColor, 'cyan');

    this.element.appendChild(this.rawCursor);
    this.element.appendChild(this.physicsCursor);
    this.element.appendChild(this.predictiveCursor);

    // Update visibility
    this.updateCursorVisibility();
  }

  private createCursor(id: string, bgColor: string, borderColor: string): HTMLDivElement {
    const cursor = document.createElement('div');
    cursor.id = id;
    cursor.className = 'cursor';
    cursor.style.cssText = `
      position: absolute;
      width: ${this.config.cursorSize}px;
      height: ${this.config.cursorSize}px;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
      transition: opacity 0.1s;
      background: ${bgColor};
      border: 2px solid ${borderColor};
      left: 50%;
      top: 50%;
    `;
    return cursor;
  }

  /**
   * Update cursor positions from cursor event
   */
  updateCursors(detail: CursorEventDetail): void {
    if (!this.element) return;
    const rect = this.element.getBoundingClientRect();

    if (this.rawCursor) {
      this.rawCursor.style.left = `${detail.raw.x * rect.width}px`;
      this.rawCursor.style.top = `${detail.raw.y * rect.height}px`;
    }
    if (this.physicsCursor) {
      this.physicsCursor.style.left = `${detail.physics.x * rect.width}px`;
      this.physicsCursor.style.top = `${detail.physics.y * rect.height}px`;
    }
    if (this.predictiveCursor) {
      this.predictiveCursor.style.left = `${detail.predictive.x * rect.width}px`;
      this.predictiveCursor.style.top = `${detail.predictive.y * rect.height}px`;
    }
  }


  /**
   * Subscribe to cursor events
   */
  subscribe(source: EventTarget): void {
    source.addEventListener('cursor', ((event: CustomEvent<CursorEventDetail>) => {
      this.updateCursors(event.detail);
    }) as EventListener);
  }

  /**
   * Get the DOM element for pointer event dispatch
   */
  getElement(): HTMLElement | null {
    return this.element;
  }

  /**
   * Toggle cursor visibility
   */
  toggleRawCursor(visible: boolean): void {
    this.config.showRawCursor = visible;
    this.updateCursorVisibility();
  }

  togglePhysicsCursor(visible: boolean): void {
    this.config.showPhysicsCursor = visible;
    this.updateCursorVisibility();
  }

  togglePredictiveCursor(visible: boolean): void {
    this.config.showPredictiveCursor = visible;
    this.updateCursorVisibility();
  }

  private updateCursorVisibility(): void {
    if (this.rawCursor) {
      this.rawCursor.style.display = this.config.showRawCursor ? 'block' : 'none';
    }
    if (this.physicsCursor) {
      this.physicsCursor.style.display = this.config.showPhysicsCursor ? 'block' : 'none';
    }
    if (this.predictiveCursor) {
      this.predictiveCursor.style.display = this.config.showPredictiveCursor ? 'block' : 'none';
    }
  }

  configure(config: Partial<TargetCanvasConfig>): void {
    this.config = { ...this.config, ...config };
    this.updateCursorVisibility();
  }

  getConfig(): TargetCanvasConfig {
    return { ...this.config };
  }

  destroy(): void {
    // Cleanup handled by GoldenLayout
  }
}
