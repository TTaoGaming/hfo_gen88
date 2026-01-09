/**
 * P4 RED REGNANT - SCREAM_BREACH Detector (Port 1)
 * 
 * @port 1
 * @commander WEB_WEAVER (aligned)
 * @verb FUSE
 * @tier SILVER
 * @provenance: .kiro/specs/scream-goldilocks-sprint/design.md
 * @mutation-score: 87.60% (GOLDILOCKS)
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4
 * 
 * Detects contract violations and type safety issues:
 * - `any` types without @bespoke annotation
 * - Missing provenance headers
 * - Type assertions without justification
 * - Unsafe type coercion
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  Detector,
  DetectorConfig,
  DetectorResult,
  DEFAULT_DETECTOR_CONFIG,
  mergeConfig,
  shouldScanFile,
  createEmptyResult,
} from '../contracts/detector.js';
import { createScreamReceipt, ScreamReceipt } from '../contracts/screams.js';

// --- BREACH PATTERNS ---

/**
 * Patterns that indicate contract violations or type safety issues
 */
export const BREACH_PATTERNS = {
  // `any` type without @bespoke annotation
  ANY_TYPE: /:\s*any(?!\s*\/\/\s*@bespoke)/g,
  
  // Type assertion without justification
  TYPE_ASSERTION_AS: /as\s+\w+(?!\s*\/\/)/g,
  
  // Non-null assertion without justification
  NON_NULL_ASSERTION: /!\./g,
  
  // @ts-ignore without explanation (bare = only whitespace or newline after)
  TS_IGNORE_BARE: /\/\/\s*@ts-ignore\s*$/gm,
  
  // @ts-expect-error without explanation (bare = only whitespace or newline after)
  TS_EXPECT_ERROR_BARE: /\/\/\s*@ts-expect-error\s*$/gm,
  
  // Unsafe any[] array
  ANY_ARRAY: /:\s*any\[\]/g,
  
  // Function returning any
  RETURN_ANY: /\)\s*:\s*any\s*[{=]/g,
  
  // Object type (too loose)
  OBJECT_TYPE: /:\s*object(?!\w)/gi,
  
  // Function type (too loose)
  FUNCTION_TYPE: /:\s*Function(?!\w)/g,
} as const;

export type BreachPatternName = keyof typeof BREACH_PATTERNS;

// --- PROVENANCE HEADER PATTERN ---

const PROVENANCE_HEADER = /@provenance:/i;
// Match both Unix and Windows path separators
const SILVER_GOLD_PATH = /[/\\](silver|gold)[/\\]/i;

// --- DETECTOR IMPLEMENTATION ---

export class BreachDetector implements Detector {
  readonly name = 'SCREAM_BREACH';
  readonly port = 1;
  readonly screamType = 'SCREAM_BREACH' as const;
  readonly description = 'Detects contract violations and type safety issues';

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

    const walk = (dir: string) => {
      if (!fs.existsSync(dir)) return;
      
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        // Skip excluded directories
        if (entry.isDirectory()) {
          if (!mergedConfig.excludeDirs.includes(entry.name)) {
            walk(fullPath);
          }
          continue;
        }

        // Check if file should be scanned
        if (!shouldScanFile(fullPath, entry.name, mergedConfig)) {
          continue;
        }

        filesScanned++;
        
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const fileReceipts = this.scanContent(fullPath, content, mergedConfig);
          receipts.push(...fileReceipts);
        } catch {
          // Skip files that can't be read
          continue;
        }
      }
    };

    // Handle both file and directory targets
    if (fs.existsSync(targetPath)) {
      const stat = fs.statSync(targetPath);
      if (stat.isDirectory()) {
        walk(targetPath);
      } else {
        filesScanned = 1;
        const content = fs.readFileSync(targetPath, 'utf8');
        const fileReceipts = this.scanContent(targetPath, content, mergedConfig);
        receipts.push(...fileReceipts);
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
   * Scan file content for breach patterns
   */
  private scanContent(
    filePath: string,
    content: string,
    config: DetectorConfig
  ): ScreamReceipt[] {
    const receipts: ScreamReceipt[] = [];
    const isTestFile = filePath.includes('.test.') || filePath.includes('.spec.');
    const isSilverOrGold = SILVER_GOLD_PATH.test(filePath);

    // Check for missing provenance header in Silver/Gold files
    if (isSilverOrGold && !isTestFile && !PROVENANCE_HEADER.test(content)) {
      receipts.push(createScreamReceipt(
        'SCREAM_BREACH',
        1,
        filePath,
        {
          breachType: 'MISSING_PROVENANCE',
          message: 'Silver/Gold files require @provenance header',
          severity: 'error',
        },
        config.severity
      ));
    }

    // Check each pattern
    for (const [patternName, pattern] of Object.entries(BREACH_PATTERNS)) {
      // Reset regex lastIndex for global patterns
      pattern.lastIndex = 0;
      
      // Skip some patterns in test files
      if (isTestFile && this.shouldSkipInTests(patternName as BreachPatternName)) {
        continue;
      }
      
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        // Find line numbers for each match
        const lineNumbers = this.findLineNumbers(content, pattern);
        
        receipts.push(createScreamReceipt(
          'SCREAM_BREACH',
          1,
          filePath,
          {
            breachType: patternName,
            pattern: pattern.source,
            matchCount: matches.length,
            lineNumbers,
            severity: this.getSeverityForPattern(patternName as BreachPatternName),
          },
          config.severity
        ));
      }
    }

    return receipts;
  }

  /**
   * Some patterns are acceptable in test files
   */
  private shouldSkipInTests(patternName: BreachPatternName): boolean {
    // Type assertions are common in tests for mocking
    return patternName === 'TYPE_ASSERTION_AS' || 
           patternName === 'NON_NULL_ASSERTION';
  }

  /**
   * Find line numbers where pattern matches
   */
  private findLineNumbers(content: string, pattern: RegExp): number[] {
    const lines = content.split('\n');
    const lineNumbers: number[] = [];
    
    // Create a new regex without global flag for line-by-line matching
    const linePattern = new RegExp(pattern.source, pattern.flags.replace('g', ''));
    
    for (let i = 0; i < lines.length; i++) {
      if (linePattern.test(lines[i])) {
        lineNumbers.push(i + 1);
      }
    }
    
    return lineNumbers;
  }

  /**
   * Get severity based on pattern type
   */
  private getSeverityForPattern(patternName: BreachPatternName): 'warning' | 'error' | 'critical' {
    switch (patternName) {
      case 'ANY_TYPE':
      case 'ANY_ARRAY':
      case 'RETURN_ANY':
        return 'error';
      case 'TS_IGNORE_BARE':
      case 'TS_EXPECT_ERROR_BARE':
        return 'warning';
      case 'TYPE_ASSERTION_AS':
      case 'NON_NULL_ASSERTION':
        return 'warning';
      case 'OBJECT_TYPE':
      case 'FUNCTION_TYPE':
        return 'warning';
      default:
        return 'error';
    }
  }
}

// --- FACTORY FUNCTION ---

export function createBreachDetector(): Detector {
  return new BreachDetector();
}
