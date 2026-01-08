/**
 * P1 WEB WEAVER - Zod Contracts
 * 
 * @port 1
 * @commander WEB_WEAVER
 * @verb BRIDGE / FUSE
 * @provenance: LEGENDARY_COMMANDERS_V9.md
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
 */

import { z } from 'zod';
import { 
  KiroEnvelopeSchema, 
  CloudEventSchema, 
  StigmergyHeadersSchema, 
  MCPContextSchema,
  type KiroEnvelope,
  type CloudEvent,
  type StigmergyHeaders,
  type MCPContext
} from './kiro_spec.js';

export {
  KiroEnvelopeSchema,
  CloudEventSchema,
  StigmergyHeadersSchema,
  MCPContextSchema,
};

export type {
  KiroEnvelope,
  CloudEvent,
  StigmergyHeaders,
  MCPContext,
};

// --- VERB ENUM ---

export const VerbSchema = z.enum([
  'OBSERVE',    // P0: Lidless Legion
  'BRIDGE',     // P1: Web Weaver
  'SHAPE',      // P2: Mirror Magus
  'INJECT',     // P3: Spore Storm
  'DISRUPT',    // P4: Red Regnant
  'IMMUNIZE',   // P5: Pyre Praetorian
  'ASSIMILATE', // P6: Kraken Keeper
  'NAVIGATE',   // P7: Spider Sovereign
]);

export type Verb = z.infer<typeof VerbSchema>;

// --- HFO ENVELOPE (Standard) ---

export const HfoEnvelopeSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.number(),
  sourcePort: z.number().min(0).max(7),
  targetPort: z.number().min(0).max(7),
  verb: VerbSchema,
  payload: z.unknown(),
  metadata: z.object({
    ttl: z.number().default(60000),
    priority: z.enum(['low', 'normal', 'high', 'critical']),
    correlationId: z.string().optional(),
  }),
});

export type HfoEnvelope = z.infer<typeof HfoEnvelopeSchema>;

// --- SILVER PROMOTION RECEIPT ---

export const SilverPromotionReceiptSchema = z.object({
  artifact: z.string(),
  mutationScore: z.number().min(80).max(98.99),
  timestamp: z.string(),
  hash: z.string().regex(/^sha256:[a-f0-9]{64}$/),
  strykerConfig: z.string(),
  propertyTestsPassed: z.boolean(),
  zodContractsPresent: z.boolean(),
  provenanceHeadersPresent: z.boolean(),
});

export type SilverPromotionReceipt = z.infer<typeof SilverPromotionReceiptSchema>;

// --- STIGMERGY EVENT ---

export const StigmergyEventSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.number(),
  sourcePort: z.number().min(0).max(7),
  eventType: z.enum([
    'OBSERVATION', 'BRIDGE', 'TRANSFORM', 'INJECTION',
    'VIOLATION', 'IMMUNIZATION', 'ASSIMILATION', 'DECISION',
    'PROMOTION', 'DEMOTION', 'REBIRTH'
  ]),
  payload: z.unknown(),
  correlationId: z.string().optional(),
});

export type StigmergyEvent = z.infer<typeof StigmergyEventSchema>;

// --- BRIDGE FUNCTION ---

/**
 * Bridges a message by validating it against a schema
 * Polymorphic adapter pattern for protocol bridging
 */
export function bridge<T>(message: unknown, schema: z.ZodType<T>): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(message);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
  };
}

// --- FUSE FUNCTION ---

/**
 * Fuses two schemas into a combined schema (intersection)
 * Contract composition for complex message types
 */
export function fuse<A extends z.ZodRawShape, B extends z.ZodRawShape>(
  schemaA: z.ZodObject<A>,
  schemaB: z.ZodObject<B>
): z.ZodObject<A & B> {
  return schemaA.merge(schemaB) as z.ZodObject<A & B>;
}

// --- WRAP ENVELOPE ---

/**
 * Wraps a payload in a HfoEnvelope
 */
export function wrapEnvelope(
  sourcePort: number,
  targetPort: number,
  verb: Verb,
  payload: unknown,
  priority: 'low' | 'normal' | 'high' | 'critical' = 'normal'
): HfoEnvelope {
  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    sourcePort,
    targetPort,
    verb,
    payload,
    metadata: {
      ttl: 60000,
      priority,
    },
  };
}
