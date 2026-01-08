/**
 * P5 Sub 7: Grudge Manager
 * @provenance hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P5_PYRE_PRAETORIAN/core/grudge-manager.ts
 * "The fire remembers. Three strikes, and the artifact is ash."
 */

export interface GrudgeRecord {
  artifact: string;
  violationCount: number;
  lastViolationTS: string;
  status: 'WATCH' | 'QUARANTINE' | 'PURGED';
}

/**
 * Grudge Manager determines the fate of persistent violators.
 */
export class GrudgeManager {
  private readonly MAX_VIOLATIONS = 3;

  /**
   * Evaluates the fate of an artifact based on its history.
   */
  evaluateFate(history: { file: string; type: string; ts: string }[]): GrudgeRecord {
    const artifact = history.length > 0 ? history[0].file : 'UNKNOWN';
    const violationCount = history.length;

    let status: GrudgeRecord['status'] = 'WATCH';
    if (violationCount >= this.MAX_VIOLATIONS) {
      status = 'QUARANTINE';
    }
    if (violationCount >= this.MAX_VIOLATIONS * 2) {
      status = 'PURGED';
    }

    return {
      artifact,
      violationCount,
      lastViolationTS: history.length > 0 ? history[history.length - 1].ts : '',
      status
    };
  }
}
