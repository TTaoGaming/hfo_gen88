import { describe, it, expect } from 'vitest';
import { LatencyCompensator } from './latency-compensator';

describe('P2_MIRROR_MAGUS Sub 1: Latency Compensator', () => {
  it('should predict future position based on velocity', () => {
    const compensator = new LatencyCompensator(50); // 50ms lookahead
    const signal = {
      x: 100,
      y: 100,
      dx: 2, // 2 units per ms
      dy: -1, // -1 unit per ms
      velocity: 2.23,
    };

    const result = compensator.compensate(signal);

    expect(result.predictedX).toBe(200); // 100 + 2 * 50
    expect(result.predictedY).toBe(50);  // 100 + (-1) * 50
    expect(result.lookAheadMs).toBe(50);
  });
});
