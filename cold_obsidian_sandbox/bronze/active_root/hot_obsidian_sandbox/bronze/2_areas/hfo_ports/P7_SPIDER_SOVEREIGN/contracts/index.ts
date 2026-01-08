/**
 * P7 SPIDER SOVEREIGN - Zod Contracts
 * 
 * @port 7
 * @commander SPIDER_SOVEREIGN
 * @verb DECIDE / NAVIGATE
 * @provenance: LEGENDARY_COMMANDERS_V9.md
 * Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7
 */

import { z } from 'zod';

// --- CONSENSUS METHODS ---

export const ConsensusMethodSchema = z.enum([
  'hybrid_agree',       // Critique agrees with weighted majority
  'weighted_majority',  // 50%+ weighted agreement
  'critique_confident', // Low agreement but high critique confidence
  'weighted_default',   // Default fallback to weighted
]);

export type ConsensusMethod = z.infer<typeof ConsensusMethodSchema>;

// --- VOTE SCHEMA ---

export const VoteSchema = z.object({
  model: z.string(),
  answer: z.string(),
  weight: z.number().min(0).max(1),
  confidence: z.number().min(0).max(1).optional(),
});

export type Vote = z.infer<typeof VoteSchema>;

// --- DECISION SCHEMA ---

export const DecisionSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.number(),
  question: z.string(),
  answer: z.string(),
  confidence: z.number().min(0).max(1),
  method: ConsensusMethodSchema,
  votes: z.array(VoteSchema),
  critiqueAnswer: z.string().optional(),
  weightedAnswer: z.string().optional(),
});

export type Decision = z.infer<typeof DecisionSchema>;

// --- HIVE/8 WORKFLOW PAIRINGS ---

export const HIVE_PAIRINGS = {
  H: [0, 7], // Hunt: Lidless Legion + Spider Sovereign
  I: [1, 6], // Interlock: Web Weaver + Kraken Keeper
  V: [2, 5], // Validate: Mirror Magus + Pyre Praetorian
  E: [3, 4], // Evolve: Spore Storm + Red Regnant
} as const;

export const PREY_PAIRINGS = {
  P: [0, 6], // Perceive: Lidless Legion + Kraken Keeper
  R: [1, 7], // React: Web Weaver + Spider Sovereign
  E: [2, 4], // Execute: Mirror Magus + Red Regnant
  Y: [3, 5], // Yield: Spore Storm + Pyre Praetorian
} as const;

// --- WORKFLOW VALIDATION ---

/**
 * Validates HIVE/8 anti-diagonal pairings (XOR = 111)
 */
export function isValidHivePairing(phase: keyof typeof HIVE_PAIRINGS, ports: [number, number]): boolean {
  const expected = HIVE_PAIRINGS[phase];
  const [a, b] = ports.sort((x, y) => x - y);
  const [expA, expB] = [...expected].sort((x, y) => x - y);
  
  // Check anti-diagonal property: a + b = 7 (XOR = 111 in binary)
  const isAntiDiagonal = a + b === 7;
  const matchesExpected = a === expA && b === expB;
  
  return isAntiDiagonal && matchesExpected;
}

/**
 * Validates PREY/8 serpentine pairings
 */
export function isValidPreyPairing(phase: keyof typeof PREY_PAIRINGS, ports: [number, number]): boolean {
  const expected = PREY_PAIRINGS[phase];
  const [a, b] = ports.sort((x, y) => x - y);
  const [expA, expB] = [...expected].sort((x, y) => x - y);
  
  return a === expA && b === expB;
}

// --- HYBRID CONSENSUS LOGIC ---

export interface ConsensusInput {
  votes: Vote[];
  critiqueAnswer: string;
  critiqueConfidence: number;
}

export interface ConsensusResult {
  answer: string;
  method: ConsensusMethod;
  confidence: number;
}

/**
 * Computes weighted voting result
 */
export function computeWeightedVoting(votes: Vote[]): { answer: string; totalWeight: number; agreement: number } {
  const answerWeights = new Map<string, number>();
  let totalWeight = 0;
  
  for (const vote of votes) {
    const current = answerWeights.get(vote.answer) || 0;
    answerWeights.set(vote.answer, current + vote.weight);
    totalWeight += vote.weight;
  }
  
  let maxWeight = 0;
  let winningAnswer = '';
  
  for (const [answer, weight] of answerWeights) {
    if (weight > maxWeight) {
      maxWeight = weight;
      winningAnswer = answer;
    }
  }
  
  const agreement = totalWeight > 0 ? maxWeight / totalWeight : 0;
  
  return { answer: winningAnswer, totalWeight: maxWeight, agreement };
}

/**
 * Implements hybrid consensus (critique + weighted voting)
 * Algorithm:
 * 1. Compute weighted voting FIRST as ground truth
 * 2. Get aggregator critique
 * 3. If critique agrees with weighted → use critique (high confidence)
 * 4. If 50%+ weighted agreement → weighted wins (robust to hallucination)
 * 5. If low agreement + high critique confidence → critique wins
 * 6. Default → weighted (more robust)
 */
export function hybridConsensus(input: ConsensusInput): ConsensusResult {
  const weighted = computeWeightedVoting(input.votes);
  
  // Case 1: Critique agrees with weighted majority
  if (input.critiqueAnswer === weighted.answer) {
    return {
      answer: input.critiqueAnswer,
      method: 'hybrid_agree',
      confidence: Math.max(weighted.agreement, input.critiqueConfidence),
    };
  }
  
  // Case 2: Strong weighted agreement (50%+) → weighted wins
  if (weighted.agreement >= 0.5) {
    return {
      answer: weighted.answer,
      method: 'weighted_majority',
      confidence: weighted.agreement,
    };
  }
  
  // Case 3: Low agreement but high critique confidence → critique wins
  if (input.critiqueConfidence >= 0.8) {
    return {
      answer: input.critiqueAnswer,
      method: 'critique_confident',
      confidence: input.critiqueConfidence,
    };
  }
  
  // Case 4: Default to weighted (more robust)
  return {
    answer: weighted.answer,
    method: 'weighted_default',
    confidence: weighted.agreement,
  };
}
