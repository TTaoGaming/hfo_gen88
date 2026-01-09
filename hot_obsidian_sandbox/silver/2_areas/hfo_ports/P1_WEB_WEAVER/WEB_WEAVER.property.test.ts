/**
 * P1 WEB WEAVER - Property-Based Tests (BDD Style)
 * 
 * @port 1
 * @commander WEB_WEAVER
 * @verb BRIDGE / FUSE
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
  StigmergyEventSchema,
} from './contracts/index.js';

describe('Commander P1: Web Weaver (Property Tests)', () => {

  describe('Verb: BRIDGE (Protocol adaptation invariants)', () => {
    it('Property: Every valid message must successfully cross the bridge', () => {
      const schema = z.object({
        name: fc.string({ minLength: 1 }),
        value: fc.double({ noNaN: true }),
      });

      fc.assert(
        fc.property(
          fc.record({
            name: fc.string({ minLength: 1 }),
            value: fc.double({ noNaN: true }),
          }),
          (message) => {
            const result = bridge(message, z.object({ name: z.string(), value: z.number() }));
            expect(result.success).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property: Messages that violate the contract must be rejected', () => {
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
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Verb: FUSE (Schema composition invariants)', () => {
    it('Property: Fusing schemas preserves the union of requirements', () => {
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
  });

  describe('Stigmergy: Event Validation Invariants', () => {
    const allVerbs = ['OBSERVE', 'BRIDGE', 'SHAPE', 'INJECT', 'DISRUPT', 'IMMUNIZE', 'ASSIMILATE', 'NAVIGATE'] as const;

    it('Property: All HFO commander verbs are valid as Stigmergy event types', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.uuid(),
            timestamp: fc.nat(),
            sourcePort: fc.integer({ min: 0, max: 7 }),
            eventType: fc.constantFrom(...allVerbs),
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

    it('Property: Event source ports must be within the Commander 0-7 range', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.uuid(),
            timestamp: fc.nat(),
            sourcePort: fc.integer({ min: 8, max: 100 }), // Invalid range
            eventType: fc.constantFrom(...allVerbs),
            payload: fc.anything(),
          }),
          (event) => {
            const result = StigmergyEventSchema.safeParse(event);
            expect(result.success).toBe(false);
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
