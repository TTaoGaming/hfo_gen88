/**
 * P1 WEB WEAVER - Unit Tests (BDD Style)
 * 
 * @port 1
 * @commander WEB_WEAVER
 * @verb BRIDGE / FUSE
 * @provenance: LEGENDARY_COMMANDERS_V9.md
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
  StigmergyEventSchema,
} from './WEB_WEAVER.js';

describe('Commander P1: Web Weaver (WebWeaver)', () => {
  const weaver = new WebWeaver();

  describe('Verb: BRIDGE (Protocol Adaptation)', () => {
    it('Scenario: Validating a well-formed payload against a contract', () => {
      // Given: A target contract for a person
      const schema = z.object({ name: z.string(), age: z.number() });
      
      // When: A valid person object is bridged
      const result = bridge({ name: 'test', age: 25 }, schema);
      
      // Then: The operation should succeed and return the parsed data
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ name: 'test', age: 25 });
      }
    });

    it('Scenario: Validating a malformed payload against a contract', () => {
      // Given: A target contract for a person
      const schema = z.object({ name: z.string(), age: z.number() });
      
      // When: An invalid person object (string instead of number) is bridged
      const result = bridge({ name: 'test', age: 'wrong' }, schema);
      
      // Then: The operation should fail with error details
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toContain('age: Expected number, received string');
      }
    });
  });

  describe('Verb: FUSE (Schema Composition)', () => {
    it('Scenario: Merging two distinct identity contracts', () => {
      // Given: Two separate schemas
      const schemaA = z.object({ name: z.string() });
      const schemaB = z.object({ age: z.number() });
      
      // When: They are fused together
      const fused = fuse(schemaA, schemaB);
      
      // Then: The resulting schema should require all fields from both parents
      const result = fused.safeParse({ name: 'test', age: 25 });
      expect(result.success).toBe(true);
    });

    it('Scenario: Fused schema rejects partial matches', () => {
      // Given: Two separate schemas
      const schemaA = z.object({ name: z.string() });
      const schemaB = z.object({ age: z.number() });
      
      // When: They are fused together
      const fused = fuse(schemaA, schemaB);
      
      // Then: A partial object (missing 'age') should fail validation
      const result = fused.safeParse({ name: 'test' });
      expect(result.success).toBe(false);
    });
  });

  describe('Behavior: Message Wrapping & HfoEnvelope', () => {
    it('Scenario: Wrapping a payload with metadata', () => {
      // Given: A source, target, and payload
      const source = 1;
      const target = 7;
      const payload = { data: 'interlock' };
      
      // When: The Web Weaver wraps the envelope
      const envelope = wrapEnvelope(source, target, 'BRIDGE', payload);
      
      // Then: It should contain all necessary routing and priority metadata
      expect(envelope.sourcePort).toBe( source );
      expect(envelope.targetPort).toBe( target );
      expect(envelope.verb).toBe('BRIDGE');
      expect(envelope.payload).toEqual({ data: 'interlock' });
      expect(envelope.metadata.priority).toBe('normal');
    });

    it('Scenario: Validating an HfoEnvelope border crossing', () => {
      // Given: A raw object pretending to be an HfoEnvelope
      const raw = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        sourcePort: 0,
        targetPort: 7,
        verb: 'OBSERVE',
        payload: { query: 'test' },
        metadata: {
          ttl: 60000,
          priority: 'high'
        }
      };
      
      // When: The Web Weaver validates the envelope at the border
      const result = weaver.validateEnvelope(raw);
      
      // Then: The envelope should be accepted
      expect(result.success).toBe(true);
    });
  });

  describe('Behavior: Stigmergy Event Logging', () => {
    it('Scenario: Validating a Stigmergy event for the Blackboard', () => {
      // Given: A valid event cross-linking PORT 1 and PORT 6
      const event = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        sourcePort: 1,
        eventType: 'BRIDGE',
        payload: { action: 'adapt' }
      };
      
      // When: The Web Weaver validates the event
      const result = weaver.validateStigmergyEvent(event);
      
      // Then: The event should be compliant with the Stigmergy schema
      expect(result.success).toBe(true);
    });
  });
});
