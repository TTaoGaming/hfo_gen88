import { describe, it, expect } from 'vitest';
import { SignalTransform } from './signal-transform';

describe('P2_MIRROR_MAGUS Sub 0: Signal Transform', () => {
  it('should initialize and transform raw input', () => {
    const transformer = new SignalTransform(0.8);
    const input1 = { x: 10, y: 10, timestamp: 1000 };
    const result1 = transformer.transform(input1);

    expect(result1.x).toBe(10);
    expect(result1.y).toBe(10);
    expect(result1.velocity).toBe(0);

    const input2 = { x: 20, y: 20, timestamp: 1100 };
    const result2 = transformer.transform(input2);

    // Alpha 0.8: 10 + 0.8 * (20 - 10) = 18
    expect(result2.x).toBe(18);
    expect(result2.y).toBe(18);
    expect(result2.dx).toBe(0.1); // (20-10)/100
    expect(result2.velocity).toBeCloseTo(0.1414, 4);
  });

  it('should throw on invalid input', () => {
    const transformer = new SignalTransform();
    expect(() => transformer.transform({ x: 'invalid' } as any)).toThrow();
  });
});
