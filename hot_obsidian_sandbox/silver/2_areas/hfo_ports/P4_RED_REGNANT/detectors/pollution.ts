/**
 * P4 RED REGNANT - SCREAM_POLLUTION Detector (Port 5)
 * 
 * @port 5
 * @commander PYRE_PRAETORIAN (aligned)
 * @verb IMMUNIZE
 * @tier BRONZE
 * @provenance: .kiro/specs/red-regnant-8-screams/design.md
 * Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5
 * 
 * Detects root pollution and medallion violations:
 * - Unauthorized root files
 * - Recursive sandbox loops
 * - Medallion tier violations
 * - PARA structure violations
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

// --- ROOT WHITELIST ---

/**
 * Files/folders allowed in root directory per AGENTS.md
 */
export const ROOT_WHITELIST = [
  'hot_obsidian_sandbox',
  'cold_obsidian_sandbox',
  'AGENTS.md',
  'llms.txt',
  'ROOT_GOVERNANCE_MANIFEST.md',
  // ttao-notes-*.md pattern handled separately
  '.git',
  '.gitignore',
  '.github',
  '.husky',
  '.kiro',
  '.vscode',
  '.venv',
  '.env',
  'node_modules',
  'package.json',
  'package-lock.json',
  'reports',
  // Stryker temp directories
  '.stryker-tmp',
  '.stryker-tmp-p1',
  // Config files
  'stryker.p1.config.mjs',
  'vitest.config.ts',
  'tsconfig.json',
] as const;

// --- PARA STRUCTURE ---

export const PARA_FOLDERS = ['1_projects', '2_areas', '3_resources', '4_archive'] as const;

// --- MEDALLION TIERS ---

export const MEDALLION_TIERS = ['gold', 'silver', 'bronze'] as const;

// --- DETECTOR IMPLEMENTATION ---

export class PollutionDetector implements Detector {
  readonly name = 'SCREAM_POLLUTION';
  readonly port = 5;
  readonly screamType = 'SCREAM_POLLUTION' as const;
  readonly description = 'Detects root pollution and medallion violations';

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
      // Check root pollution
      const rootReceipts = this.checkRootPollution(targetPath, mergedConfig);
      receipts.push(...rootReceipts);
      filesScanned += rootReceipts.length > 0 ? 1 : 0;

      // Check sandbox structure
      const sandboxReceipts = this.checkSandboxStructure(targetPath, mergedConfig);
      receipts.push(...sandboxReceipts);
      filesScanned += sandboxReceipts.length > 0 ? 1 : 0;

      // Check for recursive sandbox loops
      const loopReceipts = this.checkRecursiveLoops(targetPath, mergedConfig);
      receipts.push(...loopReceipts);
      filesScanned += loopReceipts.length > 0 ? 1 : 0;
    } else {
      // Single file - check if it's in wrong location
      filesScanned = 1;
      const fileReceipts = this.checkFileLocation(targetPath, mergedConfig);
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
   * Check for unauthorized files in root directory
   */
  private checkRootPollution(
    rootPath: string,
    config: DetectorConfig
  ): ScreamReceipt[] {
    const receipts: ScreamReceipt[] = [];
    
    try {
      const entries = fs.readdirSync(rootPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const name = entry.name;
        
        // Check whitelist
        if (this.isWhitelisted(name)) {
          continue;
        }
        
        // Check ttao-notes pattern
        if (/^ttao-notes-.*\.md$/.test(name)) {
          continue;
        }
        
        receipts.push(createScreamReceipt(
          'SCREAM_POLLUTION',
          5,
          path.join(rootPath, name),
          {
            pollutionType: 'ROOT_POLLUTION',
            fileName: name,
            isDirectory: entry.isDirectory(),
            message: `Unauthorized ${entry.isDirectory() ? 'directory' : 'file'} in root: ${name}`,
            severity: 'error',
          },
          config.severity
        ));
      }
    } catch {
      // Ignore read errors
    }
    
    return receipts;
  }

  /**
   * Check sandbox PARA structure
   */
  private checkSandboxStructure(
    rootPath: string,
    config: DetectorConfig
  ): ScreamReceipt[] {
    const receipts: ScreamReceipt[] = [];
    
    const sandboxes = ['hot_obsidian_sandbox', 'cold_obsidian_sandbox'];
    
    for (const sandbox of sandboxes) {
      const sandboxPath = path.join(rootPath, sandbox);
      
      if (!fs.existsSync(sandboxPath)) {
        continue;
      }
      
      // Check each medallion tier
      for (const tier of MEDALLION_TIERS) {
        const tierPath = path.join(sandboxPath, tier);
        
        if (!fs.existsSync(tierPath)) {
          continue;
        }
        
        // Check PARA structure
        const paraReceipts = this.checkParaStructure(tierPath, sandbox, tier, config);
        receipts.push(...paraReceipts);
      }
    }
    
    return receipts;
  }

  /**
   * Check PARA folder structure within a medallion tier
   */
  private checkParaStructure(
    tierPath: string,
    sandbox: string,
    tier: string,
    config: DetectorConfig
  ): ScreamReceipt[] {
    const receipts: ScreamReceipt[] = [];
    
    try {
      const entries = fs.readdirSync(tierPath, { withFileTypes: true });
      
      for (const entry of entries) {
        // Skip non-directories and special files
        if (!entry.isDirectory()) {
          // Allow certain files at tier level
          if (entry.name.endsWith('.jsonl') || entry.name === 'README.md') {
            continue;
          }
          
          receipts.push(createScreamReceipt(
            'SCREAM_POLLUTION',
            5,
            path.join(tierPath, entry.name),
            {
              pollutionType: 'PARA_VIOLATION',
              sandbox,
              tier,
              fileName: entry.name,
              message: `File at tier level should be in PARA folder: ${entry.name}`,
              severity: 'warning',
            },
            'warning'
          ));
          continue;
        }
        
        // Check if directory follows PARA naming
        const isParaFolder = PARA_FOLDERS.some(p => entry.name === p);
        
        if (!isParaFolder) {
          receipts.push(createScreamReceipt(
            'SCREAM_POLLUTION',
            5,
            path.join(tierPath, entry.name),
            {
              pollutionType: 'PARA_VIOLATION',
              sandbox,
              tier,
              folderName: entry.name,
              expectedFolders: [...PARA_FOLDERS],
              message: `Non-PARA folder in ${tier}: ${entry.name}`,
              severity: 'warning',
            },
            'warning'
          ));
        }
      }
    } catch {
      // Ignore read errors
    }
    
    return receipts;
  }

  /**
   * Check for recursive sandbox loops (sandbox within sandbox)
   */
  private checkRecursiveLoops(
    rootPath: string,
    config: DetectorConfig
  ): ScreamReceipt[] {
    const receipts: ScreamReceipt[] = [];
    
    const sandboxes = ['hot_obsidian_sandbox', 'cold_obsidian_sandbox'];
    
    for (const sandbox of sandboxes) {
      const sandboxPath = path.join(rootPath, sandbox);
      
      if (!fs.existsSync(sandboxPath)) {
        continue;
      }
      
      // Recursively check for nested sandboxes
      const nestedReceipts = this.findNestedSandboxes(sandboxPath, sandbox, config);
      receipts.push(...nestedReceipts);
    }
    
    return receipts;
  }

  /**
   * Find nested sandbox directories (recursive loop detection)
   */
  private findNestedSandboxes(
    dir: string,
    parentSandbox: string,
    config: DetectorConfig,
    depth: number = 0
  ): ScreamReceipt[] {
    const receipts: ScreamReceipt[] = [];
    
    if (depth > 10) return receipts; // Prevent infinite recursion
    
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        
        // Skip excluded directories
        if (['node_modules', '.git', '4_archive', 'quarantine'].includes(entry.name)) {
          continue;
        }
        
        const fullPath = path.join(dir, entry.name);
        
        // Check for nested sandbox
        if (entry.name === 'hot_obsidian_sandbox' || entry.name === 'cold_obsidian_sandbox') {
          receipts.push(createScreamReceipt(
            'SCREAM_POLLUTION',
            5,
            fullPath,
            {
              pollutionType: 'RECURSIVE_LOOP',
              parentSandbox,
              nestedSandbox: entry.name,
              depth: depth + 1,
              message: `Recursive sandbox detected: ${entry.name} inside ${parentSandbox}`,
              severity: 'critical',
            },
            'critical'
          ));
        }
        
        // Continue searching
        const nested = this.findNestedSandboxes(fullPath, parentSandbox, config, depth + 1);
        receipts.push(...nested);
      }
    } catch {
      // Ignore read errors
    }
    
    return receipts;
  }

  /**
   * Check if a single file is in the correct location
   */
  private checkFileLocation(
    filePath: string,
    config: DetectorConfig
  ): ScreamReceipt[] {
    const receipts: ScreamReceipt[] = [];
    
    // Check if file is in a sandbox
    const inHotSandbox = filePath.includes('hot_obsidian_sandbox');
    const inColdSandbox = filePath.includes('cold_obsidian_sandbox');
    
    if (!inHotSandbox && !inColdSandbox) {
      // File is outside sandboxes - check if it's whitelisted
      const fileName = path.basename(filePath);
      if (!this.isWhitelisted(fileName) && !/^ttao-notes-.*\.md$/.test(fileName)) {
        receipts.push(createScreamReceipt(
          'SCREAM_POLLUTION',
          5,
          filePath,
          {
            pollutionType: 'OUTSIDE_SANDBOX',
            fileName,
            message: `File outside sandbox: ${fileName}`,
            severity: 'warning',
          },
          'warning'
        ));
      }
    }
    
    return receipts;
  }

  /**
   * Check if name is in whitelist
   */
  private isWhitelisted(name: string): boolean {
    return ROOT_WHITELIST.includes(name as typeof ROOT_WHITELIST[number]) ||
           name.startsWith('.stryker-tmp');
  }
}

// --- FACTORY FUNCTION ---

export function createPollutionDetector(): Detector {
  return new PollutionDetector();
}
