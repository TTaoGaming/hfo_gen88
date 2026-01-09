import { z } from 'zod';

/**
 * PHOENIX_CONTRACTS - HFO Gen 88
 * Part of Port 5 (Pyre Praetorian) - Defense & Immunization
 */

export const ArtifactMetadataSchema = z.object({
  port: z.number().optional(),
  commander: z.string().optional(),
  gen: z.number().optional(),
  status: z.string().optional(),
  provenance: z.string().optional(),
});

export const ArtifactContract = z.object({
  filePath: z.string(),
  content: z.string(),
  meta: ArtifactMetadataSchema,
});

export type ArtifactMetadata = z.infer<typeof ArtifactMetadataSchema>;
export type Artifact = z.infer<typeof ArtifactContract>;
