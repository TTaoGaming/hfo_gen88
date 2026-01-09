/**
 * P4 RED REGNANT - SCREAM_AMNESIA Detector Tests
 * 
 * @port 6
 * @commander KRAKEN_KEEPER (aligned)
 * @verb STORE
 * @tier BRONZE
 * @provenance: .kiro/specs/red-regnant-8-screams/tasks.md
 * Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 11.1
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { AmnesiaDetector, createAmnesiaDetector, AMNESIA_PATTERNS } from './amnesia.js';
import { verifyScreamReceipt } from '../contracts/screams.js';

describe('SCREAM_AMNESIA Detector (Port 6)', () => {
  let tempDir: string;
  let detector: AmnesiaDetector;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'amnesia-test-'));
    detector = new AmnesiaDetector();
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  // --- DETECTOR METADATA ---
  describe('Detector Metadata', () => {
    it('has correct name', () => {
      expect(detector.name).toBe('SCREAM_AMNESIA');
    });

    it('is aligned with Port 6', () => {
      expect(detector.port).toBe(6);
    });

    it('produces SCREAM_AMNESIA type', () => {
      expect(detector.screamType).toBe('SCREAM_AMNESIA');
    });

    it('has a description', () => {
      expect(detector.description).toBeTruthy();
    });
  });

  // --- FACTORY FUNCTION ---
  describe('Factory Function', () => {
    it('createAmnesiaDetector returns a Detector', () => {
      const created = createAmnesiaDetector();
      expect(created.name).toBe('SCREAM_AMNESIA');
      expect(created.port).toBe(6);
    });
  });

  // --- CONSOLE LOG DETECTION ---
  describe('CONSOLE_LOG Detection', () => {
    it('detects console.log in silver path', async () => {
      const silverDir = path.join(tempDir, 'silver');
      fs.mkdirSync(silverDir);
      const file = path.join(silverDir, 'module.ts');
      fs.writeFileSync(file, `
        export function test() {
          console.log('debug');
        }
      `);

      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.amnesiaType === 'CONSOLE_LOG'
      );
      expect(violations.length).toBeGreaterThan(0);
    });

    it('does NOT flag console.log in bronze path', async () => {
      const bronzeDir = path.join(tempDir, 'bronze');
      fs.mkdirSync(bronzeDir);
      const file = path.join(bronzeDir, 'experiment.ts');
      fs.writeFileSync(file, `
        console.log('debug');
      `);

      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.amnesiaType === 'CONSOLE_LOG'
      );
      expect(violations.length).toBe(0);
    });

    it('does NOT flag console.log in test files', async () => {
      const silverDir = path.join(tempDir, 'silver');
      fs.mkdirSync(silverDir);
      const file = path.join(silverDir, 'module.test.ts');
      fs.writeFileSync(file, `
        console.log('test output');
      `);

      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.amnesiaType === 'CONSOLE_LOG'
      );
      expect(violations.length).toBe(0);
    });
  });

  // --- DEBUGGER DETECTION ---
  describe('DEBUGGER Detection', () => {
    it('detects debugger statement in silver', async () => {
      const silverDir = path.join(tempDir, 'silver');
      fs.mkdirSync(silverDir);
      const file = path.join(silverDir, 'module.ts');
      fs.writeFileSync(file, `
        function test() {
          debugger;
        }
      `);

      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.amnesiaType === 'DEBUGGER'
      );
      expect(violations.length).toBeGreaterThan(0);
    });
  });

  // --- TODO DETECTION ---
  describe('TODO_BARE Detection', () => {
    it('detects bare TODO comment', async () => {
      const file = path.join(tempDir, 'module.ts');
      fs.writeFileSync(file, `
        // TODO: implement this
        function test() {}
      `);

      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.amnesiaType === 'TODO_BARE'
      );
      expect(violations.length).toBeGreaterThan(0);
    });

    it('does NOT flag TODO with @permitted', async () => {
      const file = path.join(tempDir, 'module.ts');
      fs.writeFileSync(file, `
        // TODO: implement this @permitted
        function test() {}
      `);

      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.amnesiaType === 'TODO_BARE'
      );
      expect(violations.length).toBe(0);
    });
  });

  // --- FIXME DETECTION ---
  describe('FIXME_BARE Detection', () => {
    it('detects bare FIXME comment', async () => {
      const file = path.join(tempDir, 'module.ts');
      fs.writeFileSync(file, `
        // FIXME: broken code
        function test() {}
      `);

      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.amnesiaType === 'FIXME_BARE'
      );
      expect(violations.length).toBeGreaterThan(0);
    });

    it('does NOT flag FIXME with @permitted', async () => {
      const file = path.join(tempDir, 'module.ts');
      fs.writeFileSync(file, `
        // FIXME: known issue @permitted
        function test() {}
      `);

      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.amnesiaType === 'FIXME_BARE'
      );
      expect(violations.length).toBe(0);
    });
  });

  // --- HACK DETECTION ---
  describe('HACK_BARE Detection', () => {
    it('detects bare HACK comment', async () => {
      const file = path.join(tempDir, 'module.ts');
      fs.writeFileSync(file, `
        // HACK: workaround
        function test() {}
      `);

      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.amnesiaType === 'HACK_BARE'
      );
      expect(violations.length).toBeGreaterThan(0);
    });
  });

  // --- COMMENTED CODE DETECTION ---
  describe('COMMENTED_CODE Detection', () => {
    it('detects commented-out code', async () => {
      const file = path.join(tempDir, 'module.ts');
      fs.writeFileSync(file, `
        // const oldCode = 1;
        const newCode = 2;
      `);

      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.amnesiaType === 'COMMENTED_CODE'
      );
      expect(violations.length).toBeGreaterThan(0);
    });

    it('does NOT flag commented code in test files', async () => {
      const file = path.join(tempDir, 'module.test.ts');
      fs.writeFileSync(file, `
        // const oldCode = 1;
        const newCode = 2;
      `);

      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.amnesiaType === 'COMMENTED_CODE'
      );
      expect(violations.length).toBe(0);
    });
  });

  // --- MISSING DOCUMENTATION ---
  describe('MISSING_DOCUMENTATION Detection', () => {
    it('detects undocumented export in silver', async () => {
      const silverDir = path.join(tempDir, 'silver');
      fs.mkdirSync(silverDir);
      const file = path.join(silverDir, 'module.ts');
      fs.writeFileSync(file, `
        export function undocumented() {
          return true;
        }
      `);

      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.amnesiaType === 'MISSING_DOCUMENTATION'
      );
      expect(violations.length).toBeGreaterThan(0);
      expect(violations[0].details.undocumentedExports).toContain('undocumented');
    });

    it('does NOT flag documented exports', async () => {
      const silverDir = path.join(tempDir, 'silver');
      fs.mkdirSync(silverDir);
      const file = path.join(silverDir, 'module.ts');
      fs.writeFileSync(file, `
        /**
         * A documented function
         */
        export function documented() {
          return true;
        }
      `);

      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.amnesiaType === 'MISSING_DOCUMENTATION'
      );
      expect(violations.length).toBe(0);
    });

    it('does NOT check documentation in bronze', async () => {
      const bronzeDir = path.join(tempDir, 'bronze');
      fs.mkdirSync(bronzeDir);
      const file = path.join(bronzeDir, 'module.ts');
      fs.writeFileSync(file, `
        export function undocumented() {
          return true;
        }
      `);

      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.amnesiaType === 'MISSING_DOCUMENTATION'
      );
      expect(violations.length).toBe(0);
    });
  });

  // --- RECEIPT GENERATION ---
  describe('Receipt Generation', () => {
    it('generates valid SCREAM receipts', async () => {
      const file = path.join(tempDir, 'test.ts');
      fs.writeFileSync(file, '// TODO: fix this');

      const result = await detector.detect(file);
      expect(result.receipts.length).toBeGreaterThan(0);

      for (const receipt of result.receipts) {
        expect(receipt.type).toBe('SCREAM_AMNESIA');
        expect(receipt.port).toBe(6);
        expect(verifyScreamReceipt(receipt)).toBe(true);
      }
    });
  });

  // --- CONFIG OPTIONS ---
  describe('Configuration', () => {
    it('respects enabled=false', async () => {
      const file = path.join(tempDir, 'test.ts');
      fs.writeFileSync(file, '// TODO: fix this');

      const result = await detector.detect(file, { enabled: false });
      expect(result.violationsFound).toBe(0);
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
    });

    it('handles clean files', async () => {
      const file = path.join(tempDir, 'clean.ts');
      fs.writeFileSync(file, `
        /**
         * A clean function
         */
        export function clean(): number {
          return 42;
        }
      `);

      const result = await detector.detect(file);
      // May have some violations depending on path, but no amnesia-specific ones
      const amnesiaViolations = result.receipts.filter(
        r => ['TODO_BARE', 'FIXME_BARE', 'HACK_BARE', 'CONSOLE_LOG'].includes(r.details.amnesiaType as string)
      );
      expect(amnesiaViolations.length).toBe(0);
    });
  });

  // --- RESULT STRUCTURE ---
  describe('Result Structure', () => {
    it('returns correct screamType', async () => {
      const result = await detector.detect(tempDir);
      expect(result.screamType).toBe('SCREAM_AMNESIA');
    });

    it('returns duration in milliseconds', async () => {
      const file = path.join(tempDir, 'test.ts');
      fs.writeFileSync(file, 'const x = 1;');

      const result = await detector.detect(file);
      expect(typeof result.duration).toBe('number');
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });
  });
});
