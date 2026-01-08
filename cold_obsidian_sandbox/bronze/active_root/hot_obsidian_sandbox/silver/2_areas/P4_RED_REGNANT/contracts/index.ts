/**
 * P4 RED REGNANT - Zod Contracts
 * 
 * @port 4
 * @commander RED_REGNANT
 * @verb DISRUPT / SING / SCREAM
 * @provenance: LEGENDARY_COMMANDERS_V9.md
 * Validates: Requirements 6.1, 6.2, 6.3, 6.4
 */

import { z } from 'zod';

// --- VIOLATION TYPES ---

export const ViolationTypeSchema = z.enum([
  'THEATER',          // 100% scores, assertionless tests, mock-overuse
  'POLLUTION',        // Illegal files in root/bronze
  'AMNESIA',          // Debug logs in Strict Zones
  'BESPOKE',          // 'any' without // @bespoke
  'VIOLATION',        // Missing provenance or headers
  'MUTATION_FAILURE', // Score < 80% (Silver Standard)
  'MUTATION_GAP',     // Mutation report missing or malformed
  'LATTICE_BREACH',   // Octal governance violations
  'BDD_MISALIGNMENT', // Missing traceability
  'OMISSION',         // Silent success/catch blocks
  'PHANTOM',          // External/CDN dependencies
  'SUSPICION',        // Behavioral anomalies
  'DEBT',             // TODO/FIXME in codebase
]);

export type ViolationType = z.infer<typeof ViolationTypeSchema>;

// --- VIOLATION SCHEMA ---

export const ViolationSchema = z.object({
  id: z.string().uuid().optional(),
  timestamp: z.number().optional(),
  file: z.string(),
  type: ViolationTypeSchema,
  message: z.string(),
  severity: z.enum(['warning', 'error', 'critical']).default('error'),
});

export type Violation = z.infer<typeof ViolationSchema>;

// --- BLOOD BOOK ENTRY ---

export const BloodBookEntrySchema = z.object({
  id: z.string().uuid(),
  timestamp: z.number(),
  violationType: ViolationTypeSchema,
  artifact: z.string(),
  details: z.string(),
  attackVector: z.string(),
  resolved: z.boolean().default(false),
  resolvedAt: z.string().datetime().optional(),
  resolvedBy: z.enum(['P5_PYRE_PRAETORIAN', 'MANUAL']).optional(),
});

export type BloodBookEntry = z.infer<typeof BloodBookEntrySchema>;

// --- PURITY REPORT ---

export const PurityReportSchema = z.object({
  timestamp: z.number(),
  generation: z.number(),
  mutationScore: z.number().min(0).max(100),
  violationCount: z.number().min(0),
  isPure: z.boolean(),
  details: z.array(z.string()),
});

export type PurityReport = z.infer<typeof PurityReportSchema>;

// --- MUTATION SCORE BOUNDS ---

export const SILVER_STANDARD = {
  MIN_MUTATION_SCORE: 80,
  MAX_MUTATION_SCORE: 98.99,
  THEATER_THRESHOLD: 99,
} as const;

/**
 * Validates mutation score is within Silver Standard bounds
 */
export function isValidMutationScore(score: number): boolean {
  return score >= SILVER_STANDARD.MIN_MUTATION_SCORE && 
         score <= SILVER_STANDARD.MAX_MUTATION_SCORE;
}

/**
 * Detects Theater (suspiciously high scores)
 */
export function isTheater(score: number): boolean {
  return score >= SILVER_STANDARD.THEATER_THRESHOLD;
}

/**
 * Detects insufficient mutation coverage
 */
export function isMutationFailure(score: number): boolean {
  return score < SILVER_STANDARD.MIN_MUTATION_SCORE;
}
