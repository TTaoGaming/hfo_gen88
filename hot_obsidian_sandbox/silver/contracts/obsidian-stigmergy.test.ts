/**
 * OBSIDIAN Stigmergy Format - Property Tests
 * 
 * SILVER PROMOTION: 2026-01-06
 * WARLOCK APPROVAL: EXPLICIT_WARLOCK_APPROVAL from TTao
 * 
 * Tests the Gen 88 stigmergy format for correctness properties.
 * Uses fast-check for property-based testing.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  ObsidianPort,
  ObsidianLayer,
  OBSIDIAN_PORTS,
  OBSIDIAN_VERBS,
  OBSIDIAN_LAYERS,
  PORT_TO_PHASE,
  validateObsidianEvent,
  validatePortVerbConsistency,
  validatePortPhaseConsistency,
  validateTypeVerbConsistency,
  validateSourcePortConsistency,
  validateHiveGenConsistency,
  createObsidianEvent,
  toJsonl,
  fromJsonl,
  generateTraceparent,
} from './obsidian-stigmergy';

// === Arbitraries (Generators) ===

const portArb = fc.integer({ min: 0, max: 7 }) as fc.Arbitrary<ObsidianPort>;
const genArb = fc.integer({ min: 1, max: 1000 });
const layerArb = fc.constantFrom(...OBSIDIAN_LAYERS) as fc.Arbitrary<ObsidianLayer>;
const domainArb = fc.stringMatching(/^[a-z]{3,10}$/);
const actionArb = fc.stringMatching(/^[a-z]{3,10}$/);

const dataArb = fc.dictionary(
  fc.string({ minLength: 1, maxLength: 20 }),
  fc.oneof(fc.string(), fc.integer(), fc.boolean(), fc.constant(null))
);

// Generate a valid OBSIDIAN event
const validEventArb = fc.tuple(portArb, domainArb, actionArb, genArb, layerArb, dataArb)
  .map(([port, domain, action, gen, layer, data]) => 
    createObsidianEvent(port, domain, action, gen, layer, data as Record<string, unknown>)
  );

// === Property Tests ===

describe('OBSIDIAN Stigmergy Format - Property Tests', () => {
  
  describe('Property 1: Port-Verb Consistency (OBSIDIAN Mapping)', () => {
    it('port and verb must be consistent for all generated events', () => {
      fc.assert(
        fc.property(validEventArb, (event) => {
          const expectedVerb = OBSIDIAN_PORTS[event.obsidianport];
          expect(event.obsidianverb).toBe(expectedVerb);
          expect(validatePortVerbConsistency(event)).toBe(true);
        }),
        { numRuns: 25 }
      );
    });

    it('should reject events with mismatched port-verb', () => {
      fc.assert(
        fc.property(portArb, genArb, layerArb, (port, gen, layer) => {
          const wrongVerb = OBSIDIAN_VERBS[(port + 1) % 8];
          const event = createObsidianEvent(port, 'test', 'action', gen, layer, {});
          const mutatedEvent = { ...event, obsidianverb: wrongVerb };
          expect(validatePortVerbConsistency(mutatedEvent)).toBe(false);
        }),
        { numRuns: 25 }
      );
    });
  });

  describe('Property 2: Port-Phase Consistency (HIVE Mapping)', () => {
    it('port and phase must be consistent for all generated events', () => {
      fc.assert(
        fc.property(validEventArb, (event) => {
          const expectedPhase = PORT_TO_PHASE[event.obsidianport];
          expect(event.obsidianphase).toBe(expectedPhase);
        }),
        { numRuns: 25 }
      );
    });
  });

  describe('Property 3: Type-Verb Consistency', () => {
    it('event type verb must match obsidianverb', () => {
      fc.assert(
        fc.property(validEventArb, (event) => {
          const verbInType = event.type.split('.')[1].toUpperCase();
          expect(verbInType).toBe(event.obsidianverb);
          expect(validateTypeVerbConsistency(event)).toBe(true);
        }),
        { numRuns: 25 }
      );
    });
  });

  describe('Property 4: Source-Port Consistency', () => {
    it('source URI port must match obsidianport', () => {
      fc.assert(
        fc.property(validEventArb, (event) => {
          const portInSource = parseInt(event.source.split('/port/')[1], 10);
          expect(portInSource).toBe(event.obsidianport);
          expect(validateSourcePortConsistency(event)).toBe(true);
        }),
        { numRuns: 25 }
      );
    });
  });

  describe('Property 5: Hive-Gen Consistency', () => {
    it('hive generation must match obsidiangen', () => {
      fc.assert(
        fc.property(validEventArb, (event) => {
          const genInHive = parseInt(event.obsidianhive.replace('HFO_GEN', ''), 10);
          expect(genInHive).toBe(event.obsidiangen);
          expect(validateHiveGenConsistency(event)).toBe(true);
        }),
        { numRuns: 25 }
      );
    });
  });

  describe('Property 6: Round-Trip Serialization', () => {
    it('toJsonl then fromJsonl produces equivalent event', () => {
      fc.assert(
        fc.property(validEventArb, (event) => {
          const jsonl = toJsonl(event);
          const parsed = fromJsonl(jsonl);
          
          expect(parsed.specversion).toBe(event.specversion);
          expect(parsed.id).toBe(event.id);
          expect(parsed.source).toBe(event.source);
          expect(parsed.type).toBe(event.type);
          expect(parsed.obsidianport).toBe(event.obsidianport);
          expect(parsed.obsidianverb).toBe(event.obsidianverb);
          expect(parsed.obsidiangen).toBe(event.obsidiangen);
          expect(parsed.obsidianhive).toBe(event.obsidianhive);
          expect(parsed.obsidianphase).toBe(event.obsidianphase);
          expect(parsed.obsidianlayer).toBe(event.obsidianlayer);
        }),
        { numRuns: 25 }
      );
    });
  });

  describe('Property 7: Schema Validation Completeness', () => {
    it('factory-created events always pass schema validation', () => {
      fc.assert(
        fc.property(validEventArb, (event) => {
          const result = validateObsidianEvent(event);
          expect(result.valid).toBe(true);
          expect(result.errors).toHaveLength(0);
        }),
        { numRuns: 25 }
      );
    });
  });

  describe('Property 8: Traceparent Format', () => {
    it('traceparent follows W3C format', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 1000 }), () => {
          const traceparent = generateTraceparent();
          const parts = traceparent.split('-');
          
          expect(parts).toHaveLength(4);
          expect(parts[0]).toBe('00');
          expect(parts[1]).toHaveLength(32);
          expect(parts[2]).toHaveLength(16);
          expect(parts[3]).toHaveLength(2);
          expect(parts[1]).toMatch(/^[a-f0-9]+$/);
          expect(parts[2]).toMatch(/^[a-f0-9]+$/);
        }),
        { numRuns: 25 }
      );
    });
  });
});

// === Mutation Tests (Negative Cases) ===

describe('OBSIDIAN Stigmergy Format - Mutation Tests', () => {
  
  describe('Mutation 1: Invalid Port Values', () => {
    it('should reject port values outside 0-7', () => {
      const invalidPorts = [-1, 8, 100, -100];
      
      for (const port of invalidPorts) {
        const event = {
          specversion: '1.0',
          id: crypto.randomUUID(),
          source: `hfo://gen88/bronze/port/0`,
          type: 'obsidian.observe.test.action',
          time: new Date().toISOString(),
          datacontenttype: 'application/json',
          traceparent: generateTraceparent(),
          obsidianport: port,
          obsidianverb: 'OBSERVE',
          obsidiangen: 88,
          obsidianhive: 'HFO_GEN88',
          obsidianphase: 'H',
          obsidianlayer: 'bronze',
          data: {},
        };
        
        const result = validateObsidianEvent(event);
        expect(result.valid).toBe(false);
      }
    });
  });

  describe('Mutation 2: Invalid Verb Values', () => {
    it('should reject verbs not in OBSIDIAN set', () => {
      const invalidVerbs = ['SENSE', 'FUSE', 'STORE', 'DECIDE', 'ATTACK', 'DELETE'];
      
      for (const verb of invalidVerbs) {
        const event = {
          specversion: '1.0',
          id: crypto.randomUUID(),
          source: `hfo://gen88/bronze/port/0`,
          type: 'obsidian.observe.test.action',
          time: new Date().toISOString(),
          datacontenttype: 'application/json',
          traceparent: generateTraceparent(),
          obsidianport: 0,
          obsidianverb: verb,
          obsidiangen: 88,
          obsidianhive: 'HFO_GEN88',
          obsidianphase: 'H',
          obsidianlayer: 'bronze',
          data: {},
        };
        
        const result = validateObsidianEvent(event);
        expect(result.valid).toBe(false);
      }
    });
  });

  describe('Mutation 3: Mismatched Port-Verb', () => {
    it('should reject events where port does not match verb', () => {
      const event = createObsidianEvent(0, 'test', 'action', 88, 'bronze', {});
      const mutated = { ...event, obsidianverb: 'BRIDGE' as const };
      
      const result = validateObsidianEvent(mutated);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Port 0 must use verb OBSERVE'))).toBe(true);
    });
  });

  describe('Mutation 4: Mismatched Port-Phase', () => {
    it('should reject events where port does not match phase', () => {
      const event = createObsidianEvent(0, 'test', 'action', 88, 'bronze', {});
      const mutated = { ...event, obsidianphase: 'E' as const };
      
      const result = validateObsidianEvent(mutated);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Port 0 must use phase H'))).toBe(true);
    });
  });

  describe('Mutation 5: Invalid Traceparent Format', () => {
    it('should reject malformed traceparent', () => {
      const invalidTraceparents = [
        'invalid',
        '00-abc-def-01',
        '01-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa-bbbbbbbbbbbbbbbb-01',
        '00-GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG-bbbbbbbbbbbbbbbb-01',
      ];
      
      for (const traceparent of invalidTraceparents) {
        const event = {
          specversion: '1.0' as const,
          id: crypto.randomUUID(),
          source: `hfo://gen88/bronze/port/0`,
          type: 'obsidian.observe.test.action',
          time: new Date().toISOString(),
          datacontenttype: 'application/json' as const,
          traceparent,
          obsidianport: 0 as const,
          obsidianverb: 'OBSERVE' as const,
          obsidiangen: 88,
          obsidianhive: 'HFO_GEN88',
          obsidianphase: 'H' as const,
          obsidianlayer: 'bronze' as const,
          data: {},
        };
        
        const result = validateObsidianEvent(event);
        expect(result.valid).toBe(false);
      }
    });
  });

  describe('Mutation 6: Invalid Source URI', () => {
    it('should reject malformed source URIs', () => {
      const invalidSources = [
        'invalid',
        'hfo://gen88/bronze',
        'hfo://gen88/bronze/port/9',
        'http://gen88/bronze/port/0',
        'hfo://gen88/platinum/port/0',
      ];
      
      for (const source of invalidSources) {
        const event = {
          specversion: '1.0' as const,
          id: crypto.randomUUID(),
          source,
          type: 'obsidian.observe.test.action',
          time: new Date().toISOString(),
          datacontenttype: 'application/json' as const,
          traceparent: generateTraceparent(),
          obsidianport: 0 as const,
          obsidianverb: 'OBSERVE' as const,
          obsidiangen: 88,
          obsidianhive: 'HFO_GEN88',
          obsidianphase: 'H' as const,
          obsidianlayer: 'bronze' as const,
          data: {},
        };
        
        const result = validateObsidianEvent(event);
        expect(result.valid).toBe(false);
      }
    });
  });

  describe('Mutation 7: Invalid Event Type Format', () => {
    it('should reject malformed event types', () => {
      const invalidTypes = [
        'invalid',
        'obsidian.observe',
        'obsidian.OBSERVE.test.action',
        'cloudevents.observe.test.action',
        'obsidian.attack.test.action',
      ];
      
      for (const type of invalidTypes) {
        const event = {
          specversion: '1.0' as const,
          id: crypto.randomUUID(),
          source: `hfo://gen88/bronze/port/0`,
          type,
          time: new Date().toISOString(),
          datacontenttype: 'application/json' as const,
          traceparent: generateTraceparent(),
          obsidianport: 0 as const,
          obsidianverb: 'OBSERVE' as const,
          obsidiangen: 88,
          obsidianhive: 'HFO_GEN88',
          obsidianphase: 'H' as const,
          obsidianlayer: 'bronze' as const,
          data: {},
        };
        
        const result = validateObsidianEvent(event);
        expect(result.valid).toBe(false);
      }
    });
  });

  describe('Mutation 8: Mismatched Hive-Gen', () => {
    it('should reject events where hive does not match gen', () => {
      const event = createObsidianEvent(0, 'test', 'action', 88, 'bronze', {});
      const mutated = { ...event, obsidianhive: 'HFO_GEN99' };
      
      const result = validateObsidianEvent(mutated);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Hive generation must match'))).toBe(true);
    });
  });
});

// === Edge Case Tests ===

describe('OBSIDIAN Stigmergy Format - Edge Cases', () => {
  
  it('should handle empty data payload', () => {
    const event = createObsidianEvent(0, 'test', 'action', 88, 'bronze', {});
    const result = validateObsidianEvent(event);
    expect(result.valid).toBe(true);
  });

  it('should handle complex nested data payload', () => {
    const complexData = {
      nested: { deep: { value: 123 } },
      array: [1, 2, 3],
      mixed: [{ a: 1 }, 'string', null],
    };
    const event = createObsidianEvent(0, 'test', 'action', 88, 'bronze', complexData);
    const result = validateObsidianEvent(event);
    expect(result.valid).toBe(true);
  });

  it('should handle all 8 ports correctly', () => {
    for (let port = 0; port <= 7; port++) {
      const event = createObsidianEvent(port as ObsidianPort, 'test', 'action', 88, 'bronze', {});
      const result = validateObsidianEvent(event);
      expect(result.valid).toBe(true);
      expect(event.obsidianverb).toBe(OBSIDIAN_PORTS[port as ObsidianPort]);
      expect(event.obsidianphase).toBe(PORT_TO_PHASE[port]);
    }
  });

  it('should handle all 3 layers correctly', () => {
    for (const layer of OBSIDIAN_LAYERS) {
      const event = createObsidianEvent(0, 'test', 'action', 88, layer, {});
      const result = validateObsidianEvent(event);
      expect(result.valid).toBe(true);
      expect(event.obsidianlayer).toBe(layer);
    }
  });

  it('should handle BDD fields (given/when/then)', () => {
    const event = createObsidianEvent(0, 'test', 'action', 88, 'bronze', {}, {
      given: 'a file exists',
      when: 'observed',
      then: 'metadata extracted',
    });
    const result = validateObsidianEvent(event);
    expect(result.valid).toBe(true);
    expect(event.given).toBe('a file exists');
    expect(event.when).toBe('observed');
    expect(event.then).toBe('metadata extracted');
  });
});
