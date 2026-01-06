import { z } from 'zod';
import { VacuoleEnvelope } from './envelope';

/**
 * HFO Canonical Verbs (The 8 Actions)
 * ==================================
 * 
 * These are the HFO-native verbs used for component naming and intent.
 * They map 1:1 to JADC2 functional capabilities.
 */

export const HFO_VERBS = [
    'OBSERVE',   // Port 0
    'BRIDGE',    // Port 1
    'SHAPE',     // Port 2
    'INJECT',    // Port 3
    'DISRUPT',   // Port 4
    'IMMUNIZE',  // Port 5
    'ASSIMILATE',// Port 6
    'NAVIGATE'   // Port 7
] as const;

export type HFOVerb = typeof HFO_VERBS[number];

/**
 * JADC2 Functional Capabilities
 * ============================
 * 
 * The equivalent military-grade verbs from Mosaic Warfare.
 */
export const JADC2_VERBS = [
    'SENSE',     // Port 0 (ISR)
    'FUSE',      // Port 1 (Transport)
    'SHAPE',     // Port 2 (Fires)
    'DELIVER',   // Port 3 (Logistics)
    'TEST',      // Port 4 (Red Cell)
    'DEFEND',    // Port 5 (Protection)
    'STORE',     // Port 6 (PED)
    'DECIDE'     // Port 7 (C2)
] as const;

export type JADC2Verb = typeof JADC2_VERBS[number];

/**
 * The HFO-JADC2 Mapping Matrix
 */
export const VERB_MAPPING: Record<number, { hfo: HFOVerb, jadc2: JADC2Verb }> = {
    0: { hfo: 'OBSERVE',   jadc2: 'SENSE' },
    1: { hfo: 'BRIDGE',    jadc2: 'FUSE' },
    2: { hfo: 'SHAPE',     jadc2: 'SHAPE' },
    3: { hfo: 'INJECT',    jadc2: 'DELIVER' },
    4: { hfo: 'DISRUPT',   jadc2: 'TEST' },
    5: { hfo: 'IMMUNIZE',  jadc2: 'DEFEND' },
    6: { hfo: 'ASSIMILATE', jadc2: 'STORE' },
    7: { hfo: 'NAVIGATE',  jadc2: 'DECIDE' }
};

export const HFOVerbSchema = z.enum(HFO_VERBS);
export const JADC2VerbSchema = z.enum(JADC2_VERBS);

export const VerbMappingEnvelope = VacuoleEnvelope.extend({
  payload: z.record(z.number(), z.object({
    hfo: z.string(),
    jadc2: z.string()
  }))
});
