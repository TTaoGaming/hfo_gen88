/**
 * Cross-Commander Verb Enforcement - Property Tests
 * 
 * @provenance: LEGENDARY_COMMANDERS_V9.md
 * Validates: Property 14 (Verb Enforcement)
 */

import { describe, it, expect } from 'vitest';
import {
  COMMANDER_VERBS,
  HIVE_PAIRINGS,
  PREY_PAIRINGS,
  isVerbAllowed,
  getAllowedVerbs,
  createVerbViolation,
  isValidHivePair,
  getHivePhase,
  getPreyPhase,
  VerbViolationSchema,
  type Port,
} from './verb-enforcement.js';

describe('Property 14: Verb Enforcement', () => {
  // --- Verb Allowance ---
  describe('Verb Allowance', () => {
    it('P0 only allows OBSERVE and SENSE', () => {
      expect(isVerbAllowed(0, 'OBSERVE')).toBe(true);
      expect(isVerbAllowed(0, 'SENSE')).toBe(true);
      expect(isVerbAllowed(0, 'SHAPE')).toBe(false);
      expect(isVerbAllowed(0, 'DECIDE')).toBe(false);
    });

    it('P1 only allows BRIDGE and FUSE', () => {
      expect(isVerbAllowed(1, 'BRIDGE')).toBe(true);
      expect(isVerbAllowed(1, 'FUSE')).toBe(true);
      expect(isVerbAllowed(1, 'INJECT')).toBe(false);
    });

    it('P2 only allows SHAPE and TRANSFORM', () => {
      expect(isVerbAllowed(2, 'SHAPE')).toBe(true);
      expect(isVerbAllowed(2, 'TRANSFORM')).toBe(true);
      expect(isVerbAllowed(2, 'OBSERVE')).toBe(false);
    });

    it('P3 only allows INJECT and DELIVER', () => {
      expect(isVerbAllowed(3, 'INJECT')).toBe(true);
      expect(isVerbAllowed(3, 'DELIVER')).toBe(true);
      expect(isVerbAllowed(3, 'STORE')).toBe(false);
    });

    it('P4 only allows DISRUPT, SING, SCREAM', () => {
      expect(isVerbAllowed(4, 'DISRUPT')).toBe(true);
      expect(isVerbAllowed(4, 'SING')).toBe(true);
      expect(isVerbAllowed(4, 'SCREAM')).toBe(true);
      expect(isVerbAllowed(4, 'DANCE')).toBe(false);
    });

    it('P5 only allows DANCE, DIE, IMMUNIZE', () => {
      expect(isVerbAllowed(5, 'DANCE')).toBe(true);
      expect(isVerbAllowed(5, 'DIE')).toBe(true);
      expect(isVerbAllowed(5, 'IMMUNIZE')).toBe(true);
      expect(isVerbAllowed(5, 'SCREAM')).toBe(false);
    });

    it('P6 only allows ASSIMILATE and STORE', () => {
      expect(isVerbAllowed(6, 'ASSIMILATE')).toBe(true);
      expect(isVerbAllowed(6, 'STORE')).toBe(true);
      expect(isVerbAllowed(6, 'NAVIGATE')).toBe(false);
    });

    it('P7 only allows DECIDE and NAVIGATE', () => {
      expect(isVerbAllowed(7, 'DECIDE')).toBe(true);
      expect(isVerbAllowed(7, 'NAVIGATE')).toBe(true);
      expect(isVerbAllowed(7, 'OBSERVE')).toBe(false);
    });
  });

  // --- Verb Violation ---
  describe('Verb Violation', () => {
    it('creates valid violation record', () => {
      const violation = createVerbViolation(0, 'SHAPE');
      
      expect(violation.sourcePort).toBe(0);
      expect(violation.attemptedVerb).toBe('SHAPE');
      expect(violation.allowedVerbs).toContain('OBSERVE');
      expect(violation.allowedVerbs).toContain('SENSE');
      expect(violation.message).toContain('Port 0');
    });

    it('violation validates against schema', () => {
      const violation = createVerbViolation(3, 'DECIDE');
      const result = VerbViolationSchema.safeParse(violation);
      expect(result.success).toBe(true);
    });
  });

  // --- HIVE/8 Anti-Diagonal ---
  describe('HIVE/8 Anti-Diagonal Pairings', () => {
    it('all HIVE pairs sum to 7', () => {
      for (const [phase, [a, b]] of Object.entries(HIVE_PAIRINGS)) {
        expect(a + b).toBe(7);
      }
    });

    it('isValidHivePair returns true for valid pairs', () => {
      expect(isValidHivePair(0, 7)).toBe(true);
      expect(isValidHivePair(1, 6)).toBe(true);
      expect(isValidHivePair(2, 5)).toBe(true);
      expect(isValidHivePair(3, 4)).toBe(true);
    });

    it('isValidHivePair returns false for invalid pairs', () => {
      expect(isValidHivePair(0, 1)).toBe(false);
      expect(isValidHivePair(2, 3)).toBe(false);
      expect(isValidHivePair(4, 5)).toBe(false);
    });

    it('getHivePhase returns correct phase', () => {
      expect(getHivePhase(0, 7)).toBe('H');
      expect(getHivePhase(7, 0)).toBe('H'); // Order independent
      expect(getHivePhase(1, 6)).toBe('I');
      expect(getHivePhase(2, 5)).toBe('V');
      expect(getHivePhase(3, 4)).toBe('E');
    });

    it('getHivePhase returns null for invalid pairs', () => {
      expect(getHivePhase(0, 1)).toBeNull();
      expect(getHivePhase(2, 3)).toBeNull();
    });
  });

  // --- PREY/8 Serpentine ---
  describe('PREY/8 Serpentine Pairings', () => {
    it('getPreyPhase returns correct phase', () => {
      expect(getPreyPhase(0, 6)).toBe('P');
      expect(getPreyPhase(6, 0)).toBe('P'); // Order independent
      expect(getPreyPhase(1, 7)).toBe('R');
      expect(getPreyPhase(2, 4)).toBe('E');
      expect(getPreyPhase(3, 5)).toBe('Y');
    });

    it('getPreyPhase returns null for non-PREY pairs', () => {
      expect(getPreyPhase(0, 1)).toBeNull();
      expect(getPreyPhase(4, 5)).toBeNull();
    });
  });

  // --- All Ports Have Verbs ---
  describe('All Ports Have Verbs', () => {
    it('every port has at least one verb', () => {
      for (let port = 0; port <= 7; port++) {
        const verbs = getAllowedVerbs(port as Port);
        expect(verbs.length).toBeGreaterThan(0);
      }
    });

    it('no verb is shared between ports', () => {
      const allVerbs = new Map<string, number>();
      
      for (let port = 0; port <= 7; port++) {
        const verbs = getAllowedVerbs(port as Port);
        for (const verb of verbs) {
          if (allVerbs.has(verb)) {
            // This would be a violation - verbs should be unique per port
            throw new Error(`Verb "${verb}" is shared between ports ${allVerbs.get(verb)} and ${port}`);
          }
          allVerbs.set(verb, port);
        }
      }
      
      expect(allVerbs.size).toBeGreaterThan(0);
    });
  });
});
