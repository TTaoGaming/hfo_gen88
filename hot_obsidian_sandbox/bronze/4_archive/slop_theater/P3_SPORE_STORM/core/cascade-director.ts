/**
 * P3 Sub 2: Cascade Director
 * @provenance hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P3_SPORE_STORM/core/cascade-director.ts
 * "One spark, a thousand fires. The chain reaction is the storm."
 */

import { FileInjector, InjectionResult } from './file-injector.js';

export interface CascadeStep {
  file: string;
  payload: string;
  marker?: string;
}

export interface CascadeResult {
  steps: InjectionResult[];
  success: boolean;
  totalBytes: number;
}

/**
 * Cascade Director - Orchestrates multi-file delivery sequences.
 */
export class CascadeDirector {
  private injector = new FileInjector();

  /**
   * Execute a sequence of injections.
   */
  execute(steps: CascadeStep[]): CascadeResult {
    const results: InjectionResult[] = [];
    let totalBytes = 0;

    for (const step of steps) {
      const result = this.injector.inject(step.file, step.payload, { marker: step.marker });
      results.push(result);
      if (result.success) {
        totalBytes += result.bytesInjected;
      }
    }

    return {
      steps: results,
      success: results.every(r => r.success),
      totalBytes
    };
  }
}
