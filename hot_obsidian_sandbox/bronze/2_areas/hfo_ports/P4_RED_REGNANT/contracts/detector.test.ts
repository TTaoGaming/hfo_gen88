/**
 * P4 RED REGNANT - Detector Interface Tests
 * 
 * @port 4
 * @commander RED_REGNANT
 * @verb SCREAM
 * @tier SILVER
 * @provenance: .kiro/specs/silver-promotion-blindspot/design.md
 * Validates: Requirements 2.2, 2.3, 2.4
 */

import { describe, it, expect } from 'vitest';
import {
  DetectorConfigSchema,
  DetectorResultSchema,
  DEFAULT_DETECTOR_CONFIG,
  mergeConfig,
  shouldScanFile,
  createEmptyResult,
} from './detector.js';

describe('Detector Contracts (Silver)', () => {
  // --- DETECTOR CONFIG SCHEMA ---
  describe('DetectorConfigSchema', () => {
    it('validates a complete config', () => {
      const config = {
        enabled: true,
        severity: 'error',
        excludeDirs: ['node_modules'],
        fileExtensions: ['.ts'],
      };
      const result = DetectorConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('applies defaults for missing fields', () => {
      const result = DetectorConfigSchema.parse({});
      expect(result.enabled).toBe(true);
      expect(result.severity).toBe('error');
      expect(result.excludeDirs).toContain('node_modules');
      expect(result.fileExtensions).toContain('.ts');
    });

    it('validates severity enum', () => {
      expect(DetectorConfigSchema.safeParse({ severity: 'warning' }).success).toBe(true);
      expect(DetectorConfigSchema.safeParse({ severity: 'error' }).success).toBe(true);
      expect(DetectorConfigSchema.safeParse({ severity: 'critical' }).success).toBe(true);
      expect(DetectorConfigSchema.safeParse({ severity: 'invalid' }).success).toBe(false);
    });

    it('validates enabled as boolean', () => {
      expect(DetectorConfigSchema.safeParse({ enabled: true }).success).toBe(true);
      expect(DetectorConfigSchema.safeParse({ enabled: false }).success).toBe(true);
      expect(DetectorConfigSchema.safeParse({ enabled: 'yes' }).success).toBe(false);
    });

    it('validates excludeDirs as string array', () => {
      expect(DetectorConfigSchema.safeParse({ excludeDirs: ['a', 'b'] }).success).toBe(true);
      expect(DetectorConfigSchema.safeParse({ excludeDirs: [1, 2] }).success).toBe(false);
    });

    it('validates fileExtensions as string array', () => {
      expect(DetectorConfigSchema.safeParse({ fileExtensions: ['.ts', '.js'] }).success).toBe(true);
      expect(DetectorConfigSchema.safeParse({ fileExtensions: [1] }).success).toBe(false);
    });

    it('allows optional whitelist', () => {
      expect(DetectorConfigSchema.safeParse({ whitelist: ['src/'] }).success).toBe(true);
      expect(DetectorConfigSchema.safeParse({}).success).toBe(true);
    });
  });

  // --- DETECTOR RESULT SCHEMA ---
  describe('DetectorResultSchema', () => {
    const validResult = {
      screamType: 'SCREAM_BLINDSPOT',
      receipts: [],
      filesScanned: 10,
      violationsFound: 2,
      duration: 100,
    };

    it('validates a valid result', () => {
      const result = DetectorResultSchema.safeParse(validResult);
      expect(result.success).toBe(true);
    });

    it('rejects invalid screamType', () => {
      const invalid = { ...validResult, screamType: 'INVALID' };
      expect(DetectorResultSchema.safeParse(invalid).success).toBe(false);
    });

    it('rejects negative filesScanned', () => {
      const invalid = { ...validResult, filesScanned: -1 };
      expect(DetectorResultSchema.safeParse(invalid).success).toBe(false);
    });

    it('rejects negative violationsFound', () => {
      const invalid = { ...validResult, violationsFound: -1 };
      expect(DetectorResultSchema.safeParse(invalid).success).toBe(false);
    });

    it('rejects negative duration', () => {
      const invalid = { ...validResult, duration: -1 };
      expect(DetectorResultSchema.safeParse(invalid).success).toBe(false);
    });

    it('accepts zero values', () => {
      const zero = {
        screamType: 'SCREAM_BLINDSPOT',
        receipts: [],
        filesScanned: 0,
        violationsFound: 0,
        duration: 0,
      };
      expect(DetectorResultSchema.safeParse(zero).success).toBe(true);
    });
  });

  // --- DEFAULT CONFIG ---
  describe('DEFAULT_DETECTOR_CONFIG', () => {
    it('has enabled=true', () => {
      expect(DEFAULT_DETECTOR_CONFIG.enabled).toBe(true);
    });

    it('has severity=error', () => {
      expect(DEFAULT_DETECTOR_CONFIG.severity).toBe('error');
    });

    it('excludes node_modules', () => {
      expect(DEFAULT_DETECTOR_CONFIG.excludeDirs).toContain('node_modules');
    });

    it('excludes .git', () => {
      expect(DEFAULT_DETECTOR_CONFIG.excludeDirs).toContain('.git');
    });

    it('excludes .stryker-tmp', () => {
      expect(DEFAULT_DETECTOR_CONFIG.excludeDirs).toContain('.stryker-tmp');
    });

    it('includes .ts extension', () => {
      expect(DEFAULT_DETECTOR_CONFIG.fileExtensions).toContain('.ts');
    });

    it('includes .js extension', () => {
      expect(DEFAULT_DETECTOR_CONFIG.fileExtensions).toContain('.js');
    });
  });

  // --- MERGE CONFIG ---
  describe('mergeConfig', () => {
    it('returns defaults when no overrides', () => {
      const result = mergeConfig(DEFAULT_DETECTOR_CONFIG);
      expect(result).toEqual(DEFAULT_DETECTOR_CONFIG);
    });

    it('returns defaults when overrides is undefined', () => {
      const result = mergeConfig(DEFAULT_DETECTOR_CONFIG, undefined);
      expect(result).toEqual(DEFAULT_DETECTOR_CONFIG);
    });

    it('overrides enabled', () => {
      const result = mergeConfig(DEFAULT_DETECTOR_CONFIG, { enabled: false });
      expect(result.enabled).toBe(false);
    });

    it('overrides severity', () => {
      const result = mergeConfig(DEFAULT_DETECTOR_CONFIG, { severity: 'critical' });
      expect(result.severity).toBe('critical');
    });

    it('overrides excludeDirs completely', () => {
      const result = mergeConfig(DEFAULT_DETECTOR_CONFIG, { excludeDirs: ['custom'] });
      expect(result.excludeDirs).toEqual(['custom']);
    });

    it('overrides fileExtensions completely', () => {
      const result = mergeConfig(DEFAULT_DETECTOR_CONFIG, { fileExtensions: ['.py'] });
      expect(result.fileExtensions).toEqual(['.py']);
    });

    it('preserves defaults for non-overridden fields', () => {
      const result = mergeConfig(DEFAULT_DETECTOR_CONFIG, { enabled: false });
      expect(result.severity).toBe(DEFAULT_DETECTOR_CONFIG.severity);
      expect(result.excludeDirs).toEqual(DEFAULT_DETECTOR_CONFIG.excludeDirs);
    });
  });

  // --- SHOULD SCAN FILE ---
  describe('shouldScanFile', () => {
    const config = DEFAULT_DETECTOR_CONFIG;

    it('returns true for .ts file in allowed path', () => {
      expect(shouldScanFile('/src/app.ts', 'app.ts', config)).toBe(true);
    });

    it('returns true for .js file', () => {
      expect(shouldScanFile('/src/app.js', 'app.js', config)).toBe(true);
    });

    it('returns true for .tsx file', () => {
      expect(shouldScanFile('/src/App.tsx', 'App.tsx', config)).toBe(true);
    });

    it('returns false for .py file', () => {
      expect(shouldScanFile('/src/app.py', 'app.py', config)).toBe(false);
    });

    it('returns false for .txt file', () => {
      expect(shouldScanFile('/src/readme.txt', 'readme.txt', config)).toBe(false);
    });

    it('returns false for file in node_modules (unix path)', () => {
      expect(shouldScanFile('/node_modules/lib/index.ts', 'index.ts', config)).toBe(false);
    });

    it('returns false for file in node_modules (windows path)', () => {
      expect(shouldScanFile('C:\\node_modules\\lib\\index.ts', 'index.ts', config)).toBe(false);
    });

    it('returns false for file in .git', () => {
      expect(shouldScanFile('/.git/hooks/pre-commit.ts', 'pre-commit.ts', config)).toBe(false);
    });

    it('returns false for file in quarantine', () => {
      expect(shouldScanFile('/quarantine/old.ts', 'old.ts', config)).toBe(false);
    });

    it('respects whitelist when provided', () => {
      const whitelistConfig = { ...config, whitelist: ['src/'] };
      expect(shouldScanFile('/src/app.ts', 'app.ts', whitelistConfig)).toBe(true);
      expect(shouldScanFile('/lib/app.ts', 'app.ts', whitelistConfig)).toBe(false);
    });

    it('ignores whitelist when empty', () => {
      const emptyWhitelist = { ...config, whitelist: [] };
      expect(shouldScanFile('/lib/app.ts', 'app.ts', emptyWhitelist)).toBe(true);
    });
  });

  // --- CREATE EMPTY RESULT ---
  describe('createEmptyResult', () => {
    it('creates result with correct screamType', () => {
      const result = createEmptyResult('SCREAM_BLINDSPOT');
      expect(result.screamType).toBe('SCREAM_BLINDSPOT');
    });

    it('creates result with empty receipts', () => {
      const result = createEmptyResult('SCREAM_BLINDSPOT');
      expect(result.receipts).toEqual([]);
    });

    it('creates result with zero filesScanned', () => {
      const result = createEmptyResult('SCREAM_BLINDSPOT');
      expect(result.filesScanned).toBe(0);
    });

    it('creates result with zero violationsFound', () => {
      const result = createEmptyResult('SCREAM_BLINDSPOT');
      expect(result.violationsFound).toBe(0);
    });

    it('creates result with zero duration', () => {
      const result = createEmptyResult('SCREAM_BLINDSPOT');
      expect(result.duration).toBe(0);
    });

    it('works for all SCREAM types', () => {
      const types = [
        'SCREAM_BLINDSPOT', 'SCREAM_BREACH', 'SCREAM_THEATER', 'SCREAM_PHANTOM',
        'SCREAM_MUTATION', 'SCREAM_POLLUTION', 'SCREAM_AMNESIA', 'SCREAM_LATTICE'
      ] as const;
      
      for (const type of types) {
        const result = createEmptyResult(type);
        expect(result.screamType).toBe(type);
      }
    });
  });
});
