/**
 * 🪞 P2-SUB-1: LATENCY COMPENSATOR
 * Predicts future position based on velocity and look-ahead time.
 */

import { FilteredSignal } from './signal-transform';

export interface CompensatedSignal extends FilteredSignal {
  predictedX: number;
  predictedY: number;
  lookAheadMs: number;
}

export class LatencyCompensator {
  /**
   * @param lookAheadMs Time in milliseconds to project the signal forward.
   */
  constructor(private lookAheadMs: number = 20) {}

  public compensate(signal: FilteredSignal): CompensatedSignal {
    // Basic linear prediction: P' = P + V * dt
    // Signal velocity is units/ms if dx/dy were calculated correctly in Sub 0
    
    return {
      ...signal,
      predictedX: signal.x + signal.dx * this.lookAheadMs,
      predictedY: signal.y + signal.dy * this.lookAheadMs,
      lookAheadMs: this.lookAheadMs,
    };
  }

  public setLookAhead(ms: number) {
    this.lookAheadMs = ms;
  }
}
