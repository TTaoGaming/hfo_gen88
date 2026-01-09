/**
 * P4 RED REGNANT - SCREAM_MUTATION Detector (Port 4)
 * 
 * @port 4
 * @commander RED_REGNANT (self-aligned)
 * @verb DISRUPT
 * @tier BRONZE
 * @provenance: .kiro/specs/red-regnant-8-screams/design.md
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
 * 
 * Detects mutation score violations:
 * - Scores < 80% (FAILURE)
 * - Scores >= 99% (THEATER - suspiciously perfect)
 * - Missing mutation reports
 * - Malformed mutation reports
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  Detector,
  DetectorConfig,
  DetectorResult,
  DEFAULT_DETECTOR_CONFIG,
  mergeConfig,
  createEmptyResult,
} from '../contracts/detector.js';
import { createScreamReceipt, ScreamReceipt } from '../contracts/screams.js';

// --- MUTATION THRESHOLDS ---

export const MUTATION_THRESHOLDS = {
  MINIMUM: 80,      // Below this = FAILURE
  GOLDILOCKS_MAX: 98.99,  // Above this = THEATER (suspiciously perfect)
} as const;

// --- MUTATION REPORT TYPES ---

export interface MutationReport {
  schemaVersion: string;
  thresholds: {
    high: number;
    low: number;
  };
  files: Record<string, MutationFileResult>;
}

export interface MutationFileResult {
  language: string;
  mutants: MutantResult[];
  source: string;
}

export interface MutantResult {
  id: string;
  mutatorName: string;
  status: 'Killed' | 'Survived' | 'NoCoverage' | 'Timeout' | 'RuntimeError';
  location: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
}

// --- DETECTOR IMPLEMENTATION ---

export class MutationDetector implements Detector {
  readonly name = 'SCREAM_MUTATION';
  readonly port = 4;
  readonly screamType = 'SCREAM_MUTATION' as const;
  readonly description = 'Detects mutation score violations and report issues';

  async detect(
    targetPath: string,
    config?: Partial<DetectorConfig>
  ): Promise<DetectorResult> {
    const startTime = Date.now();
    const mergedConfig = mergeConfig(DEFAULT_DETECTOR_CONFIG, config);
    
    if (!mergedConfig.enabled) {
      return {
        ...createEmptyResult(this.screamType),
        duration: Date.now() - startTime,
      };
    }

    const receipts: ScreamReceipt[] = [];
    let filesScanned = 0;

    // Look for mutation reports
    const reportPaths = this.findMutationReports(targetPath);
    
    if (reportPaths.length === 0) {
      // Check if this is a directory that should have mutation reports
      if (fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory()) {
        const hasSourceFiles = this.hasSourceFiles(targetPath);
        if (hasSourceFiles) {
          receipts.push(createScreamReceipt(
            'SCREAM_MUTATION',
            4,
            targetPath,
            {
              mutationType: 'MISSING_REPORT',
              message: 'No mutation report found for directory with source files',
              severity: 'warning',
            },
            'warning'
          ));
        }
      }
    }

    for (const reportPath of reportPaths) {
      filesScanned++;
      
      try {
        const content = fs.readFileSync(reportPath, 'utf8');
        const reportReceipts = this.analyzeReport(reportPath, content, mergedConfig);
        receipts.push(...reportReceipts);
      } catch {
        receipts.push(createScreamReceipt(
          'SCREAM_MUTATION',
          4,
          reportPath,
          {
            mutationType: 'MALFORMED_REPORT',
            message: 'Failed to read or parse mutation report',
            severity: 'error',
          },
          'error'
        ));
      }
    }

    return {
      screamType: this.screamType,
      receipts,
      filesScanned,
      violationsFound: receipts.length,
      duration: Date.now() - startTime,
    };
  }

  /**
   * Find mutation report files in target path
   */
  private findMutationReports(targetPath: string): string[] {
    const reports: string[] = [];
    
    if (!fs.existsSync(targetPath)) return reports;
    
    const stat = fs.statSync(targetPath);
    
    // If it's a file, check if it's a mutation report
    if (stat.isFile()) {
      if (this.isMutationReport(targetPath)) {
        reports.push(targetPath);
      }
      return reports;
    }
    
    // Search for mutation reports in directory
    const walk = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          // Check common mutation report directories
          if (entry.name === 'reports' || entry.name === 'mutation') {
            walk(fullPath);
          }
          continue;
        }
        
        if (this.isMutationReport(fullPath)) {
          reports.push(fullPath);
        }
      }
    };
    
    walk(targetPath);
    return reports;
  }

  /**
   * Check if file is a mutation report
   */
  private isMutationReport(filePath: string): boolean {
    const name = path.basename(filePath);
    return name === 'mutation.json' || 
           name.endsWith('.mutation.json') ||
           name === 'stryker-incremental.json';
  }

  /**
   * Check if directory has source files
   */
  private hasSourceFiles(dir: string): boolean {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.js'))) {
          if (!entry.name.includes('.test.') && !entry.name.includes('.spec.')) {
            return true;
          }
        }
        
        if (entry.isDirectory() && !['node_modules', '.git', 'reports'].includes(entry.name)) {
          if (this.hasSourceFiles(path.join(dir, entry.name))) {
            return true;
          }
        }
      }
    } catch {
      // Ignore errors
    }
    
    return false;
  }

  /**
   * Analyze a mutation report
   */
  private analyzeReport(
    reportPath: string,
    content: string,
    config: DetectorConfig
  ): ScreamReceipt[] {
    const receipts: ScreamReceipt[] = [];

    let report: MutationReport;
    try {
      report = JSON.parse(content);
    } catch {
      receipts.push(createScreamReceipt(
        'SCREAM_MUTATION',
        4,
        reportPath,
        {
          mutationType: 'MALFORMED_REPORT',
          message: 'Invalid JSON in mutation report',
          severity: 'error',
        },
        'error'
      ));
      return receipts;
    }

    // Validate report structure
    if (!report.files || typeof report.files !== 'object') {
      receipts.push(createScreamReceipt(
        'SCREAM_MUTATION',
        4,
        reportPath,
        {
          mutationType: 'MALFORMED_REPORT',
          message: 'Mutation report missing files section',
          severity: 'error',
        },
        'error'
      ));
      return receipts;
    }

    // Analyze each file's mutation score
    for (const [filePath, fileResult] of Object.entries(report.files)) {
      if (!fileResult.mutants || !Array.isArray(fileResult.mutants)) {
        continue;
      }

      const total = fileResult.mutants.length;
      if (total === 0) continue;

      const killed = fileResult.mutants.filter(m => m.status === 'Killed').length;
      const score = (killed / total) * 100;

      // Check for FAILURE (below minimum)
      if (score < MUTATION_THRESHOLDS.MINIMUM) {
        receipts.push(createScreamReceipt(
          'SCREAM_MUTATION',
          4,
          filePath,
          {
            mutationType: 'SCORE_FAILURE',
            score: Math.round(score * 100) / 100,
            threshold: MUTATION_THRESHOLDS.MINIMUM,
            killed,
            total,
            message: `Mutation score ${score.toFixed(2)}% is below minimum ${MUTATION_THRESHOLDS.MINIMUM}%`,
            severity: 'error',
          },
          'error'
        ));
      }

      // Check for THEATER (suspiciously perfect)
      if (score > MUTATION_THRESHOLDS.GOLDILOCKS_MAX) {
        receipts.push(createScreamReceipt(
          'SCREAM_MUTATION',
          4,
          filePath,
          {
            mutationType: 'SCORE_THEATER',
            score: Math.round(score * 100) / 100,
            threshold: MUTATION_THRESHOLDS.GOLDILOCKS_MAX,
            killed,
            total,
            message: `Mutation score ${score.toFixed(2)}% exceeds Goldilocks max ${MUTATION_THRESHOLDS.GOLDILOCKS_MAX}% - suspiciously perfect`,
            severity: 'warning',
          },
          'warning'
        ));
      }

      // Check for survived mutants (informational)
      const survived = fileResult.mutants.filter(m => m.status === 'Survived');
      if (survived.length > 0 && score >= MUTATION_THRESHOLDS.MINIMUM) {
        // Only report if within acceptable range but has survivors
        const survivorLocations = survived.slice(0, 5).map(m => ({
          mutator: m.mutatorName,
          line: m.location.start.line,
        }));

        receipts.push(createScreamReceipt(
          'SCREAM_MUTATION',
          4,
          filePath,
          {
            mutationType: 'SURVIVORS_DETECTED',
            score: Math.round(score * 100) / 100,
            survivedCount: survived.length,
            sampleSurvivors: survivorLocations,
            message: `${survived.length} mutants survived - consider strengthening tests`,
            severity: 'warning',
          },
          'warning'
        ));
      }
    }

    return receipts;
  }
}

// --- FACTORY FUNCTION ---

export function createMutationDetector(): Detector {
  return new MutationDetector();
}

// --- HELPER FUNCTIONS ---

/**
 * Calculate mutation score from report
 */
export function calculateMutationScore(report: MutationReport): number {
  let totalKilled = 0;
  let totalMutants = 0;

  for (const fileResult of Object.values(report.files)) {
    if (!fileResult.mutants) continue;
    totalMutants += fileResult.mutants.length;
    totalKilled += fileResult.mutants.filter(m => m.status === 'Killed').length;
  }

  if (totalMutants === 0) return 0;
  return (totalKilled / totalMutants) * 100;
}

/**
 * Check if score is in Goldilocks range
 */
export function isGoldilocks(score: number): boolean {
  return score >= MUTATION_THRESHOLDS.MINIMUM && score <= MUTATION_THRESHOLDS.GOLDILOCKS_MAX;
}
