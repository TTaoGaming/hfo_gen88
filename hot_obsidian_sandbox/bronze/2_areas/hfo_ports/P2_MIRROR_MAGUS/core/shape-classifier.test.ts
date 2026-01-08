import { describe, it, expect } from 'vitest';
import { ShapeClassifier } from './shape-classifier';

describe('P2_MIRROR_MAGUS Sub 4: Shape Classifier', () => {
  const classifier = new ShapeClassifier();

  it('should classify a TAP', () => {
    const points = [
      { x: 10, y: 10 },
      { x: 11, y: 11 },
      { x: 10, y: 10 },
    ];
    expect(classifier.classify(points)).toBe('TAP');
  });

  it('should classify a SWIPE', () => {
    const points = [];
    for (let i = 0; i <= 10; i++) {
      points.push({ x: i * 10, y: 10 });
    }
    // Start (0,10), End (100,10) -> Dist 100. Path 100. Ratio 1.0.
    expect(classifier.classify(points)).toBe('SWIPE');
  });
});
