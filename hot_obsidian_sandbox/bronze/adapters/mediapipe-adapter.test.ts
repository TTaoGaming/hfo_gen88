import { describe, it, expect } from 'vitest';
import { MediaPipeAdapter } from './mediapipe-adapter.js';

describe('MediaPipeAdapter', () => {
  it('should transform real MediaPipe results to SensorFrame', async () => {
    const adapter = new MediaPipeAdapter();
    
    const mockMediaPipeResult = {
      landmarks: [[
        { x: 0.1, y: 0.2, z: 0.3 },
        { x: 0.4, y: 0.5, z: 0.6 },
        // ... (rest of the 21 landmarks would be here)
      ].concat(Array(19).fill({ x: 0, y: 0, z: 0 }))],
      gestures: [[{ categoryName: 'Open_Palm', score: 0.95 }]],
      handedness: [[{ categoryName: 'Right', score: 0.99 }]]
    };

    const frame = await adapter.process(mockMediaPipeResult);

    expect(frame.gesture).toBe('Open_Palm');
    expect(frame.handedness).toBe('Right');
    expect(frame.confidence).toBe(0.95);
    expect(frame.landmarks).toHaveLength(21);
    expect(frame.landmarks[0]).toEqual({ x: 0.1, y: 0.2, z: 0.3 });
  });

  it('should handle empty results gracefully', async () => {
    const adapter = new MediaPipeAdapter();
    const emptyResult = { landmarks: [], gestures: [], handedness: [] };
    
    const frame = await adapter.process(emptyResult);
    
    expect(frame.gesture).toBe('None');
    expect(frame.landmarks).toHaveLength(21);
    expect(frame.landmarks[0]).toEqual({ x: 0.5, y: 0.5, z: 0 });
  });
});
