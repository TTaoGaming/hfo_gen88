/**
 * P5 Sub 3: Import Validator
 * @provenance hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P5_PYRE_PRAETORIAN/core/import-validator.ts
 * "The flow of knowledge must be unidirectional. Do not infect the high with the low."
 */

export interface ImportViolation {
  file: string;
  sourceMedallion: string;
  targetMedallion: string;
  importPath: string;
  message: string;
}

export class ImportValidator {
  /**
   * Checks if an import is legal based on Garrison rules.
   * Rules:
   * 1. Gold cannot import Silver or Bronze.
   * 2. Silver cannot import Bronze.
   * 3. Bronze can import anything (Trial Mode).
   */
  validateImport(file: string, importPath: string): ImportViolation | null {
    const sourceMed = this.getMedallion(file);
    const targetMed = this.getMedallion(importPath);

    if (sourceMed === 'gold' && (targetMed === 'silver' || targetMed === 'bronze')) {
      return {
        file,
        sourceMedallion: sourceMed,
        targetMedallion: targetMed,
        importPath,
        message: `Gold artifact illegal import from ${targetMed.toUpperCase()}.`
      };
    }

    if (sourceMed === 'silver' && targetMed === 'bronze') {
      return {
        file,
        sourceMedallion: sourceMed,
        targetMedallion: targetMed,
        importPath,
        message: `Silver artifact illegal import from BRONZE.`
      };
    }

    return null;
  }

  private getMedallion(path: string): string {
    if (path.includes('gold/')) return 'gold';
    if (path.includes('silver/')) return 'silver';
    if (path.includes('bronze/')) return 'bronze';
    return 'external';
  }
}
