/**
 * P4 RED REGNANT - Silver Contracts
 * 
 * @port 4
 * @commander RED_REGNANT
 * @verb DISRUPT / SCREAM
 * @tier SILVER
 * @promoted 2026-01-07
 * @provenance: p4-p5-silver-sprint/design.md
 * Validates: Requirements 6.1, 6.2, 6.3, 6.4
 * 
 * Core contracts for mutation score classification.
 * Bronze detectors should import from here for score thresholds.
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
  'DEBT',             // [Technical Debt] in codebase
]);

export type ViolationType = z.infer<typeof ViolationTypeSchema>;

// --- MUTATION SCORE BOUNDS (CANONICAL) ---

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
