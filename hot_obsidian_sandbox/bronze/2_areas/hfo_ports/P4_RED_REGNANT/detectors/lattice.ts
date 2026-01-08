/**
 * P4 RED REGNANT - SCREAM_LATTICE Detector (Port 7)
 * 
 * @port 7
 * @commander SPIDER_SOVEREIGN (aligned)
 * @verb DECIDE
 * @tier BRONZE
 * @provenance: .kiro/specs/red-regnant-8-screams/design.md
 * Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5
 * 
 * Detects governance and BDD alignment issues:
 * - Folder density violations (octal limits)
 * - Missing requirement traceability
 * - Bypass annotations without approval
 * - Spec-to-implementation drift
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

// --- LATTICE THRESHOLDS ---

export const LATTICE_THRESHOLDS = {
  MAX_FILES_PER_FOLDER: 8,      // Octal limit
  MAX_FOLDERS_PER_FOLDER: 8,   // Octal limit
  MAX_DEPTH: 7,                 // Maximum nesting depth
} as const;

// --- LATTICE PATTERNS ---

export const LATTICE_PATTERNS = {
  // Bypass annotations without approval
  BYPASS_BARE: /\/\/\s*@bypass(?!.*@approved)/gi,
  
  // Skip annotations without reason (bare = only whitespace or newline after)
  SKIP_BARE: /\/\/\s*@skip\s*$/gm,
  
  // Override annotations without justification
  OVERRIDE_BARE: /\/\/\s*@override\s*$/gm,
  
  // Missing provenance in implementation files
  MISSING_PROVENANCE: /@provenance:/i,
  
  // Missing requirement reference
  VALIDATES_PATTERN: /Validates:\s*Requirements?\s+[\d.,\s]+/i,
} as const;

export type LatticePatternName = keyof typeof LATTICE_PATTERNS;

// --- TIER DETECTION ---

const SILVER_GOLD_PATH = /[/\\](silver|gold)[/\\]/i;

// --- DETECTOR IMPLEMENTATION ---

export class LatticeDetector implements Detector {
  readonly name = 'SCREAM_LATTICE';
  readonly port = 7;
  readonly screamType = 'SCREAM_LATTICE' as const;
  readonly description = 'Detects governance and BDD alignment issues';

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

    if (!fs.existsSync(targetPath)) {
      return {
        screamType: this.screamType,
        receipts,
        filesScanned,
        violationsFound: 0,
        duration: Date.now() - startTime,
      };
    }

    const stat = fs.statSync(targetPath);
    
    if (stat.isDirectory()) {
      // Check folder density
      const densityReceipts = this.checkFolderDensity(targetPath, mergedConfig);
      receipts.push(...densityReceipts);

      // Scan files for pattern violations
      const walk = (dir: string, depth: number = 0) => {
        if (depth > LATTICE_THRESHOLDS.MAX_DEPTH + 2) return; // Allow some buffer
        
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
          if (entry.isDirectory()) {
            if (!mergedConfig.excludeDirs.includes(entry.name)) {
              walk(fullPath, depth + 1);
            }
            continue;
          }

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

      walk(targetPath);
    } else {
      filesScanned = 1;
      const content = fs.readFileSync(targetPath, 'utf8');
      const fileReceipts = this.scanContent(targetPath, content, mergedConfig);
      receipts.push(...fileReceipts);
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
   * Check folder density (octal limits)
   */
  private checkFolderDensity(
    rootPath: string,
    config: DetectorConfig,
    depth: number = 0
  ): ScreamReceipt[] {
    const receipts: ScreamReceipt[] = [];
    
    if (depth > LATTICE_THRESHOLDS.MAX_DEPTH + 2) return receipts;
    
    try {
      const entries = fs.readdirSync(rootPath, { withFileTypes: true });
      
      // Count files and folders
      let fileCount = 0;
      let folderCount = 0;
      const subDirs: string[] = [];
      
      for (const entry of entries) {
        if (config.excludeDirs.includes(entry.name)) continue;
        
        if (entry.isDirectory()) {
          folderCount++;
          subDirs.push(path.join(rootPath, entry.name));
        } else {
          fileCount++;
        }
      }
      
      // Check file density
      if (fileCount > LATTICE_THRESHOLDS.MAX_FILES_PER_FOLDER) {
        receipts.push(createScreamReceipt(
          'SCREAM_LATTICE',
          7,
          rootPath,
          {
            latticeType: 'FILE_DENSITY_VIOLATION',
            fileCount,
            threshold: LATTICE_THRESHOLDS.MAX_FILES_PER_FOLDER,
            message: `Folder has ${fileCount} files, exceeds octal limit of ${LATTICE_THRESHOLDS.MAX_FILES_PER_FOLDER}`,
            severity: 'warning',
          },
          'warning'
        ));
      }
      
      // Check folder density
      if (folderCount > LATTICE_THRESHOLDS.MAX_FOLDERS_PER_FOLDER) {
        receipts.push(createScreamReceipt(
          'SCREAM_LATTICE',
          7,
          rootPath,
          {
            latticeType: 'FOLDER_DENSITY_VIOLATION',
            folderCount,
            threshold: LATTICE_THRESHOLDS.MAX_FOLDERS_PER_FOLDER,
            message: `Folder has ${folderCount} subfolders, exceeds octal limit of ${LATTICE_THRESHOLDS.MAX_FOLDERS_PER_FOLDER}`,
            severity: 'warning',
          },
          'warning'
        ));
      }
      
      // Check depth
      if (depth > LATTICE_THRESHOLDS.MAX_DEPTH) {
        receipts.push(createScreamReceipt(
          'SCREAM_LATTICE',
          7,
          rootPath,
          {
            latticeType: 'DEPTH_VIOLATION',
            depth,
            threshold: LATTICE_THRESHOLDS.MAX_DEPTH,
            message: `Folder depth ${depth} exceeds maximum of ${LATTICE_THRESHOLDS.MAX_DEPTH}`,
            severity: 'warning',
          },
          'warning'
        ));
      }
      
      // Recurse into subdirectories
      for (const subDir of subDirs) {
        const subReceipts = this.checkFolderDensity(subDir, config, depth + 1);
        receipts.push(...subReceipts);
      }
    } catch {
      // Ignore read errors
    }
    
    return receipts;
  }

  /**
   * Scan file content for lattice patterns
   */
  private scanContent(
    filePath: string,
    content: string,
    config: DetectorConfig
  ): ScreamReceipt[] {
    const receipts: ScreamReceipt[] = [];
    const isTestFile = filePath.includes('.test.') || filePath.includes('.spec.');
    const isSilverOrGold = SILVER_GOLD_PATH.test(filePath);

    // Check bypass annotations
    const bypassPattern = LATTICE_PATTERNS.BYPASS_BARE;
    bypassPattern.lastIndex = 0;
    const bypassMatches = content.match(bypassPattern);
    if (bypassMatches && bypassMatches.length > 0) {
      receipts.push(createScreamReceipt(
        'SCREAM_LATTICE',
        7,
        filePath,
        {
          latticeType: 'BYPASS_VIOLATION',
          matchCount: bypassMatches.length,
          lineNumbers: this.findLineNumbers(content, bypassPattern),
          message: 'Bypass annotation without @approved',
          severity: 'error',
        },
        'error'
      ));
    }

    // Check skip annotations
    const skipPattern = LATTICE_PATTERNS.SKIP_BARE;
    skipPattern.lastIndex = 0;
    const skipMatches = content.match(skipPattern);
    if (skipMatches && skipMatches.length > 0) {
      receipts.push(createScreamReceipt(
        'SCREAM_LATTICE',
        7,
        filePath,
        {
          latticeType: 'SKIP_VIOLATION',
          matchCount: skipMatches.length,
          lineNumbers: this.findLineNumbers(content, skipPattern),
          message: 'Skip annotation without reason',
          severity: 'warning',
        },
        'warning'
      ));
    }

    // Check for missing traceability in Silver/Gold implementation files
    if (isSilverOrGold && !isTestFile) {
      const hasProvenance = LATTICE_PATTERNS.MISSING_PROVENANCE.test(content);
      const hasValidates = LATTICE_PATTERNS.VALIDATES_PATTERN.test(content);
      
      if (!hasProvenance && !hasValidates) {
        receipts.push(createScreamReceipt(
          'SCREAM_LATTICE',
          7,
          filePath,
          {
            latticeType: 'TRACEABILITY_VIOLATION',
            hasProvenance,
            hasValidates,
            message: 'Silver/Gold file missing requirement traceability (@provenance or Validates)',
            severity: 'warning',
          },
          'warning'
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
    
    const flags = pattern.flags.replace('g', '');
    const linePattern = new RegExp(pattern.source, flags);
    
    for (let i = 0; i < lines.length; i++) {
      if (linePattern.test(lines[i])) {
        lineNumbers.push(i + 1);
      }
    }
    
    return lineNumbers;
  }
}

// --- FACTORY FUNCTION ---

export function createLatticeDetector(): Detector {
  return new LatticeDetector();
}
