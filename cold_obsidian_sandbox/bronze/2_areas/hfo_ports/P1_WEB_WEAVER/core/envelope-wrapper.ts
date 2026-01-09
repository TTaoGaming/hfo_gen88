/**
 * 🕸️ P1-SUB-2: ENVELOPE WRAPPER
 * Wraps payloads into standardized Kiro/Stigmergy envelopes with UUIDs and timestamps.
 */

import { z } from 'zod';

export const StigmergyHeadersSchema = z.object({
  source_port: z.number(),
  target_port: z.number(),
  verb: z.string(),
  integrity_hash: z.string().optional(),
});

export type StigmergyHeaders = z.infer<typeof StigmergyHeadersSchema>;

export interface KiroEnvelope<T = any> {
  version: string;
  envelope_id: string;
  timestamp: number;
  stigmergy: StigmergyHeaders;
  payload: T;
}

export class EnvelopeWrapper {
  /**
   * Standardizes a payload into a KiroEnvelope.
   */
  public wrap<T>(payload: T, headers: StigmergyHeaders): KiroEnvelope<T> {
    const validatedHeaders = StigmergyHeadersSchema.parse(headers);
    
    return {
      version: 'kiro.1.0',
      envelope_id: crypto.randomUUID(),
      timestamp: Date.now(),
      stigmergy: validatedHeaders,
      payload,
    };
  }
}
