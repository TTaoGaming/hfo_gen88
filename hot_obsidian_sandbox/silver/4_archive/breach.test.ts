/**
 * P4 RED REGNANT - SCREAM_BREACH Detector Tests
 * 
 * @port 1
 * @commander WEB_WEAVER (aligned)
 * @verb FUSE
 * @tier BRONZE
 * @provenance: .kiro/specs/red-regnant-8-screams/tasks.md
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 11.1
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { BreachDetector, createBreachDetector, BREACH_PATTERNS } from './breach.js';
import { verifyScreamReceipt } from '../contracts/screams.js';

describe('SCREAM_BREACH Detector (Port 1)', () => {
  let tempDir: string;
  let detector: BreachDetector;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'breach-test-'));
    detector = new BreachDetector();
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  // --- DETECTOR METADATA ---
  describe('Detector Metadata', () => {
    it('has correct name', () => {
      expect(detector.name).toBe('SCREAM_BREACH');
    });

    it('is aligned with Port 1', () => {
      expect(detector.port).toBe(1);
    });

    it('produces SCREAM_BREACH type', () => {
      expect(detector.screamType).toBe('SCREAM_BREACH');
    });

    it('has a description', () => {
      expect(detector.description).toBeTruthy();
      expect(detector.description.length).toBeGreaterThan(0);
    });
  });

  // --- FACTORY FUNCTION ---
  describe('Factory Function', () => {
    it('createBreachDetector returns a Detector', () => {
      const created = createBreachDetector();
      expect(created.name).toBe('SCREAM_BREACH');
      expect(created.port).toBe(1);
    });
  });

  // --- ANY TYPE DETECTION ---
  describe('ANY_TYPE Pattern', () => {
    it('detects bare any type', async () => {
      const file = path.join(tempDir, 'any-type.ts');
      fs.writeFileSync(file, `
        const data: any = fetchData();
      `);

      const result = await detector.detect(file);
      const anyViolations = result.receipts.filter(
        r => r.details.breachType === 'ANY_TYPE'
      );
      expect(anyViolations.length).toBeGreaterThan(0);
    });

    it('does NOT flag any with @bespoke annotation', async () => {
      const file = path.join(tempDir, 'bespoke-any.ts');
      fs.writeFileSync(file, `
        const data: any // @bespoke - legacy API requires any
      `);

      const result = await detector.detect(file);
      const anyViolations = result.receipts.filter(
        r => r.details.breachType === 'ANY_TYPE'
      );
      expect(anyViolations.length).toBe(0);
    });

    it('detects function parameter with any', async () => {
      const file = path.join(tempDir, 'param-any.ts');
      fs.writeFileSync(file, `
        function process(data: any) {
          return data;
        }
      `);

      const result = await detector.detect(file);
      const anyViolations = result.receipts.filter(
        r => r.details.breachType === 'ANY_TYPE'
      );
      expect(anyViolations.length).toBeGreaterThan(0);
    });
  });

  // --- ANY ARRAY DETECTION ---
  describe('ANY_ARRAY Pattern', () => {
    it('detects any[] array type', async () => {
      const file = path.join(tempDir, 'any-array.ts');
      fs.writeFileSync(file, `
        const items: any[] = [];
      `);

      const result = await detector.detect(file);
      const arrayViolations = result.receipts.filter(
        r => r.details.breachType === 'ANY_ARRAY'
      );
      expect(arrayViolations.length).toBeGreaterThan(0);
    });
  });

  // --- TYPE ASSERTION DETECTION ---
  describe('TYPE_ASSERTION_AS Pattern', () => {
    it('detects type assertion without comment', async () => {
      const file = path.join(tempDir, 'assertion.ts');
      fs.writeFileSync(file, `
        const user = data as User;
      `);

      const result = await detector.detect(file);
      const assertionViolations = result.receipts.filter(
        r => r.details.breachType === 'TYPE_ASSERTION_AS'
      );
      expect(assertionViolations.length).toBeGreaterThan(0);
    });

    it('skips type assertions in test files', async () => {
      const file = path.join(tempDir, 'mock.test.ts');
      fs.writeFileSync(file, `
        const mock = {} as MockService;
      `);

      const result = await detector.detect(file);
      const assertionViolations = result.receipts.filter(
        r => r.details.breachType === 'TYPE_ASSERTION_AS'
      );
      expect(assertionViolations.length).toBe(0);
    });
  });

  // --- NON-NULL ASSERTION DETECTION ---
  describe('NON_NULL_ASSERTION Pattern', () => {
    it('detects non-null assertion', async () => {
      const file = path.join(tempDir, 'non-null.ts');
      fs.writeFileSync(file, `
        const name = user!.name;
      `);

      const result = await detector.detect(file);
      const nonNullViolations = result.receipts.filter(
        r => r.details.breachType === 'NON_NULL_ASSERTION'
      );
      expect(nonNullViolations.length).toBeGreaterThan(0);
    });

    it('skips non-null assertions in test files', async () => {
      const file = path.join(tempDir, 'test.spec.ts');
      fs.writeFileSync(file, `
        const result = service!.getData();
      `);

      const result = await detector.detect(file);
      const nonNullViolations = result.receipts.filter(
        r => r.details.breachType === 'NON_NULL_ASSERTION'
      );
      expect(nonNullViolations.length).toBe(0);
    });
  });

  // --- TS-IGNORE DETECTION ---
  describe('TS_IGNORE_BARE Pattern', () => {
    it('detects bare @ts-ignore', async () => {
      const file = path.join(tempDir, 'ts-ignore.ts');
      fs.writeFileSync(file, `
        // @ts-ignore
        const x = badCode();
      `);

      const result = await detector.detect(file);
      const ignoreViolations = result.receipts.filter(
        r => r.details.breachType === 'TS_IGNORE_BARE'
      );
      expect(ignoreViolations.length).toBeGreaterThan(0);
    });

    it('does NOT flag @ts-ignore with explanation', async () => {
      const file = path.join(tempDir, 'ts-ignore-explained.ts');
      fs.writeFileSync(file, `
        // @ts-ignore Legacy API incompatibility
        const x = legacyCode();
      `);

      const result = await detector.detect(file);
      const ignoreViolations = result.receipts.filter(
        r => r.details.breachType === 'TS_IGNORE_BARE'
      );
      expect(ignoreViolations.length).toBe(0);
    });
  });

  // --- TS-EXPECT-ERROR DETECTION ---
  describe('TS_EXPECT_ERROR_BARE Pattern', () => {
    it('detects bare @ts-expect-error', async () => {
      const file = path.join(tempDir, 'ts-expect.ts');
      fs.writeFileSync(file, `
        // @ts-expect-error
        const x = intentionalError();
      `);

      const result = await detector.detect(file);
      const expectViolations = result.receipts.filter(
        r => r.details.breachType === 'TS_EXPECT_ERROR_BARE'
      );
      expect(expectViolations.length).toBeGreaterThan(0);
    });

    it('does NOT flag @ts-expect-error with explanation', async () => {
      const file = path.join(tempDir, 'ts-expect-explained.ts');
      fs.writeFileSync(file, `
        // @ts-expect-error Testing error handling
        const x = errorCase();
      `);

      const result = await detector.detect(file);
      const expectViolations = result.receipts.filter(
        r => r.details.breachType === 'TS_EXPECT_ERROR_BARE'
      );
      expect(expectViolations.length).toBe(0);
    });
  });

  // --- OBJECT TYPE DETECTION ---
  describe('OBJECT_TYPE Pattern', () => {
    it('detects loose object type', async () => {
      const file = path.join(tempDir, 'object-type.ts');
      fs.writeFileSync(file, `
        function process(data: object) {
          return data;
        }
      `);

      const result = await detector.detect(file);
      const objectViolations = result.receipts.filter(
        r => r.details.breachType === 'OBJECT_TYPE'
      );
      expect(objectViolations.length).toBeGreaterThan(0);
    });
  });

  // --- FUNCTION TYPE DETECTION ---
  describe('FUNCTION_TYPE Pattern', () => {
    it('detects loose Function type', async () => {
      const file = path.join(tempDir, 'function-type.ts');
      fs.writeFileSync(file, `
        const callback: Function = () => {};
      `);

      const result = await detector.detect(file);
      const functionViolations = result.receipts.filter(
        r => r.details.breachType === 'FUNCTION_TYPE'
      );
      expect(functionViolations.length).toBeGreaterThan(0);
    });
  });

  // --- PROVENANCE HEADER ---
  describe('Provenance Header Check', () => {
    it('detects missing provenance in silver path', async () => {
      const silverDir = path.join(tempDir, 'silver');
      fs.mkdirSync(silverDir);
      const file = path.join(silverDir, 'module.ts');
      fs.writeFileSync(file, `
        export function doSomething() {
          return true;
        }
      `);

      const result = await detector.detect(file);
      const provenanceViolations = result.receipts.filter(
        r => r.details.breachType === 'MISSING_PROVENANCE'
      );
      expect(provenanceViolations.length).toBeGreaterThan(0);
    });

    it('does NOT flag files with provenance header', async () => {
      const silverDir = path.join(tempDir, 'silver');
      fs.mkdirSync(silverDir);
      const file = path.join(silverDir, 'module.ts');
      fs.writeFileSync(file, `
        /**
         * @provenance: .kiro/specs/example/design.md
         */
        export function doSomething() {
          return true;
        }
      `);

      const result = await detector.detect(file);
      const provenanceViolations = result.receipts.filter(
        r => r.details.breachType === 'MISSING_PROVENANCE'
      );
      expect(provenanceViolations.length).toBe(0);
    });

    it('does NOT require provenance in bronze path', async () => {
      const bronzeDir = path.join(tempDir, 'bronze');
      fs.mkdirSync(bronzeDir);
      const file = path.join(bronzeDir, 'experiment.ts');
      fs.writeFileSync(file, `
        export function experiment() {
          return true;
        }
      `);

      const result = await detector.detect(file);
      const provenanceViolations = result.receipts.filter(
        r => r.details.breachType === 'MISSING_PROVENANCE'
      );
      expect(provenanceViolations.length).toBe(0);
    });

    it('does NOT require provenance in test files', async () => {
      const silverDir = path.join(tempDir, 'silver');
      fs.mkdirSync(silverDir);
      const file = path.join(silverDir, 'module.test.ts');
      fs.writeFileSync(file, `
        describe('test', () => {
          it('works', () => {});
        });
      `);

      const result = await detector.detect(file);
      const provenanceViolations = result.receipts.filter(
        r => r.details.breachType === 'MISSING_PROVENANCE'
      );
      expect(provenanceViolations.length).toBe(0);
    });
  });

  // --- RECEIPT GENERATION ---
  describe('Receipt Generation', () => {
    it('generates valid SCREAM receipts', async () => {
      const file = path.join(tempDir, 'test.ts');
      fs.writeFileSync(file, 'const x: any = 1;');

      const result = await detector.detect(file);
      expect(result.receipts.length).toBeGreaterThan(0);

      for (const receipt of result.receipts) {
        expect(receipt.type).toBe('SCREAM_BREACH');
        expect(receipt.port).toBe(1);
        expect(verifyScreamReceipt(receipt)).toBe(true);
      }
    });

    it('includes line numbers in receipt details', async () => {
      const file = path.join(tempDir, 'lines.ts');
      fs.writeFileSync(file, `line1
line2
const x: any = 1;
line4`);

      const result = await detector.detect(file);
      const anyViolation = result.receipts.find(r => r.details.breachType === 'ANY_TYPE');
      expect(anyViolation?.details.lineNumbers).toContain(3);
    });
  });

  // --- CONFIG OPTIONS ---
  describe('Configuration', () => {
    it('respects enabled=false', async () => {
      const file = path.join(tempDir, 'test.ts');
      fs.writeFileSync(file, 'const x: any = 1;');

      const result = await detector.detect(file, { enabled: false });
      expect(result.violationsFound).toBe(0);
      expect(result.filesScanned).toBe(0);
    });

    it('respects custom severity', async () => {
      const file = path.join(tempDir, 'test.ts');
      fs.writeFileSync(file, 'const x: any = 1;');

      const result = await detector.detect(file, { severity: 'critical' });
      expect(result.receipts[0].severity).toBe('critical');
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

    it('handles clean files', async () => {
      const file = path.join(tempDir, 'clean.ts');
      fs.writeFileSync(file, `
        interface User {
          name: string;
          age: number;
        }
        
        function getUser(id: string): User {
          return { name: 'Test', age: 25 };
        }
      `);

      const result = await detector.detect(file);
      expect(result.violationsFound).toBe(0);
    });

    it('handles multiple violations in same file', async () => {
      const file = path.join(tempDir, 'multi.ts');
      fs.writeFileSync(file, `
        const a: any = 1;
        const b: any[] = [];
        // @ts-ignore
        const c = bad();
      `);

      const result = await detector.detect(file);
      expect(result.violationsFound).toBeGreaterThanOrEqual(2);
    });
  });

  // --- RESULT STRUCTURE ---
  describe('Result Structure', () => {
    it('returns correct screamType', async () => {
      const result = await detector.detect(tempDir);
      expect(result.screamType).toBe('SCREAM_BREACH');
    });

    it('returns duration in milliseconds', async () => {
      const file = path.join(tempDir, 'test.ts');
      fs.writeFileSync(file, 'const x = 1;');

      const result = await detector.detect(file);
      expect(typeof result.duration).toBe('number');
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });
  });

  // --- MUTATION KILLERS ---
  // These tests specifically target surviving mutants from Stryker analysis
  describe('Mutation Killers', () => {
    
    // Kill: duration arithmetic mutation (- to +)
    describe('Duration Calculation', () => {
      it('duration is reasonable (not astronomical from addition)', async () => {
        const file = path.join(tempDir, 'test.ts');
        fs.writeFileSync(file, 'const x: any = 1;');
        
        const result = await detector.detect(file);
        // If duration used + instead of -, it would be ~2x Date.now() (huge number)
        expect(result.duration).toBeLessThan(10000); // Should be < 10 seconds
        expect(result.duration).toBeGreaterThanOrEqual(0);
      });

      it('duration is valid even when detector is disabled', async () => {
        const file = path.join(tempDir, 'test.ts');
        fs.writeFileSync(file, 'const x: any = 1;');
        
        const result = await detector.detect(file, { enabled: false });
        expect(result.duration).toBeLessThan(10000);
        expect(result.duration).toBeGreaterThanOrEqual(0);
      });
    });

    // Kill: directory walking mutations
    describe('Directory Walking', () => {
      it('scans files in subdirectories recursively', async () => {
        const subDir = path.join(tempDir, 'src', 'utils');
        fs.mkdirSync(subDir, { recursive: true });
        const file = path.join(subDir, 'helper.ts');
        fs.writeFileSync(file, 'const x: any = 1;');
        
        const result = await detector.detect(tempDir);
        expect(result.filesScanned).toBeGreaterThan(0);
        expect(result.violationsFound).toBeGreaterThan(0);
      });

      it('excludes node_modules directory', async () => {
        const nodeModules = path.join(tempDir, 'node_modules', 'pkg');
        fs.mkdirSync(nodeModules, { recursive: true });
        const file = path.join(nodeModules, 'index.ts');
        fs.writeFileSync(file, 'const x: any = 1;');
        
        const result = await detector.detect(tempDir);
        // Should not find violations in node_modules
        const nodeModulesViolations = result.receipts.filter(
          r => r.filePath.includes('node_modules')
        );
        expect(nodeModulesViolations.length).toBe(0);
      });

      it('excludes .git directory', async () => {
        const gitDir = path.join(tempDir, '.git', 'hooks');
        fs.mkdirSync(gitDir, { recursive: true });
        const file = path.join(gitDir, 'pre-commit.ts');
        fs.writeFileSync(file, 'const x: any = 1;');
        
        const result = await detector.detect(tempDir);
        const gitViolations = result.receipts.filter(
          r => r.filePath.includes('.git')
        );
        expect(gitViolations.length).toBe(0);
      });

      it('returns empty result for non-existent directory', async () => {
        const result = await detector.detect('/non/existent/directory');
        expect(result.filesScanned).toBe(0);
        expect(result.violationsFound).toBe(0);
        expect(result.receipts).toHaveLength(0);
      });

      it('handles directory with only excluded subdirectories', async () => {
        const nodeModules = path.join(tempDir, 'node_modules');
        fs.mkdirSync(nodeModules);
        fs.writeFileSync(path.join(nodeModules, 'pkg.ts'), 'const x: any = 1;');
        
        const result = await detector.detect(tempDir);
        expect(result.violationsFound).toBe(0);
      });
    });

    // Kill: filesScanned increment mutation (++ to --)
    describe('Files Scanned Counter', () => {
      it('filesScanned increments correctly for each file', async () => {
        // Create multiple files
        fs.writeFileSync(path.join(tempDir, 'file1.ts'), 'const a = 1;');
        fs.writeFileSync(path.join(tempDir, 'file2.ts'), 'const b = 2;');
        fs.writeFileSync(path.join(tempDir, 'file3.ts'), 'const c = 3;');
        
        const result = await detector.detect(tempDir);
        expect(result.filesScanned).toBe(3);
      });

      it('filesScanned is exactly 1 for single file', async () => {
        const file = path.join(tempDir, 'single.ts');
        fs.writeFileSync(file, 'const x = 1;');
        
        const result = await detector.detect(file);
        expect(result.filesScanned).toBe(1);
      });

      it('filesScanned is 0 for empty directory', async () => {
        const emptyDir = path.join(tempDir, 'empty');
        fs.mkdirSync(emptyDir);
        
        const result = await detector.detect(emptyDir);
        expect(result.filesScanned).toBe(0);
      });
    });

    // Kill: severity string mutations
    describe('Severity Classification', () => {
      it('ANY_TYPE returns error severity', async () => {
        const file = path.join(tempDir, 'any.ts');
        fs.writeFileSync(file, 'const x: any = 1;');
        
        const result = await detector.detect(file);
        const violation = result.receipts.find(r => r.details.breachType === 'ANY_TYPE');
        expect(violation?.details.severity).toBe('error');
      });

      it('ANY_ARRAY returns error severity', async () => {
        const file = path.join(tempDir, 'arr.ts');
        fs.writeFileSync(file, 'const x: any[] = [];');
        
        const result = await detector.detect(file);
        const violation = result.receipts.find(r => r.details.breachType === 'ANY_ARRAY');
        expect(violation?.details.severity).toBe('error');
      });

      it('RETURN_ANY returns error severity', async () => {
        const file = path.join(tempDir, 'ret.ts');
        fs.writeFileSync(file, 'function foo(): any { return 1; }');
        
        const result = await detector.detect(file);
        const violation = result.receipts.find(r => r.details.breachType === 'RETURN_ANY');
        expect(violation?.details.severity).toBe('error');
      });

      it('TS_IGNORE_BARE returns warning severity', async () => {
        const file = path.join(tempDir, 'ignore.ts');
        fs.writeFileSync(file, '// @ts-ignore\nconst x = 1;');
        
        const result = await detector.detect(file);
        const violation = result.receipts.find(r => r.details.breachType === 'TS_IGNORE_BARE');
        expect(violation?.details.severity).toBe('warning');
      });

      it('TS_EXPECT_ERROR_BARE returns warning severity', async () => {
        const file = path.join(tempDir, 'expect.ts');
        fs.writeFileSync(file, '// @ts-expect-error\nconst x = 1;');
        
        const result = await detector.detect(file);
        const violation = result.receipts.find(r => r.details.breachType === 'TS_EXPECT_ERROR_BARE');
        expect(violation?.details.severity).toBe('warning');
      });

      it('TYPE_ASSERTION_AS returns warning severity', async () => {
        const file = path.join(tempDir, 'assert.ts');
        fs.writeFileSync(file, 'const x = y as string;');
        
        const result = await detector.detect(file);
        const violation = result.receipts.find(r => r.details.breachType === 'TYPE_ASSERTION_AS');
        expect(violation?.details.severity).toBe('warning');
      });

      it('NON_NULL_ASSERTION returns warning severity', async () => {
        const file = path.join(tempDir, 'nonnull.ts');
        fs.writeFileSync(file, 'const x = y!.z;');
        
        const result = await detector.detect(file);
        const violation = result.receipts.find(r => r.details.breachType === 'NON_NULL_ASSERTION');
        expect(violation?.details.severity).toBe('warning');
      });

      it('OBJECT_TYPE returns warning severity', async () => {
        const file = path.join(tempDir, 'obj.ts');
        fs.writeFileSync(file, 'function foo(x: object) {}');
        
        const result = await detector.detect(file);
        const violation = result.receipts.find(r => r.details.breachType === 'OBJECT_TYPE');
        expect(violation?.details.severity).toBe('warning');
      });

      it('FUNCTION_TYPE returns warning severity', async () => {
        const file = path.join(tempDir, 'func.ts');
        fs.writeFileSync(file, 'const cb: Function = () => {};');
        
        const result = await detector.detect(file);
        const violation = result.receipts.find(r => r.details.breachType === 'FUNCTION_TYPE');
        expect(violation?.details.severity).toBe('warning');
      });
    });

    // Kill: line number calculation mutations
    describe('Line Number Calculation', () => {
      it('lineNumbers array contains correct line numbers', async () => {
        const file = path.join(tempDir, 'lines.ts');
        fs.writeFileSync(file, 'const a = 1;\nconst b: any = 2;\nconst c = 3;');
        
        const result = await detector.detect(file);
        const violation = result.receipts.find(r => r.details.breachType === 'ANY_TYPE');
        expect(violation?.details.lineNumbers).toEqual([2]);
      });

      it('lineNumbers handles multiple matches on different lines', async () => {
        const file = path.join(tempDir, 'multi-lines.ts');
        fs.writeFileSync(file, 'const a: any = 1;\nconst b = 2;\nconst c: any = 3;');
        
        const result = await detector.detect(file);
        const violation = result.receipts.find(r => r.details.breachType === 'ANY_TYPE');
        expect(violation?.details.lineNumbers).toContain(1);
        expect(violation?.details.lineNumbers).toContain(3);
        expect(violation?.details.lineNumbers).not.toContain(2);
      });

      it('lineNumbers is empty array when no matches', async () => {
        const file = path.join(tempDir, 'clean.ts');
        fs.writeFileSync(file, 'const x: string = "hello";');
        
        const result = await detector.detect(file);
        expect(result.receipts.length).toBe(0);
      });

      it('matchCount reflects actual number of matches', async () => {
        const file = path.join(tempDir, 'count.ts');
        fs.writeFileSync(file, 'const a: any = 1;\nconst b: any = 2;\nconst c: any = 3;');
        
        const result = await detector.detect(file);
        const violation = result.receipts.find(r => r.details.breachType === 'ANY_TYPE');
        expect(violation?.details.matchCount).toBe(3);
      });
    });

    // Kill: shouldSkipInTests mutations
    describe('Test File Skipping', () => {
      it('skips TYPE_ASSERTION_AS in .test.ts files', async () => {
        const file = path.join(tempDir, 'mock.test.ts');
        fs.writeFileSync(file, 'const x = {} as MockType;');
        
        const result = await detector.detect(file);
        const assertions = result.receipts.filter(r => r.details.breachType === 'TYPE_ASSERTION_AS');
        expect(assertions.length).toBe(0);
      });

      it('skips NON_NULL_ASSERTION in .spec.ts files', async () => {
        const file = path.join(tempDir, 'service.spec.ts');
        fs.writeFileSync(file, 'const x = obj!.prop;');
        
        const result = await detector.detect(file);
        const assertions = result.receipts.filter(r => r.details.breachType === 'NON_NULL_ASSERTION');
        expect(assertions.length).toBe(0);
      });

      it('does NOT skip TYPE_ASSERTION_AS in regular .ts files', async () => {
        const file = path.join(tempDir, 'service.ts');
        fs.writeFileSync(file, 'const x = {} as MockType;');
        
        const result = await detector.detect(file);
        const assertions = result.receipts.filter(r => r.details.breachType === 'TYPE_ASSERTION_AS');
        expect(assertions.length).toBeGreaterThan(0);
      });

      it('does NOT skip NON_NULL_ASSERTION in regular .ts files', async () => {
        const file = path.join(tempDir, 'service.ts');
        fs.writeFileSync(file, 'const x = obj!.prop;');
        
        const result = await detector.detect(file);
        const assertions = result.receipts.filter(r => r.details.breachType === 'NON_NULL_ASSERTION');
        expect(assertions.length).toBeGreaterThan(0);
      });
    });

    // Kill: provenance message mutation
    describe('Provenance Violation Details', () => {
      it('provenance violation has correct message', async () => {
        const silverDir = path.join(tempDir, 'silver');
        fs.mkdirSync(silverDir);
        const file = path.join(silverDir, 'module.ts');
        fs.writeFileSync(file, 'export const x = 1;');
        
        const result = await detector.detect(file);
        const violation = result.receipts.find(r => r.details.breachType === 'MISSING_PROVENANCE');
        expect(violation?.details.message).toBe('Silver/Gold files require @provenance header');
      });

      it('provenance violation has error severity', async () => {
        const silverDir = path.join(tempDir, 'silver');
        fs.mkdirSync(silverDir);
        const file = path.join(silverDir, 'module.ts');
        fs.writeFileSync(file, 'export const x = 1;');
        
        const result = await detector.detect(file);
        const violation = result.receipts.find(r => r.details.breachType === 'MISSING_PROVENANCE');
        expect(violation?.details.severity).toBe('error');
      });

      it('detects missing provenance in gold path', async () => {
        const goldDir = path.join(tempDir, 'gold');
        fs.mkdirSync(goldDir);
        const file = path.join(goldDir, 'canonical.ts');
        fs.writeFileSync(file, 'export const x = 1;');
        
        const result = await detector.detect(file);
        const violation = result.receipts.find(r => r.details.breachType === 'MISSING_PROVENANCE');
        expect(violation).toBeDefined();
      });
    });

    // Kill: matches.length > 0 boundary mutation
    describe('Match Count Boundary', () => {
      it('does NOT create receipt when pattern has zero matches', async () => {
        const file = path.join(tempDir, 'clean.ts');
        fs.writeFileSync(file, 'const x: string = "hello";');
        
        const result = await detector.detect(file);
        // No ANY_TYPE violations should exist
        const anyViolations = result.receipts.filter(r => r.details.breachType === 'ANY_TYPE');
        expect(anyViolations.length).toBe(0);
      });

      it('creates receipt when pattern has exactly one match', async () => {
        const file = path.join(tempDir, 'one.ts');
        fs.writeFileSync(file, 'const x: any = 1;');
        
        const result = await detector.detect(file);
        const anyViolations = result.receipts.filter(r => r.details.breachType === 'ANY_TYPE');
        expect(anyViolations.length).toBe(1);
        expect(anyViolations[0].details.matchCount).toBe(1);
      });
    });

    // Kill: file extension filtering
    describe('File Extension Filtering', () => {
      it('scans .ts files', async () => {
        const file = path.join(tempDir, 'code.ts');
        fs.writeFileSync(file, 'const x: any = 1;');
        
        const result = await detector.detect(tempDir);
        expect(result.filesScanned).toBe(1);
      });

      it('scans .tsx files', async () => {
        const file = path.join(tempDir, 'component.tsx');
        fs.writeFileSync(file, 'const x: any = 1;');
        
        const result = await detector.detect(tempDir);
        expect(result.filesScanned).toBe(1);
      });

      it('scans .js files', async () => {
        const file = path.join(tempDir, 'script.js');
        fs.writeFileSync(file, 'const x = 1;');
        
        const result = await detector.detect(tempDir);
        expect(result.filesScanned).toBe(1);
      });

      it('does NOT scan .json files', async () => {
        const file = path.join(tempDir, 'config.json');
        fs.writeFileSync(file, '{"any": true}');
        
        const result = await detector.detect(tempDir);
        expect(result.filesScanned).toBe(0);
      });

      it('does NOT scan .md files', async () => {
        const file = path.join(tempDir, 'readme.md');
        fs.writeFileSync(file, '# any type');
        
        const result = await detector.detect(tempDir);
        expect(result.filesScanned).toBe(0);
      });
    });
  });
});