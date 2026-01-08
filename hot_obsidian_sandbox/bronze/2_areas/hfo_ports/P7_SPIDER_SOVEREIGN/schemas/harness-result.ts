import { z } from 'zod';

export const HarnessResultSchema = z.object({
  harness_id: z.number().min(0).max(7),
  harness_name: z.string(),
  model: z.string(),
  scores: z.object({
    raw: z.number(),
    normalized: z.number().min(0).max(1),
  }),
  timestamp: z.string().datetime(),
  duration_ms: z.number().min(0),
  prev_hash: z.string(),
  hash: z.string(),
  metadata: z.record(z.unknown()).optional(),
});

export type HarnessResult = z.infer<typeof HarnessResultSchema>;

export const HARNESS_NAMES = [
  'SENSE', 'FUSE', 'SHAPE', 'DELIVER',
  'DISRUPT', 'IMMUNIZE', 'STORE', 'DECIDE'
] as const;

export type HarnessName = typeof HARNESS_NAMES[number];
