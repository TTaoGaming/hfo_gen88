/**
 * OBSIDIAN Stigmergy Format - Property Tests
 * 
 * Tests the Gen 88 stigmergy format for correctness properties.
 * Uses fast-check for property-based testing.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  ObsidianStigmergySchema,
  ObsidianStigmergy,
  ObsidianPort,
  ObsidianVerb,
  ObsidianPhase,
  ObsidianLayer,
  OBSIDIAN_PORTS,
  OBSIDIAN_VERBS,
  OBSIDIAN_PHASES,
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
  parseJsonlFile,
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
    /**
     * For any valid port (0-7), the verb MUST match the OBSIDIAN mapping:
     * 0=OBSERVE, 1=BRIDGE, 2=SHAPE, 3=INJECT, 4=DISRUPT, 5=IMMUNIZE, 6=ASSIMILATE, 7=NAVIGATE
     */
    it('port and verb must be consistent for all generated events', () => {
      fc.assert(
        fc.property(validEventArb, (event) => {
          const expectedVerb = OBSIDIAN_PORTS[event.obsidianport];
          expect(event.obsidianverb).toBe(expectedVerb);
          expect(validatePortVerbConsistency(event)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should reject events with mismatched port-verb', () => {
      fc.assert(
        fc.property(portArb, genArb, layerArb, (port, gen, layer) => {
          // Create event with wrong verb
          const wrongVerb = OBSIDIAN_VERBS[(port + 1) % 8];
          const event = createObsidianEvent(port, 'test', 'action', gen, layer, {});
          // Mutate to wrong verb
          const mutatedEvent = { ...event, obsidianverb: wrongVerb };
          expect(validatePortVerbConsistency(mutatedEvent)).toBe(false);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 2: Port-Phase Consistency (HIVE Mapping)', () => {
    /**
     * For any valid port, the phase MUST match the HIVE mapping:
     * H (Hunt): Ports 0, 7
     * I (Interlock): Ports 1, 6
     * V (Validate): Ports 2, 5
     * E (Evolve): Ports 3, 4
     */
    it('port and phase must be consistent for all generated events', () => {
      fc.assert(
        fc.property(validEventArb, (event) => {
          const expectedPhase = PORT_TO_PHASE[event.obsidianport];
          expect(event.obsidianphase).toBe(expectedPhase);
          expect(validatePortPhaseConsistency(event)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });
  });


  describe('Property 3: Type-Verb Consistency', () => {
    /**
     * For any event, the verb in the type string must match obsidianverb
     * Type format: obsidian.{verb}.{domain}.{action}
     */
    it('event type verb must match obsidianverb', () => {
      fc.assert(
        fc.property(validEventArb, (event) => {
          const verbInType = event.type.split('.')[1].toUpperCase();
          expect(verbInType).toBe(event.obsidianverb);
          expect(validateTypeVerbConsistency(event)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 4: Source-Port Consistency', () => {
    /**
     * For any event, the port in the source URI must match obsidianport
     * Source format: hfo://gen{N}/{layer}/port/{port}
     */
    it('source URI port must match obsidianport', () => {
      fc.assert(
        fc.property(validEventArb, (event) => {
          const portInSource = parseInt(event.source.split('/port/')[1], 10);
          expect(portInSource).toBe(event.obsidianport);
          expect(validateSourcePortConsistency(event)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 5: Hive-Gen Consistency', () => {
    /**
     * For any event, the generation in obsidianhive must match obsidiangen
     * Hive format: HFO_GEN{N}
     */
    it('hive generation must match obsidiangen', () => {
      fc.assert(
        fc.property(validEventArb, (event) => {
          const genInHive = parseInt(event.obsidianhive.replace('HFO_GEN', ''), 10);
          expect(genInHive).toBe(event.obsidiangen);
          expect(validateHiveGenConsistency(event)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 6: Round-Trip Serialization', () => {
    /**
     * For any valid event, serializing to JSONL and parsing back
     * must produce an equivalent event
     */
    it('toJsonl then fromJsonl produces equivalent event', () => {
      fc.assert(
        fc.property(validEventArb, (event) => {
          const jsonl = toJsonl(event);
          const parsed = fromJsonl(jsonl);
          
          // Check all fields match
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
        { numRuns: 100 }
      );
    });
  });

  describe('Property 7: Schema Validation Completeness', () => {
    /**
     * For any valid event created by the factory, schema validation must pass
     */
    it('factory-created events always pass schema validation', () => {
      fc.assert(
        fc.property(validEventArb, (event) => {
          const result = validateObsidianEvent(event);
          expect(result.valid).toBe(true);
          expect(result.errors).toHaveLength(0);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 8: Traceparent Format', () => {
    /**
     * Generated traceparent must follow W3C format:
     * 00-{32-hex-trace-id}-{16-hex-span-id}-{2-digit-flags}
     */
    it('traceparent follows W3C format', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 1000 }), () => {
          const traceparent = generateTraceparent();
          const parts = traceparent.split('-');
          
          expect(parts).toHaveLength(4);
          expect(parts[0]).toBe('00'); // version
          expect(parts[1]).toHaveLength(32); // trace-id
          expect(parts[2]).toHaveLength(16); // span-id
          expect(parts[3]).toHaveLength(2); // flags
          
          // All hex characters
          expect(parts[1]).toMatch(/^[a-f0-9]+$/);
          expect(parts[2]).toMatch(/^[a-f0-9]+$/);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Boundary: Invalid Formats', () => {
    it('should reject invalid source format', () => {
      const event = createObsidianEvent(0, 'hunt', 'research', 88, 'bronze', {});
      const invalidSources = [
        'http://github.com',
        'hfo://gen88',
        'hfo://gen88/bronze',
        'hfo://gen88/bronze/port/8', // port out of range
        'hfo://gen88/gold/port/0',   // layer mismatch
        'prefix_hfo://gen88/bronze/port/0', // anchor test
        'hfo://gen88/bronze/port/0_suffix', // anchor test
      ];

      invalidSources.forEach(source => {
        const invalidEvent = { ...event, source };
        const result = validateObsidianEvent(invalidEvent);
        expect(result.valid).toBe(false);
        // Kill error push mutants by checking messages
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors.some(e => e.includes('source') || e.includes('Source'))).toBe(true);
      });
    });

    it('should reject invalid type format', () => {
      const event = createObsidianEvent(0, 'hunt', 'research', 88, 'bronze', {});
      const invalidTypes = [
        'invalid.type',
        'obsidian.SENSE', // missing domain/action
        'obsidian.SENSE.port0', // missing action
        'obsidian.FUSE.hunt.test', // verb mismatch (FUSE vs SENSE)
        'prefix.obsidian.SENSE.hunt.test', // anchor test
        'obsidian.SENSE.hunt.test.suffix', // anchor test
      ];

      invalidTypes.forEach(type => {
        const invalidEvent = { ...event, type };
        const result = validateObsidianEvent(invalidEvent);
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.includes('type') || e.includes('Type'))).toBe(true);
      });
    });

    it('should reject invalid hive format', () => {
      const event = createObsidianEvent(0, 'hunt', 'research', 88, 'bronze', {});
      const invalidHives = [
        'GEN88',
        'hfo_gen88',
        'HFO_GEN89', // generation mismatch
        'PRE_HFO_GEN88', // anchor test
        'HFO_GEN88_POST', // anchor test
      ];

      invalidHives.forEach(obsidianhive => {
        const invalidEvent = { ...event, obsidianhive };
        const result = validateObsidianEvent(invalidEvent);
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.includes('hive') || e.includes('Hive'))).toBe(true);
      });
    });
  });

  describe('Property 9: Traceparent Character Distribution', () => {
    it('generates IDs with varying characters (kills math mutants)', () => {
      for (let i = 0; i < 10; i++) {
        const tp = generateTraceparent();
        const parts = tp.split('-');
        const traceId = parts[1];
        const spanId = parts[2];
        
        // If Math.random() logic is broken, we might get all 0s or similar
        const uniqueTraceChars = new Set(traceId.split('')).size;
        const uniqueSpanChars = new Set(spanId.split('')).size;
        
        // Statistically extremely likely to have > 1 unique char in 32/16 hex chars
        expect(uniqueTraceChars).toBeGreaterThan(1);
        expect(uniqueSpanChars).toBeGreaterThan(1);
      }
    });
  });

  describe('Integration: File Parsing', () => {
    it('should parse multiple events from JSONL string', () => {
      const events = [
        createObsidianEvent(0, 'test', 'one', 1, 'bronze', {}),
        createObsidianEvent(1, 'test', 'two', 1, 'bronze', {}),
      ];
      const content = events.map(e => toJsonl(e)).join('\n');
      
      const parsed = parseJsonlFile(content);
      expect(parsed).toHaveLength(2);
      expect(parsed[0].id).toBe(events[0].id);
      expect(parsed[1].id).toBe(events[1].id);
    });

    it('should ignore empty lines in JSONL', () => {
      const event = createObsidianEvent(0, 'test', 'one', 1, 'bronze', {});
      const content = `\n${toJsonl(event)}\n\n`;
      const parsed = parseJsonlFile(content);
      expect(parsed).toHaveLength(1);
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
      // Port 0 should be OBSERVE, not BRIDGE
      const event = createObsidianEvent(0, 'test', 'action', 88, 'bronze', {});
      const mutated = { ...event, obsidianverb: 'BRIDGE' as const };
      
      const result = validateObsidianEvent(mutated);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Port 0 must use verb OBSERVE'))).toBe(true);
    });
  });

  describe('Mutation 4: Mismatched Port-Phase', () => {
    it('should reject events where port does not match phase', () => {
      // Port 0 should be phase H, not E
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
        '00-abc-def-01', // too short
        '01-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa-bbbbbbbbbbbbbbbb-01', // wrong version
        '00-GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG-bbbbbbbbbbbbbbbb-01', // invalid hex
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
        'hfo://gen88/bronze', // missing port
        'hfo://gen88/bronze/port/9', // port out of range
        'http://gen88/bronze/port/0', // wrong protocol
        'hfo://gen88/platinum/port/0', // invalid layer
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
        'obsidian.observe', // missing domain.action
        'obsidian.OBSERVE.test.action', // uppercase verb
        'cloudevents.observe.test.action', // wrong prefix
        'obsidian.attack.test.action', // invalid verb
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
