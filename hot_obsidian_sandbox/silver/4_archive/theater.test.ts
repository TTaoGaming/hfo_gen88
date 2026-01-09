/**
 * P4 RED REGNANT - SCREAM_THEATER Detector Tests
 * 
 * @port 2
 * @commander MIRROR_MAGUS (aligned)
 * @verb SHAPE
 * @tier BRONZE
 * @provenance: .kiro/specs/red-regnant-8-screams/tasks.md
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 11.1
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { TheaterDetector, createTheaterDetector, THEATER_PATTERNS } from './theater.js';
import { verifyScreamReceipt } from '../contracts/screams.js';

describe('SCREAM_THEATER Detector (Port 2)', () => {
  let tempDir: string;
  let detector: TheaterDetector;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'theater-test-'));
    detector = new TheaterDetector();
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  // --- DETECTOR METADATA ---
  describe('Detector Metadata', () => {
    it('has correct name', () => {
      expect(detector.name).toBe('SCREAM_THEATER');
    });

    it('is aligned with Port 2', () => {
      expect(detector.port).toBe(2);
    });

    it('produces SCREAM_THEATER type', () => {
      expect(detector.screamType).toBe('SCREAM_THEATER');
    });

    it('has a description', () => {
      expect(detector.description).toBeTruthy();
    });
  });

  // --- FACTORY FUNCTION ---
  describe('Factory Function', () => {
    it('createTheaterDetector returns a Detector', () => {
      const created = createTheaterDetector();
      expect(created.name).toBe('SCREAM_THEATER');
      expect(created.port).toBe(2);
    });
  });

  // --- PLACEHOLDER DETECTION ---
  describe('NOT_IMPLEMENTED Pattern', () => {
    it('detects throw Not implemented', async () => {
      const file = path.join(tempDir, 'placeholder.ts');
      fs.writeFileSync(file, `
        function doSomething() {
          throw new Error('Not implemented');
        }
      `);

      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.theaterType === 'NOT_IMPLEMENTED'
      );
      expect(violations.length).toBeGreaterThan(0);
    });

    it('detects with double quotes', async () => {
      const file = path.join(tempDir, 'placeholder2.ts');
      fs.writeFileSync(file, `
        function doSomething() {
          throw new Error("Not implemented");
        }
      `);

      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.theaterType === 'NOT_IMPLEMENTED'
      );
      expect(violations.length).toBeGreaterThan(0);
    });
  });

  describe('LOGIC_PLACEHOLDER Pattern', () => {
    it('detects Logic goes here comment', async () => {
      const file = path.join(tempDir, 'logic.ts');
      fs.writeFileSync(file, `
        function process() {
          // Logic goes here
        }
      `);

      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.theaterType === 'LOGIC_PLACEHOLDER'
      );
      expect(violations.length).toBeGreaterThan(0);
    });

    it('detects TODO implement comment', async () => {
      const file = path.join(tempDir, 'todo.ts');
      fs.writeFileSync(file, `
        function process() {
          // TODO: implement
        }
      `);

      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.theaterType === 'LOGIC_PLACEHOLDER'
      );
      expect(violations.length).toBeGreaterThan(0);
    });
  });

  describe('STUB_RETURN Pattern', () => {
    it('detects stub return null', async () => {
      const file = path.join(tempDir, 'stub.ts');
      fs.writeFileSync(file, `
        function getData() {
          return null; // stub
        }
      `);

      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.theaterType === 'STUB_RETURN'
      );
      expect(violations.length).toBeGreaterThan(0);
    });

    it('detects stub return empty object', async () => {
      const file = path.join(tempDir, 'stub2.ts');
      fs.writeFileSync(file, `
        function getData() {
          return {}; // stub
        }
      `);

      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.theaterType === 'STUB_RETURN'
      );
      expect(violations.length).toBeGreaterThan(0);
    });
  });

  // --- TEST FILE SPECIFIC ---
  describe('EMPTY_TEST Pattern', () => {
    it('detects empty test body in test file', async () => {
      const file = path.join(tempDir, 'empty.test.ts');
      fs.writeFileSync(file, `
        it('should work', () => {});
      `);

      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.theaterType === 'EMPTY_TEST'
      );
      expect(violations.length).toBeGreaterThan(0);
    });

    it('does NOT flag empty test in non-test file', async () => {
      const file = path.join(tempDir, 'module.ts');
      fs.writeFileSync(file, `
        it('should work', () => {});
      `);

      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.theaterType === 'EMPTY_TEST'
      );
      expect(violations.length).toBe(0);
    });
  });

  describe('ASSERTIONLESS_TEST Detection', () => {
    it('detects test without assertions', async () => {
      const file = path.join(tempDir, 'no-assert.test.ts');
      fs.writeFileSync(file, `
        it('should work', () => {
          const x = 1;
          console.log(x);
        });
      `);

      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.theaterType === 'ASSERTIONLESS_TEST'
      );
      expect(violations.length).toBeGreaterThan(0);
    });

    it('does NOT flag test with expect()', async () => {
      const file = path.join(tempDir, 'with-assert.test.ts');
      fs.writeFileSync(file, `
        it('should work', () => {
          const x = 1;
          expect(x).toBe(1);
        });
      `);

      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.theaterType === 'ASSERTIONLESS_TEST'
      );
      expect(violations.length).toBe(0);
    });
  });

  describe('MOCK_POISONING Detection', () => {
    it('detects excessive vi.mock usage', async () => {
      const file = path.join(tempDir, 'mocks.test.ts');
      fs.writeFileSync(file, `
        vi.mock('./a');
        vi.mock('./b');
        vi.mock('./c');
        vi.mock('./d');
        vi.mock('./e');
        vi.mock('./f');
        
        it('works', () => {
          expect(true).toBe(true);
        });
      `);

      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.theaterType === 'MOCK_POISONING'
      );
      expect(violations.length).toBeGreaterThan(0);
      expect(violations[0].details.mockCount).toBe(6);
    });

    it('does NOT flag reasonable mock usage', async () => {
      const file = path.join(tempDir, 'few-mocks.test.ts');
      fs.writeFileSync(file, `
        vi.mock('./a');
        vi.mock('./b');
        
        it('works', () => {
          expect(true).toBe(true);
        });
      `);

      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.theaterType === 'MOCK_POISONING'
      );
      expect(violations.length).toBe(0);
    });

    it('counts vi.fn() as mocks', async () => {
      const file = path.join(tempDir, 'fn-mocks.test.ts');
      fs.writeFileSync(file, `
        const fn1 = vi.fn();
        const fn2 = vi.fn();
        const fn3 = vi.fn();
        const fn4 = vi.fn();
        const fn5 = vi.fn();
        const fn6 = vi.fn();
        
        it('works', () => {
          expect(true).toBe(true);
        });
      `);

      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.theaterType === 'MOCK_POISONING'
      );
      expect(violations.length).toBeGreaterThan(0);
    });
  });

  // --- RECEIPT GENERATION ---
  describe('Receipt Generation', () => {
    it('generates valid SCREAM receipts', async () => {
      const file = path.join(tempDir, 'test.ts');
      fs.writeFileSync(file, `throw new Error('Not implemented');`);

      const result = await detector.detect(file);
      expect(result.receipts.length).toBeGreaterThan(0);

      for (const receipt of result.receipts) {
        expect(receipt.type).toBe('SCREAM_THEATER');
        expect(receipt.port).toBe(2);
        expect(verifyScreamReceipt(receipt)).toBe(true);
      }
    });
  });

  // --- CONFIG OPTIONS ---
  describe('Configuration', () => {
    it('respects enabled=false', async () => {
      const file = path.join(tempDir, 'test.ts');
      fs.writeFileSync(file, `throw new Error('Not implemented');`);

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

    it('handles clean implementation files', async () => {
      const file = path.join(tempDir, 'clean.ts');
      fs.writeFileSync(file, `
        export function add(a: number, b: number): number {
          return a + b;
        }
      `);

      const result = await detector.detect(file);
      expect(result.violationsFound).toBe(0);
    });

    it('handles clean test files', async () => {
      const file = path.join(tempDir, 'clean.test.ts');
      fs.writeFileSync(file, `
        import { add } from './clean';
        
        describe('add', () => {
          it('adds two numbers', () => {
            expect(add(1, 2)).toBe(3);
          });
        });
      `);

      const result = await detector.detect(file);
      expect(result.violationsFound).toBe(0);
    });
  });

  // --- RESULT STRUCTURE ---
  describe('Result Structure', () => {
    it('returns correct screamType', async () => {
      const result = await detector.detect(tempDir);
      expect(result.screamType).toBe('SCREAM_THEATER');
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
