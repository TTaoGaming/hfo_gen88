/**
 * P5 Sub 6: Stigmergy Monitor
 * @provenance hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P5_PYRE_PRAETORIAN/core/stigmergy-monitor.ts
 * "The ground speaks. Listen for the dissonance."
 */

import * as fs from 'node:fs';

export interface StigmergyAnomaly {
  ts: string;
  type: 'UNAUTHORIZED_ENTRY' | 'SEQUENCE_BREAK' | 'CORRUPTION';
  message: string;
}

/**
 * Monitors the Stigmergy Blackboards (JSONL) for integrity.
 */
export class StigmergyMonitor {
  /**
   * Audits a blackboard file for common corruption patterns.
   */
  auditBlackboard(filePath: string): StigmergyAnomaly[] {
    const anomalies: StigmergyAnomaly[] = [];
    if (!fs.existsSync(filePath)) return anomalies;

    const lines = fs.readFileSync(filePath, 'utf8').split('\n').filter(Boolean);
    
    for (let i = 0; i < lines.length; i++) {
        try {
            JSON.parse(lines[i]);
        } catch (e) {
            anomalies.push({
                ts: new Date().toISOString(),
                type: 'CORRUPTION',
                message: `JSON Parse error on line ${i + 1}.`
            });
        }
    }

    return anomalies;
  }
}
