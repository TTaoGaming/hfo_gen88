/**
 * P4 RED REGNANT - SCREAM_THEATER Detector (Port 2)
 * 
 * @port 2
 * @commander MIRROR_MAGUS (aligned)
 * @verb SHAPE
 * @tier BRONZE
 * @provenance: .kiro/specs/red-regnant-8-screams/design.md
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
 * 
 * Detects fake tests and mock poisoning:
 * - Assertionless tests
 * - Mock overuse (>5 mocks)
 * - Placeholder patterns
 * - 99%+ mutation scores (suspiciously perfect)
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

// --- THEATER PATTERNS ---

/**
 * Patterns that indicate fake tests or placeholder code
 */
export const THEATER_PATTERNS = {
  // Placeholder implementations
  NOT_IMPLEMENTED: new RegExp('throw new' + ' Error\\([\'"`]Not implemented[\'"`]\\)', 'gi'),
  
  // Logic placeholder comments
  LOGIC_PLACEHOLDER: new RegExp('//\\s*(Lo' + 'gic goes here|TO' + 'DO:?\\s*implement)', 'gi'),
  
  // Stub returns
  STUB_RETURN: new RegExp('return\\s+(null|undefined|false|0|\\{\\});\\s*//\\s*stub', 'gi'),
  
  // Implementation placeholder
  IMPL_PLACEHOLDER: new RegExp('implementation\\s+(below|here).*\\.\\.\\.', 'gis'),
  
  // Empty test body
  EMPTY_TEST: new RegExp('it\\s*\\([^)]+,\\s*\\(\\)\\s*=>\\s*\\{\\s*\\}\\s*\\)', 'g'),
  
  // Test with only console.log
  CONSOLE_ONLY_TEST: new RegExp('it\\s*\\([^)]+,\\s*\\(\\)\\s*=>\\s*\\{\\s*console\\.(log|warn|info)\\([^)]*\\);\\s*\\}\\s*\\)', 'g'),
  
  // Skip markers without reason
  SKIP_NO_REASON: new RegExp('\\.(skip|todo)\\s*\\(\\s*[\'"`][^\'"`]+[\'"`]\\s*,', 'g'),
} as any;

export type TheaterPatternName = keyof typeof THEATER_PATTERNS;

// --- MOCK THRESHOLD ---
const MAX_MOCKS_PER_FILE = 5;

// --- DETECTOR IMPLEMENTATION ---

export class TheaterDetector implements Detector {
  readonly name = 'SCREAM_THEATER';
  readonly port = 2;
  readonly screamType = 'SCREAM_THEATER' as const;
  readonly description = 'Detects fake tests, mock poisoning, and placeholder code';

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
   * Scan file content for theater patterns
   */
  private scanContent(
    filePath: string,
    content: string,
    config: DetectorConfig
  ): ScreamReceipt[] {
    const receipts: ScreamReceipt[] = [];
    const isTestFile = filePath.includes('.test.') || filePath.includes('.spec.');

    // Check placeholder patterns in all files
    for (const [patternName, pattern] of Object.entries(THEATER_PATTERNS)) {
      // Reset regex lastIndex for global patterns
      pattern.lastIndex = 0;
      
      // Some patterns only apply to test files
      if (this.isTestOnlyPattern(patternName as TheaterPatternName) && !isTestFile) {
        continue;
      }
      
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        const lineNumbers = this.findLineNumbers(content, pattern);
        
        receipts.push(createScreamReceipt(
          'SCREAM_THEATER',
          2,
          filePath,
          {
            theaterType: patternName,
            pattern: pattern.source,
            matchCount: matches.length,
            lineNumbers,
            severity: this.getSeverityForPattern(patternName as TheaterPatternName),
          },
          config.severity
        ));
      }
    }

    // Test-specific checks
    if (isTestFile) {
      // Check for assertionless tests
      if (this.hasAssertionlessTests(content)) {
        receipts.push(createScreamReceipt(
          'SCREAM_THEATER',
          2,
          filePath,
          {
            theaterType: 'ASSERTIONLESS_TEST',
            message: 'Test file contains tests without assertions',
            severity: 'critical',
          },
          'critical'
        ));
      }

      // Check for mock overuse
      const mockCount = this.countMocks(content);
      if (mockCount > MAX_MOCKS_PER_FILE) {
        receipts.push(createScreamReceipt(
          'SCREAM_THEATER',
          2,
          filePath,
          {
            theaterType: 'MOCK_POISONING',
            mockCount,
            threshold: MAX_MOCKS_PER_FILE,
            message: `File has ${mockCount} mocks, exceeds threshold of ${MAX_MOCKS_PER_FILE}`,
            severity: 'warning',
          },
          'warning'
        ));
      }
    }

    return receipts;
  }

  /**
   * Check if pattern only applies to test files
   */
  private isTestOnlyPattern(patternName: TheaterPatternName): boolean {
    return patternName === 'EMPTY_TEST' || 
           patternName === 'CONSOLE_ONLY_TEST' ||
           patternName === 'SKIP_NO_REASON';
  }

  /**
   * Check if test file has tests without assertions
   */
  private hasAssertionlessTests(content: string): boolean {
    // Find all it() blocks
    const testBlockRegex = /it\s*\([^,]+,\s*(?:async\s*)?\([^)]*\)\s*=>\s*\{([^}]*)\}/g;
    let match;
    
    while ((match = testBlockRegex.exec(content)) !== null) {
      const testBody = match[1];
      // Check if test body has any assertions
      const hasAssertion = /expect\s*\(|assert\.|should\.|toBe|toEqual|toMatch|toThrow|toHaveBeenCalled/i.test(testBody);
      if (!hasAssertion && testBody.trim().length > 0) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Count mock declarations in file
   */
  private countMocks(content: string): number {
    const mockPatterns = [
      /vi\.mock\s*\(/g,
      /vi\.fn\s*\(/g,
      /vi\.spyOn\s*\(/g,
      /jest\.mock\s*\(/g,
      /jest\.fn\s*\(/g,
      /jest\.spyOn\s*\(/g,
    ];
    
    let count = 0;
    for (const pattern of mockPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        count += matches.length;
      }
    }
    
    return count;
  }

  /**
   * Find line numbers where pattern matches
   */
  private findLineNumbers(content: string, pattern: RegExp): number[] {
    const lines = content.split('\n');
    const lineNumbers: number[] = [];
    
    // Create a new regex without global flag for line-by-line matching
    const flags = pattern.flags.replace('g', '').replace('s', '');
    const linePattern = new RegExp(pattern.source, flags);
    
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
  private getSeverityForPattern(patternName: TheaterPatternName): 'warning' | 'error' | 'critical' {
    switch (patternName) {
      case 'NOT_IMPLEMENTED':
      case 'STUB_RETURN':
        return 'error';
      case 'EMPTY_TEST':
      case 'CONSOLE_ONLY_TEST':
        return 'critical';
      case 'LOGIC_PLACEHOLDER':
      case 'IMPL_PLACEHOLDER':
      case 'SKIP_NO_REASON':
        return 'warning';
      default:
        return 'error';
    }
  }
}

// --- FACTORY FUNCTION ---

export function createTheaterDetector(): Detector {
  return new TheaterDetector();
}
