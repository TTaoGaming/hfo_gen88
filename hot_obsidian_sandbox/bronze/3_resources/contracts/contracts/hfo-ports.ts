import { z } from 'zod';
import { HFOVerbSchema, JADC2VerbSchema, VERB_MAPPING } from './verbs.js';
import { VacuoleEnvelope } from './envelope.js';

/**
 * HFO 8-Port Canonical Interface System
 * =====================================
 *
 * The Obsidian Hourglass Architecture - 8 Legendary Commanders
 */

/** The 8 canonical port numbers */
export type PortNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** HIVE phases */
export type HIVEPhase = 'H' | 'I' | 'V' | 'E';

/** Commander names for semantic anchoring */
export const COMMANDERS = [
	'Lidless Legion',   // Port 0
	'Web Weaver',       // Port 1
	'Mirror Magus',     // Port 2
	'Spore Storm',      // Port 3
	'Red Regnant',      // Port 4
	'Pyre Praetorian',  // Port 5
	'Kraken Keeper',    // Port 6
	'Spider Sovereign', // Port 7
] as const;

export type Commander = typeof COMMANDERS[number];

export const PortNumberSchema = z.union([
	z.literal(0),
	z.literal(1),
	z.literal(2),
	z.literal(3),
	z.literal(4),
	z.literal(5),
	z.literal(6),
	z.literal(7),
]);

export interface PortMetadata {
    port: PortNumber;
    commander: Commander;
    hfoVerb: string;
    jadc2Verb: string;
}

export const PORT_METADATA: Record<PortNumber, PortMetadata> = {
    0: { port: 0, commander: 'Lidless Legion', hfoVerb: VERB_MAPPING[0].hfo, jadc2Verb: VERB_MAPPING[0].jadc2 },
    1: { port: 1, commander: 'Web Weaver',     hfoVerb: VERB_MAPPING[1].hfo, jadc2Verb: VERB_MAPPING[1].jadc2 },
    2: { port: 2, commander: 'Mirror Magus',   hfoVerb: VERB_MAPPING[2].hfo, jadc2Verb: VERB_MAPPING[2].jadc2 },
    3: { port: 3, commander: 'Spore Storm',    hfoVerb: VERB_MAPPING[3].hfo, jadc2Verb: VERB_MAPPING[3].jadc2 },
    4: { port: 4, commander: 'Red Regnant',    hfoVerb: VERB_MAPPING[4].hfo, jadc2Verb: VERB_MAPPING[4].jadc2 },
    5: { port: 5, commander: 'Pyre Praetorian', hfoVerb: VERB_MAPPING[5].hfo, jadc2Verb: VERB_MAPPING[5].jadc2 },
    6: { port: 6, commander: 'Kraken Keeper',   hfoVerb: VERB_MAPPING[6].hfo, jadc2Verb: VERB_MAPPING[6].jadc2 },
    7: { port: 7, commander: 'Spider Sovereign', hfoVerb: VERB_MAPPING[7].hfo, jadc2Verb: VERB_MAPPING[7].jadc2 },
};

export const PortMetadataEnvelope = VacuoleEnvelope.extend({
  payload: z.record(z.string(), z.any())
});
