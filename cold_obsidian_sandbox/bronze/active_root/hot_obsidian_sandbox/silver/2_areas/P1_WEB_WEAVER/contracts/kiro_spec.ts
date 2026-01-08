import { z } from 'zod';

/**
 * KIRO SPECIFICATION v1.0
 * Focus: Interlocking Interfaces & Border Control
 * Status: DRAFT / BRONZE
 */

export const CloudEventSchema = z.object({
  specversion: z.literal('1.0'),
  type: z.string(),
  source: z.string(),
  id: z.string(),
  time: z.string().datetime().optional(),
  datacontenttype: z.string().optional(),
  dataschema: z.string().optional(),
  subject: z.string().optional(),
  data: z.unknown().optional(),
});

export const StigmergyHeadersSchema = z.object({
  origin_id: z.string().uuid(),
  causal_link: z.string().uuid().optional(),
  entropy_score: z.number().min(0).max(1),
  hive_phase: z.enum(['H', 'I', 'V', 'E']),
  commander_id: z.string(),
});

export const MCPContextSchema = z.object({
  mcp_version: z.string(),
  capabilities: z.record(z.any()),
  client: z.object({
    name: z.string(),
    version: z.string(),
  }),
});

/**
 * The Standardized HFO Interlock Envelope (Kiro Spec)
 */
export const KiroEnvelopeSchema = z.object({
  version: z.literal('kiro.1'),
  envelope_id: z.string().uuid(),
  timestamp: z.number(),
  stigmergy: StigmergyHeadersSchema,
  cloud_event: CloudEventSchema.optional(),
  mcp_context: MCPContextSchema.optional(),
  payload: z.unknown(),
  signature: z.string().optional(), // For P5 Pyre Praetorian validation
});

export type KiroEnvelope = z.infer<typeof KiroEnvelopeSchema>;
export type CloudEvent = z.infer<typeof CloudEventSchema>;
export type StigmergyHeaders = z.infer<typeof StigmergyHeadersSchema>;
export type MCPContext = z.infer<typeof MCPContextSchema>;
