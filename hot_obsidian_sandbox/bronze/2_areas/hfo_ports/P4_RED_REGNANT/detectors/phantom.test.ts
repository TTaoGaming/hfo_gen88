/**
 * P4 RED REGNANT - SCREAM_PHANTOM Detector Tests
 * 
 * @port 3
 * @commander SPORE_STORM (aligned)
 * @verb DELIVER
 * @tier BRONZE
 * @provenance: .kiro/specs/red-regnant-8-screams/tasks.md
 * Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 11.1
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { PhantomDetector, createPhantomDetector, PHANTOM_PATTERNS } from './phantom.js';
import { verifyScreamReceipt } from '../contracts/screams.js';

describe('SCREAM_PHANTOM Detector (Port 3)', () => {
  let tempDir: string;
  let detector: PhantomDetector;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'phantom-test-'));
    detector = new PhantomDetector();
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  // --- DETECTOR METADATA ---
  describe('Detector Metadata', () => {
    it('has correct name', () => {
      expect(detector.name).toBe('SCREAM_PHANTOM');
    });

    it('is aligned with Port 3', () => {
      expect(detector.port).toBe(3);
    });

    it('produces SCREAM_PHANTOM type', () => {
      expect(detector.screamType).toBe('SCREAM_PHANTOM');
    });

    it('has a description', () => {
      expect(detector.description).toBeTruthy();
    });
  });

  // --- FACTORY FUNCTION ---
  describe('Factory Function', () => {
    it('createPhantomDetector returns a Detector', () => {
      const created = createPhantomDetector();
      expect(created.name).toBe('SCREAM_PHANTOM');
      expect(created.port).toBe(3);
    });
  });

  // --- CDN DETECTION ---
  describe('CDN_SCRIPT Pattern', () => {
    it('detects CDN script tag', async () => {
      const file = path.join(tempDir, 'index.ts');
      fs.writeFileSync(file, `
        const html = '<script src="https://cdn.example.com/lib.js"></script>';
      `);

      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.phantomType === 'CDN_SCRIPT'
      );
      expect(violations.length).toBeGreaterThan(0);
    });
  });

  describe('CDN_LINK Pattern', () => {
    it('detects CDN link tag', async () => {
      const file = path.join(tempDir, 'index.ts');
      fs.writeFileSync(file, `
        const html = '<link href="https://cdn.example.com/style.css" rel="stylesheet">';
      `);

      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.phantomType === 'CDN_LINK'
      );
      expect(violations.length).toBeGreaterThan(0);
    });
  });

  // --- DYNAMIC IMPORT ---
  describe('DYNAMIC_IMPORT_URL Pattern', () => {
    it('detects dynamic import from URL', async () => {
      const file = path.join(tempDir, 'loader.ts');
      fs.writeFileSync(file, `
        const module = await import("https://example.com/module.js");
      `);

      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.phantomType === 'DYNAMIC_IMPORT_URL'
      );
      expect(violations.length).toBeGreaterThan(0);
    });
  });

  // --- EXTERNAL API CALLS ---
  describe('FETCH_EXTERNAL Pattern', () => {
    it('detects fetch to external API', async () => {
      const file = path.join(tempDir, 'api.ts');
      fs.writeFileSync(file, `
        const data = await fetch("https://api.example.com/data");
      `);

      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.phantomType === 'FETCH_EXTERNAL'
      );
      expect(violations.length).toBeGreaterThan(0);
    });

    it('does NOT flag fetch to localhost', async () => {
      const file = path.join(tempDir, 'local.ts');
      fs.writeFileSync(file, `
        const data = await fetch("http://localhost:3000/api");
      `);

      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.phantomType === 'FETCH_EXTERNAL'
      );
      expect(violations.length).toBe(0);
    });
  });

  // --- CODE INJECTION RISKS ---
  describe('EVAL_USAGE Pattern', () => {
    it('detects eval() usage', async () => {
      const file = path.join(tempDir, 'danger.ts');
      fs.writeFileSync(file, `
        const result = eval(userInput);
      `);

      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.phantomType === 'EVAL_USAGE'
      );
      expect(violations.length).toBeGreaterThan(0);
    });
  });

  describe('NEW_FUNCTION Pattern', () => {
    it('detects new Function() usage', async () => {
      const file = path.join(tempDir, 'danger.ts');
      fs.writeFileSync(file, `
        const fn = new Function('return 1');
      `);

      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.phantomType === 'NEW_FUNCTION'
      );
      expect(violations.length).toBeGreaterThan(0);
    });
  });

  // --- XSS RISKS ---
  describe('INNER_HTML Pattern', () => {
    it('detects innerHTML assignment', async () => {
      const file = path.join(tempDir, 'xss.ts');
      fs.writeFileSync(file, `
        element.innerHTML = userContent;
      `);

      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.phantomType === 'INNER_HTML'
      );
      expect(violations.length).toBeGreaterThan(0);
    });
  });

  // --- PACKAGE.JSON SCANNING ---
  describe('Package.json Scanning', () => {
    it('detects unpinned dependencies with ^', async () => {
      const file = path.join(tempDir, 'package.json');
      fs.writeFileSync(file, JSON.stringify({
        dependencies: {
          'lodash': '^4.17.0',
          'express': '4.18.2'
        }
      }));

      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.phantomType === 'UNPINNED_DEPENDENCY'
      );
      expect(violations.length).toBeGreaterThan(0);
      expect(violations[0].details.unpinnedDeps).toContain('lodash@^4.17.0');
    });

    it('detects unpinned dependencies with ~', async () => {
      const file = path.join(tempDir, 'package.json');
      fs.writeFileSync(file, JSON.stringify({
        dependencies: {
          'lodash': '~4.17.0'
        }
      }));

      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.phantomType === 'UNPINNED_DEPENDENCY'
      );
      expect(violations.length).toBeGreaterThan(0);
    });

    it('detects latest version', async () => {
      const file = path.join(tempDir, 'package.json');
      fs.writeFileSync(file, JSON.stringify({
        dependencies: {
          'danger-lib': 'latest'
        }
      }));

      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.phantomType === 'UNPINNED_DEPENDENCY'
      );
      expect(violations.length).toBeGreaterThan(0);
    });

    it('detects star version', async () => {
      const file = path.join(tempDir, 'package.json');
      fs.writeFileSync(file, JSON.stringify({
        dependencies: {
          'wild-lib': '*'
        }
      }));

      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.phantomType === 'UNPINNED_DEPENDENCY'
      );
      expect(violations.length).toBeGreaterThan(0);
    });

    it('does NOT flag pinned dependencies', async () => {
      const file = path.join(tempDir, 'package.json');
      fs.writeFileSync(file, JSON.stringify({
        dependencies: {
          'lodash': '4.17.21',
          'express': '4.18.2'
        }
      }));

      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.phantomType === 'UNPINNED_DEPENDENCY'
      );
      expect(violations.length).toBe(0);
    });

    it('scans devDependencies', async () => {
      const file = path.join(tempDir, 'package.json');
      fs.writeFileSync(file, JSON.stringify({
        devDependencies: {
          'vitest': '^1.0.0'
        }
      }));

      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.phantomType === 'UNPINNED_DEPENDENCY'
      );
      expect(violations.length).toBeGreaterThan(0);
      expect(violations[0].details.section).toBe('devDependencies');
    });
  });

  // --- RECEIPT GENERATION ---
  describe('Receipt Generation', () => {
    it('generates valid SCREAM receipts', async () => {
      const file = path.join(tempDir, 'test.ts');
      fs.writeFileSync(file, `eval('code');`);

      const result = await detector.detect(file);
      expect(result.receipts.length).toBeGreaterThan(0);

      for (const receipt of result.receipts) {
        expect(receipt.type).toBe('SCREAM_PHANTOM');
        expect(receipt.port).toBe(3);
        expect(verifyScreamReceipt(receipt)).toBe(true);
      }
    });
  });

  // --- CONFIG OPTIONS ---
  describe('Configuration', () => {
    it('respects enabled=false', async () => {
      const file = path.join(tempDir, 'test.ts');
      fs.writeFileSync(file, `eval('code');`);

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
        export function add(a: number, b: number): number {
          return a + b;
        }
      `);

      const result = await detector.detect(file);
      expect(result.violationsFound).toBe(0);
    });

    it('handles invalid package.json', async () => {
      const file = path.join(tempDir, 'package.json');
      fs.writeFileSync(file, 'not valid json');

      const result = await detector.detect(file);
      expect(result.filesScanned).toBe(1);
      // Should not throw, just skip
    });
  });

  // --- RESULT STRUCTURE ---
  describe('Result Structure', () => {
    it('returns correct screamType', async () => {
      const result = await detector.detect(tempDir);
      expect(result.screamType).toBe('SCREAM_PHANTOM');
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
