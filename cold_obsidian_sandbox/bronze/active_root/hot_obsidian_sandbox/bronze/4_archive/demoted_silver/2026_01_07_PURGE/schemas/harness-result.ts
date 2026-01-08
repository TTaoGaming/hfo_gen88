/**
 * Harness Result Schema - Zod Contracts
 * @provenance hfo-testing-promotion/4.1
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5
 */

import { z } from 'zod';

/** Valid harness names mapped to OBSIDIAN ports */
export const HARNESS_NAMES = [
  'SENSE', 'FUSE', 'SHAPE', 'DELIVER',
  'DISRUPT', 'IMMUNIZE', 'STORE', 'DECIDE'
] as const;

export type HarnessName = typeof HARNESS_NAMES[number];

/** Schema for harness scores */
export const ScoresSchema = z.object({
  raw: z.number().min(0),
  normalized: z.number().min(0).max(1),
});

export type Scores = z.infer<typeof ScoresSchema>;

/** Schema for harness result entry */
export const HarnessResultSchema = z.object({
  harness_id: z.number().int().min(0).max(7),
  harness_name: z.enum(HARNESS_NAMES),
  model: z.string().min(1),
  scores: ScoresSchema,
  timestamp: z.string().datetime(),
  duration_ms: z.number().int().min(0),
  prev_hash: z.string().length(16),
  hash: z.string().length(16),
  metadata: z.record(z.unknown()).optional(),
});

export type HarnessResult = z.infer<typeof HarnessResultSchema>;

/** Schema for harness result without hash fields (for creation) */
export const HarnessResultInputSchema = HarnessResultSchema.omit({
  prev_hash: true,
  hash: true,
});

export type HarnessResultInput = z.infer<typeof HarnessResultInputSchema>;

/**
 * Validate harness result data.
 * Returns { success: true, data } or { success: false, error }
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4
 */
export function validateHarnessResult(data: unknown): z.SafeParseReturnType<unknown, HarnessResult> {
  return HarnessResultSchema.safeParse(data);
}

/**
 * Validate harness result input (without hash fields).
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4
 */
export function validateHarnessResultInput(data: unknown): z.SafeParseReturnType<unknown, HarnessResultInput> {
  return HarnessResultInputSchema.safeParse(data);
}

/**
 * Serialize harness result to JSON string.
 * Validates: Requirements 2.5
 */
export function serializeResult(result: HarnessResult): string {
  return JSON.stringify(result);
}

/**
 * Parse JSON string to harness result with validation.
 * Validates: Requirements 2.5
 */
export function parseResult(json: string): z.SafeParseReturnType<unknown, HarnessResult> {
  try {
    const data = JSON.parse(json);
    return HarnessResultSchema.safeParse(data);
  } catch (e) {
    return {
      success: false,
      error: new z.ZodError([{
        code: 'custom',
        path: [],
        message: `Invalid JSON: ${e instanceof Error ? e.message : String(e)}`,
      }]),
    };
  }
}

/**
 * Check if harness_id is valid (0-7).
 * Validates: Requirements 2.1
 */
export function isValidHarnessId(id: number): boolean {
  return Number.isInteger(id) && id >= 0 && id <= 7;
}

/**
 * Check if normalized score is valid (0-1).
 * Validates: Requirements 2.2
 */
export function isValidNormalizedScore(score: number): boolean {
  return typeof score === 'number' && !isNaN(score) && score >= 0 && score <= 1;
}

/**
 * Check if timestamp is valid ISO 8601 format.
 * Validates: Requirements 2.3
 */
export function isValidTimestamp(timestamp: string): boolean {
  const result = z.string().datetime().safeParse(timestamp);
  return result.success;
}
