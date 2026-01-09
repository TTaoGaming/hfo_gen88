/**
 * P2 MIRROR MAGUS - Zod Contracts
 * 
 * @port 2
 * @commander MIRROR_MAGUS
 * @verb SHAPE
 * @provenance LEGENDARY_COMMANDERS_V9.md
 * Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5
 */

import { z } from 'zod';

// --- TRANSFORMATION TYPE ---

export const TransformationTypeSchema = z.enum([
  'ONE_EURO_FILTER',  // Noise reduction
  'SCHEMA_MORPH',     // Schema transformation
  'NORMALIZE',        // Data normalization
  'DENORMALIZE',      // Data denormalization
  'AGGREGATE',        // Data aggregation
  'SPLIT',            // Data splitting
]);

export type TransformationType = z.infer<typeof TransformationTypeSchema>;

// --- TRANSFORMATION SCHEMA ---

export const TransformationSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.number(),
  type: TransformationTypeSchema,
  input: z.unknown(),
  output: z.unknown(),
  invertible: z.boolean(),
  metadata: z.object({
    latencyMs: z.number().min(0).optional(),
    lossless: z.boolean().default(true),
    parameters: z.record(z.unknown()).default({}),
  }),
});

export type Transformation = z.infer<typeof TransformationSchema>;

// --- ONE EURO FILTER CONFIG ---

export const OneEuroFilterConfigSchema = z.object({
  minCutoff: z.number().min(0).default(1.0),
  beta: z.number().min(0).default(0.007),
  dCutoff: z.number().min(0).default(1.0),
  frequency: z.number().min(0).default(120),
});

export type OneEuroFilterConfig = z.infer<typeof OneEuroFilterConfigSchema>;

// --- ONE EURO FILTER STATE ---

export const OneEuroFilterStateSchema = z.object({
  x: z.number(),
  dx: z.number(),
  lastTime: z.number(),
  initialized: z.boolean(),
});

export type OneEuroFilterState = z.infer<typeof OneEuroFilterStateSchema>;

// --- SHAPE RESULT ---

export const ShapeResultSchema = z.object({
  success: z.boolean(),
  transformation: TransformationSchema.optional(),
  error: z.string().optional(),
  canInvert: z.boolean().default(false),
});

export type ShapeResult = z.infer<typeof ShapeResultSchema>;

// --- SCHEMA MORPH ---

export const SchemaMorphSchema = z.object({
  sourceSchema: z.string(),
  targetSchema: z.string(),
  mappings: z.array(z.object({
    sourcePath: z.string(),
    targetPath: z.string(),
    transform: z.string().optional(),
  })),
  bidirectional: z.boolean().default(false),
});

export type SchemaMorph = z.infer<typeof SchemaMorphSchema>;

// --- ONE EURO FILTER IMPLEMENTATION ---

/**
 * Smoothing factor calculation for One Euro Filter
 */
export function smoothingFactor(te: number, cutoff: number): number {
  const r = 2 * Math.PI * cutoff * te;
  return r / (r + 1);
}

/**
 * Exponential smoothing
 */
export function exponentialSmoothing(a: number, x: number, xPrev: number): number {
  return a * x + (1 - a) * xPrev;
}

/**
 * Creates initial One Euro Filter state
 */
export function createFilterState(): OneEuroFilterState {
  return {
    x: 0,
    dx: 0,
    lastTime: 0,
    initialized: false,
  };
}

/**
 * Applies One Euro Filter to a value
 * Returns [filteredValue, newState]
 */
export function applyOneEuroFilter(
  value: number,
  timestamp: number,
  state: OneEuroFilterState,
  config: OneEuroFilterConfig
): [number, OneEuroFilterState] {
  if (!state.initialized) {
    return [value, {
      x: value,
      dx: 0,
      lastTime: timestamp,
      initialized: true,
    }];
  }
  
  const te = timestamp - state.lastTime;
  if (te <= 0) {
    return [state.x, state];
  }
  
  // Estimate derivative
  const edx = (value - state.x) / te;
  const adx = smoothingFactor(te, config.dCutoff);
  const dx = exponentialSmoothing(adx, edx, state.dx);
  
  // Adaptive cutoff
  const cutoff = config.minCutoff + config.beta * Math.abs(dx);
  const ax = smoothingFactor(te, cutoff);
  const x = exponentialSmoothing(ax, value, state.x);
  
  return [x, {
    x,
    dx,
    lastTime: timestamp,
    initialized: true,
  }];
}

// --- TRANSFORMATION FUNCTIONS ---

/**
 * Creates a transformation record
 */
export function createTransformation(
  type: TransformationType,
  input: unknown,
  output: unknown,
  invertible: boolean,
  parameters?: Record<string, unknown>
): Transformation {
  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    type,
    input,
    output,
    invertible,
    metadata: {
      lossless: invertible,
      parameters: parameters ?? {},
    },
  };
}

/**
 * Validates that a transformation is invertible by checking round-trip
 */
export function isRoundTripValid<T>(
  value: T,
  transform: (v: T) => T,
  inverse: (v: T) => T,
  equals: (a: T, b: T) => boolean
): boolean {
  const transformed = transform(value);
  const restored = inverse(transformed);
  return equals(value, restored);
}
