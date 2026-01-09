import { describe, it, expect } from 'vitest';
import { AdaptiveThreshold } from './adaptive-threshold';

describe('P2_MIRROR_MAGUS Sub 3: Adaptive Threshold', () => {
  it('should gate noise and adapt threshold', () => {
    const gate = new AdaptiveThreshold(10.0, 0.5);
    
    // Value 5 is below base threshold 10
    expect(gate.isSignificant(5)).toBe(false);
    expect(gate.getThreshold()).toBe(10);

    // Value 20 is above 10
    expect(gate.isSignificant(20)).toBe(true);
    // Adapts: 10 + (20 - 10) * 0.5 = 15
    expect(gate.getThreshold()).toBe(15);

    // Value 12 is now below 15
    expect(gate.isSignificant(12)).toBe(false);
    // Adapts back towards base: 15 - (15 - 10) * 0.5 = 12.5
    expect(gate.getThreshold()).toBe(12.5);
  });
});
