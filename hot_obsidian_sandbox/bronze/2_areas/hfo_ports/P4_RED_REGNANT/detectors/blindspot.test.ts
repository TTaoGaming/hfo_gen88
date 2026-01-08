/**
 * P4 RED REGNANT - SCREAM_BLINDSPOT Detector Tests
 * 
 * @port 0
 * @commander LIDLESS_LEGION (aligned)
 * @verb SENSE
 * @tier BRONZE
 * @provenance: .kiro/specs/red-regnant-8-screams/tasks.md
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 11.1
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { BlindspotDetector, createBlindspotDetector, BLINDSPOT_PATTERNS } from './blindspot.js';
import { verifyScreamReceipt } from '../contracts/screams.js';

describe('SCREAM_BLINDSPOT Detector (Port 0)', () => {
  let tempDir: string;
  let detector: BlindspotDetector;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blindspot-test-'));
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

  // --- CATCH CONSOLE ONLY DETECTION ---
  describe('CATCH_CONSOLE_ONLY Pattern', () => {
    it('detects catch with only console.log', async () => {
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
  // These tests target specific surviving mutants to achieve 80%+ mutation score
  describe('Mutation Killing Tests', () => {
    // Kills: Date.now() - startTime → Date.now() + startTime
    it('duration is reasonable (not astronomical from addition)', async () => {
      const file = path.join(tempDir, 'test.ts');
      fs.writeFileSync(file, 'const x = 1;');

      const result = await detector.detect(file);
      // If mutant changes - to +, duration would be ~2x Date.now() (billions of ms)
      expect(result.duration).toBeLessThan(60000); // Should complete in under 60 seconds
    });

    // Kills: !fs.existsSync(dir) → false (directory existence check)
    it('returns empty result for non-existent directory path', async () => {
      const nonExistent = path.join(tempDir, 'does-not-exist-subdir');
      // Don't create this directory
      const result = await detector.detect(nonExistent);
      expect(result.filesScanned).toBe(0);
      expect(result.violationsFound).toBe(0);
    });

    // Kills: !mergedConfig.excludeDirs.includes(entry.name) → true
    it('excludes node_modules and does NOT count violations from it', async () => {
      const nodeModules = path.join(tempDir, 'node_modules');
      fs.mkdirSync(nodeModules);
      fs.writeFileSync(path.join(nodeModules, 'lib.ts'), 'try {} catch (e) {}');
      // Also add a valid file to ensure scanning works
      fs.writeFileSync(path.join(tempDir, 'valid.ts'), 'const x = 1;');

      const result = await detector.detect(tempDir);
      // Should scan valid.ts but NOT node_modules/lib.ts
      expect(result.filesScanned).toBe(1);
      expect(result.violationsFound).toBe(0); // No violations in valid.ts
    });

    // Kills: matches.length > 0 → matches.length >= 0 or true
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

    // Kills: lineNumbers array initialization mutation
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
      expect(emptyCatch!.details.lineNumbers).not.toContain(1);
      expect(emptyCatch!.details.lineNumbers).not.toContain(2);
    });

    // Kills: pattern.flags.replace('g', '') → pattern.flags.replace('', '')
    it('correctly identifies line numbers with global regex patterns', async () => {
      const file = path.join(tempDir, 'global-pattern.ts');
      fs.writeFileSync(file, `// @ignore-error line 1
const x = 1;
// @ignore-error line 3`);

      const result = await detector.detect(file);
      const ignoreError = result.receipts.find(r => r.details.patternName === 'IGNORE_ERROR');
      expect(ignoreError).toBeDefined();
      // Should find both lines, not just one
      expect(ignoreError!.details.lineNumbers).toContain(1);
      expect(ignoreError!.details.lineNumbers).toContain(3);
    });

    // Kills: i < lines.length → i <= lines.length (loop boundary)
    it('does not throw when scanning file with violations on last line', async () => {
      const file = path.join(tempDir, 'last-line.ts');
      fs.writeFileSync(file, 'try {} catch (e) {}'); // No newline at end

      const result = await detector.detect(file);
      expect(result.violationsFound).toBeGreaterThan(0);
      expect(result.receipts[0].details.lineNumbers).toContain(1);
    });

    // Kills: linePattern.test(lines[i]) → true
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
      // Should ONLY contain line 4, not all lines
      expect(emptyCatch!.details.lineNumbers).toEqual([4]);
    });

    // Kills: getSeverityForPattern switch cases
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

    // Kills: BlockStatement mutation on getSeverityForPattern
    it('getSeverityForPattern returns valid severity for all pattern types', async () => {
      // Test multiple patterns to ensure the function body executes
      const file = path.join(tempDir, 'all-patterns.ts');
      fs.writeFileSync(file, `
        // @ignore-error
        try {} catch (e) {}
        promise.then(() => {});
        try { x(); } catch (e) { console.log(e); }
      `);

      const result = await detector.detect(file);
      // All receipts should have valid severity values
      for (const receipt of result.receipts) {
        expect(['warning', 'error', 'critical']).toContain(receipt.details.severity);
      }
    });

    // Additional test to ensure excludeDirs actually prevents scanning
    it('does NOT scan files in .git directory', async () => {
      const gitDir = path.join(tempDir, '.git');
      fs.mkdirSync(gitDir);
      fs.writeFileSync(path.join(gitDir, 'hooks.ts'), 'try {} catch (e) {}');
      fs.writeFileSync(path.join(tempDir, 'main.ts'), 'const x = 1;');

      const result = await detector.detect(tempDir);
      expect(result.filesScanned).toBe(1); // Only main.ts
      expect(result.violationsFound).toBe(0); // main.ts has no violations
    });

    // Test that verifies match count is actually > 0 (not >= 0)
    it('matchCount reflects actual number of matches found', async () => {
      const file = path.join(tempDir, 'count-matches.ts');
      fs.writeFileSync(file, `
        try {} catch (e) {}
        try {} catch (err) {}
        try {} catch (error) {}
      `);

      const result = await detector.detect(file);
      const emptyCatch = result.receipts.find(r => r.details.patternName === 'EMPTY_CATCH');
      expect(emptyCatch).toBeDefined();
      expect(emptyCatch!.details.matchCount).toBe(3);
    });

    // Kills: matches.length > 0 → matches.length >= 0 (must NOT create receipt for 0 matches)
    it('does NOT create receipts when regex matches but returns empty array', async () => {
      const file = path.join(tempDir, 'no-violations.ts');
      fs.writeFileSync(file, `
        // This file has proper error handling
        try {
          doSomething();
        } catch (error) {
          logger.error('Failed:', error);
          throw new Error('Operation failed', { cause: error });
        }
      `);

      const result = await detector.detect(file);
      expect(result.receipts.length).toBe(0);
      expect(result.violationsFound).toBe(0);
    });

    // Kills: excludeDirs check - must verify node_modules violations are NOT counted
    it('violations in node_modules are NOT included in results', async () => {
      const nodeModules = path.join(tempDir, 'node_modules');
      const subPkg = path.join(nodeModules, 'some-package');
      fs.mkdirSync(subPkg, { recursive: true });
      fs.writeFileSync(path.join(subPkg, 'index.ts'), 'try {} catch (e) {}');
      // Add a clean file in main dir
      fs.writeFileSync(path.join(tempDir, 'main.ts'), 'export const x = 1;');

      const result = await detector.detect(tempDir);
      // Should only scan main.ts, not node_modules
      expect(result.filesScanned).toBe(1);
      expect(result.violationsFound).toBe(0);
      // Verify no receipts from node_modules path
      const nodeModulesReceipts = result.receipts.filter(r => 
        r.file.includes('node_modules')
      );
      expect(nodeModulesReceipts.length).toBe(0);
    });

    // Kills: fs.existsSync check - verify walk returns early for non-existent subdirs
    it('handles directory with non-existent subdirectory reference gracefully', async () => {
      // Create a directory structure
      fs.writeFileSync(path.join(tempDir, 'exists.ts'), 'try {} catch (e) {}');
      
      const result = await detector.detect(tempDir);
      expect(result.filesScanned).toBe(1);
      expect(result.violationsFound).toBe(1);
    });

    // Kills: loop boundary i < lines.length → i <= lines.length
    it('does not access out of bounds when finding line numbers', async () => {
      const file = path.join(tempDir, 'boundary.ts');
      // File with violation on last line, no trailing newline
      fs.writeFileSync(file, 'const a = 1;\ntry {} catch (e) {}');

      const result = await detector.detect(file);
      expect(result.violationsFound).toBe(1);
      // Line numbers should be valid (not include undefined or out of bounds)
      const lineNumbers = result.receipts[0].details.lineNumbers as number[];
      expect(lineNumbers.every(n => typeof n === 'number' && n > 0)).toBe(true);
      expect(lineNumbers).toContain(2); // Second line
    });

    // Kills: pattern.flags.replace('g', '') mutation
    it('correctly handles global flag removal for line-by-line matching', async () => {
      const file = path.join(tempDir, 'global-flag.ts');
      fs.writeFileSync(file, `// @ignore-error on line 1
const x = 1;
// @ignore-error on line 3
const y = 2;`);

      const result = await detector.detect(file);
      const ignoreError = result.receipts.find(r => r.details.patternName === 'IGNORE_ERROR');
      expect(ignoreError).toBeDefined();
      // Should find BOTH lines, not just one (if 'g' flag not removed, regex state persists)
      expect(ignoreError!.details.lineNumbers).toHaveLength(2);
      expect(ignoreError!.details.lineNumbers).toContain(1);
      expect(ignoreError!.details.lineNumbers).toContain(3);
    });

    // Kills: switch case string mutations - verify EACH pattern returns correct severity
    describe('Severity by Pattern Type (Mutation Killers)', () => {
      it('EMPTY_CATCH pattern specifically returns error severity', async () => {
        const file = path.join(tempDir, 'empty-catch-only.ts');
        fs.writeFileSync(file, 'try { x(); } catch (e) {}');

        const result = await detector.detect(file);
        const receipt = result.receipts.find(r => r.details.patternName === 'EMPTY_CATCH');
        expect(receipt).toBeDefined();
        expect(receipt!.details.severity).toBe('error');
        // Verify it's NOT warning
        expect(receipt!.details.severity).not.toBe('warning');
      });

      it('IGNORE_ERROR pattern specifically returns error severity', async () => {
        const file = path.join(tempDir, 'ignore-only.ts');
        fs.writeFileSync(file, '// @ignore-error\nconst x = 1;');

        const result = await detector.detect(file);
        const receipt = result.receipts.find(r => r.details.patternName === 'IGNORE_ERROR');
        expect(receipt).toBeDefined();
        expect(receipt!.details.severity).toBe('error');
        expect(receipt!.details.severity).not.toBe('warning');
      });

      it('EMPTY_THEN pattern specifically returns warning severity', async () => {
        const file = path.join(tempDir, 'then-only.ts');
        fs.writeFileSync(file, 'promise.then(() => {});');

        const result = await detector.detect(file);
        const receipt = result.receipts.find(r => r.details.patternName === 'EMPTY_THEN');
        expect(receipt).toBeDefined();
        expect(receipt!.details.severity).toBe('warning');
        expect(receipt!.details.severity).not.toBe('error');
      });

      it('CATCH_CONSOLE_ONLY pattern specifically returns warning severity', async () => {
        const file = path.join(tempDir, 'console-only.ts');
        fs.writeFileSync(file, 'try { x(); } catch (e) { console.log(e); }');

        const result = await detector.detect(file);
        const receipt = result.receipts.find(r => r.details.patternName === 'CATCH_CONSOLE_ONLY');
        expect(receipt).toBeDefined();
        expect(receipt!.details.severity).toBe('warning');
        expect(receipt!.details.severity).not.toBe('error');
      });
    });

    // Kills: duration calculation on disabled path
    it('duration is valid even when detector is disabled', async () => {
      const file = path.join(tempDir, 'disabled.ts');
      fs.writeFileSync(file, 'try {} catch (e) {}');

      const result = await detector.detect(file, { enabled: false });
      expect(result.duration).toBeGreaterThanOrEqual(0);
      expect(result.duration).toBeLessThan(10000); // Should be nearly instant
    });
  });
});
