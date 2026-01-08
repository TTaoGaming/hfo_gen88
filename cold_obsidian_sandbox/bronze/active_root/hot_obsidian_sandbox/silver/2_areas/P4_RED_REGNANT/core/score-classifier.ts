/**
 * P4 RED REGNANT - Score Classifier
 * 
 * @port 4
 * @commander RED_REGNANT
 * @verb SCREAM
 * @tier SILVER
 * @promoted 2026-01-07
 * @mutation-score 92.96%
 * @provenance: p4-p5-silver-sprint/design.md
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5
 * 
 * Classifies mutation scores into FAILURE, GOLDILOCKS, or THEATER
 * and creates cryptographically verifiable SCREAM receipts.
 */

import { z } from 'zod';
import { createHash } from 'crypto';
import { SILVER_STANDARD, ViolationTypeSchema } from '../contracts/index.js';

// --- SCORE CLASSIFICATION ---

export const ScoreClassification = z.enum(['FAILURE', 'GOLDILOCKS', 'THEATER']);
export type ScoreClassification = z.infer<typeof ScoreClassification>;

/**
 * Classify mutation score into FAILURE, GOLDILOCKS, or THEATER
 * 
 * - FAILURE: score < 80% (tests too weak)
 * - GOLDILOCKS: 80% <= score < 99% (just right)
 * - THEATER: score >= 99% (tests are fake/trivial)
 * 
 * @param score - Mutation score (0-100)
 * @returns Classification
 */
export function classifyScore(score: number): ScoreClassification {
  if (typeof score !== 'number' || Number.isNaN(score)) {
    throw new TypeError('Score must be a valid number');
  }
  if (score < 0 || score > 100) {
    throw new RangeError('Score must be between 0 and 100');
  }
  
  if (score < SILVER_STANDARD.MIN_MUTATION_SCORE) {
    return 'FAILURE';
  }
  if (score >= SILVER_STANDARD.THEATER_THRESHOLD) {
    return 'THEATER';
  }
  return 'GOLDILOCKS';
}

// --- SCREAM RECEIPT ---

export const ScreamReceiptSchema = z.object({
  type: z.literal('SCREAM'),
  port: z.literal(4),
  timestamp: z.number(),
  violationType: z.enum(['MUTATION_FAILURE', 'THEATER']),
  score: z.number().min(0).max(100),
  artifact: z.string().min(1),
  receiptHash: z.string().regex(/^sha256:[a-f0-9]{64}$/),
});
export type ScreamReceipt = z.infer<typeof ScreamReceiptSchema>;


/**
 * Create a SCREAM receipt for a violation
 * 
 * Only creates receipts for FAILURE or THEATER scores.
 * GOLDILOCKS scores do not trigger SCREAMs.
 * 
 * @param score - Mutation score that triggered the violation
 * @param artifact - Path to the artifact being evaluated
 * @returns ScreamReceipt with cryptographic hash
 * @throws Error if score is GOLDILOCKS (no violation)
 */
export function createScreamReceipt(
  score: number,
  artifact: string
): ScreamReceipt {
  if (!artifact || artifact.trim().length === 0) {
    throw new TypeError('Artifact path cannot be empty');
  }
  
  const classification = classifyScore(score);
  
  if (classification === 'GOLDILOCKS') {
    throw new Error('Cannot create SCREAM for GOLDILOCKS score - no violation');
  }
  
  const violationType = classification === 'FAILURE' 
    ? 'MUTATION_FAILURE' as const
    : 'THEATER' as const;
  
  const content = {
    type: 'SCREAM' as const,
    port: 4 as const,
    timestamp: Date.now(),
    violationType,
    score,
    artifact: artifact.trim(),
  };
  
  // Compute SHA-256 hash of content
  const hash = createHash('sha256')
    .update(JSON.stringify(content))
    .digest('hex');
  
  return {
    ...content,
    receiptHash: `sha256:${hash}`,
  };
}

/**
 * Verify a SCREAM receipt's integrity
 * 
 * Recomputes the hash from receipt content and compares.
 * Returns false if receipt has been tampered with.
 * 
 * @param receipt - The receipt to verify
 * @returns true if receipt is valid, false if tampered
 */
export function verifyScreamReceipt(receipt: ScreamReceipt): boolean {
  const { receiptHash, ...content } = receipt;
  
  const computed = createHash('sha256')
    .update(JSON.stringify(content))
    .digest('hex');
  
  return `sha256:${computed}` === receiptHash;
}

/**
 * Check if a score requires a SCREAM
 * 
 * @param score - Mutation score to check
 * @returns true if score is FAILURE or THEATER
 */
export function requiresScream(score: number): boolean {
  const classification = classifyScore(score);
  return classification !== 'GOLDILOCKS';
}
