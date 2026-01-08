/**
 * 🎯 ONE EURO FILTER
 * 
 * Velocity-adaptive low-pass filter for cursor smoothing.
 * Smooth when slow, responsive when fast.
 * 
 * @source Casiez, Roussel, Vogel (CHI 2012)
 * @provenance .kiro/specs/gesture-pointer-monolith/design.md
 * 
 * Property 3: OneEuro smoothing bounds
 * For any sequence of input positions, the output SHALL remain within
 * the bounding box of inputs (with small overshoot tolerance).
 */

import type { Point2D, Velocity2D } from '../../contracts/schemas.js';

class LowPassFilter {
  private s: number | null = null;
  private lastValue: number | null = null;

  filter(value: number, alpha: number): number {
    if (this.s === null) {
      this.s = value;
    } else {
      this.s = alpha * value + (1.0 - alpha) * this.s;
    }
    this.lastValue = value;
    return this.s;
  }

  last(): number {
    return this.s ?? 0;
  }

  getLastValue(): number | null {
    return this.lastValue;
  }

  reset(): void {
    this.s = null;
    this.lastValue = null;
  }
}

export interface OneEuroFilterConfig {
  minCutoff: number;  // Minimum cutoff frequency (Hz), default 0.5
  beta: number;       // Speed coefficient, default 0.001
  dcutoff: number;    // Derivative cutoff frequency, default 1.0
}

export interface OneEuroFilterResult {
  position: Point2D;
  velocity: Velocity2D;
}

export class OneEuroFilter {
  private xFilter = new LowPassFilter();
  private yFilter = new LowPassFilter();
  private dxFilter = new LowPassFilter();
  private dyFilter = new LowPassFilter();
  private lastTime: number | null = null;

  private minCutoff: number;
  private beta: number;
  private dcutoff: number;

  constructor(config: Partial<OneEuroFilterConfig> = {}) {
    this.minCutoff = config.minCutoff ?? 0.5;
    this.beta = config.beta ?? 0.001;
    this.dcutoff = config.dcutoff ?? 1.0;
  }

  /**
   * Calculate smoothing factor alpha from cutoff frequency and time delta
   */
  private alpha(cutoff: number, dt: number): number {
    const r = 2 * Math.PI * cutoff * dt;
    return r / (r + 1);
  }

  /**
   * Filter a single position sample
   * @param x - Raw X position (0-1 normalized)
   * @param y - Raw Y position (0-1 normalized)
   * @param timestamp - Timestamp in milliseconds
   * @returns Filtered position and estimated velocity
   */
  filter(x: number, y: number, timestamp: number): OneEuroFilterResult {
    // First sample or same timestamp: initialize without filtering
    if (this.lastTime === null || this.lastTime === timestamp) {
      this.lastTime = timestamp;
      const rx = this.xFilter.filter(x, 1.0);
      const ry = this.yFilter.filter(y, 1.0);
      return {
        position: { x: rx, y: ry },
        velocity: { vx: 0, vy: 0 },
      };
    }

    // Calculate time delta in seconds
    const dt = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;

    // Estimate velocity (derivative)
    const dx = (x - (this.xFilter.getLastValue() ?? x)) / dt;
    const dy = (y - (this.yFilter.getLastValue() ?? y)) / dt;

    // Filter the velocity
    const edx = this.dxFilter.filter(dx, this.alpha(this.dcutoff, dt));
    const edy = this.dyFilter.filter(dy, this.alpha(this.dcutoff, dt));

    // Calculate adaptive cutoff based on velocity magnitude
    // Higher velocity = higher cutoff = less smoothing = more responsive
    const cutoffX = this.minCutoff + this.beta * Math.abs(edx);
    const cutoffY = this.minCutoff + this.beta * Math.abs(edy);

    // Calculate alpha for position filtering
    const ax = this.alpha(cutoffX, dt);
    const ay = this.alpha(cutoffY, dt);

    // Filter position
    const fx = this.xFilter.filter(x, ax);
    const fy = this.yFilter.filter(y, ay);

    return {
      position: { x: fx, y: fy },
      velocity: { vx: edx, vy: edy },
    };
  }

  /**
   * Reset filter state for tracking resumption
   * Called when tracking is lost and then resumes
   */
  reset(): void {
    this.xFilter.reset();
    this.yFilter.reset();
    this.dxFilter.reset();
    this.dyFilter.reset();
    this.lastTime = null;
  }

  /**
   * Update configuration parameters
   */
  configure(config: Partial<OneEuroFilterConfig>): void {
    if (config.minCutoff !== undefined) this.minCutoff = config.minCutoff;
    if (config.beta !== undefined) this.beta = config.beta;
    if (config.dcutoff !== undefined) this.dcutoff = config.dcutoff;
  }

  /**
   * Get current configuration
   */
  getConfig(): OneEuroFilterConfig {
    return {
      minCutoff: this.minCutoff,
      beta: this.beta,
      dcutoff: this.dcutoff,
    };
  }
}
