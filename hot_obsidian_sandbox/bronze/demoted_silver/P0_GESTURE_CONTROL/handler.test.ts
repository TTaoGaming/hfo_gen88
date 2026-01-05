/**
 * Topic: Gesture Control Plane
 * Provenance: bronze/P0_GESTURE_KINETIC_DRAFT.md
 */
import { describe, it, expect } from 'vitest';
import { processGestureData } from './handler.js';
import { GestureEnvelope } from './schemas.js';

describe('P0 Gesture Handler', () => {
  it('should transform valid MediaPipe data into a GestureEnvelope', () => {
    const mockMediaPipeData = {
      landmarks: [[{ x: 0.1, y: 0.2, z: 0.3 }]],
      worldLandmarks: [[{ x: 1, y: 2, z: 3 }]],
      handedness: [[{ score: 0.9, index: 0, label: 'Left', displayName: 'Left' }]],
    };

    const result = processGestureData(mockMediaPipeData);
    
    // Validate against schema
    const validated = GestureEnvelope.parse(result);
    
    expect(validated.mark).toBe('GESTURE_RAW');
    expect(validated.payload.landmarks[0][0].x).toBe(0.1);
    expect(new Date(validated.ts).getTime()).toBeLessThanOrEqual(Date.now());
  });

  it('should throw an error for invalid MediaPipe data', () => {
    const invalidData = {
      landmarks: 'not-an-array',
    };

    expect(() => processGestureData(invalidData as any)).toThrow();
  });
});

