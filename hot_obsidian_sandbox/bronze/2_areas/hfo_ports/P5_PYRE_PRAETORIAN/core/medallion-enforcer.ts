/**
 * P5 Sub 1: Medallion Enforcer
 * @provenance hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P5_PYRE_PRAETORIAN/core/medallion-enforcer.ts
 * "The boundaries are the law. To cross without a permit is to perish."
 */

import * as path from 'node:path';
import { z } from 'zod';

export const MedallionTypeSchema = z.enum(['gold', 'silver', 'bronze']);
export type MedallionType = z.infer<typeof MedallionTypeSchema>;

export interface MedallionViolation {
  file: string;
  expected: MedallionType | 'root';
  actual: string;
  message: string;
}

/**
 * Enforces Medallion Integrity.
 * Any file found outside its designated medallion without a Promotion Certificate is a violation.
 */
export class MedallionEnforcer {
  private readonly medallions: MedallionType[] = ['gold', 'silver', 'bronze'];

  /**
   * Identifies the medallion of a given path.
   */
  getMedallion(filePath: string): MedallionType | 'root' | 'unknown' {
    const normalized = path.normalize(filePath).replace(/\\/g, '/');
    
    if (normalized.includes('hot_obsidian_sandbox/gold')) return 'gold';
    if (normalized.includes('hot_obsidian_sandbox/silver')) return 'silver';
    if (normalized.includes('hot_obsidian_sandbox/bronze')) return 'bronze';
    
    // Root files are handled separately
    return 'root';
  }

  /**
   * Validates if a file is in the correct medallion based on its stated identity.
   * (e.g., if a file has '@medallion silver' but is in bronze)
   */
  validateIdentity(filePath: string, content: string): MedallionViolation[] {
    const violations: MedallionViolation[] = [];
    const actual = this.getMedallion(filePath);
    
    const match = content.match(/@medallion\s+(gold|silver|bronze)/i);
    if (match) {
      const stated = match[1].toLowerCase() as MedallionType;
      if (stated !== actual) {
        violations.push({
          file: filePath,
          expected: stated,
          actual: actual as string,
          message: `File claims to be [${stated.toUpperCase()}] but resides in [${actual.toUpperCase()}].`
        });
      }
    }

    return violations;
  }
}
