/**
 * P4 RED REGNANT - SCREAM_LATTICE Detector Tests
 * 
 * @port 7
 * @commander SPIDER_SOVEREIGN (aligned)
 * @verb DECIDE
 * @tier BRONZE
 * @provenance: .kiro/specs/red-regnant-8-screams/tasks.md
 * Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 11.1
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { 
  LatticeDetector, 
  createLatticeDetector, 
  LATTICE_THRESHOLDS,
  LATTICE_PATTERNS
} from './lattice.js';
import { verifyScreamReceipt } from '../contracts/screams.js';

describe('SCREAM_LATTICE Detector (Port 7)', () => {
  let tempDir: string;
  let detector: LatticeDetector;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lattice-test-'));
    detector = new LatticeDetector();
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  // --- DETECTOR METADATA ---
  describe('Detector Metadata', () => {
    it('has correct name', () => {
      expect(detector.name).toBe('SCREAM_LATTICE');
    });

    it('is aligned with Port 7', () => {
      expect(detector.port).toBe(7);
    });

    it('produces SCREAM_LATTICE type', () => {
      expect(detector.screamType).toBe('SCREAM_LATTICE');
    });

    it('has a description', () => {
      expect(detector.description).toBeTruthy();
    });
  });

  // --- FACTORY FUNCTION ---
  describe('Factory Function', () => {
    it('createLatticeDetector returns a Detector', () => {
      const created = createLatticeDetector();
      expect(created.name).toBe('SCREAM_LATTICE');
      expect(created.port).toBe(7);
    });
  });

  // --- FILE DENSITY VIOLATION ---
  describe('FILE_DENSITY_VIOLATION Detection', () => {
    it('detects folder with more than 8 files', async () => {
      // Create 10 files (exceeds octal limit of 8)
      for (let i = 0; i < 10; i++) {
        fs.writeFileSync(path.join(tempDir, `file${i}.ts`), `const x${i} = ${i};`);
      }

      const result = await detector.detect(tempDir);
      const violations = result.receipts.filter(
        r => r.details.latticeType === 'FILE_DENSITY_VIOLATION'
      );
      expect(violations.length).toBeGreaterThan(0);
      expect(violations[0].details.fileCount).toBe(10);
    });

    it('does NOT flag folder with 8 or fewer files', async () => {
      for (let i = 0; i < 8; i++) {
        fs.writeFileSync(path.join(tempDir, `file${i}.ts`), `const x${i} = ${i};`);
      }

      const result = await detector.detect(tempDir);
      const violations = result.receipts.filter(
        r => r.details.latticeType === 'FILE_DENSITY_VIOLATION'
      );
      expect(violations.length).toBe(0);
    });
  });

  // --- FOLDER DENSITY VIOLATION ---
  describe('FOLDER_DENSITY_VIOLATION Detection', () => {
    it('detects folder with more than 8 subfolders', async () => {
      // Create 10 subfolders (exceeds octal limit of 8)
      for (let i = 0; i < 10; i++) {
        fs.mkdirSync(path.join(tempDir, `folder${i}`));
      }

      const result = await detector.detect(tempDir);
      const violations = result.receipts.filter(
        r => r.details.latticeType === 'FOLDER_DENSITY_VIOLATION'
      );
      expect(violations.length).toBeGreaterThan(0);
      expect(violations[0].details.folderCount).toBe(10);
    });

    it('does NOT flag folder with 8 or fewer subfolders', async () => {
      for (let i = 0; i < 8; i++) {
        fs.mkdirSync(path.join(tempDir, `folder${i}`));
      }

      const result = await detector.detect(tempDir);
      const violations = result.receipts.filter(
        r => r.details.latticeType === 'FOLDER_DENSITY_VIOLATION'
      );
      expect(violations.length).toBe(0);
    });
  });

  // --- BYPASS VIOLATION ---
  describe('BYPASS_VIOLATION Detection', () => {
    it('detects bare @bypass annotation', async () => {
      const file = path.join(tempDir, 'module.ts');
      fs.writeFileSync(file, `
        // @bypass
        function skipValidation() {}
      `);

      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.latticeType === 'BYPASS_VIOLATION'
      );
      expect(violations.length).toBeGreaterThan(0);
    });

    it('does NOT flag @bypass with @approved', async () => {
      const file = path.join(tempDir, 'module.ts');
      fs.writeFileSync(file, `
        // @bypass @approved by: admin
        function skipValidation() {}
      `);

      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.latticeType === 'BYPASS_VIOLATION'
      );
      expect(violations.length).toBe(0);
    });
  });

  // --- SKIP VIOLATION ---
  describe('SKIP_VIOLATION Detection', () => {
    it('detects bare @skip annotation', async () => {
      const file = path.join(tempDir, 'module.ts');
      fs.writeFileSync(file, `
        // @skip
        function skippedFunction() {}
      `);

      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.latticeType === 'SKIP_VIOLATION'
      );
      expect(violations.length).toBeGreaterThan(0);
    });

    it('does NOT flag @skip with reason', async () => {
      const file = path.join(tempDir, 'module.ts');
      fs.writeFileSync(file, `
        // @skip flaky test, see issue #123
        function skippedFunction() {}
      `);

      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.latticeType === 'SKIP_VIOLATION'
      );
      expect(violations.length).toBe(0);
    });
  });

  // --- TRACEABILITY VIOLATION ---
  describe('TRACEABILITY_VIOLATION Detection', () => {
    it('detects missing traceability in silver', async () => {
      const silverDir = path.join(tempDir, 'silver');
      fs.mkdirSync(silverDir);
      const file = path.join(silverDir, 'module.ts');
      fs.writeFileSync(file, `
        export function noTraceability() {
          return true;
        }
      `);

      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.latticeType === 'TRACEABILITY_VIOLATION'
      );
      expect(violations.length).toBeGreaterThan(0);
    });

    it('does NOT flag file with @provenance', async () => {
      const silverDir = path.join(tempDir, 'silver');
      fs.mkdirSync(silverDir);
      const file = path.join(silverDir, 'module.ts');
      fs.writeFileSync(file, `
        /**
         * @provenance: .kiro/specs/example/design.md
         */
        export function traced() {
          return true;
        }
      `);

      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.latticeType === 'TRACEABILITY_VIOLATION'
      );
      expect(violations.length).toBe(0);
    });

    it('does NOT flag file with Validates comment', async () => {
      const silverDir = path.join(tempDir, 'silver');
      fs.mkdirSync(silverDir);
      const file = path.join(silverDir, 'module.ts');
      fs.writeFileSync(file, `
        /**
         * Validates: Requirements 1.1, 1.2
         */
        export function traced() {
          return true;
        }
      `);

      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.latticeType === 'TRACEABILITY_VIOLATION'
      );
      expect(violations.length).toBe(0);
    });

    it('does NOT check traceability in bronze', async () => {
      const bronzeDir = path.join(tempDir, 'bronze');
      fs.mkdirSync(bronzeDir);
      const file = path.join(bronzeDir, 'experiment.ts');
      fs.writeFileSync(file, `
        export function noTraceability() {
          return true;
        }
      `);

      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.latticeType === 'TRACEABILITY_VIOLATION'
      );
      expect(violations.length).toBe(0);
    });

    it('does NOT check traceability in test files', async () => {
      const silverDir = path.join(tempDir, 'silver');
      fs.mkdirSync(silverDir);
      const file = path.join(silverDir, 'module.test.ts');
      fs.writeFileSync(file, `
        describe('test', () => {
          it('works', () => {});
        });
      `);

      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.latticeType === 'TRACEABILITY_VIOLATION'
      );
      expect(violations.length).toBe(0);
    });
  });

  // --- RECEIPT GENERATION ---
  describe('Receipt Generation', () => {
    it('generates valid SCREAM receipts', async () => {
      const file = path.join(tempDir, 'test.ts');
      fs.writeFileSync(file, '// @bypass\nconst x = 1;');

      const result = await detector.detect(file);
      expect(result.receipts.length).toBeGreaterThan(0);

      for (const receipt of result.receipts) {
        expect(receipt.type).toBe('SCREAM_LATTICE');
        expect(receipt.port).toBe(7);
        expect(verifyScreamReceipt(receipt)).toBe(true);
      }
    });
  });

  // --- CONFIG OPTIONS ---
  describe('Configuration', () => {
    it('respects enabled=false', async () => {
      const file = path.join(tempDir, 'test.ts');
      fs.writeFileSync(file, '// @bypass\nconst x = 1;');

      const result = await detector.detect(file, { enabled: false });
      expect(result.violationsFound).toBe(0);
    });
  });

  // --- EDGE CASES ---
  describe('Edge Cases', () => {
    it('handles non-existent path', async () => {
      const result = await detector.detect('/non/existent/path');
      expect(result.filesScanned).toBe(0);
      expect(result.violationsFound).toBe(0);
    });

    it('handles empty directory', async () => {
      const result = await detector.detect(tempDir);
      expect(result.violationsFound).toBe(0);
    });

    it('handles clean files', async () => {
      const file = path.join(tempDir, 'clean.ts');
      fs.writeFileSync(file, `
        export function clean(): number {
          return 42;
        }
      `);

      const result = await detector.detect(file);
      const latticeViolations = result.receipts.filter(
        r => ['BYPASS_VIOLATION', 'SKIP_VIOLATION'].includes(r.details.latticeType as string)
      );
      expect(latticeViolations.length).toBe(0);
    });
  });

  // --- CONSTANTS ---
  describe('Constants', () => {
    it('LATTICE_THRESHOLDS has octal limits', () => {
      expect(LATTICE_THRESHOLDS.MAX_FILES_PER_FOLDER).toBe(8);
      expect(LATTICE_THRESHOLDS.MAX_FOLDERS_PER_FOLDER).toBe(8);
      expect(LATTICE_THRESHOLDS.MAX_DEPTH).toBe(7);
    });
  });

  // --- RESULT STRUCTURE ---
  describe('Result Structure', () => {
    it('returns correct screamType', async () => {
      const result = await detector.detect(tempDir);
      expect(result.screamType).toBe('SCREAM_LATTICE');
    });

    it('returns duration in milliseconds', async () => {
      const file = path.join(tempDir, 'test.ts');
      fs.writeFileSync(file, 'const x = 1;');

      const result = await detector.detect(file);
      expect(typeof result.duration).toBe('number');
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });
  });

  // --- MUTATION-KILLING: Duration Calculation ---
  describe('Duration Calculation (Mutation Killers)', () => {
    it('duration is subtraction not addition when disabled', async () => {
      const result = await detector.detect(tempDir, { enabled: false });
      expect(result.duration).toBeLessThan(5000);
    });

    it('duration is subtraction not addition for non-existent path', async () => {
      const result = await detector.detect('/non/existent/path');
      expect(result.duration).toBeLessThan(5000);
    });

    it('duration is subtraction not addition for directory scan', async () => {
      fs.writeFileSync(path.join(tempDir, 'test.ts'), 'const x = 1;');
      const result = await detector.detect(tempDir);
      expect(result.duration).toBeLessThan(5000);
    });
  });

  // --- MUTATION-KILLING: filesScanned Counter ---
  describe('filesScanned Counter (Mutation Killers)', () => {
    it('filesScanned increments for each file', async () => {
      fs.writeFileSync(path.join(tempDir, 'file1.ts'), 'const x = 1;');
      fs.writeFileSync(path.join(tempDir, 'file2.ts'), 'const y = 2;');
      const result = await detector.detect(tempDir);
      expect(result.filesScanned).toBe(2);
    });

    it('filesScanned is exactly 1 for single file', async () => {
      const file = path.join(tempDir, 'single.ts');
      fs.writeFileSync(file, 'const x = 1;');
      const result = await detector.detect(file);
      expect(result.filesScanned).toBe(1);
    });

    it('filesScanned does not go negative', async () => {
      fs.writeFileSync(path.join(tempDir, 'test.ts'), 'const x = 1;');
      const result = await detector.detect(tempDir);
      expect(result.filesScanned).toBeGreaterThanOrEqual(0);
    });
  });

  // --- MUTATION-KILLING: Directory Recursion ---
  describe('Directory Recursion (Mutation Killers)', () => {
    it('scans files in subdirectories', async () => {
      const subDir = path.join(tempDir, 'subdir');
      fs.mkdirSync(subDir);
      fs.writeFileSync(path.join(subDir, 'nested.ts'), '// @bypass\nconst x = 1;');
      
      const result = await detector.detect(tempDir);
      const violations = result.receipts.filter(
        r => r.details.latticeType === 'BYPASS_VIOLATION'
      );
      expect(violations.length).toBeGreaterThan(0);
    });

    it('excludes node_modules from recursion', async () => {
      const nmDir = path.join(tempDir, 'node_modules');
      fs.mkdirSync(nmDir);
      fs.writeFileSync(path.join(nmDir, 'module.ts'), '// @bypass\nconst x = 1;');
      
      const result = await detector.detect(tempDir);
      const violations = result.receipts.filter(
        r => r.details.latticeType === 'BYPASS_VIOLATION'
      );
      expect(violations.length).toBe(0);
    });

    it('excludes .git from recursion', async () => {
      const gitDir = path.join(tempDir, '.git');
      fs.mkdirSync(gitDir);
      fs.writeFileSync(path.join(gitDir, 'config.ts'), '// @bypass\nconst x = 1;');
      
      const result = await detector.detect(tempDir);
      const violations = result.receipts.filter(
        r => r.details.latticeType === 'BYPASS_VIOLATION'
      );
      expect(violations.length).toBe(0);
    });

    it('scans multiple levels deep', async () => {
      const level1 = path.join(tempDir, 'level1');
      const level2 = path.join(level1, 'level2');
      fs.mkdirSync(level1);
      fs.mkdirSync(level2);
      fs.writeFileSync(path.join(level2, 'deep.ts'), '// @bypass\nconst x = 1;');
      
      const result = await detector.detect(tempDir);
      const violations = result.receipts.filter(
        r => r.details.latticeType === 'BYPASS_VIOLATION'
      );
      expect(violations.length).toBeGreaterThan(0);
    });
  });

  // --- MUTATION-KILLING: Message Content ---
  describe('Message Content (Mutation Killers)', () => {
    it('FILE_DENSITY_VIOLATION message is not empty', async () => {
      for (let i = 0; i < 10; i++) {
        fs.writeFileSync(path.join(tempDir, `file${i}.ts`), `const x${i} = ${i};`);
      }
      const result = await detector.detect(tempDir);
      const violation = result.receipts.find(
        r => r.details.latticeType === 'FILE_DENSITY_VIOLATION'
      );
      expect(violation).toBeDefined();
      expect(violation!.details.message).toBeTruthy();
      expect(violation!.details.message.length).toBeGreaterThan(0);
    });

    it('FILE_DENSITY_VIOLATION severity is warning', async () => {
      for (let i = 0; i < 10; i++) {
        fs.writeFileSync(path.join(tempDir, `file${i}.ts`), `const x${i} = ${i};`);
      }
      const result = await detector.detect(tempDir);
      const violation = result.receipts.find(
        r => r.details.latticeType === 'FILE_DENSITY_VIOLATION'
      );
      expect(violation).toBeDefined();
      expect(violation!.details.severity).toBe('warning');
      expect(violation!.severity).toBe('warning');
    });

    it('FOLDER_DENSITY_VIOLATION message is not empty', async () => {
      for (let i = 0; i < 10; i++) {
        fs.mkdirSync(path.join(tempDir, `folder${i}`));
      }
      const result = await detector.detect(tempDir);
      const violation = result.receipts.find(
        r => r.details.latticeType === 'FOLDER_DENSITY_VIOLATION'
      );
      expect(violation).toBeDefined();
      expect(violation!.details.message).toBeTruthy();
      expect(violation!.details.message.length).toBeGreaterThan(0);
    });

    it('FOLDER_DENSITY_VIOLATION severity is warning', async () => {
      for (let i = 0; i < 10; i++) {
        fs.mkdirSync(path.join(tempDir, `folder${i}`));
      }
      const result = await detector.detect(tempDir);
      const violation = result.receipts.find(
        r => r.details.latticeType === 'FOLDER_DENSITY_VIOLATION'
      );
      expect(violation).toBeDefined();
      expect(violation!.details.severity).toBe('warning');
      expect(violation!.severity).toBe('warning');
    });

    it('BYPASS_VIOLATION message is not empty', async () => {
      const file = path.join(tempDir, 'module.ts');
      fs.writeFileSync(file, '// @bypass\nconst x = 1;');
      const result = await detector.detect(file);
      const violation = result.receipts.find(
        r => r.details.latticeType === 'BYPASS_VIOLATION'
      );
      expect(violation).toBeDefined();
      expect(violation!.details.message).toBeTruthy();
      expect(violation!.details.message.length).toBeGreaterThan(0);
    });

    it('BYPASS_VIOLATION severity is error', async () => {
      const file = path.join(tempDir, 'module.ts');
      fs.writeFileSync(file, '// @bypass\nconst x = 1;');
      const result = await detector.detect(file);
      const violation = result.receipts.find(
        r => r.details.latticeType === 'BYPASS_VIOLATION'
      );
      expect(violation).toBeDefined();
      expect(violation!.details.severity).toBe('error');
      expect(violation!.severity).toBe('error');
    });

    it('SKIP_VIOLATION message is not empty', async () => {
      const file = path.join(tempDir, 'module.ts');
      fs.writeFileSync(file, '// @skip\nconst x = 1;');
      const result = await detector.detect(file);
      const violation = result.receipts.find(
        r => r.details.latticeType === 'SKIP_VIOLATION'
      );
      expect(violation).toBeDefined();
      expect(violation!.details.message).toBeTruthy();
      expect(violation!.details.message.length).toBeGreaterThan(0);
    });

    it('SKIP_VIOLATION severity is warning', async () => {
      const file = path.join(tempDir, 'module.ts');
      fs.writeFileSync(file, '// @skip\nconst x = 1;');
      const result = await detector.detect(file);
      const violation = result.receipts.find(
        r => r.details.latticeType === 'SKIP_VIOLATION'
      );
      expect(violation).toBeDefined();
      expect(violation!.details.severity).toBe('warning');
      expect(violation!.severity).toBe('warning');
    });

    it('TRACEABILITY_VIOLATION message is not empty', async () => {
      const silverDir = path.join(tempDir, 'silver');
      fs.mkdirSync(silverDir);
      const file = path.join(silverDir, 'module.ts');
      fs.writeFileSync(file, 'export function noTrace() { return true; }');
      const result = await detector.detect(file);
      const violation = result.receipts.find(
        r => r.details.latticeType === 'TRACEABILITY_VIOLATION'
      );
      expect(violation).toBeDefined();
      expect(violation!.details.message).toBeTruthy();
      expect(violation!.details.message.length).toBeGreaterThan(0);
    });

    it('TRACEABILITY_VIOLATION severity is warning', async () => {
      const silverDir = path.join(tempDir, 'silver');
      fs.mkdirSync(silverDir);
      const file = path.join(silverDir, 'module.ts');
      fs.writeFileSync(file, 'export function noTrace() { return true; }');
      const result = await detector.detect(file);
      const violation = result.receipts.find(
        r => r.details.latticeType === 'TRACEABILITY_VIOLATION'
      );
      expect(violation).toBeDefined();
      expect(violation!.details.severity).toBe('warning');
      expect(violation!.severity).toBe('warning');
    });
  });

  // --- MUTATION-KILLING: Line Numbers ---
  describe('Line Numbers (Mutation Killers)', () => {
    it('lineNumbers array contains correct line numbers for bypass', async () => {
      const file = path.join(tempDir, 'module.ts');
      fs.writeFileSync(file, 'const a = 1;\n// @bypass\nconst b = 2;');
      const result = await detector.detect(file);
      const violation = result.receipts.find(
        r => r.details.latticeType === 'BYPASS_VIOLATION'
      );
      expect(violation).toBeDefined();
      expect(violation!.details.lineNumbers).toBeDefined();
      expect(violation!.details.lineNumbers).toContain(2);
    });

    it('lineNumbers array contains correct line numbers for skip', async () => {
      const file = path.join(tempDir, 'module.ts');
      fs.writeFileSync(file, 'const a = 1;\nconst b = 2;\n// @skip\nconst c = 3;');
      const result = await detector.detect(file);
      const violation = result.receipts.find(
        r => r.details.latticeType === 'SKIP_VIOLATION'
      );
      expect(violation).toBeDefined();
      expect(violation!.details.lineNumbers).toBeDefined();
      expect(violation!.details.lineNumbers).toContain(3);
    });

    it('lineNumbers handles multiple matches', async () => {
      const file = path.join(tempDir, 'module.ts');
      fs.writeFileSync(file, '// @bypass\nconst a = 1;\n// @bypass\nconst b = 2;');
      const result = await detector.detect(file);
      const violation = result.receipts.find(
        r => r.details.latticeType === 'BYPASS_VIOLATION'
      );
      expect(violation).toBeDefined();
      expect(violation!.details.lineNumbers.length).toBe(2);
      expect(violation!.details.lineNumbers).toContain(1);
      expect(violation!.details.lineNumbers).toContain(3);
    });
  });

  // --- MUTATION-KILLING: Folder Density Recursion ---
  describe('Folder Density Recursion (Mutation Killers)', () => {
    it('checks density in subdirectories', async () => {
      const subDir = path.join(tempDir, 'subdir');
      fs.mkdirSync(subDir);
      for (let i = 0; i < 10; i++) {
        fs.writeFileSync(path.join(subDir, `file${i}.ts`), `const x${i} = ${i};`);
      }
      
      const result = await detector.detect(tempDir);
      const violations = result.receipts.filter(
        r => r.details.latticeType === 'FILE_DENSITY_VIOLATION'
      );
      expect(violations.length).toBeGreaterThan(0);
    });

    it('excludes node_modules from density check', async () => {
      const nmDir = path.join(tempDir, 'node_modules');
      fs.mkdirSync(nmDir);
      for (let i = 0; i < 10; i++) {
        fs.writeFileSync(path.join(nmDir, `file${i}.ts`), `const x${i} = ${i};`);
      }
      
      const result = await detector.detect(tempDir);
      const violations = result.receipts.filter(
        r => r.details.latticeType === 'FILE_DENSITY_VIOLATION'
      );
      expect(violations.length).toBe(0);
    });
  });

  // --- MUTATION-KILLING: Match Count Boundary ---
  describe('Match Count Boundary (Mutation Killers)', () => {
    it('matchCount is exactly 1 for single match', async () => {
      const file = path.join(tempDir, 'module.ts');
      fs.writeFileSync(file, '// @bypass\nconst x = 1;');
      const result = await detector.detect(file);
      const violation = result.receipts.find(
        r => r.details.latticeType === 'BYPASS_VIOLATION'
      );
      expect(violation).toBeDefined();
      expect(violation!.details.matchCount).toBe(1);
    });

    it('matchCount is exactly 2 for two matches', async () => {
      const file = path.join(tempDir, 'module.ts');
      fs.writeFileSync(file, '// @bypass\nconst a = 1;\n// @bypass\nconst b = 2;');
      const result = await detector.detect(file);
      const violation = result.receipts.find(
        r => r.details.latticeType === 'BYPASS_VIOLATION'
      );
      expect(violation).toBeDefined();
      expect(violation!.details.matchCount).toBe(2);
    });
  });

  // --- MUTATION-KILLING: Depth Violation ---
  describe('Depth Violation (Mutation Killers)', () => {
    it('detects folder depth exceeding MAX_DEPTH', async () => {
      // Create deeply nested structure (depth > 7)
      let currentPath = tempDir;
      for (let i = 0; i < 10; i++) {
        currentPath = path.join(currentPath, `level${i}`);
        fs.mkdirSync(currentPath);
      }
      
      const result = await detector.detect(tempDir);
      const violations = result.receipts.filter(
        r => r.details.latticeType === 'DEPTH_VIOLATION'
      );
      expect(violations.length).toBeGreaterThan(0);
    });

    it('DEPTH_VIOLATION has correct depth value', async () => {
      let currentPath = tempDir;
      for (let i = 0; i < 10; i++) {
        currentPath = path.join(currentPath, `level${i}`);
        fs.mkdirSync(currentPath);
      }
      
      const result = await detector.detect(tempDir);
      const violation = result.receipts.find(
        r => r.details.latticeType === 'DEPTH_VIOLATION'
      );
      expect(violation).toBeDefined();
      expect(violation!.details.depth).toBeGreaterThan(LATTICE_THRESHOLDS.MAX_DEPTH);
    });

    it('DEPTH_VIOLATION message is not empty', async () => {
      let currentPath = tempDir;
      for (let i = 0; i < 10; i++) {
        currentPath = path.join(currentPath, `level${i}`);
        fs.mkdirSync(currentPath);
      }
      
      const result = await detector.detect(tempDir);
      const violation = result.receipts.find(
        r => r.details.latticeType === 'DEPTH_VIOLATION'
      );
      expect(violation).toBeDefined();
      expect(violation!.details.message).toBeTruthy();
      expect(violation!.details.message.length).toBeGreaterThan(0);
    });

    it('DEPTH_VIOLATION severity is warning', async () => {
      let currentPath = tempDir;
      for (let i = 0; i < 10; i++) {
        currentPath = path.join(currentPath, `level${i}`);
        fs.mkdirSync(currentPath);
      }
      
      const result = await detector.detect(tempDir);
      const violation = result.receipts.find(
        r => r.details.latticeType === 'DEPTH_VIOLATION'
      );
      expect(violation).toBeDefined();
      expect(violation!.details.severity).toBe('warning');
      expect(violation!.severity).toBe('warning');
    });
  });

  // --- MUTATION-KILLING: File Extension Filtering ---
  describe('File Extension Filtering (Mutation Killers)', () => {
    it('scans .ts files', async () => {
      fs.writeFileSync(path.join(tempDir, 'test.ts'), '// @bypass\nconst x = 1;');
      const result = await detector.detect(tempDir);
      const violations = result.receipts.filter(
        r => r.details.latticeType === 'BYPASS_VIOLATION'
      );
      expect(violations.length).toBeGreaterThan(0);
    });

    it('scans .js files', async () => {
      fs.writeFileSync(path.join(tempDir, 'test.js'), '// @bypass\nconst x = 1;');
      const result = await detector.detect(tempDir);
      const violations = result.receipts.filter(
        r => r.details.latticeType === 'BYPASS_VIOLATION'
      );
      expect(violations.length).toBeGreaterThan(0);
    });
  });
});
