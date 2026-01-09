import { describe, it, expect } from 'vitest';
import { FeedbackLoop } from './feedback-loop';

describe('P2_MIRROR_MAGUS Sub 7: Feedback Loop', () => {
  const loop = new FeedbackLoop();

  it('should generate haptic and visual feedback for ACTIVATE', () => {
    const signals = loop.generate('ACTIVATE');
    expect(signals).toHaveLength(2);
    expect(signals[0].type).toBe('HAPTIC');
    expect(signals[1].type).toBe('VISUAL');
  });

  it('should generate nothing for NONE', () => {
    const signals = loop.generate('NONE');
    expect(signals).toHaveLength(0);
  });
});
