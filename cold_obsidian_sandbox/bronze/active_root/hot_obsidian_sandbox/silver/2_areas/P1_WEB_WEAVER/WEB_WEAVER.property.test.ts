/**
 * P1 WEB WEAVER - Property-Based Tests
 * 
 * @port 1
 * @commander WEB_WEAVER
 * @provenance: design.md
 * Validates: Requirements 3.6
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { z } from 'zod';
import {
  bridge,
  fuse,
  wrapEnvelope,
  HfoEnvelopeSchema,
  SilverPromotionReceiptSchema,
  StigmergyEventSchema,
} from './contracts/index.js';

// --- Property 4: Message Bridging Validation ---
// Feature: legendary-commanders-gen88, Property 4: Message Bridging Validation

describe('Property 4: Message Bridging Validation', () => {
  
  it('bridge returns success for all valid messages', () => {
    const schema = z.object({
      name: z.string(),
      value: z.number(),
    });

    fc.assert(
      fc.property(
        fc.record({
          name: fc.string({ minLength: 1 }),
          value: fc.double({ noNaN: true }),
        }),
        (message) => {
          const result = bridge(message, schema);
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data.name).toBe(message.name);
            expect(result.data.value).toBe(message.value);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('bridge returns failure for all invalid messages', () => {
    const schema = z.object({
      name: z.string(),
      value: z.number(),
    });

    fc.assert(
      fc.property(
        fc.record({
          name: fc.nat(), // Wrong type
          value: fc.string(), // Wrong type
        }),
        (message) => {
          const result = bridge(message, schema);
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.errors.length).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('bridged messages preserve data integrity', () => {
    const schema = z.object({
      id: z.string(),
      count: z.number(),
      active: z.boolean(),
    });

    fc.assert(
      fc.property(
        fc.record({
          id: fc.string({ minLength: 1 }),
          count: fc.integer(),
          active: fc.boolean(),
        }),
        (message) => {
          const result = bridge(message, schema);
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data).toEqual(message);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// --- HfoEnvelope Validation ---

describe('HfoEnvelope Schema Validation', () => {
  
  const envelopeArb = fc.record({
    id: fc.uuid(),
    timestamp: fc.nat(),
    sourcePort: fc.integer({ min: 0, max: 7 }),
    targetPort: fc.integer({ min: 0, max: 7 }),
    verb: fc.constantFrom('OBSERVE', 'BRIDGE', 'SHAPE', 'INJECT', 'DISRUPT', 'IMMUNIZE', 'ASSIMILATE', 'NAVIGATE'),
    payload: fc.anything(),
    metadata: fc.record({
      ttl: fc.nat(),
      priority: fc.constantFrom('low', 'normal', 'high', 'critical'),
      correlationId: fc.option(fc.string(), { nil: undefined }),
    }),
  });

  it('all valid envelopes pass schema validation', () => {
    fc.assert(
      fc.property(envelopeArb, (envelope) => {
        const result = HfoEnvelopeSchema.safeParse(envelope);
        expect(result.success).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('wrapEnvelope creates valid envelopes for all inputs', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 7 }),
        fc.integer({ min: 0, max: 7 }),
        fc.constantFrom('OBSERVE', 'BRIDGE', 'SHAPE', 'INJECT', 'DISRUPT', 'IMMUNIZE', 'ASSIMILATE', 'NAVIGATE'),
        fc.anything(),
        fc.constantFrom('low', 'normal', 'high', 'critical'),
        (source, target, verb, payload, priority) => {
          const envelope = wrapEnvelope(source, target, verb, payload, priority);
          const result = HfoEnvelopeSchema.safeParse(envelope);
          expect(result.success).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// --- SilverPromotionReceipt Validation ---

describe('SilverPromotionReceipt Schema Validation', () => {
  
  const hexCharArb = fc.constantFrom(...'0123456789abcdef'.split(''));
  const hex64Arb = fc.array(hexCharArb, { minLength: 64, maxLength: 64 }).map(arr => arr.join(''));

  const receiptArb = fc.record({
    artifact: fc.string({ minLength: 1 }),
    mutationScore: fc.double({ min: 80, max: 98.99, noNaN: true }),
    timestamp: fc.string({ minLength: 1 }),
    hash: hex64Arb.map(h => `sha256:${h}`),
    strykerConfig: fc.string({ minLength: 1 }),
    propertyTestsPassed: fc.boolean(),
    zodContractsPresent: fc.boolean(),
    provenanceHeadersPresent: fc.boolean(),
  });

  it('all valid receipts pass schema validation', () => {
    fc.assert(
      fc.property(receiptArb, (receipt) => {
        const result = SilverPromotionReceiptSchema.safeParse(receipt);
        expect(result.success).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('receipts with score < 80 fail validation', () => {
    fc.assert(
      fc.property(
        fc.record({
          artifact: fc.string({ minLength: 1 }),
          mutationScore: fc.double({ min: 0, max: 79.99, noNaN: true }),
          timestamp: fc.string({ minLength: 1 }),
          hash: hex64Arb.map(h => `sha256:${h}`),
          strykerConfig: fc.string({ minLength: 1 }),
          propertyTestsPassed: fc.boolean(),
          zodContractsPresent: fc.boolean(),
          provenanceHeadersPresent: fc.boolean(),
        }),
        (receipt) => {
          const result = SilverPromotionReceiptSchema.safeParse(receipt);
          expect(result.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('receipts with score > 98.99 fail validation', () => {
    fc.assert(
      fc.property(
        fc.record({
          artifact: fc.string({ minLength: 1 }),
          mutationScore: fc.double({ min: 99, max: 100, noNaN: true }),
          timestamp: fc.string({ minLength: 1 }),
          hash: hex64Arb.map(h => `sha256:${h}`),
          strykerConfig: fc.string({ minLength: 1 }),
          propertyTestsPassed: fc.boolean(),
          zodContractsPresent: fc.boolean(),
          provenanceHeadersPresent: fc.boolean(),
        }),
        (receipt) => {
          const result = SilverPromotionReceiptSchema.safeParse(receipt);
          expect(result.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// --- Fuse Schema Composition ---

describe('Fuse Schema Composition', () => {
  
  it('fused schemas accept objects with all required fields', () => {
    const schemaA = z.object({ a: z.string() });
    const schemaB = z.object({ b: z.number() });
    const fused = fuse(schemaA, schemaB);

    fc.assert(
      fc.property(
        fc.record({
          a: fc.string(),
          b: fc.double({ noNaN: true }),
        }),
        (obj) => {
          const result = fused.safeParse(obj);
          expect(result.success).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('fused schemas reject objects missing fields from either schema', () => {
    const schemaA = z.object({ a: z.string() });
    const schemaB = z.object({ b: z.number() });
    const fused = fuse(schemaA, schemaB);

    // Missing 'b'
    fc.assert(
      fc.property(
        fc.record({ a: fc.string() }),
        (obj) => {
          const result = fused.safeParse(obj);
          expect(result.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});


// --- StigmergyEvent Schema Validation (Killing Surviving Mutants) ---

describe('StigmergyEvent Schema Validation', () => {
  
  // Test ALL eventType values to kill string literal mutants
  const allEventTypes = [
    'OBSERVATION', 'BRIDGE', 'TRANSFORM', 'INJECTION',
    'VIOLATION', 'IMMUNIZATION', 'ASSIMILATION', 'DECISION',
    'PROMOTION', 'DEMOTION', 'REBIRTH'
  ] as const;

  it('validates all eventType enum values', () => {
    for (const eventType of allEventTypes) {
      const event = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        sourcePort: 1,
        eventType,
        payload: { test: 'data' },
      };
      const result = StigmergyEventSchema.safeParse(event);
      expect(result.success, `eventType "${eventType}" should be valid`).toBe(true);
    }
  });

  it('rejects invalid eventType values', () => {
    const invalidTypes = ['INVALID', '', 'observation', 'OBSERVE'];
    for (const eventType of invalidTypes) {
      const event = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        sourcePort: 1,
        eventType,
        payload: {},
      };
      const result = StigmergyEventSchema.safeParse(event);
      expect(result.success, `eventType "${eventType}" should be invalid`).toBe(false);
    }
  });

  it('validates sourcePort bounds (0-7)', () => {
    // Valid ports
    for (let port = 0; port <= 7; port++) {
      const event = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        sourcePort: port,
        eventType: 'BRIDGE' as const,
        payload: {},
      };
      const result = StigmergyEventSchema.safeParse(event);
      expect(result.success, `port ${port} should be valid`).toBe(true);
    }
    
    // Invalid ports
    for (const port of [-1, 8, 100]) {
      const event = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        sourcePort: port,
        eventType: 'BRIDGE' as const,
        payload: {},
      };
      const result = StigmergyEventSchema.safeParse(event);
      expect(result.success, `port ${port} should be invalid`).toBe(false);
    }
  });

  it('validates correlationId is optional', () => {
    const withCorrelation = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      sourcePort: 1,
      eventType: 'PROMOTION' as const,
      payload: {},
      correlationId: 'corr-123',
    };
    expect(StigmergyEventSchema.safeParse(withCorrelation).success).toBe(true);

    const withoutCorrelation = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      sourcePort: 1,
      eventType: 'DEMOTION' as const,
      payload: {},
    };
    expect(StigmergyEventSchema.safeParse(withoutCorrelation).success).toBe(true);
  });

  // Property test for all valid combinations
  it('all valid stigmergy events pass validation', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.uuid(),
          timestamp: fc.nat(),
          sourcePort: fc.integer({ min: 0, max: 7 }),
          eventType: fc.constantFrom(...allEventTypes),
          payload: fc.anything(),
          correlationId: fc.option(fc.string(), { nil: undefined }),
        }),
        (event) => {
          const result = StigmergyEventSchema.safeParse(event);
          expect(result.success).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
