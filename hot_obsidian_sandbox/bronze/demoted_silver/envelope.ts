/**
 * 🥈 IMPLEMENTATION: VacuoleEnvelope Exemplar
 * 
 * This is a verified implementation of the VacuoleEnvelope pattern.
 * 
 * @provenance bronze/P0_GESTURE_KINETIC_DRAFT.md
 * @topic Gesture Control Plane
 */

import { z } from 'zod';

export const VacuoleEnvelope = z.object({
  ts: z.string().datetime(),
  mark: z.string(),
  payload: z.any(),
});

export type VacuoleEnvelope = z.infer<typeof VacuoleEnvelope>;

export function wrapInEnvelope(mark: string, payload: any): VacuoleEnvelope {
  return {
    ts: new Date().toISOString(),
    mark,
    payload,
  };
}
