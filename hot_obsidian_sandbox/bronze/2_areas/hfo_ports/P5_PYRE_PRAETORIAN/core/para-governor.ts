/**
 * P5 Sub 2: PARA Governor
 * @provenance hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P5_PYRE_PRAETORIAN/core/para-governor.ts
 * "Architecture is destiny. 1-2-3-4 is the only sequence allowed."
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

export interface ParaViolation {
  path: string;
  type: 'ILLEGAL_FOLDER' | 'MISSING_MANDATORY' | 'MISPLACED_ARTIFACT';
  message: string;
}

/**
 * PARA Governor ensures the Medallion structure adheres to the Gen 88 standards.
 */
export class ParaGovernor {
  private readonly ALLOWED_PARA = ['1_projects', '2_areas', '3_resources', '4_archive'];
  private readonly MANDATORY_FILES = ['hot_obsidianblackboard.jsonl'];

  /**
   * Audits a medallion directory for PARA compliance.
   */
  auditMedallion(medallionPath: string): ParaViolation[] {
    const violations: ParaViolation[] = [];
    if (!fs.existsSync(medallionPath)) return violations;

    const entries = fs.readdirSync(medallionPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const name = entry.name;
      
      if (entry.isDirectory()) {
        if (!this.ALLOWED_PARA.includes(name)) {
          violations.push({
            path: path.join(medallionPath, name),
            type: 'ILLEGAL_FOLDER',
            message: `Folder [${name}] is not a valid PARA directory.`
          });
        }
      } else if (entry.isFile()) {
        // Files allowed in medallion root (outside PARA) are limited
        const isMandatory = this.MANDATORY_FILES.includes(name);
        const isMarkdown = name.endsWith('.md'); // Readmes are allowed
        
        if (!isMandatory && !isMarkdown) {
           violations.push({
            path: path.join(medallionPath, name),
            type: 'MISPLACED_ARTIFACT',
            message: `File [${name}] must be inside a PARA category.`
          });
        }
      }
    }

    return violations;
  }
}
