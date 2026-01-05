import { z } from 'zod';
import { Port, SensorFrame, SmoothedFrame, SensorFrameSchema, SmoothedFrameSchema } from '../contracts/pointer-contracts.js';
import { VacuoleEnvelope, wrapInEnvelope } from '../contracts/envelope.js';

/**
 * 🥈 PORT 2: SHAPER (TRANSFORM) - OneEuroFilter Adapter
 * 
 * Velocity-adaptive low-pass filter. Smooth when slow, responsive when fast.
 * 
 * @source Casiez, Roussel, Vogel (CHI 2012)
 * @provenance hot_obsidian_sandbox/bronze/stale_context_payloads/GEN87_X3_CONTEXT_PAYLOAD_V1_20251230Z.md
 */

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

  getLastValue(): number | null {
    return this.lastValue;
  }
}

export class OneEuroFilter {
  private xFilter = new LowPassFilter();
  private yFilter = new LowPassFilter();
  private dxFilter = new LowPassFilter();
  private dyFilter = new LowPassFilter();
  private lastTime: number | null = null;

  constructor(
    private minCutoff: number = 1.0,
    private beta: number = 0.007,
    private dcutoff: number = 1.0
  ) {}

  private alpha(cutoff: number, dt: number): number {
    const r = 2 * Math.PI * cutoff * dt;
    return r / (r + 1);
  }

  filter(x: number, y: number, timestamp: number): { x: number; y: number; vx: number; vy: number } {
    if (this.lastTime === null || this.lastTime === timestamp) {
      this.lastTime = timestamp;
      const rx = this.xFilter.filter(x, 1.0);
      const ry = this.yFilter.filter(y, 1.0);
      return { x: rx, y: ry, vx: 0, vy: 0 };
    }

    const dt = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;

    // Calculate velocity
    const dx = (x - (this.xFilter.getLastValue() ?? x)) / dt;
    const dy = (y - (this.yFilter.getLastValue() ?? y)) / dt;

    // Filter velocity
    const edx = this.dxFilter.filter(dx, this.alpha(this.dcutoff, dt));
    const edy = this.dyFilter.filter(dy, this.alpha(this.dcutoff, dt));

    // Calculate adaptive cutoff
    const cutoffX = this.minCutoff + this.beta * Math.abs(edx);
    const cutoffY = this.minCutoff + this.beta * Math.abs(edy);

    const ax = this.alpha(cutoffX, dt);
    const ay = this.alpha(cutoffY, dt);

    // console.log(`dt=${dt}, cutoffX=${cutoffX}, ax=${ax}`);

    const fx = this.xFilter.filter(x, ax);
    const fy = this.yFilter.filter(y, ay);

    return {
      x: fx,
      y: fy,
      vx: edx,
      vy: edy
    };
  }
}

export class OneEuroAdapter implements Port<SensorFrame, SmoothedFrame> {
  readonly name = 'OneEuroSmoother';
  readonly inputSchema = SensorFrameSchema;
  readonly outputSchema = SmoothedFrameSchema;

  private filter = new OneEuroFilter(0.5, 0.001, 1.0); // 'earth' preset

  async process(input: SensorFrame): Promise<SmoothedFrame> {
    // Validate input
    const frame = this.inputSchema.parse(input);

    // Use INDEX_TIP (landmark 8) for cursor position
    const indexTip = frame.landmarks[8];
    
    // Apply filter
    const { x, y, vx, vy } = this.filter.filter(indexTip.x, indexTip.y, frame.timestamp);

    // Determine palm facing (simplified: if wrist.y > middle_mcp.y)
    const wrist = frame.landmarks[0];
    const middleMcp = frame.landmarks[9];
    const palmFacing = wrist.y > middleMcp.y;

    const output: SmoothedFrame = {
      position: { x, y },
      velocity: { vx, vy },
      gesture: frame.gesture,
      palmFacing
    };

    // Validate output
    return this.outputSchema.parse(output);
  }
}
