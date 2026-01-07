/**
 * Fitness computation with configurable weights
 */

import { HarnessResult, FitnessConfig, DEFAULT_FITNESS_CONFIG } from '../schemas';

export interface FitnessReport {
  fitness: number;
  harness_scores: Record<string, number>;
  total_duration_ms: number;
  timestamp: string;
}

export function computeFitness(
  results: HarnessResult[],
  config: FitnessConfig = DEFAULT_FITNESS_CONFIG
): FitnessReport {
  const harness_scores: Record<string, number> = {};
  let weightedSum = 0;
  let totalWeight = 0;
  let total_duration_ms = 0;

  for (const r of results) {
    const weight = config.harness_weights[r.harness_name] ?? 1.0;
    harness_scores[r.harness_name] = r.scores.normalized;
    weightedSum += r.scores.normalized * weight;
    totalWeight += weight;
    total_duration_ms += r.duration_ms;
  }

  const fitness = totalWeight > 0 ? weightedSum / totalWeight : 0;

  return {
    fitness,
    harness_scores,
    total_duration_ms,
    timestamp: new Date().toISOString(),
  };
}
