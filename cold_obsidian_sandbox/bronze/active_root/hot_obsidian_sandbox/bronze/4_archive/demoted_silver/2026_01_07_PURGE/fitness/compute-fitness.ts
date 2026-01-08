/**
 * Fitness Calculator - Pure Computation
 * @provenance hfo-testing-promotion/6.1
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5
 */

/** Configuration for fitness weights */
export interface FitnessConfig {
  harness_weights: Record<string, number>;
}

/** Default equal weights for all harnesses */
export const DEFAULT_FITNESS_CONFIG: FitnessConfig = {
  harness_weights: {
    SENSE: 1.0,
    FUSE: 1.0,
    SHAPE: 1.0,
    DELIVER: 1.0,
    DISRUPT: 1.0,
    IMMUNIZE: 1.0,
    STORE: 1.0,
    DECIDE: 1.0,
  },
};

/** Input for fitness computation */
export interface HarnessScore {
  harness_name: string;
  normalized: number; // 0-1
  duration_ms?: number;
}

/** Output of fitness computation */
export interface FitnessReport {
  fitness: number;
  harness_scores: Record<string, number>;
  total_duration_ms: number;
  timestamp: string;
}

/**
 * Compute weighted average of scores.
 * Returns 0 if weights sum to 0.
 * Validates: Requirements 3.1, 3.2
 */
export function weightedAverage(scores: number[], weights: number[]): number {
  if (scores.length === 0 || weights.length === 0) return 0;
  if (scores.length !== weights.length) {
    throw new Error('Scores and weights must have same length');
  }

  let weightedSum = 0;
  let totalWeight = 0;

  for (let i = 0; i < scores.length; i++) {
    weightedSum += scores[i] * weights[i];
    totalWeight += weights[i];
  }

  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

/**
 * Compute fitness from harness scores with configurable weights.
 * Returns fitness in range [0, 1].
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5
 */
export function computeFitness(
  results: HarnessScore[],
  config: FitnessConfig = DEFAULT_FITNESS_CONFIG
): FitnessReport {
  const harness_scores: Record<string, number> = {};
  const scores: number[] = [];
  const weights: number[] = [];
  let total_duration_ms = 0;

  for (const r of results) {
    const weight = config.harness_weights[r.harness_name] ?? 1.0;
    harness_scores[r.harness_name] = r.normalized;
    scores.push(r.normalized);
    weights.push(weight);
    total_duration_ms += r.duration_ms ?? 0;
  }

  const fitness = weightedAverage(scores, weights);

  // Clamp to [0, 1] for safety
  const clampedFitness = Math.max(0, Math.min(1, fitness));

  return {
    fitness: clampedFitness,
    harness_scores,
    total_duration_ms,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Compute simple arithmetic mean of scores.
 * Validates: Requirements 3.1
 */
export function arithmeticMean(scores: number[]): number {
  if (scores.length === 0) return 0;
  const sum = scores.reduce((a, b) => a + b, 0);
  return sum / scores.length;
}

/**
 * Check if fitness value is in valid range [0, 1].
 * Validates: Requirements 3.4
 */
export function isValidFitness(fitness: number): boolean {
  return typeof fitness === 'number' && !isNaN(fitness) && fitness >= 0 && fitness <= 1;
}
