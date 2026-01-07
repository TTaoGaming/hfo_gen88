/**
 * OBSIDIAN Stigmergy Format v1.0 (Gen 88)
 * 
 * CloudEvents 1.0 + W3C Trace Context + HFO 8-Port OBSIDIAN Extensions
 * 
 * The 8 verbs spell OBSIDIAN:
 * - O: OBSERVE  (Port 0) - Sensing, perception
 * - B: BRIDGE   (Port 1) - Protocol translation
 * - S: SHAPE    (Port 2) - Data transformation
 * - I: INJECT   (Port 3) - Payload delivery
 * - D: DISRUPT  (Port 4) - Testing, chaos
 * - I: IMMUNIZE (Port 5) - Validation, defense
 * - A: ASSIMILATE (Port 6) - Storage, memory
 * - N: NAVIGATE (Port 7) - Decision, orchestration
 */

import { z } from 'zod';

// === OBSIDIAN Port/Verb Mapping ===
export const OBSIDIAN_PORTS = {
  0: 'OBSERVE',
  1: 'BRIDGE',
  2: 'SHAPE',
  3: 'INJECT',
  4: 'DISRUPT',
  5: 'IMMUNIZE',
  6: 'ASSIMILATE',
  7: 'NAVIGATE',
} as const;

export const OBSIDIAN_VERBS = ['OBSERVE', 'BRIDGE', 'SHAPE', 'INJECT', 'DISRUPT', 'IMMUNIZE', 'ASSIMILATE', 'NAVIGATE'] as const;
export const OBSIDIAN_PHASES = ['H', 'I', 'V', 'E'] as const;
export const OBSIDIAN_LAYERS = ['bronze', 'silver', 'gold'] as const;

// Port to HIVE Phase mapping
export const PORT_TO_PHASE: Record<number, typeof OBSIDIAN_PHASES[number]> = {
  0: 'H', // OBSERVE → Hunt
  1: 'I', // BRIDGE → Interlock
  2: 'V', // SHAPE → Validate
  3: 'E', // INJECT → Evolve
  4: 'E', // DISRUPT → Evolve
  5: 'V', // IMMUNIZE → Validate
  6: 'I', // ASSIMILATE → Interlock
  7: 'H', // NAVIGATE → Hunt
};

// === Zod Schemas ===

// W3C Trace Context traceparent format: 00-{trace-id}-{span-id}-{flags}
const TraceparentSchema = z.string().regex(
  /^00-[a-f0-9]{32}-[a-f0-9]{16}-[0-9]{2}$/,
  'Invalid traceparent format. Expected: 00-{32-hex-trace-id}-{16-hex-span-id}-{2-digit-flags}'
);

// CloudEvents source URI format: hfo://gen{N}/{layer}/port/{port}
const SourceSchema = z.string().regex(
  /^hfo:\/\/gen\d+\/(bronze|silver|gold)\/port\/[0-7]$/,
  'Invalid source format. Expected: hfo://gen{N}/{layer}/port/{port}'
);

// Event type format: obsidian.{verb}.{domain}.{action}
const EventTypeSchema = z.string().regex(
  /^obsidian\.(observe|bridge|shape|inject|disrupt|immunize|assimilate|navigate)\.[a-z]+\.[a-z]+$/,
  'Invalid type format. Expected: obsidian.{verb}.{domain}.{action}'
);

export const ObsidianPortSchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
  z.literal(7),
]);

export const ObsidianVerbSchema = z.enum(OBSIDIAN_VERBS);
export const ObsidianPhaseSchema = z.enum(OBSIDIAN_PHASES);
export const ObsidianLayerSchema = z.enum(OBSIDIAN_LAYERS);


// === Main Stigmergy Event Schema ===
export const ObsidianStigmergySchema = z.object({
  // CloudEvents 1.0 Required Fields
  specversion: z.literal('1.0'),
  id: z.string().uuid(),
  source: SourceSchema,
  type: EventTypeSchema,
  
  // CloudEvents 1.0 Optional Fields
  time: z.string().datetime(),
  datacontenttype: z.literal('application/json'),
  subject: z.string().optional(),
  
  // W3C Trace Context
  traceparent: TraceparentSchema,
  tracestate: z.string().optional(),
  
  // OBSIDIAN 8-Port Extensions
  obsidianport: ObsidianPortSchema,
  obsidianverb: ObsidianVerbSchema,
  obsidiangen: z.number().int().min(1),
  obsidianhive: z.string().regex(/^HFO_GEN\d+$/),
  obsidianphase: ObsidianPhaseSchema,
  obsidianlayer: ObsidianLayerSchema,
  
  // BDD Context (Behavioral)
  given: z.string().optional(),
  when: z.string().optional(),
  then: z.string().optional(),
  
  // Payload
  data: z.record(z.unknown()),
});

export type ObsidianStigmergy = z.infer<typeof ObsidianStigmergySchema>;
export type ObsidianPort = z.infer<typeof ObsidianPortSchema>;
export type ObsidianVerb = z.infer<typeof ObsidianVerbSchema>;
export type ObsidianPhase = z.infer<typeof ObsidianPhaseSchema>;
export type ObsidianLayer = z.infer<typeof ObsidianLayerSchema>;

// === Validation Functions ===

/**
 * Validates that port and verb are consistent (OBSIDIAN mapping)
 */
export function validatePortVerbConsistency(event: ObsidianStigmergy): boolean {
  const expectedVerb = OBSIDIAN_PORTS[event.obsidianport];
  return event.obsidianverb === expectedVerb;
}

/**
 * Validates that port and phase are consistent (HIVE mapping)
 */
export function validatePortPhaseConsistency(event: ObsidianStigmergy): boolean {
  const expectedPhase = PORT_TO_PHASE[event.obsidianport];
  return event.obsidianphase === expectedPhase;
}

/**
 * Validates that event type matches the verb
 */
export function validateTypeVerbConsistency(event: ObsidianStigmergy): boolean {
  const verbInType = event.type.split('.')[1].toUpperCase();
  return event.obsidianverb === verbInType;
}

/**
 * Validates that source URI matches port
 */
export function validateSourcePortConsistency(event: ObsidianStigmergy): boolean {
  const portInSource = parseInt(event.source.split('/port/')[1], 10);
  return event.obsidianport === portInSource;
}

/**
 * Validates that source URI gen matches obsidiangen
 */
export function validateSourceGenConsistency(event: ObsidianStigmergy): boolean {
  const match = event.source.match(/^hfo:\/\/gen(\d+)\//);
  if (!match) return false;
  const genInSource = parseInt(match[1], 10);
  return event.obsidiangen === genInSource;
}

/**
 * Validates that source URI layer matches obsidianlayer
 */
export function validateSourceLayerConsistency(event: ObsidianStigmergy): boolean {
  const match = event.source.match(/^hfo:\/\/gen\d+\/(bronze|silver|gold)\//);
  if (!match) return false;
  return event.obsidianlayer === match[1];
}

/**
 * Validates that hive matches generation
 */
export function validateHiveGenConsistency(event: ObsidianStigmergy): boolean {
  const genInHive = parseInt(event.obsidianhive.replace('HFO_GEN', ''), 10);
  return event.obsidiangen === genInHive;
}

/**
 * Full validation of an OBSIDIAN stigmergy event
 */
export function validateObsidianEvent(event: unknown): { 
  valid: boolean; 
  errors: string[];
  event?: ObsidianStigmergy;
} {
  const errors: string[] = [];
  
  // Schema validation
  const parseResult = ObsidianStigmergySchema.safeParse(event);
  if (!parseResult.success) {
    return {
      valid: false,
      errors: parseResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
    };
  }
  
  const validEvent = parseResult.data;
  
  // Semantic consistency checks
  if (!validatePortVerbConsistency(validEvent)) {
    errors.push(`Port ${validEvent.obsidianport} must use verb ${OBSIDIAN_PORTS[validEvent.obsidianport]}, got ${validEvent.obsidianverb}`);
  }
  
  if (!validatePortPhaseConsistency(validEvent)) {
    errors.push(`Port ${validEvent.obsidianport} must use phase ${PORT_TO_PHASE[validEvent.obsidianport]}, got ${validEvent.obsidianphase}`);
  }
  
  if (!validateTypeVerbConsistency(validEvent)) {
    errors.push(`Event type verb must match obsidianverb`);
  }
  
  if (!validateSourcePortConsistency(validEvent)) {
    errors.push(`Source URI port must match obsidianport`);
  }
  
  if (!validateSourceGenConsistency(validEvent)) {
    errors.push(`Source URI gen must match obsidiangen`);
  }
  
  if (!validateSourceLayerConsistency(validEvent)) {
    errors.push(`Source URI layer must match obsidianlayer`);
  }
  
  if (!validateHiveGenConsistency(validEvent)) {
    errors.push(`Hive generation must match obsidiangen`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
    event: validEvent,
  };
}


// === Factory Functions ===

/**
 * Generate a valid traceparent string
 */
export function generateTraceparent(): string {
  const traceId = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  const spanId = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return `00-${traceId}-${spanId}-01`;
}

/**
 * Create a valid OBSIDIAN stigmergy event
 */
export function createObsidianEvent(
  port: ObsidianPort,
  domain: string,
  action: string,
  gen: number,
  layer: ObsidianLayer,
  data: Record<string, unknown>,
  options?: {
    subject?: string;
    given?: string;
    when?: string;
    then?: string;
    tracestate?: string;
  }
): ObsidianStigmergy {
  const verb = OBSIDIAN_PORTS[port];
  const phase = PORT_TO_PHASE[port];
  
  return {
    specversion: '1.0',
    id: crypto.randomUUID(),
    source: `hfo://gen${gen}/${layer}/port/${port}`,
    type: `obsidian.${verb.toLowerCase()}.${domain}.${action}`,
    time: new Date().toISOString(),
    datacontenttype: 'application/json',
    subject: options?.subject,
    traceparent: generateTraceparent(),
    tracestate: options?.tracestate,
    obsidianport: port,
    obsidianverb: verb,
    obsidiangen: gen,
    obsidianhive: `HFO_GEN${gen}`,
    obsidianphase: phase,
    obsidianlayer: layer,
    given: options?.given,
    when: options?.when,
    then: options?.then,
    data,
  };
}

// === Serialization ===

/**
 * Serialize event to JSONL line
 */
export function toJsonl(event: ObsidianStigmergy): string {
  return JSON.stringify(event);
}

/**
 * Parse JSONL line to event
 */
export function fromJsonl(line: string): ObsidianStigmergy {
  const parsed = JSON.parse(line);
  const result = ObsidianStigmergySchema.parse(parsed);
  return result;
}

/**
 * Parse multiple JSONL lines
 */
export function parseJsonlFile(content: string): ObsidianStigmergy[] {
  return content
    .split('\n')
    .filter(line => line.trim().length > 0)
    .map(fromJsonl);
}
