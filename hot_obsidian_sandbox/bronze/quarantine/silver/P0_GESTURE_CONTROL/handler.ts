import { GestureEnvelope, HandLandmarkerResultSchema } from './schemas.js';
import { wrapInEnvelope } from '../envelope.js';

/**
 * 🥈 PORT 0: GESTURE CONTROL HANDLER
 * 
 * Processes raw MediaPipe Hand Landmarker data into verified GestureEnvelopes.
 * 
 * @provenance bronze/P0_GESTURE_KINETIC_DRAFT.md
 * @topic Gesture Control Plane
 */

export function processGestureData(rawData: unknown): GestureEnvelope {
  // 1. Validate raw data against the HandLandmarkerResultSchema
  const validatedPayload = HandLandmarkerResultSchema.parse(rawData);

  // 2. Wrap in a GestureEnvelope
  const envelope = wrapInEnvelope('GESTURE_RAW', validatedPayload);

  // 3. Final validation of the envelope itself
  return GestureEnvelope.parse(envelope);
}
