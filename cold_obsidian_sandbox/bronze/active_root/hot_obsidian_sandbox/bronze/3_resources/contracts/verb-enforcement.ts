/**
 * Cross-Commander Verb Enforcement
 * 
 * @provenance: LEGENDARY_COMMANDERS_V9.md
 * Validates: Property 14 (Verb Enforcement)
 * 
 * Each commander has assigned verbs. Cross-verb calls trigger P4 screams.
 */

import { z } from 'zod';

// --- COMMANDER VERB MAPPING ---

export const COMMANDER_VERBS = {
  0: ['OBSERVE', 'SENSE'],           // P0: Lidless Legion
  1: ['BRIDGE', 'FUSE'],             // P1: Web Weaver
  2: ['SHAPE', 'TRANSFORM'],         // P2: Mirror Magus
  3: ['INJECT', 'DELIVER'],          // P3: Spore Storm
  4: ['DISRUPT', 'SING', 'SCREAM'],  // P4: Red Regnant
  5: ['DANCE', 'DIE', 'IMMUNIZE'],   // P5: Pyre Praetorian
  6: ['ASSIMILATE', 'STORE'],        // P6: Kraken Keeper
  7: ['DECIDE', 'NAVIGATE'],         // P7: Spider Sovereign
} as const;

export type Port = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type Verb = typeof COMMANDER_VERBS[Port][number];

// --- HIVE/8 PAIRINGS (Anti-diagonal: sum = 7) ---

export const HIVE_PAIRINGS = {
  H: [0, 7] as const, // Hunt: Lidless Legion + Spider Sovereign
  I: [1, 6] as const, // Interlock: Web Weaver + Kraken Keeper
  V: [2, 5] as const, // Validate: Mirror Magus + Pyre Praetorian
  E: [3, 4] as const, // Evolve: Spore Storm + Red Regnant
} as const;

// --- PREY/8 PAIRINGS (Serpentine) ---

export const PREY_PAIRINGS = {
  P: [0, 6] as const, // Perceive: Lidless Legion + Kraken Keeper
  R: [1, 7] as const, // React: Web Weaver + Spider Sovereign
  E: [2, 4] as const, // Execute: Mirror Magus + Red Regnant
  Y: [3, 5] as const, // Yield: Spore Storm + Pyre Praetorian
} as const;

// --- VERB VIOLATION SCHEMA ---

export const VerbViolationSchema = z.object({
  timestamp: z.number(),
  sourcePort: z.number().min(0).max(7),
  attemptedVerb: z.string(),
  allowedVerbs: z.array(z.string()),
  message: z.string(),
});

export type VerbViolation = z.infer<typeof VerbViolationSchema>;

// --- ENFORCEMENT FUNCTIONS ---

/**
 * Checks if a verb is allowed for a given port
 */
export function isVerbAllowed(port: Port, verb: string): boolean {
  const allowed = COMMANDER_VERBS[port] as readonly string[];
  return allowed.includes(verb);
}

/**
 * Gets allowed verbs for a port
 */
export function getAllowedVerbs(port: Port): readonly string[] {
  return COMMANDER_VERBS[port];
}

/**
 * Creates a verb violation record
 */
export function createVerbViolation(port: Port, attemptedVerb: string): VerbViolation {
  const allowed = getAllowedVerbs(port);
  return {
    timestamp: Date.now(),
    sourcePort: port,
    attemptedVerb,
    allowedVerbs: [...allowed],
    message: `Port ${port} attempted verb "${attemptedVerb}" but only allows: ${allowed.join(', ')}`,
  };
}

/**
 * Validates HIVE/8 anti-diagonal property (sum = 7)
 */
export function isValidHivePair(portA: Port, portB: Port): boolean {
  return portA + portB === 7;
}

/**
 * Gets the HIVE phase for a port pair
 */
export function getHivePhase(portA: Port, portB: Port): 'H' | 'I' | 'V' | 'E' | null {
  if (!isValidHivePair(portA, portB)) return null;
  
  const sorted = [portA, portB].sort((a, b) => a - b) as [Port, Port];
  
  for (const [phase, pair] of Object.entries(HIVE_PAIRINGS)) {
    const pairSorted = [...pair].sort((a, b) => a - b);
    if (sorted[0] === pairSorted[0] && sorted[1] === pairSorted[1]) {
      return phase as 'H' | 'I' | 'V' | 'E';
    }
  }
  return null;
}

/**
 * Gets the PREY phase for a port pair
 */
export function getPreyPhase(portA: Port, portB: Port): 'P' | 'R' | 'E' | 'Y' | null {
  const sorted = [portA, portB].sort((a, b) => a - b) as [Port, Port];
  
  for (const [phase, pair] of Object.entries(PREY_PAIRINGS)) {
    const pairSorted = [...pair].sort((a, b) => a - b);
    if (sorted[0] === pairSorted[0] && sorted[1] === pairSorted[1]) {
      return phase as 'P' | 'R' | 'E' | 'Y';
    }
  }
  return null;
}
