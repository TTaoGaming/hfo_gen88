/**
 * 🪞 P2-SUB-0: SIGNAL TRANSFORM
 * Transforms raw input vectors into filtered/smoothed signals.
 */

import { z } from 'zod';

export const RawInputSchema = z.object({
  x: z.number(),
  y: z.number(),
  timestamp: z.number(),
  pressure: z.number().optional().default(1.0),
});

export type RawInput = z.infer<typeof RawInputSchema>;

export interface FilteredSignal {
  x: number;
  y: number;
  dx: number;
  dy: number;
  velocity: number;
}

export class SignalTransform {
  private lastInput?: RawInput;
  private lastFiltered?: FilteredSignal;

  constructor(private alpha: number = 0.5) {}

  /**
   * Simple Low-Pass Filter Transform
   */
  public transform(input: RawInput): FilteredSignal {
    const validated = RawInputSchema.parse(input);
    
    if (!this.lastInput || !this.lastFiltered) {
      this.lastInput = validated;
      this.lastFiltered = {
        x: validated.x,
        y: validated.y,
        dx: 0,
        dy: 0,
        velocity: 0,
      };
      return this.lastFiltered;
    }

    const dt = validated.timestamp - this.lastInput.timestamp;
    const dx = (validated.x - this.lastInput.x) / (dt || 1);
    const dy = (validated.y - this.lastInput.y) / (dt || 1);
    const velocity = Math.sqrt(dx * dx + dy * dy);

    // Exponential smoothing
    const newX = this.lastFiltered.x + this.alpha * (validated.x - this.lastFiltered.x);
    const newY = this.lastFiltered.y + this.alpha * (validated.y - this.lastFiltered.y);

    const result: FilteredSignal = {
      x: newX,
      y: newY,
      dx,
      dy,
      velocity,
    };

    this.lastInput = validated;
    this.lastFiltered = result;
    return result;
  }
}
