/**
 * PHOENIX CONTRACTS (PORT 0x05: THE BLUE PHOENIX)
 * 
 * Contract Law for the HFO Gen 88 Cleanroom.
 * All artifacts entering SILVER or GOLD must pass these Zod Shrouds.
 */

import { z } from 'zod';

/**
 * TRL (Technology Readiness Level) Schema
 */
export const TRLSchema = z.enum([
    'TRL_1_BASIC_PRINCIPLES',
    'TRL_2_CONCEPT_FORMULATED',
    'TRL_3_PROOF_OF_CONCEPT',
    'TRL_4_LAB_VALIDATION',
    'TRL_5_FIELD_VALIDATION',
    'TRL_6_PROTOTYPE_DEMONSTRATION',
    'TRL_7_OPERATIONAL_DEMONSTRATION',
    'TRL_8_SYSTEM_COMPLETE_QUALIFIED',
    'TRL_9_MISSION_PROVEN'
]);

/**
 * Metadata Schema for Artifact Traceability
 */
export const ArtifactMetadataSchema = z.object({
    port: z.number().min(0).max(7),
    commander: z.string(),
    gen: z.number(),
    status: z.enum(['BRONZE', 'SILVER', 'GOLD']),
    provenance: z.string().describe("Source of the requirement or mission context"),
    validates: z.string().optional().describe("Requirement/Artifact ID being validated"),
    reputation: z.number().min(0).max(1).default(0),
    tags: z.array(z.string()).default([])
}).describe("Metadata required for all HFO artifacts");

/**
 * Artifact Contract (The Shroud)
 */
export const ArtifactContract = z.object({
    filePath: z.string(),
    meta: ArtifactMetadataSchema,
    ast: z.object({
        screams: z.number().max(0).describe("Must have 0 Semgrep screams to pass"),
        coverage: z.number().min(80).describe("Minimum 80% test coverage")
    }),
    content: z.string().refine(c => !c.includes('TODO') && !c.includes('// ...'), {
        message: "Artifact contains theater/placeholder logic"
    })
});

export type Artifact = z.infer<typeof ArtifactContract>;
