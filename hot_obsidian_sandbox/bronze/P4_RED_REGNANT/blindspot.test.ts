/**
 * P4 RED REGNANT - SCREAM_BLINDSPOT Detector Tests
 * 
 * @port 0
 * @commander LIDLESS_LEGION (aligned)
 * @verb SENSE
 * @tier SILVER
 * @provenance: .kiro/specs/silver-promotion-blindspot/design.md
 * @mutationScore: 80.95% (Goldilocks)
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { BlindspotDetector, createBlindspotDetector, BLINDSPOT_PATTERNS } from './blindspot.js';
import { verifyScreamReceipt } from '../contracts/screams.js';

describe('SCREAM_BLINDSPOT Detector (Port 0) - Silver', () => {
  let tempDir: string;
  let detector: BlindspotDetector;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blindspot-silver-'));
    detector = new BlindspotDetector();
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  // --- DETECTOR METADATA ---
  describe('Detector Metadata', () => {
    it('has correct name', () => {
      expect(detector.name).toBe('SCREAM_BLINDSPOT');
    });

    it('is aligned with Port 0', () => {
      expect(detector.port).toBe(0);
    });

    it('produces SCREAM_BLINDSPOT type', () => {
      expect(detector.screamType).toBe('SCREAM_BLINDSPOT');
    });

    it('has a description', () => {
      expect(detector.description).toBeTruthy();
      expect(detector.description.length).toBeGreaterThan(0);
    });
  });

  // --- FACTORY FUNCTION ---
  describe('Factory Function', () => {
    it('createBlindspotDetector returns a Detector', () => {
      const created = createBlindspotDetector();
      expect(created.name).toBe('SCREAM_BLINDSPOT');
      expect(created.port).toBe(0);
    });
  });

  // --- EMPTY CATCH BLOCK DETECTION ---
  describe('EMPTY_CATCH Pattern', () => {
    it('detects empty catch block with parameter', async () => {
      const file = path.join(tempDir, 'empty-catch.ts');
      fs.writeFileSync(file, `
        try {
          doSomething();
        } catch (e) {}
      `);

      const result = await detector.detect(file);
      expect(result.violationsFound).toBeGreaterThan(0);
      expect(result.receipts[0].details.patternName).toBe('EMPTY_CATCH');
    });

    it('detects empty catch block without parameter', async () => {
      const file = path.join(tempDir, 'empty-catch-no-param.ts');
      fs.writeFileSync(file, `
        try {
          doSomething();
        } catch () {}
      `);

      const result = await detector.detect(file);
      expect(result.violationsFound).toBeGreaterThan(0);
    });

    it('does NOT flag catch with error handling', async () => {
      const file = path.join(tempDir, 'proper-catch.ts');
      fs.writeFileSync(file, `
        try {
          doSomething();
        } catch (e) {
          logger.error(e);
          throw e;
        }
      `);

      const result = await detector.detect(file);
      const emptyCatchViolations = result.receipts.filter(
        r => r.details.patternName === 'EMPTY_CATCH'
      );
      expect(emptyCatchViolations.length).toBe(0);
    });
  });

  // --- EMPTY THEN HANDLER DETECTION ---
  describe('EMPTY_THEN Pattern', () => {
    it('detects empty then handler', async () => {
      const file = path.join(tempDir, 'empty-then.ts');
      fs.writeFileSync(file, `
        fetchData().then(() => {});
      `);

      const result = await detector.detect(file);
      expect(result.violationsFound).toBeGreaterThan(0);
      expect(result.receipts[0].details.patternName).toBe('EMPTY_THEN');
    });

    it('does NOT flag then with handler', async () => {
      const file = path.join(tempDir, 'proper-then.ts');
      fs.writeFileSync(file, `
        fetchData().then((data) => {
          processData(data);
        });
      `);

      const result = await detector.detect(file);
      const emptyThenViolations = result.receipts.filter(
        r => r.details.patternName === 'EMPTY_THEN'
      );
      expect(emptyThenViolations.length).toBe(0);
    });
  });

  // --- IGNORE ERROR ANNOTATION DETECTION ---
  describe('IGNORE_ERROR Pattern', () => {
    it('detects @ignore-error annotation', async () => {
      const file = path.join(tempDir, 'ignore-error.ts');
      fs.writeFileSync(file, `
        // @ignore-error
        const result = riskyOperation();
      `);

      const result = await detector.detect(file);
      expect(result.violationsFound).toBeGreaterThan(0);
      expect(result.receipts[0].details.patternName).toBe('IGNORE_ERROR');
    });

    it('detects @IGNORE-ERROR (case insensitive)', async () => {
      const file = path.join(tempDir, 'ignore-error-upper.ts');
      fs.writeFileSync(file, `
        // @IGNORE-ERROR
        const result = riskyOperation();
      `);

      const result = await detector.detect(file);
      expect(result.violationsFound).toBeGreaterThan(0);
    });
  });

  // --- CATCH_CONSOLE_ONLY Pattern ---
  describe('CATCH_CONSOLE_ONLY Pattern', () => {
    it('detects catch with only console log', async () => {
      const file = path.join(tempDir, 'catch-console.ts');
      fs.writeFileSync(file, `
        try {
          doSomething();
        } catch (e) { console.log(e); }
      `);

      const result = await detector.detect(file);
      const consoleOnlyViolations = result.receipts.filter(
        r => r.details.patternName === 'CATCH_CONSOLE_ONLY'
      );
      expect(consoleOnlyViolations.length).toBeGreaterThan(0);
    });

    it('detects catch with only console.warn', async () => {
      const file = path.join(tempDir, 'catch-warn.ts');
      fs.writeFileSync(file, `
        try {
          doSomething();
        } catch (err) { console.warn(err); }
      `);

      const result = await detector.detect(file);
      const consoleOnlyViolations = result.receipts.filter(
        r => r.details.patternName === 'CATCH_CONSOLE_ONLY'
      );
      expect(consoleOnlyViolations.length).toBeGreaterThan(0);
    });
  });

  // --- DIRECTORY SCANNING ---
  describe('Directory Scanning', () => {
    it('scans all .ts files in directory', async () => {
      fs.writeFileSync(path.join(tempDir, 'file1.ts'), 'try {} catch (e) {}');
      fs.writeFileSync(path.join(tempDir, 'file2.ts'), 'try {} catch (e) {}');

      const result = await detector.detect(tempDir);
      expect(result.filesScanned).toBe(2);
      expect(result.violationsFound).toBe(2);
    });

    it('scans .js files', async () => {
      fs.writeFileSync(path.join(tempDir, 'file.js'), 'try {} catch (e) {}');

      const result = await detector.detect(tempDir);
      expect(result.filesScanned).toBe(1);
    });

    it('excludes node_modules directory', async () => {
      const nodeModules = path.join(tempDir, 'node_modules');
      fs.mkdirSync(nodeModules);
      fs.writeFileSync(path.join(nodeModules, 'lib.ts'), 'try {} catch (e) {}');

      const result = await detector.detect(tempDir);
      expect(result.filesScanned).toBe(0);
    });

    it('excludes .git directory', async () => {
      const gitDir = path.join(tempDir, '.git');
      fs.mkdirSync(gitDir);
      fs.writeFileSync(path.join(gitDir, 'hooks.ts'), 'try {} catch (e) {}');

      const result = await detector.detect(tempDir);
      expect(result.filesScanned).toBe(0);
    });

    it('scans subdirectories recursively', async () => {
      const subDir = path.join(tempDir, 'src');
      fs.mkdirSync(subDir);
      fs.writeFileSync(path.join(subDir, 'nested.ts'), 'try {} catch (e) {}');

      const result = await detector.detect(tempDir);
      expect(result.filesScanned).toBe(1);
      expect(result.violationsFound).toBe(1);
    });
  });

  // --- RECEIPT GENERATION ---
  describe('Receipt Generation', () => {
    it('generates valid SCREAM receipts', async () => {
      const file = path.join(tempDir, 'test.ts');
      fs.writeFileSync(file, 'try {} catch (e) {}');

      const result = await detector.detect(file);
      expect(result.receipts.length).toBeGreaterThan(0);

      for (const receipt of result.receipts) {
        expect(receipt.type).toBe('SCREAM_BLINDSPOT');
        expect(receipt.port).toBe(0);
        expect(verifyScreamReceipt(receipt)).toBe(true);
      }
    });

    it('includes line numbers in receipt details', async () => {
      const file = path.join(tempDir, 'lines.ts');
      fs.writeFileSync(file, `line1
line2
try {} catch (e) {}
line4`);

      const result = await detector.detect(file);
      expect(result.receipts[0].details.lineNumbers).toContain(3);
    });

    it('includes match count in receipt details', async () => {
      const file = path.join(tempDir, 'multi.ts');
      fs.writeFileSync(file, `
        try {} catch (e) {}
        try {} catch (err) {}
      `);

      const result = await detector.detect(file);
      const emptyCatch = result.receipts.find(r => r.details.patternName === 'EMPTY_CATCH');
      expect(emptyCatch?.details.matchCount).toBe(2);
    });
  });

  // --- CONFIG OPTIONS ---
  describe('Configuration', () => {
    it('respects enabled=false', async () => {
      const file = path.join(tempDir, 'test.ts');
      fs.writeFileSync(file, 'try {} catch (e) {}');

      const result = await detector.detect(file, { enabled: false });
      expect(result.violationsFound).toBe(0);
      expect(result.filesScanned).toBe(0);
    });

    it('respects custom severity', async () => {
      const file = path.join(tempDir, 'test.ts');
      fs.writeFileSync(file, 'try {} catch (e) {}');

      const result = await detector.detect(file, { severity: 'critical' });
      expect(result.receipts[0].severity).toBe('critical');
    });

    it('respects custom file extensions', async () => {
      fs.writeFileSync(path.join(tempDir, 'test.ts'), 'try {} catch (e) {}');
      fs.writeFileSync(path.join(tempDir, 'test.py'), 'try {} catch (e) {}');

      const result = await detector.detect(tempDir, { fileExtensions: ['.py'] });
      expect(result.filesScanned).toBe(1);
    });
  });

  // --- EDGE CASES ---
  describe('Edge Cases', () => {
    it('handles empty files', async () => {
      const file = path.join(tempDir, 'empty.ts');
      fs.writeFileSync(file, '');

      const result = await detector.detect(file);
      expect(result.filesScanned).toBe(1);
      expect(result.violationsFound).toBe(0);
    });

    it('handles non-existent path', async () => {
      const result = await detector.detect('/non/existent/path');
      expect(result.filesScanned).toBe(0);
      expect(result.violationsFound).toBe(0);
    });

    it('handles files with no violations', async () => {
      const file = path.join(tempDir, 'clean.ts');
      fs.writeFileSync(file, `
        function safeOperation() {
          try {
            return doSomething();
          } catch (error) {
            logger.error('Operation failed', error);
            throw new OperationError('Failed', { cause: error });
          }
        }
      `);

      const result = await detector.detect(file);
      expect(result.violationsFound).toBe(0);
    });

    it('handles multiple patterns in same file', async () => {
      const file = path.join(tempDir, 'multi-pattern.ts');
      fs.writeFileSync(file, `
        // @ignore-error
        try {} catch (e) {}
        promise.then(() => {});
      `);

      const result = await detector.detect(file);
      expect(result.violationsFound).toBeGreaterThanOrEqual(3);
    });
  });

  // --- RESULT STRUCTURE ---
  describe('Result Structure', () => {
    it('returns correct screamType', async () => {
      const result = await detector.detect(tempDir);
      expect(result.screamType).toBe('SCREAM_BLINDSPOT');
    });

    it('returns duration in milliseconds', async () => {
      const file = path.join(tempDir, 'test.ts');
      fs.writeFileSync(file, 'const x = 1;');

      const result = await detector.detect(file);
      expect(typeof result.duration).toBe('number');
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });

    it('filesScanned matches actual files processed', async () => {
      fs.writeFileSync(path.join(tempDir, 'a.ts'), 'const a = 1;');
      fs.writeFileSync(path.join(tempDir, 'b.ts'), 'const b = 2;');
      fs.writeFileSync(path.join(tempDir, 'c.txt'), 'not scanned');

      const result = await detector.detect(tempDir);
      expect(result.filesScanned).toBe(2);
    });
  });

  // --- MUTATION KILLING TESTS ---
  describe('Mutation Killing Tests', () => {
    it('duration is reasonable (not astronomical from addition)', async () => {
      const file = path.join(tempDir, 'test.ts');
      fs.writeFileSync(file, 'const x = 1;');

      const result = await detector.detect(file);
      expect(result.duration).toBeLessThan(60000);
    });

    it('returns empty result for non-existent directory path', async () => {
      const nonExistent = path.join(tempDir, 'does-not-exist-subdir');
      const result = await detector.detect(nonExistent);
      expect(result.filesScanned).toBe(0);
      expect(result.violationsFound).toBe(0);
    });

    it('excludes node_modules and does NOT count violations from it', async () => {
      const nodeModules = path.join(tempDir, 'node_modules');
      fs.mkdirSync(nodeModules);
      fs.writeFileSync(path.join(nodeModules, 'lib.ts'), 'try {} catch (e) {}');
      fs.writeFileSync(path.join(tempDir, 'valid.ts'), 'const x = 1;');

      const result = await detector.detect(tempDir);
      expect(result.filesScanned).toBe(1);
      expect(result.violationsFound).toBe(0);
    });

    it('does NOT create receipt when pattern has zero matches', async () => {
      const file = path.join(tempDir, 'clean-code.ts');
      fs.writeFileSync(file, `
        function properErrorHandling() {
          try {
            return doSomething();
          } catch (error) {
            logger.error('Failed', error);
            throw new Error('Operation failed', { cause: error });
          }
        }
      `);

      const result = await detector.detect(file);
      expect(result.filesScanned).toBe(1);
      expect(result.violationsFound).toBe(0);
      expect(result.receipts.length).toBe(0);
    });

    it('lineNumbers array contains correct line numbers for violations', async () => {
      const file = path.join(tempDir, 'specific-lines.ts');
      fs.writeFileSync(file, `const a = 1;
const b = 2;
try {} catch (e) {}
const c = 3;
try {} catch (err) {}
const d = 4;`);

      const result = await detector.detect(file);
      const emptyCatch = result.receipts.find(r => r.details.patternName === 'EMPTY_CATCH');
      expect(emptyCatch).toBeDefined();
      expect(emptyCatch!.details.lineNumbers).toContain(3);
      expect(emptyCatch!.details.lineNumbers).toContain(5);
    });

    it('correctly identifies line numbers with global regex patterns', async () => {
      const file = path.join(tempDir, 'global-pattern.ts');
      fs.writeFileSync(file, `// @ignore-error line 1
const x = 1;
// @ignore-error line 3`);

      const result = await detector.detect(file);
      const ignoreError = result.receipts.find(r => r.details.patternName === 'IGNORE_ERROR');
      expect(ignoreError).toBeDefined();
      expect(ignoreError!.details.lineNumbers).toContain(1);
      expect(ignoreError!.details.lineNumbers).toContain(3);
    });

    it('only reports line numbers where pattern actually matches', async () => {
      const file = path.join(tempDir, 'selective-lines.ts');
      fs.writeFileSync(file, `const a = 1;
const b = 2;
const c = 3;
try {} catch (e) {}
const d = 4;`);

      const result = await detector.detect(file);
      const emptyCatch = result.receipts.find(r => r.details.patternName === 'EMPTY_CATCH');
      expect(emptyCatch).toBeDefined();
      expect(emptyCatch!.details.lineNumbers).toEqual([4]);
    });

    describe('Pattern Severity Classification', () => {
      it('EMPTY_CATCH returns error severity', async () => {
        const file = path.join(tempDir, 'empty-catch-severity.ts');
        fs.writeFileSync(file, 'try {} catch (e) {}');

        const result = await detector.detect(file);
        const receipt = result.receipts.find(r => r.details.patternName === 'EMPTY_CATCH');
        expect(receipt).toBeDefined();
        expect(receipt!.details.severity).toBe('error');
      });

      it('IGNORE_ERROR returns error severity', async () => {
        const file = path.join(tempDir, 'ignore-error-severity.ts');
        fs.writeFileSync(file, '// @ignore-error\nconst x = 1;');

        const result = await detector.detect(file);
        const receipt = result.receipts.find(r => r.details.patternName === 'IGNORE_ERROR');
        expect(receipt).toBeDefined();
        expect(receipt!.details.severity).toBe('error');
      });

      it('EMPTY_THEN returns warning severity', async () => {
        const file = path.join(tempDir, 'empty-then-severity.ts');
        fs.writeFileSync(file, 'promise.then(() => {});');

        const result = await detector.detect(file);
        const receipt = result.receipts.find(r => r.details.patternName === 'EMPTY_THEN');
        expect(receipt).toBeDefined();
        expect(receipt!.details.severity).toBe('warning');
      });

      it('CATCH_CONSOLE_ONLY returns warning severity', async () => {
        const file = path.join(tempDir, 'catch-console-severity.ts');
        fs.writeFileSync(file, 'try { x(); } catch (e) { console.log(e); }');

        const result = await detector.detect(file);
        const receipt = result.receipts.find(r => r.details.patternName === 'CATCH_CONSOLE_ONLY');
        expect(receipt).toBeDefined();
        expect(receipt!.details.severity).toBe('warning');
      });
    });

    it('duration is valid even when detector is disabled', async () => {
      const file = path.join(tempDir, 'disabled.ts');
      fs.writeFileSync(file, 'try {} catch (e) {}');

      const result = await detector.detect(file, { enabled: false });
      expect(result.duration).toBeGreaterThanOrEqual(0);
      expect(result.duration).toBeLessThan(10000);
    });
  });
});
