import { z } from 'zod';

/**
 * PHOENIX_CONTRACTS - HFO Gen 88
 * Part of Port 5 (Pyre Praetorian) - Defense & Immunization
 */

export const GOLDILOCKS = {
  MIN: 80,
  TARGET: 88,
  MAX: 99,
} as const;

export const InscriptionSchema = z.object({
  id: z.string(),
  rune: z.string(),
  meaning: z.string(),
  validation: z.function().args(z.any()).returns(z.boolean()),
});

export const ArtifactMetadataSchema = z.object({
  port: z.number().optional(),
  commander: z.string().optional(),
  gen: z.number().optional(),
  status: z.string().optional(),
  provenance: z.string().optional(),
  inscriptions: z.array(z.string()).optional(),
});

export const ArtifactContract = z.object({
  filePath: z.string(),
  content: z.string(),
  meta: ArtifactMetadataSchema,
});

export type Inscription = z.infer<typeof InscriptionSchema>;
export type ArtifactMetadata = z.infer<typeof ArtifactMetadataSchema>;
export type Artifact = z.infer<typeof ArtifactContract>;
