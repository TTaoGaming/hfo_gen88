/**
 * P4 RED REGNANT - Property-Based Tests
 * 
 * @port 4
 * @commander RED_REGNANT
 * @provenance: design.md
 * Validates: Requirements 6.6, 6.7, 6.8, 6.9, 10.1, 10.6, 10.7
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { 
  isValidMutationScore, 
  isTheater, 
  isMutationFailure,
  SILVER_STANDARD,
  ViolationSchema,
  BloodBookEntrySchema,
} from './contracts/index.js';

// --- Property 8: Anti-Pattern Detection ---
// Feature: legendary-commanders-gen88, Property 8: Anti-Pattern Detection

describe('Property 8: Anti-Pattern Detection', () => {
  
  it('detects theater when mutation score is 100%', () => {
    fc.assert(
      fc.property(
        fc.constant(100),
        (score) => {
          expect(isTheater(score)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('detects theater for scores >= 99%', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 99, max: 100, noNaN: true }),
        (score) => {
          expect(isTheater(score)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('does not flag theater for valid scores', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 80, max: 98.99, noNaN: true }),
        (score) => {
          expect(isTheater(score)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('detects mutation failure for scores < 80%', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 79.99, noNaN: true }),
        (score) => {
          expect(isMutationFailure(score)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('does not flag mutation failure for valid scores', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 80, max: 100, noNaN: true }),
        (score) => {
          expect(isMutationFailure(score)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// --- Property 10: Mutation Score Bounds ---
// Feature: legendary-commanders-gen88, Property 10: Mutation Score Bounds

describe('Property 10: Mutation Score Bounds', () => {
  
  it('accepts scores in valid range [80, 98.99]', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 80, max: 98.99, noNaN: true }),
        (score) => {
          expect(isValidMutationScore(score)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('rejects scores below 80%', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 79.99, noNaN: true }),
        (score) => {
          expect(isValidMutationScore(score)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('rejects scores above 98.99% (Theater)', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 99, max: 100, noNaN: true }),
        (score) => {
          expect(isValidMutationScore(score)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('boundary: 80% is valid', () => {
    expect(isValidMutationScore(80)).toBe(true);
  });

  it('boundary: 98.99% is valid', () => {
    expect(isValidMutationScore(98.99)).toBe(true);
  });

  it('boundary: 79.99% is invalid', () => {
    expect(isValidMutationScore(79.99)).toBe(false);
  });

  it('boundary: 99% is invalid (Theater)', () => {
    expect(isValidMutationScore(99)).toBe(false);
  });
});

// --- Property 9: Violation Logging Invariant ---
// Feature: legendary-commanders-gen88, Property 9: Violation Logging Invariant

describe('Property 9: Violation Schema Validation', () => {
  
  const violationArb = fc.record({
    file: fc.string({ minLength: 1 }),
    type: fc.constantFrom(
      'THEATER', 'POLLUTION', 'AMNESIA', 'BESPOKE', 'VIOLATION',
      'MUTATION_FAILURE', 'MUTATION_GAP', 'LATTICE_BREACH',
      'BDD_MISALIGNMENT', 'OMISSION', 'PHANTOM', 'SUSPICION', 'DEBT'
    ),
    message: fc.string({ minLength: 1 }),
  });

  it('all valid violations pass schema validation', () => {
    fc.assert(
      fc.property(violationArb, (violation) => {
        const result = ViolationSchema.safeParse(violation);
        expect(result.success).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('violations with invalid type fail schema validation', () => {
    fc.assert(
      fc.property(
        fc.record({
          file: fc.string({ minLength: 1 }),
          type: fc.string().filter(s => !['THEATER', 'POLLUTION', 'AMNESIA', 'BESPOKE', 'VIOLATION',
            'MUTATION_FAILURE', 'MUTATION_GAP', 'LATTICE_BREACH',
            'BDD_MISALIGNMENT', 'OMISSION', 'PHANTOM', 'SUSPICION', 'DEBT'].includes(s)),
          message: fc.string({ minLength: 1 }),
        }),
        (violation) => {
          const result = ViolationSchema.safeParse(violation);
          expect(result.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// --- Blood Book Entry Schema Validation ---

describe('Blood Book Entry Schema', () => {
  
  const bloodBookEntryArb = fc.record({
    id: fc.uuid(),
    timestamp: fc.nat(),
    violationType: fc.constantFrom(
      'THEATER', 'POLLUTION', 'AMNESIA', 'BESPOKE', 'VIOLATION',
      'MUTATION_FAILURE', 'MUTATION_GAP', 'LATTICE_BREACH',
      'BDD_MISALIGNMENT', 'OMISSION', 'PHANTOM', 'SUSPICION', 'DEBT'
    ),
    artifact: fc.string({ minLength: 1 }),
    details: fc.string({ minLength: 1 }),
    attackVector: fc.string({ minLength: 1 }),
    resolved: fc.boolean(),
  });

  it('all valid blood book entries pass schema validation', () => {
    fc.assert(
      fc.property(bloodBookEntryArb, (entry) => {
        const result = BloodBookEntrySchema.safeParse(entry);
        expect(result.success).toBe(true);
      }),
      { numRuns: 100 }
    );
  });
});
