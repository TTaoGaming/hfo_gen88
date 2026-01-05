import { z } from 'zod';

/**
 * 🥈 IMPLEMENTATION: VacuoleEnvelope
 * 
 * This is the canonical envelope for all data exchange in HFO Gen 88.
 * It ensures that all data is timestamped, marked with a provenance ID,
 * and adheres to a schema.
 */
export const VacuoleEnvelope = z.object({
  ts: z.string().datetime(),
  mark: z.string(),
  payload: z.unknown(),
});

export type VacuoleEnvelope = z.infer<typeof VacuoleEnvelope>;

export function wrapInEnvelope(mark: string, payload: unknown): VacuoleEnvelope {
  return {
    ts: new Date().toISOString(),
    mark,
    payload,
  };
}
