/**
 * Topic: Gesture Control Plane
 * Provenance: bronze/P0_GESTURE_KINETIC_DRAFT.md
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GestureBridge } from './bridge.js';
import { GestureEnvelope } from './schemas.js';

// Mock NATS
vi.mock('nats', () => ({
  connect: vi.fn().mockResolvedValue({
    jetstream: vi.fn().mockReturnValue({
      publish: vi.fn().mockResolvedValue({}),
    }),
    drain: vi.fn().mockResolvedValue({}),
  }),
  StringCodec: vi.fn().mockReturnValue({
    encode: vi.fn().mockReturnValue(new Uint8Array()),
    decode: vi.fn().mockReturnValue(''),
  }),
}));

describe('Gesture NATS Bridge', () => {
  let bridge: GestureBridge;

  beforeEach(() => {
    bridge = new GestureBridge();
  });

  it('should connect and publish data', async () => {
    await bridge.connect();
    
    const mockEnvelope: GestureEnvelope = {
      ts: new Date().toISOString(),
      mark: 'GESTURE_RAW',
      payload: {
        landmarks: [[{ x: 0.1, y: 0.2, z: 0.3 }]],
        worldLandmarks: [[{ x: 1, y: 2, z: 3 }]],
        handedness: [[{ score: 0.9, index: 0, label: 'Left', displayName: 'Left' }]],
      },
    };

    await expect(bridge.publish(mockEnvelope)).resolves.not.toThrow();
    await bridge.disconnect();
  });

  it('should throw error if publishing without connection', async () => {
    const mockEnvelope: any = {};
    await expect(bridge.publish(mockEnvelope)).rejects.toThrow('NATS JetStream not initialized');
  });
});

