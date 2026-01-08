/**
 * P1 WEB WEAVER - Unit Tests
 * 
 * @port 1
 * @commander WEB_WEAVER
 * @provenance: design.md
 * Validates: Requirements 3.4, 3.5, 3.6
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  WebWeaver,
  bridge,
  fuse,
  wrapEnvelope,
  HfoEnvelopeSchema,
  SilverPromotionReceiptSchema,
} from './WEB_WEAVER.js';

describe('P1 Web Weaver', () => {
  const weaver = new WebWeaver();

  describe('bridge()', () => {
    it('validates valid messages against schema', () => {
      const schema = z.object({ name: z.string(), age: z.number() });
      const result = bridge({ name: 'test', age: 25 }, schema);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('test');
        expect(result.data.age).toBe(25);
      }
    });

    it('rejects invalid messages with errors', () => {
      const schema = z.object({ name: z.string(), age: z.number() });
      const result = bridge({ name: 123, age: 'invalid' }, schema);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });
  });

  describe('fuse()', () => {
    it('merges two schemas', () => {
      const schemaA = z.object({ name: z.string() });
      const schemaB = z.object({ age: z.number() });
      const fused = fuse(schemaA, schemaB);
      
      const result = fused.safeParse({ name: 'test', age: 25 });
      expect(result.success).toBe(true);
    });

    it('fused schema requires all fields', () => {
      const schemaA = z.object({ name: z.string() });
      const schemaB = z.object({ age: z.number() });
      const fused = fuse(schemaA, schemaB);
      
      const result = fused.safeParse({ name: 'test' });
      expect(result.success).toBe(false);
    });
  });

  describe('wrapEnvelope()', () => {
    it('creates valid HfoEnvelope', () => {
      const envelope = wrapEnvelope(1, 7, 'BRIDGE', { data: 'test' });
      
      expect(envelope.sourcePort).toBe(1);
      expect(envelope.targetPort).toBe(7);
      expect(envelope.verb).toBe('BRIDGE');
      expect(envelope.payload).toEqual({ data: 'test' });
      expect(envelope.metadata.priority).toBe('normal');
    });

    it('envelope passes schema validation', () => {
      const envelope = wrapEnvelope(0, 7, 'OBSERVE', { query: 'test' }, 'high');
      const result = HfoEnvelopeSchema.safeParse(envelope);
      
      expect(result.success).toBe(true);
    });
  });

  describe('WebWeaver class', () => {
    it('validateEnvelope accepts valid envelopes', () => {
      const envelope = weaver.wrapEnvelope(1, 6, 'BRIDGE', {});
      const result = weaver.validateEnvelope(envelope);
      
      expect(result.success).toBe(true);
    });

    it('validateEnvelope rejects invalid envelopes', () => {
      const result = weaver.validateEnvelope({ invalid: true });
      
      expect(result.success).toBe(false);
    });

    it('validateReceipt accepts valid receipts', () => {
      const receipt = {
        artifact: 'P4_RED_REGNANT/RED_REGNANT.ts',
        mutationScore: 88.5,
        timestamp: '2026-01-07T19:00:00Z',
        hash: 'sha256:' + 'a'.repeat(64),
        strykerConfig: 'stryker.p4.config.mjs',
        propertyTestsPassed: true,
        zodContractsPresent: true,
        provenanceHeadersPresent: true,
      };
      const result = weaver.validateReceipt(receipt);
      
      expect(result.success).toBe(true);
    });

    it('validateReceipt rejects scores below 80%', () => {
      const receipt = {
        artifact: 'test.ts',
        mutationScore: 79.99,
        timestamp: '2026-01-07T19:00:00Z',
        hash: 'sha256:' + 'a'.repeat(64),
        strykerConfig: 'stryker.config.mjs',
        propertyTestsPassed: true,
        zodContractsPresent: true,
        provenanceHeadersPresent: true,
      };
      const result = weaver.validateReceipt(receipt);
      
      expect(result.success).toBe(false);
    });

    it('validateReceipt rejects scores above 98.99%', () => {
      const receipt = {
        artifact: 'test.ts',
        mutationScore: 99,
        timestamp: '2026-01-07T19:00:00Z',
        hash: 'sha256:' + 'a'.repeat(64),
        strykerConfig: 'stryker.config.mjs',
        propertyTestsPassed: true,
        zodContractsPresent: true,
        provenanceHeadersPresent: true,
      };
      const result = weaver.validateReceipt(receipt);
      
      expect(result.success).toBe(false);
    });
  });
});
