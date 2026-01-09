/**
 * P4 RED REGNANT - SCREAM_AMNESIA Detector (Port 6)
 * 
 * @port 6
 * @commander KRAKEN_KEEPER (aligned)
 * @verb STORE
 * @tier BRONZE
 * @provenance: .kiro/specs/red-regnant-8-screams/design.md
 * Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5
 * 
 * Detects debug logs and technical debt:
 * - console.log/debug in Silver/Gold
 * - TODO/FIXME without @permitted
 * - Missing API documentation
 * - Commented-out code blocks
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

// --- AMNESIA PATTERNS ---

/**
 * Patterns that indicate debug logs or technical debt
 */
export const AMNESIA_PATTERNS = {
  // Console debug statements
  CONSOLE_LOG: new RegExp('console.' + 'log\\s*\\(', 'g'),
  CONSOLE_DEBUG: new RegExp('console.' + 'debug\\s*\\(', 'g'),
  CONSOLE_INFO: new RegExp('console.' + 'info\\s*\\(', 'g'),
  
  // Debugger statements
  DEBUGGER: new RegExp('\\b' + 'debugger' + '\\b', 'g'),
  
  // TODO without @permitted
  TODO_BARE: new RegExp('//\\s*' + 'TO' + 'DO' + '(?!.*@permitted)', 'gi'),
  
  // FIXME without @permitted
  FIXME_BARE: new RegExp('//\\s*' + 'FIXME' + '(?!.*@permitted)', 'gi'),
  
  // HACK without @permitted
  HACK_BARE: new RegExp('//\\s*' + 'HACK' + '(?!.*@permitted)', 'gi'),
  
  // XXX markers
  XXX_MARKER: new RegExp('//\\s*' + 'XXX', 'gi'),
  
  // Commented-out code (heuristic: // followed by code-like patterns)
  COMMENTED_CODE: new RegExp('//\\s*(const|let|var|function|class|import|export|return|if|for|while)\\s+', 'g'),
  
  // Alert statements (browser)
  ALERT_CALL: new RegExp('\\b' + 'alert' + '\\s*\\(', 'g'),
} as any;

export type AmnesiaPatternName = keyof typeof AMNESIA_PATTERNS;

// --- TIER DETECTION ---

const SILVER_GOLD_PATH = /[/\\](silver|gold)[/\\]/i;

// --- DETECTOR IMPLEMENTATION ---

export class AmnesiaDetector implements Detector {
  readonly name = 'SCREAM_AMNESIA';
  readonly port = 6;
  readonly screamType = 'SCREAM_AMNESIA' as const;
  readonly description = 'Detects debug logs and technical debt';

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
   * Scan file content for amnesia patterns
   */
  private scanContent(
    filePath: string,
    content: string,
    config: DetectorConfig
  ): ScreamReceipt[] {
    const receipts: ScreamReceipt[] = [];
    const isTestFile = filePath.includes('.test.') || filePath.includes('.spec.');
    const isSilverOrGold = SILVER_GOLD_PATH.test(filePath);

    for (const [patternName, pattern] of Object.entries(AMNESIA_PATTERNS)) {
      pattern.lastIndex = 0;
      
      // Console logs are only violations in Silver/Gold (not Bronze or tests)
      if (this.isConsolePattern(patternName as AmnesiaPatternName)) {
        if (!isSilverOrGold || isTestFile) {
          continue;
        }
      }
      
      // Skip commented code detection in test files
      if (patternName === 'COMMENTED_CODE' && isTestFile) {
        continue;
      }
      
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        const lineNumbers = this.findLineNumbers(content, pattern);
        
        receipts.push(createScreamReceipt(
          'SCREAM_AMNESIA',
          6,
          filePath,
          {
            amnesiaType: patternName,
            pattern: pattern.source,
            matchCount: matches.length,
            lineNumbers,
            isSilverOrGold,
            severity: this.getSeverityForPattern(patternName as AmnesiaPatternName, isSilverOrGold),
          },
          config.severity
        ));
      }
    }

    // Check for missing JSDoc on exported functions in Silver/Gold
    if (isSilverOrGold && !isTestFile) {
      const missingDocs = this.checkMissingDocumentation(content);
      if (missingDocs.length > 0) {
        receipts.push(createScreamReceipt(
          'SCREAM_AMNESIA',
          6,
          filePath,
          {
            amnesiaType: 'MISSING_DOCUMENTATION',
            undocumentedExports: missingDocs,
            count: missingDocs.length,
            message: `${missingDocs.length} exported functions/classes missing JSDoc`,
            severity: 'warning',
          },
          'warning'
        ));
      }
    }

    return receipts;
  }

  /**
   * Check if pattern is a console-related pattern
   */
  private isConsolePattern(patternName: AmnesiaPatternName): boolean {
    return patternName === 'CONSOLE_LOG' || 
           patternName === 'CONSOLE_DEBUG' || 
           patternName === 'CONSOLE_INFO' ||
           patternName === 'DEBUGGER' ||
           patternName === 'ALERT_CALL';
  }

  /**
   * Check for missing documentation on exports
   */
  private checkMissingDocumentation(content: string): string[] {
    const undocumented: string[] = [];
    
    // Find exported functions without preceding JSDoc
    const exportFunctionRegex = /(?<!\/\*\*[\s\S]*?\*\/\s*)export\s+(async\s+)?function\s+(\w+)/g;
    let match;
    
    while ((match = exportFunctionRegex.exec(content)) !== null) {
      // Check if there's a JSDoc comment before this export
      const beforeMatch = content.substring(0, match.index);
      const lastJsDoc = beforeMatch.lastIndexOf('*/');
      const lastCode = Math.max(
        beforeMatch.lastIndexOf(';'),
        beforeMatch.lastIndexOf('}'),
        beforeMatch.lastIndexOf('{')
      );
      
      // If no JSDoc or JSDoc is before other code
      if (lastJsDoc === -1 || lastJsDoc < lastCode) {
        undocumented.push(match[2]);
      }
    }
    
    // Find exported classes without preceding JSDoc
    const exportClassRegex = /(?<!\/\*\*[\s\S]*?\*\/\s*)export\s+class\s+(\w+)/g;
    
    while ((match = exportClassRegex.exec(content)) !== null) {
      const beforeMatch = content.substring(0, match.index);
      const lastJsDoc = beforeMatch.lastIndexOf('*/');
      const lastCode = Math.max(
        beforeMatch.lastIndexOf(';'),
        beforeMatch.lastIndexOf('}'),
        beforeMatch.lastIndexOf('{')
      );
      
      if (lastJsDoc === -1 || lastJsDoc < lastCode) {
        undocumented.push(match[1]);
      }
    }
    
    return undocumented;
  }

  /**
   * Find line numbers where pattern matches
   */
  private findLineNumbers(content: string, pattern: RegExp): number[] {
    const lines = content.split('\n');
    const lineNumbers: number[] = [];
    
    const flags = pattern.flags.replace('g', '');
    const linePattern = new RegExp(pattern.source, flags);
    
    for (let i = 0; i < lines.length; i++) {
      if (linePattern.test(lines[i])) {
        lineNumbers.push(i + 1);
      }
    }
    
    return lineNumbers;
  }

  /**
   * Get severity based on pattern type and tier
   */
  private getSeverityForPattern(
    patternName: AmnesiaPatternName, 
    isSilverOrGold: boolean
  ): 'warning' | 'error' | 'critical' {
    // Console/debug in Silver/Gold is an error
    if (this.isConsolePattern(patternName) && isSilverOrGold) {
      return 'error';
    }
    
    switch (patternName) {
      case 'DEBUGGER':
        return 'error';
      case 'TODO_BARE':
      case 'FIXME_BARE':
      case 'HACK_BARE':
        return isSilverOrGold ? 'error' : 'warning';
      case 'XXX_MARKER':
        return 'warning';
      case 'COMMENTED_CODE':
        return 'warning';
      default:
        return 'warning';
    }
  }
}

// --- FACTORY FUNCTION ---

export function createAmnesiaDetector(): Detector {
  return new AmnesiaDetector();
}
