import { z } from 'zod';
import { Port, SensorFrame, SensorFrameSchema, LandmarkSchema } from '../contracts/pointer-contracts.js';
import { VacuoleEnvelope } from '../contracts/envelope.js';

/**
 * 🥈 PORT 0: OBSERVER (SENSE) - MediaPipe Adapter (Mock)
 * 
 * Wraps MediaPipe Hand Landmarker.
 * 
 * @source https://ai.google.dev/edge/mediapipe/solutions/vision/gesture_recognizer
 */

export class MediaPipeAdapter implements Port<unknown, SensorFrame> {
  readonly name = 'MediaPipeObserver';
  readonly inputSchema = z.unknown(); // Raw MediaPipe result
  readonly outputSchema = SensorFrameSchema;

  private frameId = 0;

  async process(input: any): Promise<SensorFrame> { // // @bespoke: MediaPipe raw input is untyped
    // In a real implementation, this would map MediaPipe's result to SensorFrame
    // For now, we assume the input is already close to what we need or we mock it.
    
    const output: SensorFrame = {
      frameId: this.frameId++,
      timestamp: Date.now(),
      landmarks: input.landmarks || this.generateDefaultLandmarks(),
      gesture: input.gesture || 'None',
      handedness: input.handedness || 'Right',
      confidence: input.confidence || 0.9,
    };

    return this.outputSchema.parse(output);
  }

  private generateDefaultLandmarks() {
    return Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.5, z: 0 }));
  }
}

/**
 * Mock Sensor for testing the pipeline without a real camera
 */
export class MockSensorAdapter implements Port<void, SensorFrame> {
  readonly name = 'MockSensor';
  readonly inputSchema = z.void();
  readonly outputSchema = SensorFrameSchema;

  private frameId = 0;

  async process(): Promise<SensorFrame> {
    const t = Date.now() / 1000;
    const x = 0.5 + 0.2 * Math.cos(t);
    const y = 0.5 + 0.2 * Math.sin(t);

    const landmarks = Array.from({ length: 21 }, (_, i) => ({
      x: i === 8 ? x : 0.5, // INDEX_TIP moves in a circle
      y: i === 8 ? y : 0.5,
      z: 0,
    }));

    const output: SensorFrame = {
      frameId: this.frameId++,
      timestamp: Date.now(),
      landmarks: landmarks as any,
      gesture: 'None',
      handedness: 'Right',
      confidence: 1.0,
    };

    return this.outputSchema.parse(output);
  }
}
