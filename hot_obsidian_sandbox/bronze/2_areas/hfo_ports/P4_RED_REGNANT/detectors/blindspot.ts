/**
 * P4 RED REGNANT - SCREAM_BLINDSPOT Detector (Port 0)
 * 
 * @port 0
 * @commander LIDLESS_LEGION (aligned)
 * @verb SENSE
 * @tier SILVER
 * @provenance: .kiro/specs/silver-promotion-blindspot/design.md
 * @mutationScore: 80.95% (Goldilocks)
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5
 * 
 * Detects silent failures and missing observations:
 * - Empty catch blocks
 * - Empty then handlers
 * - @ignore-error annotations
 * - Functions without error handling
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

// --- BLINDSPOT PATTERNS ---

/**
 * Patterns that indicate silent failures or missing observations
 */
export const BLINDSPOT_PATTERNS = {
  // Empty catch blocks - silent error swallowing
  EMPTY_CATCH: /catch\s*\([^)]*\)\s*\{\s*\}/g,
  
  // Empty then handlers - ignored promise results
  EMPTY_THEN: /\.then\(\s*\(\)\s*=>\s*\{\s*\}\s*\)/g,
  
  // Explicit error ignoring annotations
  IGNORE_ERROR: /\/\/\s*@ignore-error/gi,
  
  // Empty finally blocks
  EMPTY_FINALLY: /finally\s*\{\s*\}/g,
  
  // Catch with only console log (not proper handling)
  CATCH_CONSOLE_ONLY: /catch\s*\([^)]*\)\s*\{\s*console\.(log|warn)\([^)]*\);\s*\}/g,
  
  // Async function without try-catch
  ASYNC_NO_TRY: /async\s+function\s+\w+\s*\([^)]*\)\s*\{(?![\s\S]*try\s*\{)/g,
  
  // Promise without catch
  PROMISE_NO_CATCH: /new\s+Promise\s*\([^)]*\)(?![\s\S]*\.catch)/g,
} as const;

export type BlindspotPatternName = keyof typeof BLINDSPOT_PATTERNS;

// --- DETECTOR IMPLEMENTATION ---

export class BlindspotDetector implements Detector {
  readonly name = 'SCREAM_BLINDSPOT';
  readonly port = 0;
  readonly screamType = 'SCREAM_BLINDSPOT' as const;
  readonly description = 'Detects silent failures and missing observations';

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
        } catch (err) {
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
   * Scan file content for blindspot patterns
   */
  private scanContent(
    filePath: string,
    content: string,
    config: DetectorConfig
  ): ScreamReceipt[] {
    const receipts: ScreamReceipt[] = [];
    const relativePath = filePath;

    // Check each pattern
    for (const [patternName, pattern] of Object.entries(BLINDSPOT_PATTERNS)) {
      // Reset regex lastIndex for global patterns
      pattern.lastIndex = 0;
      
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        // Find line numbers for each match
        const lineNumbers = this.findLineNumbers(content, pattern);
        
        receipts.push(createScreamReceipt(
          'SCREAM_BLINDSPOT',
          0,
          relativePath,
          {
            patternName,
            pattern: pattern.source,
            matchCount: matches.length,
            lineNumbers,
            severity: this.getSeverityForPattern(patternName as BlindspotPatternName),
          },
          config.severity
        ));
      }
    }

    return receipts;
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
  private getSeverityForPattern(patternName: BlindspotPatternName): 'warning' | 'error' | 'critical' {
    switch (patternName) {
      case 'EMPTY_CATCH':
      case 'IGNORE_ERROR':
        return 'error';
      case 'CATCH_CONSOLE_ONLY':
      case 'EMPTY_THEN':
        return 'warning';
      case 'ASYNC_NO_TRY':
      case 'PROMISE_NO_CATCH':
        return 'warning';
      default:
        return 'error';
    }
  }
}

// --- FACTORY FUNCTION ---

export function createBlindspotDetector(): Detector {
  return new BlindspotDetector();
}
