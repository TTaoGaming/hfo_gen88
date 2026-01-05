import { describe, it, expect, beforeEach } from 'vitest';
import { MediaPipeAdapter, MockSensorAdapter } from '../adapters/mediapipe-adapter.js';
import { OneEuroAdapter } from '../adapters/one-euro-adapter.js';

describe('Port 0 Pipeline: Gesture Control', () => {
  let sensor: MediaPipeAdapter;
  let smoother: OneEuroAdapter;

  beforeEach(() => {
    sensor = new MediaPipeAdapter();
    smoother = new OneEuroAdapter();
  });

  it('should process a raw sensor frame and produce a smoothed frame', async () => {
    // 1. SENSE (Port 0)
    const rawInput = {
      landmarks: Array.from({ length: 21 }, (_, i) => ({ x: 0.1, y: 0.1, z: 0 })),
      gesture: 'Open_Palm',
      handedness: 'Right',
      confidence: 0.95
    };
    const sensorFrame = await sensor.process(rawInput);
    expect(sensorFrame.frameId).toBe(0);
    expect(sensorFrame.gesture).toBe('Open_Palm');

    // 2. TRANSFORM (Port 2)
    const smoothedFrame = await smoother.process(sensorFrame);
    expect(smoothedFrame.position.x).toBeCloseTo(0.1);
    expect(smoothedFrame.position.y).toBeCloseTo(0.1);
    expect(smoothedFrame.velocity.vx).toBe(0);
    expect(smoothedFrame.velocity.vy).toBe(0);
  });

  it('should apply smoothing over multiple frames', async () => {
    const timestamps = [1000, 1016, 1032]; // ~60fps
    const positions = [0.1, 0.2, 0.3];
    
    let lastSmoothedX = 0;

    for (let i = 0; i < timestamps.length; i++) {
      const sensorFrame = await sensor.process({
        landmarks: Array.from({ length: 21 }, (_, j) => ({ 
          x: j === 8 ? positions[i] : 0.5, 
          y: 0.5, 
          z: 0 
        })),
        timestamp: timestamps[i]
      });

      const smoothedFrame = await smoother.process(sensorFrame);
      
      // Smoothed position should be different from raw position after the first frame
      if (i > 0) {
        expect(smoothedFrame.position.x).not.toBe(positions[i]);
      }
      
      lastSmoothedX = smoothedFrame.position.x;
    }
  });

  it('should handle mock sensor input', async () => {
    const mockSensor = new MockSensorAdapter();
    const frame1 = await mockSensor.process();
    const frame2 = await mockSensor.process();
    
    expect(frame2.frameId).toBe(frame1.frameId + 1);
    expect(frame2.timestamp).toBeGreaterThanOrEqual(frame1.timestamp);
  });
});
