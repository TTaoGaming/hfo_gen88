import { z } from 'zod';
import { VacuoleEnvelope } from '../envelope.js';

/**
 * 🥈 PORT 0: GESTURE CONTROL SCHEMAS
 * 
 * Verified Zod schemas for MediaPipe Hand Landmarker passthrough.
 * This ensures "Contract Law" is enforced at the edge.
 * 
 * @provenance bronze/P0_GESTURE_KINETIC_DRAFT.md
 * @topic Gesture Control Plane
 */

export const LandmarkSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
  visibility: z.number().optional(),
  presence: z.number().optional(),
});

export const HandLandmarkerResultSchema = z.object({
  landmarks: z.array(z.array(LandmarkSchema)),
  worldLandmarks: z.array(z.array(LandmarkSchema)),
  handedness: z.array(z.array(z.object({
    score: z.number(),
    index: z.number(),
    label: z.string(),
    displayName: z.string(),
  }))),
});

export type HandLandmarkerResult = z.infer<typeof HandLandmarkerResultSchema>;

/**
 * @exemplar VacuoleEnvelope
 */
export const GestureEnvelope = VacuoleEnvelope.extend({
  mark: z.literal('GESTURE_RAW'),
  payload: HandLandmarkerResultSchema,
});

export type GestureEnvelope = z.infer<typeof GestureEnvelope>;
