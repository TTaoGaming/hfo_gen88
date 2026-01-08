/**
 * P1 WEB WEAVER - Main Implementation
 * 
 * @port 1
 * @commander WEB_WEAVER
 * @verb BRIDGE / FUSE
 * @provenance: LEGENDARY_COMMANDERS_V9.md
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
 */

import { z } from 'zod';
import {
  bridge,
  fuse,
  wrapEnvelope,
  HfoEnvelopeSchema,
  SilverPromotionReceiptSchema,
  StigmergyEventSchema,
  KiroEnvelopeSchema,
  type HfoEnvelope,
  type SilverPromotionReceipt,
  type StigmergyEvent,
  type Verb,
  type KiroEnvelope,
  type StigmergyHeaders,
} from './contracts/index.js';

export {
  bridge,
  fuse,
  wrapEnvelope,
  HfoEnvelopeSchema,
  SilverPromotionReceiptSchema,
  StigmergyEventSchema,
  KiroEnvelopeSchema,
};

export type {
  HfoEnvelope,
  SilverPromotionReceipt,
  StigmergyEvent,
  Verb,
  KiroEnvelope,
};

/**
 * Web Weaver API
 * Polymorphic adapter for protocol bridging and contract composition
 */
export class WebWeaver {
  /**
   * Bridge a message by validating against a schema
   */
  bridge<T>(message: unknown, schema: z.ZodType<T>): { success: true; data: T } | { success: false; errors: string[] } {
    return bridge(message, schema);
  }

  /**
   * Fuse two object schemas into one
   */
  fuse<A extends z.ZodRawShape, B extends z.ZodRawShape>(
    schemaA: z.ZodObject<A>,
    schemaB: z.ZodObject<B>
  ): z.ZodObject<A & B> {
    return fuse(schemaA, schemaB);
  }

  /**
   * Standardizes any payload into a KiroEnvelope
   * Optionally validates payload against a specific schema (Interlock)
   */
  standardize<T = unknown>(
    payload: unknown,
    stigmergy: StigmergyHeaders,
    options: { 
      cloudEvent?: any; 
      mcpContext?: any;
      payloadSchema?: z.ZodType<T>;
    } = {}
  ): KiroEnvelope {
    let finalPayload = payload;
    
    // Phase 6: Interlock Validation
    if (options.payloadSchema) {
      const result = options.payloadSchema.safeParse(payload);
      if (!result.success) {
        throw new Error(`Interlock Validation Failed: ${result.error.message}`);
      }
      finalPayload = result.data;
    }

    const envelope: KiroEnvelope = {
      version: 'kiro.1',
      envelope_id: crypto.randomUUID(),
      timestamp: Date.now(),
      stigmergy,
      payload: finalPayload,
      cloud_event: options.cloudEvent,
      mcp_context: options.mcpContext,
    };

    // Final Kiro Spec Validation
    const result = KiroEnvelopeSchema.safeParse(envelope);
    if (!result.success) {
      throw new Error(`Kiro Spec Violation: ${result.error.message}`);
    }

    return result.data;
  }

  /**
   * Wrap a payload in a HfoEnvelope
   */
  wrapEnvelope(
    sourcePort: number,
    targetPort: number,
    verb: Verb,
    payload: unknown,
    priority: 'low' | 'normal' | 'high' | 'critical' = 'normal'
  ): HfoEnvelope {
    return wrapEnvelope(sourcePort, targetPort, verb, payload, priority);
  }

  /**
   * Validate a HfoEnvelope
   */
  validateEnvelope(envelope: unknown): { success: true; data: HfoEnvelope } | { success: false; errors: string[] } {
    return this.bridge(envelope, HfoEnvelopeSchema);
  }

  /**
   * Validate a SilverPromotionReceipt
   */
  validateReceipt(receipt: unknown): { success: true; data: SilverPromotionReceipt } | { success: false; errors: string[] } {
    return this.bridge(receipt, SilverPromotionReceiptSchema);
  }

  /**
   * Validate a StigmergyEvent
   */
  validateStigmergyEvent(event: unknown): { success: true; data: StigmergyEvent } | { success: false; errors: string[] } {
    return this.bridge(event, StigmergyEventSchema);
  }
}

// Singleton instance
export const webWeaver = new WebWeaver();
