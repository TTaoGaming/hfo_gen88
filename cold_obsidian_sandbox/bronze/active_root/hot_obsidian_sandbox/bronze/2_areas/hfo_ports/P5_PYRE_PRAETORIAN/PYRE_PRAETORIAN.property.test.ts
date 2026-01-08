/**
 * P5 PYRE PRAETORIAN - Property-Based Tests
 * 
 * @port 5
 * @commander PYRE_PRAETORIAN
 * @provenance: design.md
 * Validates: Requirements 7.2, 7.3, 7.4, 11.1, 11.5
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  shouldTerminateDance,
  getDanceOutcome,
  createDanceState,
  advanceDance,
  PyreDanceStateSchema,
  DanceResultSchema,
  PhoenixImmunityCertificateSchema,
} from './contracts/index.js';

// --- Property 11: Pyre Dance Termination ---
// Feature: legendary-commanders-gen88, Property 11: Pyre Dance Termination

describe('Property 11: Pyre Dance Termination', () => {
  
  const violationArb = fc.record({
    type: fc.constantFrom('THEATER', 'POLLUTION', 'AMNESIA', 'MUTATION_FAILURE'),
    message: fc.string({ minLength: 1 }),
    resolved: fc.boolean(),
  });

  const danceStateArb = fc.record({
    artifact: fc.string({ minLength: 1 }),
    iteration: fc.nat({ max: 20 }),
    maxIterations: fc.integer({ min: 1, max: 20 }),
    status: fc.constantFrom('DANCING', 'COMPLETED', 'QUARANTINED'),
    violations: fc.array(violationArb, { minLength: 1, maxLength: 10 }),
  });

  it('terminates when all violations are resolved (rebirth)', () => {
    fc.assert(
      fc.property(
        fc.record({
          artifact: fc.string({ minLength: 1 }),
          iteration: fc.nat({ max: 5 }),
          maxIterations: fc.integer({ min: 10, max: 20 }),
          status: fc.constant('DANCING' as const),
          violations: fc.array(
            fc.record({
              type: fc.constantFrom('THEATER', 'POLLUTION'),
              message: fc.string({ minLength: 1 }),
              resolved: fc.constant(true), // All resolved
            }),
            { minLength: 1, maxLength: 5 }
          ),
        }),
        (state) => {
          expect(shouldTerminateDance(state)).toBe(true);
          expect(getDanceOutcome(state)).toBe('REBIRTH');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('terminates when max iterations reached (quarantine)', () => {
    fc.assert(
      fc.property(
        fc.record({
          artifact: fc.string({ minLength: 1 }),
          iteration: fc.integer({ min: 10, max: 20 }),
          maxIterations: fc.integer({ min: 1, max: 10 }),
          status: fc.constant('DANCING' as const),
          violations: fc.array(
            fc.record({
              type: fc.constantFrom('THEATER', 'POLLUTION'),
              message: fc.string({ minLength: 1 }),
              resolved: fc.constant(false), // Not resolved
            }),
            { minLength: 1, maxLength: 5 }
          ),
        }),
        (state) => {
          // iteration >= maxIterations means terminate
          if (state.iteration >= state.maxIterations) {
            expect(shouldTerminateDance(state)).toBe(true);
            expect(getDanceOutcome(state)).toBe('QUARANTINE');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('does not terminate while dancing with unresolved violations and iterations remaining', () => {
    fc.assert(
      fc.property(
        fc.record({
          artifact: fc.string({ minLength: 1 }),
          iteration: fc.integer({ min: 0, max: 4 }),
          maxIterations: fc.constant(10),
          status: fc.constant('DANCING' as const),
          violations: fc.array(
            fc.record({
              type: fc.constantFrom('THEATER', 'POLLUTION'),
              message: fc.string({ minLength: 1 }),
              resolved: fc.constant(false),
            }),
            { minLength: 1, maxLength: 5 }
          ),
        }),
        (state) => {
          expect(shouldTerminateDance(state)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('dance always terminates within maxIterations', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.array(
          fc.record({
            type: fc.constantFrom('THEATER', 'POLLUTION', 'AMNESIA'),
            message: fc.string({ minLength: 1 }),
          }),
          { minLength: 1, maxLength: 5 }
        ),
        fc.integer({ min: 1, max: 10 }),
        (artifact, violations, maxIter) => {
          let state = createDanceState(artifact, violations);
          state = { ...state, maxIterations: maxIter };
          
          let iterations = 0;
          while (!shouldTerminateDance(state) && iterations < maxIter + 1) {
            // Simulate no progress (worst case)
            state = advanceDance(state, []);
            iterations++;
          }
          
          // Must terminate within maxIterations
          expect(iterations).toBeLessThanOrEqual(maxIter);
          expect(shouldTerminateDance(state)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// --- Property 12: Pyre Dance Response Chain ---
// Feature: legendary-commanders-gen88, Property 12: Pyre Dance Response Chain

describe('Property 12: Pyre Dance Response Chain', () => {
  
  it('createDanceState initializes with all violations unresolved', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.array(
          fc.record({
            type: fc.constantFrom('THEATER', 'POLLUTION', 'AMNESIA'),
            message: fc.string({ minLength: 1 }),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (artifact, violations) => {
          const state = createDanceState(artifact, violations);
          
          expect(state.artifact).toBe(artifact);
          expect(state.iteration).toBe(0);
          expect(state.status).toBe('DANCING');
          expect(state.violations.length).toBe(violations.length);
          expect(state.violations.every(v => v.resolved === false)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('advanceDance increments iteration and resolves specified violations', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.array(
          fc.record({
            type: fc.constantFrom('THEATER', 'POLLUTION'),
            message: fc.string({ minLength: 1 }),
          }),
          { minLength: 2, maxLength: 5 }
        ),
        (artifact, violations) => {
          const state = createDanceState(artifact, violations);
          
          // Resolve first violation
          const newState = advanceDance(state, [0]);
          
          expect(newState.iteration).toBe(1);
          expect(newState.violations[0].resolved).toBe(true);
          // Others remain unresolved
          for (let i = 1; i < newState.violations.length; i++) {
            expect(newState.violations[i].resolved).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('resolving all violations leads to COMPLETED status', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.array(
          fc.record({
            type: fc.constantFrom('THEATER', 'POLLUTION'),
            message: fc.string({ minLength: 1 }),
          }),
          { minLength: 1, maxLength: 5 }
        ),
        (artifact, violations) => {
          let state = createDanceState(artifact, violations);
          
          // Resolve all violations in one step
          const allIndices = violations.map((_, i) => i);
          state = advanceDance(state, allIndices);
          
          expect(state.status).toBe('COMPLETED');
          expect(state.violations.every(v => v.resolved)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// --- Schema Validation ---

describe('P5 Schema Validation', () => {
  
  it('valid dance states pass schema validation', () => {
    fc.assert(
      fc.property(
        fc.record({
          artifact: fc.string({ minLength: 1 }),
          iteration: fc.nat({ max: 100 }),
          maxIterations: fc.integer({ min: 1, max: 100 }),
          status: fc.constantFrom('DANCING', 'COMPLETED', 'QUARANTINED'),
          violations: fc.array(
            fc.record({
              type: fc.string({ minLength: 1 }),
              message: fc.string({ minLength: 1 }),
              resolved: fc.boolean(),
            }),
            { minLength: 0, maxLength: 10 }
          ),
        }),
        (state) => {
          const result = PyreDanceStateSchema.safeParse(state);
          expect(result.success).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('valid Phoenix certificates pass schema validation', () => {
    // Generate valid hex string for hash
    const hexCharArb = fc.constantFrom(...'0123456789abcdef'.split(''));
    const hex64Arb = fc.array(hexCharArb, { minLength: 64, maxLength: 64 }).map(arr => arr.join(''));
    
    // Use integer timestamp to avoid date parsing issues
    const isoDateArb = fc.integer({ min: 1577836800000, max: 1893456000000 }) // 2020-2030
      .map(ts => new Date(ts).toISOString());
    
    fc.assert(
      fc.property(
        fc.record({
          id: fc.uuid(),
          artifact: fc.string({ minLength: 1 }),
          issuedAt: isoDateArb,
          attackVectorDefended: fc.string({ minLength: 1 }),
          hash: hex64Arb.map(h => `sha256:${h}`),
          generation: fc.nat(),
        }),
        (cert) => {
          const result = PhoenixImmunityCertificateSchema.safeParse(cert);
          expect(result.success).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
