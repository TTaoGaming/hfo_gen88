import { z } from 'zod';

export const FitnessConfigSchema = z.object({
  harness_weights: z.record(z.string(), z.number().min(0)),
});

export type FitnessConfig = z.infer<typeof FitnessConfigSchema>;

export const DEFAULT_FITNESS_CONFIG: FitnessConfig = {
  harness_weights: {
    'SENSE': 1.0,
    'FUSE': 1.0,
    'SHAPE': 1.5,
    'DELIVER': 1.0,
    'DISRUPT': 1.2,
    'IMMUNIZE': 1.0,
    'STORE': 1.0,
    'DECIDE': 2.0,
  },
};
