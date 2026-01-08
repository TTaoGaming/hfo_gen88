/**
 * P7 SPIDER SOVEREIGN - Property-Based Tests
 * 
 * @port 7
 * @commander SPIDER_SOVEREIGN
 * @provenance: design.md
 * Validates: Requirements 9.5, 9.6, 9.7, 12.3, 12.4
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  hybridConsensus,
  computeWeightedVoting,
  isValidHivePairing,
  isValidPreyPairing,
  HIVE_PAIRINGS,
  PREY_PAIRINGS,
  DecisionSchema,
  VoteSchema,
  ConsensusMethodSchema,
} from './contracts/index.js';

// --- Property 15: Hybrid Consensus Correctness ---
// Feature: legendary-commanders-gen88, Property 15: Hybrid Consensus Correctness

describe('Property 15: Hybrid Consensus Correctness', () => {
  
  const voteArb = fc.record({
    model: fc.string({ minLength: 1 }),
    answer: fc.constantFrom('A', 'B', 'C', 'D'),
    weight: fc.double({ min: 0, max: 1, noNaN: true }),
  });

  it('returns hybrid_agree when critique matches weighted majority', () => {
    fc.assert(
      fc.property(
        fc.array(voteArb, { minLength: 3, maxLength: 8 }),
        (votes) => {
          const weighted = computeWeightedVoting(votes);
          if (weighted.answer === '') return true; // Skip empty
          
          const result = hybridConsensus({
            votes,
            critiqueAnswer: weighted.answer, // Critique agrees
            critiqueConfidence: 0.9,
          });
          
          expect(result.method).toBe('hybrid_agree');
          expect(result.answer).toBe(weighted.answer);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns weighted_majority when agreement >= 50% and critique disagrees', () => {
    // Create votes where one answer has majority
    const majorityVotesArb = fc.tuple(
      fc.constantFrom('A', 'B', 'C'),
      fc.constantFrom('A', 'B', 'C'),
    ).filter(([majority, critique]) => majority !== critique)
    .chain(([majority, critique]) => {
      // Create 6 votes where majority answer has 4+ votes (66%+)
      const majorityVotes = fc.array(
        fc.record({
          model: fc.string({ minLength: 1 }),
          answer: fc.constant(majority),
          weight: fc.constant(1),
        }),
        { minLength: 4, maxLength: 4 }
      );
      const minorityVotes = fc.array(
        fc.record({
          model: fc.string({ minLength: 1 }),
          answer: fc.constantFrom('A', 'B', 'C').filter(a => a !== majority),
          weight: fc.constant(1),
        }),
        { minLength: 2, maxLength: 2 }
      );
      return fc.tuple(
        majorityVotes,
        minorityVotes,
        fc.constant(critique),
      );
    });

    fc.assert(
      fc.property(majorityVotesArb, ([majorityVotes, minorityVotes, critique]) => {
        const votes = [...majorityVotes, ...minorityVotes];
        const weighted = computeWeightedVoting(votes);
        
        if (weighted.agreement < 0.5) return true; // Skip if not majority
        
        const result = hybridConsensus({
          votes,
          critiqueAnswer: critique,
          critiqueConfidence: 0.5, // Low confidence
        });
        
        expect(result.method).toBe('weighted_majority');
        expect(result.answer).toBe(weighted.answer);
      }),
      { numRuns: 100 }
    );
  });

  it('returns critique_confident when low agreement but high critique confidence', () => {
    // Create evenly split votes (low agreement)
    const splitVotesArb = fc.tuple(
      fc.array(
        fc.record({
          model: fc.string({ minLength: 1 }),
          answer: fc.constant('A'),
          weight: fc.constant(1),
        }),
        { minLength: 2, maxLength: 2 }
      ),
      fc.array(
        fc.record({
          model: fc.string({ minLength: 1 }),
          answer: fc.constant('B'),
          weight: fc.constant(1),
        }),
        { minLength: 2, maxLength: 2 }
      ),
      fc.array(
        fc.record({
          model: fc.string({ minLength: 1 }),
          answer: fc.constant('C'),
          weight: fc.constant(1),
        }),
        { minLength: 2, maxLength: 2 }
      ),
    );

    fc.assert(
      fc.property(splitVotesArb, ([votesA, votesB, votesC]) => {
        const votes = [...votesA, ...votesB, ...votesC];
        const weighted = computeWeightedVoting(votes);
        
        // Agreement should be ~33% (low)
        if (weighted.agreement >= 0.5) return true;
        
        const result = hybridConsensus({
          votes,
          critiqueAnswer: 'D', // Different from all
          critiqueConfidence: 0.9, // High confidence
        });
        
        expect(result.method).toBe('critique_confident');
        expect(result.answer).toBe('D');
      }),
      { numRuns: 100 }
    );
  });

  it('always returns a valid consensus method', () => {
    fc.assert(
      fc.property(
        fc.array(voteArb, { minLength: 1, maxLength: 10 }),
        fc.constantFrom('A', 'B', 'C', 'D'),
        fc.double({ min: 0, max: 1, noNaN: true }),
        (votes, critiqueAnswer, critiqueConfidence) => {
          const result = hybridConsensus({
            votes,
            critiqueAnswer,
            critiqueConfidence,
          });
          
          const validMethods = ['hybrid_agree', 'weighted_majority', 'critique_confident', 'weighted_default'];
          expect(validMethods).toContain(result.method);
          expect(result.confidence).toBeGreaterThanOrEqual(0);
          expect(result.confidence).toBeLessThanOrEqual(1);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// --- Property 13: Workflow Pairing Correctness ---
// Feature: legendary-commanders-gen88, Property 13: Workflow Pairing Correctness

describe('Property 13: Workflow Pairing Correctness', () => {
  
  describe('HIVE/8 Anti-Diagonal Pairings', () => {
    
    it('H phase uses ports 0+7 (anti-diagonal)', () => {
      expect(isValidHivePairing('H', [0, 7])).toBe(true);
      expect(isValidHivePairing('H', [7, 0])).toBe(true); // Order doesn't matter
      expect(0 + 7).toBe(7); // Anti-diagonal property
    });

    it('I phase uses ports 1+6 (anti-diagonal)', () => {
      expect(isValidHivePairing('I', [1, 6])).toBe(true);
      expect(isValidHivePairing('I', [6, 1])).toBe(true);
      expect(1 + 6).toBe(7);
    });

    it('V phase uses ports 2+5 (anti-diagonal)', () => {
      expect(isValidHivePairing('V', [2, 5])).toBe(true);
      expect(isValidHivePairing('V', [5, 2])).toBe(true);
      expect(2 + 5).toBe(7);
    });

    it('E phase uses ports 3+4 (anti-diagonal)', () => {
      expect(isValidHivePairing('E', [3, 4])).toBe(true);
      expect(isValidHivePairing('E', [4, 3])).toBe(true);
      expect(3 + 4).toBe(7);
    });

    it('all HIVE pairings satisfy anti-diagonal property (sum = 7)', () => {
      for (const [phase, ports] of Object.entries(HIVE_PAIRINGS)) {
        const [a, b] = ports;
        expect(a + b).toBe(7);
        expect(isValidHivePairing(phase as keyof typeof HIVE_PAIRINGS, [a, b])).toBe(true);
      }
    });

    it('rejects incorrect HIVE pairings', () => {
      expect(isValidHivePairing('H', [0, 6])).toBe(false); // Wrong pair
      expect(isValidHivePairing('H', [1, 7])).toBe(false); // Wrong pair
      expect(isValidHivePairing('I', [0, 7])).toBe(false); // Wrong phase
    });
  });

  describe('PREY/8 Serpentine Pairings', () => {
    
    it('P phase uses ports 0+6 (serpentine)', () => {
      expect(isValidPreyPairing('P', [0, 6])).toBe(true);
      expect(isValidPreyPairing('P', [6, 0])).toBe(true);
    });

    it('R phase uses ports 1+7 (serpentine)', () => {
      expect(isValidPreyPairing('R', [1, 7])).toBe(true);
      expect(isValidPreyPairing('R', [7, 1])).toBe(true);
    });

    it('E phase uses ports 2+4 (serpentine)', () => {
      expect(isValidPreyPairing('E', [2, 4])).toBe(true);
      expect(isValidPreyPairing('E', [4, 2])).toBe(true);
    });

    it('Y phase uses ports 3+5 (serpentine)', () => {
      expect(isValidPreyPairing('Y', [3, 5])).toBe(true);
      expect(isValidPreyPairing('Y', [5, 3])).toBe(true);
    });

    it('all PREY pairings are valid', () => {
      for (const [phase, ports] of Object.entries(PREY_PAIRINGS)) {
        const [a, b] = ports;
        expect(isValidPreyPairing(phase as keyof typeof PREY_PAIRINGS, [a, b])).toBe(true);
      }
    });

    it('rejects incorrect PREY pairings', () => {
      expect(isValidPreyPairing('P', [0, 7])).toBe(false); // Wrong pair
      expect(isValidPreyPairing('R', [0, 6])).toBe(false); // Wrong phase
    });
  });
});

// --- Property 16: Decision Logging Invariant ---
// Feature: legendary-commanders-gen88, Property 16: Decision Logging Invariant

describe('Property 16: Decision Schema Validation', () => {
  
  const voteArb = fc.record({
    model: fc.string({ minLength: 1 }),
    answer: fc.string({ minLength: 1 }),
    weight: fc.double({ min: 0, max: 1, noNaN: true }),
  });

  it('valid decisions pass schema validation', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.uuid(),
          timestamp: fc.nat(),
          question: fc.string({ minLength: 1 }),
          answer: fc.string({ minLength: 1 }),
          confidence: fc.double({ min: 0, max: 1, noNaN: true }),
          method: fc.constantFrom('hybrid_agree', 'weighted_majority', 'critique_confident', 'weighted_default'),
          votes: fc.array(voteArb, { minLength: 1, maxLength: 10 }),
        }),
        (decision) => {
          const result = DecisionSchema.safeParse(decision);
          expect(result.success).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('decisions with invalid method fail validation', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.uuid(),
          timestamp: fc.nat(),
          question: fc.string({ minLength: 1 }),
          answer: fc.string({ minLength: 1 }),
          confidence: fc.double({ min: 0, max: 1, noNaN: true }),
          method: fc.string().filter(s => !['hybrid_agree', 'weighted_majority', 'critique_confident', 'weighted_default'].includes(s)),
          votes: fc.array(voteArb, { minLength: 1, maxLength: 5 }),
        }),
        (decision) => {
          const result = DecisionSchema.safeParse(decision);
          expect(result.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('valid votes pass schema validation', () => {
    fc.assert(
      fc.property(voteArb, (vote) => {
        const result = VoteSchema.safeParse(vote);
        expect(result.success).toBe(true);
      }),
      { numRuns: 100 }
    );
  });
});
