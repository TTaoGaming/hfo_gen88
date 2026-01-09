/**
 * P4 RED REGNANT - Detector Interface
 * 
 * @port 4
 * @commander RED_REGNANT
 * @verb SCREAM
 * @tier SILVER
 * @provenance: .kiro/specs/silver-promotion-blindspot/design.md
 * Validates: Requirements 1.5, 2.2
 * 
 * Defines the interface for all 8 SCREAM detectors.
 * Each detector implements this interface to provide consistent behavior.
 */

import { z } from 'zod';
import { ScreamReceipt, ScreamType, ScreamSeverity } from './screams.js';

// --- DETECTOR CONFIG ---

export const DetectorConfigSchema = z.object({
  enabled: z.boolean().default(true),
  severity: ScreamSeverity.default('error'),
  patterns: z.array(z.instanceof(RegExp)).optional(),
  whitelist: z.array(z.string()).optional(),
  excludeDirs: z.array(z.string()).default(['node_modules', '.git', '.venv', 'quarantine', '4_archive']),
  fileExtensions: z.array(z.string()).default(['.ts', '.js', '.tsx', '.jsx']),
});
export type DetectorConfig = z.infer<typeof DetectorConfigSchema>;

// --- DETECTOR RESULT ---

export const DetectorResultSchema = z.object({
  screamType: ScreamType,
  receipts: z.array(z.custom<ScreamReceipt>()),
  filesScanned: z.number().int().min(0),
  violationsFound: z.number().int().min(0),
  duration: z.number().min(0), // milliseconds
});
export type DetectorResult = z.infer<typeof DetectorResultSchema>;

// --- DETECTOR INTERFACE ---

/**
 * Interface for all SCREAM detectors
 * 
 * Each detector is responsible for:
 * 1. Scanning files for specific violation patterns
 * 2. Creating SCREAM receipts for each violation
 * 3. Returning a summary of findings
 */
export interface Detector {
  /** Human-readable name of the detector */
  readonly name: string;
  
  /** Port number (0-7) aligned with Legendary Commander */
  readonly port: number;
  
  /** The SCREAM type this detector produces */
  readonly screamType: ScreamType;
  
  /** Description of what this detector looks for */
  readonly description: string;
  
  /**
   * Run the detector on a target path
   * 
   * @param targetPath - Directory or file to scan
   * @param config - Optional configuration overrides
   * @returns DetectorResult with receipts and statistics
   */
  detect(targetPath: string, config?: Partial<DetectorConfig>): Promise<DetectorResult>;
}

// --- DEFAULT CONFIG ---

export const DEFAULT_DETECTOR_CONFIG: DetectorConfig = {
  enabled: true,
  severity: 'error',
  excludeDirs: ['node_modules', '.git', '.venv', 'quarantine', '4_archive', '.stryker-tmp'],
  fileExtensions: ['.ts', '.js', '.tsx', '.jsx'],
};

// --- HELPER FUNCTIONS ---

/**
 * Merge user config with defaults
 */
export function mergeConfig(
  defaults: DetectorConfig,
  overrides?: Partial<DetectorConfig>
): DetectorConfig {
  if (!overrides) return defaults;
  
  return {
    ...defaults,
    ...overrides,
    excludeDirs: overrides.excludeDirs ?? defaults.excludeDirs,
    fileExtensions: overrides.fileExtensions ?? defaults.fileExtensions,
  };
}

/**
 * Check if a file should be scanned based on config
 */
export function shouldScanFile(
  filePath: string,
  fileName: string,
  config: DetectorConfig
): boolean {
  // Check if file extension is allowed
  const hasValidExtension = config.fileExtensions.some(ext => fileName.endsWith(ext));
  if (!hasValidExtension) return false;
  
  // Check if file is in excluded directory
  const isExcluded = config.excludeDirs.some(dir => filePath.includes(`/${dir}/`) || filePath.includes(`\\${dir}\\`));
  if (isExcluded) return false;
  
  // Check whitelist if provided
  if (config.whitelist && config.whitelist.length > 0) {
    return config.whitelist.some(pattern => filePath.includes(pattern));
  }
  
  return true;
}

/**
 * Create an empty detector result
 */
export function createEmptyResult(screamType: ScreamType): DetectorResult {
  return {
    screamType,
    receipts: [],
    filesScanned: 0,
    violationsFound: 0,
    duration: 0,
  };
}
