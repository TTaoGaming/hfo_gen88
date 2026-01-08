/**
 * P5 Sub 4: Theater Detector (Hardener)
 * @provenance hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P5_PYRE_PRAETORIAN/core/theater-detector.ts
 * "Reality is the only validation. Simulated success is a death sentence."
 */

import { z } from 'zod';

export const TheaterSeveritySchema = z.enum(['SUSPICION', 'VIOLATION', 'TERMINATION']);

export interface TheaterReport {
  file: string;
  severity: z.infer<typeof TheaterSeveritySchema>;
  metrics: {
    mockRatio: number;
    assertionDensity: number;
    mutationScore: number;
  };
  judgment: string;
}

/**
 * P5's Theater Detector focuses on hard-gating promoting code that exhibits high "Theater" signatures.
 */
export class TheaterDetector {
  /**
   * Evaluates if an artifact is "Real" or just "Theater".
   */
  evaluate(metrics: { 
    lineCount: number; 
    mockCount: number; 
    assertionCount: number; 
    mutationScore: number; 
  }): TheaterReport {
    const mockRatio = metrics.mockCount / Math.max(metrics.lineCount, 1);
    const assertionDensity = metrics.assertionCount / Math.max(metrics.lineCount, 1);
    
    let severity: z.infer<typeof TheaterSeveritySchema> = 'SUSPICION';
    let judgment = 'Standard quality detected.';

    // Rule 1: Suspiciously high mutation score (>99%)
    if (metrics.mutationScore > 99) {
      severity = 'VIOLATION';
      judgment = 'Mutation score [>99%] suggests Mock Poisoning or Trivial Tests (AI Theater).';
    }

    // Rule 2: Mock Poisoning
    if (mockRatio > 0.2) {
      severity = 'VIOLATION';
      judgment = 'High Mock-to-Code ratio detected. Evaluation integrity compromised.';
    }

    // Rule 3: Assertionless / Low Assertion Density
    if (assertionDensity < 0.01 && metrics.lineCount > 50) {
      severity = 'TERMINATION';
      judgment = 'Critical lack of assertions in significant codebase. Pure Theater.';
    }

    return {
      file: 'CURRENT_ARTIFACT',
      severity,
      metrics: {
        mockRatio,
        assertionDensity,
        mutationScore: metrics.mutationScore
      },
      judgment
    };
  }
}
