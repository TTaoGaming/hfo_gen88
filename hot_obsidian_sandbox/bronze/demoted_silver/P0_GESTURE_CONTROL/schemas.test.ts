/**
 * Topic: Gesture Control Plane
 * Provenance: bronze/P0_GESTURE_KINETIC_DRAFT.md
 */
import { describe, it, expect } from 'vitest';
import { GestureEnvelope, HandLandmarkerResultSchema } from './schemas.js';

describe('P0 Gesture Control Schemas', () => {
  it('should validate a valid MediaPipe result', () => {
    const mockResult = {
      landmarks: [[{ x: 0.1, y: 0.2, z: 0.3 }]],
      worldLandmarks: [[{ x: 1, y: 2, z: 3 }]],
      handedness: [[{ score: 0.9, index: 0, label: 'Left', displayName: 'Left' }]],
    };

    const parsed = HandLandmarkerResultSchema.parse(mockResult);
    expect(parsed.landmarks[0][0].x).toBe(0.1);
  });

  it('should validate a full GestureEnvelope', () => {
    const mockEnvelope = {
      ts: new Date().toISOString(),
      mark: 'GESTURE_RAW',
      payload: {
        landmarks: [[{ x: 0.1, y: 0.2, z: 0.3 }]],
        worldLandmarks: [[{ x: 1, y: 2, z: 3 }]],
        handedness: [[{ score: 0.9, index: 0, label: 'Left', displayName: 'Left' }]],
      },
    };

    const parsed = GestureEnvelope.parse(mockEnvelope);
    expect(parsed.mark).toBe('GESTURE_RAW');
  });

  it('should fail on invalid mark', () => {
    const invalidEnvelope = {
      ts: new Date().toISOString(),
      mark: 'INVALID_MARK',
      payload: {},
    };

    expect(() => GestureEnvelope.parse(invalidEnvelope)).toThrow();
  });
});

