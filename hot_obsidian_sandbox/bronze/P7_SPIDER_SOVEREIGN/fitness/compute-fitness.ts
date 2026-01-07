/**
 * Fitness computation with configurable weights
 * @provenance hfo-testing-promotion/13.2
 * Validates: Requirements 3.1 (delegates to silver/fitness)
 */

import { HarnessResult, FitnessConfig, DEFAULT_FITNESS_CONFIG } from '../schemas';
import {
  computeFitness as silverComputeFitness,
  type FitnessReport as SilverFitnessReport,
  type HarnessScore,
} from '../../../silver/fitness/compute-fitness';

// Re-export silver FitnessReport type
export type FitnessReport = SilverFitnessReport;

/**
 * Compute fitness from HarnessResult array.
 * Adapts bronze HarnessResult to silver HarnessScore interface.
 */
export function computeFitness(
  results: HarnessResult[],
  config: FitnessConfig = DEFAULT_FITNESS_CONFIG
): FitnessReport {
  // Adapt bronze HarnessResult to silver HarnessScore
  const scores: HarnessScore[] = results.map(r => ({
    harness_name: r.harness_name,
    normalized: r.scores.normalized,
    duration_ms: r.duration_ms,
  }));

  // Delegate to silver
  return silverComputeFitness(scores, { harness_weights: config.harness_weights });
}
