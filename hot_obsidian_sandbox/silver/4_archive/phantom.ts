/**
 * P4 RED REGNANT - SCREAM_PHANTOM Detector (Port 3)
 * 
 * @port 3
 * @commander SPORE_STORM (aligned)
 * @verb DELIVER
 * @tier BRONZE
 * @provenance: .kiro/specs/red-regnant-8-screams/design.md
 * Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5
 * 
 * Detects external dependencies and supply chain risks:
 * - CDN dependencies
 * - Unpinned npm dependencies
 * - External API calls
 * - Dynamic imports from URLs
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

// --- PHANTOM PATTERNS ---

/**
 * Patterns that indicate external dependencies or supply chain risks
 */
export const PHANTOM_PATTERNS = {
  // CDN script tags
  CDN_SCRIPT: /<script[^>]+src=["']https?:\/\/[^"']+["'][^>]*>/gi,
  
  // CDN link tags
  CDN_LINK: /<link[^>]+href=["']https?:\/\/[^"']+["'][^>]*>/gi,
  
  // Dynamic import from URL
  DYNAMIC_IMPORT_URL: /import\s*\(\s*["'`]https?:\/\//gi,
  
  // Fetch to external API
  FETCH_EXTERNAL: /fetch\s*\(\s*["'`]https?:\/\/(?!localhost|127\.0\.0\.1)/gi,
  
  // Axios to external API
  AXIOS_EXTERNAL: /axios\.(get|post|put|delete|patch)\s*\(\s*["'`]https?:\/\/(?!localhost|127\.0\.0\.1)/gi,
  
  // XMLHttpRequest to external
  XHR_EXTERNAL: /\.open\s*\(\s*["'][^"']+["']\s*,\s*["'`]https?:\/\/(?!localhost|127\.0\.0\.1)/gi,
  
  // eval() usage (code injection risk)
  EVAL_USAGE: /\beval\s*\(/g,
  
  // new Function() usage (code injection risk)
  NEW_FUNCTION: /new\s+Function\s*\(/g,
  
  // document.write (XSS risk)
  DOCUMENT_WRITE: /document\.write\s*\(/g,
  
  // innerHTML assignment (XSS risk)
  INNER_HTML: /\.innerHTML\s*=/g,
} as const;

export type PhantomPatternName = keyof typeof PHANTOM_PATTERNS;

// --- PACKAGE.JSON PATTERNS ---

const UNPINNED_VERSION = /["'][\^~><=]/;
const LATEST_VERSION = /["']latest["']/i;
const STAR_VERSION = /["']\*["']/;

// --- DETECTOR IMPLEMENTATION ---

export class PhantomDetector implements Detector {
  readonly name = 'SCREAM_PHANTOM';
  readonly port = 3;
  readonly screamType = 'SCREAM_PHANTOM' as const;
  readonly description = 'Detects external dependencies and supply chain risks';

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

        // Special handling for package.json
        if (entry.name === 'package.json') {
          filesScanned++;
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            const pkgReceipts = this.scanPackageJson(fullPath, content, mergedConfig);
            receipts.push(...pkgReceipts);
          } catch {
            continue;
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
        
        if (targetPath.endsWith('package.json')) {
          const pkgReceipts = this.scanPackageJson(targetPath, content, mergedConfig);
          receipts.push(...pkgReceipts);
        } else {
          const fileReceipts = this.scanContent(targetPath, content, mergedConfig);
          receipts.push(...fileReceipts);
        }
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
   * Scan file content for phantom patterns
   */
  private scanContent(
    filePath: string,
    content: string,
    config: DetectorConfig
  ): ScreamReceipt[] {
    const receipts: ScreamReceipt[] = [];

    for (const [patternName, pattern] of Object.entries(PHANTOM_PATTERNS)) {
      pattern.lastIndex = 0;
      
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        const lineNumbers = this.findLineNumbers(content, pattern);
        
        receipts.push(createScreamReceipt(
          'SCREAM_PHANTOM',
          3,
          filePath,
          {
            phantomType: patternName,
            pattern: pattern.source,
            matchCount: matches.length,
            lineNumbers,
            severity: this.getSeverityForPattern(patternName as PhantomPatternName),
          },
          config.severity
        ));
      }
    }

    return receipts;
  }

  /**
   * Scan package.json for unpinned dependencies
   */
  private scanPackageJson(
    filePath: string,
    content: string,
    config: DetectorConfig
  ): ScreamReceipt[] {
    const receipts: ScreamReceipt[] = [];

    try {
      const pkg = JSON.parse(content);
      const depSections = ['dependencies', 'devDependencies', 'peerDependencies'];
      
      for (const section of depSections) {
        const deps = pkg[section];
        if (!deps || typeof deps !== 'object') continue;
        
        const unpinnedDeps: string[] = [];
        
        for (const [name, version] of Object.entries(deps)) {
          if (typeof version !== 'string') continue;
          
          if (UNPINNED_VERSION.test(`"${version}"`) || 
              LATEST_VERSION.test(`"${version}"`) ||
              STAR_VERSION.test(`"${version}"`)) {
            unpinnedDeps.push(`${name}@${version}`);
          }
        }
        
        if (unpinnedDeps.length > 0) {
          receipts.push(createScreamReceipt(
            'SCREAM_PHANTOM',
            3,
            filePath,
            {
              phantomType: 'UNPINNED_DEPENDENCY',
              section,
              unpinnedDeps,
              count: unpinnedDeps.length,
              message: `Found ${unpinnedDeps.length} unpinned dependencies in ${section}`,
              severity: 'warning',
            },
            'warning'
          ));
        }
      }
    } catch {
      // Invalid JSON, skip
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

  /**
   * Get severity based on pattern type
   */
  private getSeverityForPattern(patternName: PhantomPatternName): 'warning' | 'error' | 'critical' {
    switch (patternName) {
      case 'EVAL_USAGE':
      case 'NEW_FUNCTION':
        return 'critical';
      case 'CDN_SCRIPT':
      case 'CDN_LINK':
      case 'DYNAMIC_IMPORT_URL':
        return 'error';
      case 'DOCUMENT_WRITE':
      case 'INNER_HTML':
        return 'error';
      case 'FETCH_EXTERNAL':
      case 'AXIOS_EXTERNAL':
      case 'XHR_EXTERNAL':
        return 'warning';
      default:
        return 'warning';
    }
  }
}

// --- FACTORY FUNCTION ---

export function createPhantomDetector(): Detector {
  return new PhantomDetector();
}
