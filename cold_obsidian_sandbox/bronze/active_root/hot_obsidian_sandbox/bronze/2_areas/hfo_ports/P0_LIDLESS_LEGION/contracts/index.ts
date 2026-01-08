/**
 * P0 LIDLESS LEGION - Zod Contracts
 * 
 * @port 0
 * @commander LIDLESS_LEGION
 * @verb OBSERVE / SENSE
 * @provenance: LEGENDARY_COMMANDERS_V9.md
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7
 */

import { z } from 'zod';

// --- OBSERVATION SOURCE ---

export const ObservationSourceSchema = z.enum([
  'TAVILY',      // Web search
  'PERPLEXITY',  // AI search
  'OSINT',       // Open source intelligence
  'MEDIAPIPE',   // Gesture recognition
  'WEBCAM',      // Raw video input
  'FILE_SYSTEM', // Local file observation
  'STIGMERGY',   // Blackboard observation
]);

export type ObservationSource = z.infer<typeof ObservationSourceSchema>;

// --- OBSERVATION SCHEMA ---

export const ObservationSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.number(),
  source: ObservationSourceSchema,
  query: z.string().optional(),
  data: z.unknown(),
  confidence: z.number().min(0).max(1).default(1),
  metadata: z.object({
    latencyMs: z.number().min(0).optional(),
    sourceUrl: z.string().url().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

export type Observation = z.infer<typeof ObservationSchema>;

// --- OBSERVATION BATCH ---

export const ObservationBatchSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.number(),
  observations: z.array(ObservationSchema),
  correlationId: z.string().optional(),
});

export type ObservationBatch = z.infer<typeof ObservationBatchSchema>;

// --- SENSE RESULT ---

export const SenseResultSchema = z.object({
  success: z.boolean(),
  observation: ObservationSchema.optional(),
  error: z.string().optional(),
  retryable: z.boolean().default(false),
});

export type SenseResult = z.infer<typeof SenseResultSchema>;

// --- OBSERVATION FILTER ---

export const ObservationFilterSchema = z.object({
  sources: z.array(ObservationSourceSchema).optional(),
  minConfidence: z.number().min(0).max(1).optional(),
  tags: z.array(z.string()).optional(),
  since: z.number().optional(),
  limit: z.number().int().min(1).max(1000).default(100),
});

export type ObservationFilter = z.infer<typeof ObservationFilterSchema>;

// --- VERB ENFORCEMENT ---

const ALLOWED_VERBS = ['OBSERVE', 'SENSE'] as const;
const FORBIDDEN_VERBS = ['SHAPE', 'STORE', 'DECIDE', 'INJECT', 'DISRUPT', 'IMMUNIZE', 'BRIDGE', 'ASSIMILATE'] as const;

/**
 * Validates that P0 only uses allowed verbs (separation of concerns)
 */
export function isAllowedVerb(verb: string): boolean {
  return (ALLOWED_VERBS as readonly string[]).includes(verb);
}

/**
 * Checks if a verb is forbidden for P0
 */
export function isForbiddenVerb(verb: string): boolean {
  return (FORBIDDEN_VERBS as readonly string[]).includes(verb);
}

// --- OBSERVATION FUNCTIONS ---

/**
 * Creates a new observation
 */
export function createObservation(
  source: ObservationSource,
  data: unknown,
  options?: {
    query?: string;
    confidence?: number;
    latencyMs?: number;
    sourceUrl?: string;
    tags?: string[];
  }
): Observation {
  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    source,
    query: options?.query,
    data,
    confidence: options?.confidence ?? 1,
    metadata: {
      latencyMs: options?.latencyMs,
      sourceUrl: options?.sourceUrl,
      tags: options?.tags ?? [],
    },
  };
}

/**
 * Filters observations based on criteria
 */
export function filterObservations(observations: Observation[], filter: ObservationFilter): Observation[] {
  let results = observations;
  
  // Filter by source
  if (filter.sources && filter.sources.length > 0) {
    results = results.filter(o => filter.sources!.includes(o.source));
  }
  
  // Filter by confidence
  if (filter.minConfidence !== undefined) {
    results = results.filter(o => o.confidence >= filter.minConfidence!);
  }
  
  // Filter by tags
  if (filter.tags && filter.tags.length > 0) {
    results = results.filter(o => 
      filter.tags!.every(tag => o.metadata.tags.includes(tag))
    );
  }
  
  // Filter by timestamp
  if (filter.since !== undefined) {
    results = results.filter(o => o.timestamp >= filter.since!);
  }
  
  // Apply limit
  return results.slice(0, filter.limit);
}

/**
 * Merges multiple observations into a batch
 */
export function batchObservations(observations: Observation[], correlationId?: string): ObservationBatch {
  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    observations,
    correlationId,
  };
}
