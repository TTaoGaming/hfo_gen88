/**
 * P5 PYRE PRAETORIAN - Zod Contracts
 * 
 * @port 5
 * @commander PYRE_PRAETORIAN
 * @verb DANCE / DIE / REBORN
 * @provenance: LEGENDARY_COMMANDERS_V9.md
 * Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5
 */

import { z } from 'zod';

// --- PHOENIX IMMUNITY CERTIFICATE ---

export const PhoenixImmunityCertificateSchema = z.object({
  id: z.string().uuid(),
  artifact: z.string(),
  issuedAt: z.string(), // ISO datetime string
  expiresAt: z.string().optional(),
  attackVectorDefended: z.string(),
  hash: z.string().regex(/^sha256:[a-f0-9]{64}$/),
  generation: z.number(),
});

export type PhoenixImmunityCertificate = z.infer<typeof PhoenixImmunityCertificateSchema>;

// --- DANCE RESULT ---

export const DanceOutcomeSchema = z.enum(['REBIRTH', 'QUARANTINE', 'PENDING']);

export const DanceResultSchema = z.object({
  artifact: z.string(),
  outcome: DanceOutcomeSchema,
  iterations: z.number().min(1),
  violationsResolved: z.number().min(0),
  violationsRemaining: z.number().min(0),
  certificate: PhoenixImmunityCertificateSchema.optional(),
  quarantinePath: z.string().optional(),
  timestamp: z.number(),
});

export type DanceResult = z.infer<typeof DanceResultSchema>;

// --- QUARANTINE ENTRY ---

export const QuarantineEntrySchema = z.object({
  id: z.string().uuid(),
  artifact: z.string(),
  originalPath: z.string(),
  quarantinePath: z.string(),
  reason: z.string(),
  timestamp: z.number(),
  violations: z.array(z.object({
    type: z.string(),
    message: z.string(),
  })),
});

export type QuarantineEntry = z.infer<typeof QuarantineEntrySchema>;

// --- REBIRTH EVENT ---

export const RebirthEventSchema = z.object({
  id: z.string().uuid(),
  artifact: z.string(),
  fromQuarantine: z.string(),
  toPath: z.string(),
  timestamp: z.number(),
  certificate: PhoenixImmunityCertificateSchema,
});

export type RebirthEvent = z.infer<typeof RebirthEventSchema>;

// --- PYRE DANCE STATE ---

export const PyreDanceStateSchema = z.object({
  artifact: z.string(),
  iteration: z.number().min(0),
  maxIterations: z.number().min(1).default(10),
  status: z.enum(['DANCING', 'COMPLETED', 'QUARANTINED']),
  violations: z.array(z.object({
    type: z.string(),
    message: z.string(),
    resolved: z.boolean(),
  })),
});

export type PyreDanceState = z.infer<typeof PyreDanceStateSchema>;

// --- DANCE PROTOCOL FUNCTIONS ---

/**
 * Determines if the Pyre Dance should terminate
 */
export function shouldTerminateDance(state: PyreDanceState): boolean {
  // Terminate if all violations resolved (rebirth)
  const allResolved = state.violations.every(v => v.resolved);
  if (allResolved) return true;
  
  // Terminate if max iterations reached (quarantine)
  if (state.iteration >= state.maxIterations) return true;
  
  return false;
}

/**
 * Determines the outcome of a completed dance
 */
export function getDanceOutcome(state: PyreDanceState): 'REBIRTH' | 'QUARANTINE' {
  const allResolved = state.violations.every(v => v.resolved);
  return allResolved ? 'REBIRTH' : 'QUARANTINE';
}

/**
 * Creates a new dance state for an artifact
 */
export function createDanceState(artifact: string, violations: Array<{ type: string; message: string }>): PyreDanceState {
  return {
    artifact,
    iteration: 0,
    maxIterations: 10,
    status: 'DANCING',
    violations: violations.map(v => ({ ...v, resolved: false })),
  };
}

/**
 * Advances the dance by one iteration
 */
export function advanceDance(state: PyreDanceState, resolvedIndices: number[]): PyreDanceState {
  const newViolations = state.violations.map((v, i) => ({
    ...v,
    resolved: v.resolved || resolvedIndices.includes(i),
  }));
  
  const newIteration = state.iteration + 1;
  const shouldTerminate = shouldTerminateDance({ ...state, violations: newViolations, iteration: newIteration });
  
  return {
    ...state,
    iteration: newIteration,
    violations: newViolations,
    status: shouldTerminate 
      ? (newViolations.every(v => v.resolved) ? 'COMPLETED' : 'QUARANTINED')
      : 'DANCING',
  };
}
