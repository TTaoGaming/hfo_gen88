/**
 * P4 RED REGNANT - SCREAM_BLINDSPOT Integration Tests
 * 
 * @port 0
 * @commander LIDLESS_LEGION (aligned)
 * @verb SENSE
 * @tier BRONZE
 * @purpose ANTI-THEATER - Verify detector works against REAL code, not just synthetic fixtures
 * 
 * These tests run the BLINDSPOT detector against actual codebase files
 * to prove it's not cosmetic theater.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { BlindspotDetector, BLINDSPOT_PATTERNS } from './blindspot.js';
import { verifyScreamReceipt } from '../contracts/screams.js';

describe('SCREAM_BLINDSPOT Integration Tests (Anti-Theater)', () => {
  let detector: BlindspotDetector;

  beforeEach(() => {
    detector = new BlindspotDetector();
  });

  // --- REAL CODEBASE SCANNING ---
  describe('Real Codebase Scanning', () => {
    it('can scan the P4_RED_REGNANT directory without crashing', async () => {
      const targetPath = 'hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P4_RED_REGNANT';
      
      const result = await detector.detect(targetPath);
      
      // Should scan multiple files
      expect(result.filesScanned).toBeGreaterThan(0);
      // Should complete in reasonable time
      expect(result.duration).toBeLessThan(30000);
      // Result structure should be valid
      expect(result.screamType).toBe('SCREAM_BLINDSPOT');
    });

    it('can scan the entire bronze directory', async () => {
      const targetPath = 'hot_obsidian_sandbox/bronze';
      
      const result = await detector.detect(targetPath);
      
      // Should scan many files
      expect(result.filesScanned).toBeGreaterThan(5);
      // All receipts should be valid
      for (const receipt of result.receipts) {
        expect(verifyScreamReceipt(receipt)).toBe(true);
      }
    });

    it('produces receipts with real file paths (not synthetic)', async () => {
      const targetPath = 'hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P4_RED_REGNANT';
      
      const result = await detector.detect(targetPath);
      
      // If violations found, verify they reference real files
      for (const receipt of result.receipts) {
        expect(receipt.file).toBeTruthy();
        // File path should be a real path, not a temp path
        expect(receipt.file).not.toContain(os.tmpdir());
        // Should be a TypeScript or JavaScript file
        expect(receipt.file).toMatch(/\.(ts|js|tsx|jsx)$/);
      }
    });
  });

  // --- PLANTED VIOLATION TESTS ---
  describe('Planted Violation Detection', () => {
    let tempDir: string;

    beforeEach(() => {
      tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blindspot-integration-'));
    });

    afterEach(() => {
      fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('detects planted empty catch block in realistic code', async () => {
      const file = path.join(tempDir, 'api-handler.ts');
      fs.writeFileSync(file, `
        import { Request, Response } from 'express';
        
        export async function handleUserRequest(req: Request, res: Response) {
          const userId = req.params.id;
          
          try {
            const user = await fetchUser(userId);
            res.json(user);
          } catch (error) {}  // BLINDSPOT: Silent failure!
        }
        
        async function fetchUser(id: string) {
          return { id, name: 'Test User' };
        }
      `);

      const result = await detector.detect(file);
      
      expect(result.violationsFound).toBeGreaterThan(0);
      const emptyCatch = result.receipts.find(r => r.details.patternName === 'EMPTY_CATCH');
      expect(emptyCatch).toBeDefined();
      expect(emptyCatch!.details.lineNumbers).toContain(10);
    });

    it('detects planted @ignore-error in realistic code', async () => {
      const file = path.join(tempDir, 'data-processor.ts');
      fs.writeFileSync(file, `
        interface DataRecord {
          id: string;
          value: number;
        }
        
        export function processRecords(records: DataRecord[]) {
          const results: number[] = [];
          
          for (const record of records) {
            // @ignore-error - BLINDSPOT: Hiding potential issues!
            const processed = record.value * 2;
            results.push(processed);
          }
          
          return results;
        }
      `);

      const result = await detector.detect(file);
      
      expect(result.violationsFound).toBeGreaterThan(0);
      const ignoreError = result.receipts.find(r => r.details.patternName === 'IGNORE_ERROR');
      expect(ignoreError).toBeDefined();
    });

    it('detects planted empty then handler in realistic code', async () => {
      const file = path.join(tempDir, 'event-emitter.ts');
      fs.writeFileSync(file, `
        class EventBus {
          private listeners: Map<string, Function[]> = new Map();
          
          emit(event: string, data: unknown) {
            const handlers = this.listeners.get(event) || [];
            
            // BLINDSPOT: Ignoring promise results!
            Promise.all(handlers.map(h => h(data))).then(() => {});
          }
        }
        
        export const eventBus = new EventBus();
      `);

      const result = await detector.detect(file);
      
      expect(result.violationsFound).toBeGreaterThan(0);
      const emptyThen = result.receipts.find(r => r.details.patternName === 'EMPTY_THEN');
      expect(emptyThen).toBeDefined();
    });

    it('detects planted console-only catch in realistic code', async () => {
      const file = path.join(tempDir, 'database-client.ts');
      fs.writeFileSync(file, `
        interface QueryResult {
          rows: unknown[];
        }
        
        export async function executeQuery(sql: string): Promise<QueryResult> {
          try {
            const result = await runQuery(sql);
            return result;
          } catch (e) { console.log(e); }  // BLINDSPOT: Not proper error handling!
          
          return { rows: [] };
        }
        
        async function runQuery(sql: string): Promise<QueryResult> {
          return { rows: [] };
        }
      `);

      const result = await detector.detect(file);
      
      const consoleOnly = result.receipts.find(r => r.details.patternName === 'CATCH_CONSOLE_ONLY');
      expect(consoleOnly).toBeDefined();
    });

    it('detects multiple violations in a single realistic file', async () => {
      const file = path.join(tempDir, 'legacy-service.ts');
      fs.writeFileSync(file, `
        // @ignore-error - Legacy code, don't touch
        
        export class LegacyService {
          async fetchData() {
            try {
              return await this.callApi();
            } catch (err) {}  // Silent failure
          }
          
          processResult(promise: Promise<unknown>) {
            promise.then(() => {});  // Ignored result
          }
          
          logError(error: Error) {
            try {
              this.sendToLogging(error);
            } catch (e) { console.warn(e); }  // Console only
          }
          
          private async callApi() { return {}; }
          private sendToLogging(e: Error) {}
        }
      `);

      const result = await detector.detect(file);
      
      // Should find at least 4 different violations
      expect(result.violationsFound).toBeGreaterThanOrEqual(4);
      
      const patternNames = result.receipts.map(r => r.details.patternName);
      expect(patternNames).toContain('IGNORE_ERROR');
      expect(patternNames).toContain('EMPTY_CATCH');
      expect(patternNames).toContain('EMPTY_THEN');
      expect(patternNames).toContain('CATCH_CONSOLE_ONLY');
    });
  });

  // --- RECEIPT INTEGRITY VERIFICATION ---
  describe('Receipt Integrity (Anti-Tampering)', () => {
    let tempDir: string;

    beforeEach(() => {
      tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blindspot-integrity-'));
    });

    afterEach(() => {
      fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('all receipts pass cryptographic verification', async () => {
      const file = path.join(tempDir, 'test.ts');
      fs.writeFileSync(file, `
        try {} catch (e) {}
        // @ignore-error
        promise.then(() => {});
      `);

      const result = await detector.detect(file);
      
      expect(result.receipts.length).toBeGreaterThan(0);
      
      for (const receipt of result.receipts) {
        const isValid = verifyScreamReceipt(receipt);
        expect(isValid).toBe(true);
      }
    });

    it('tampered receipts fail verification', async () => {
      const file = path.join(tempDir, 'test.ts');
      fs.writeFileSync(file, 'try {} catch (e) {}');

      const result = await detector.detect(file);
      const receipt = result.receipts[0];
      
      // Tamper with the receipt
      const tamperedReceipt = {
        ...receipt,
        details: { ...receipt.details, matchCount: 999 },
      };
      
      expect(verifyScreamReceipt(tamperedReceipt)).toBe(false);
    });

    it('receipts have valid SHA-256 hash format', async () => {
      const file = path.join(tempDir, 'test.ts');
      fs.writeFileSync(file, 'try {} catch (e) {}');

      const result = await detector.detect(file);
      
      for (const receipt of result.receipts) {
        expect(receipt.receiptHash).toMatch(/^sha256:[a-f0-9]{64}$/);
      }
    });
  });

  // --- PATTERN ACCURACY TESTS ---
  describe('Pattern Accuracy (No False Positives)', () => {
    let tempDir: string;

    beforeEach(() => {
      tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blindspot-accuracy-'));
    });

    afterEach(() => {
      fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('does NOT flag proper error handling', async () => {
      const file = path.join(tempDir, 'proper-handling.ts');
      fs.writeFileSync(file, `
        export async function safeOperation() {
          try {
            const result = await riskyCall();
            return result;
          } catch (error) {
            logger.error('Operation failed', { error, context: 'safeOperation' });
            metrics.increment('operation.failures');
            throw new OperationError('Failed to complete operation', { cause: error });
          }
        }
      `);

      const result = await detector.detect(file);
      
      // Should NOT find empty catch or console-only violations
      const badViolations = result.receipts.filter(r => 
        r.details.patternName === 'EMPTY_CATCH' || 
        r.details.patternName === 'CATCH_CONSOLE_ONLY'
      );
      expect(badViolations.length).toBe(0);
    });

    it('does NOT flag then with actual handler', async () => {
      const file = path.join(tempDir, 'proper-then.ts');
      fs.writeFileSync(file, `
        fetchData()
          .then((data) => {
            processData(data);
            updateUI(data);
          })
          .catch((error) => {
            handleError(error);
          });
      `);

      const result = await detector.detect(file);
      
      const emptyThenViolations = result.receipts.filter(r => 
        r.details.patternName === 'EMPTY_THEN'
      );
      expect(emptyThenViolations.length).toBe(0);
    });

    it('does NOT flag regular comments as @ignore-error', async () => {
      const file = path.join(tempDir, 'regular-comments.ts');
      fs.writeFileSync(file, `
        // This is a regular comment
        // TODO: Fix this later
        // FIXME: Handle edge case
        /* Multi-line comment
           with multiple lines */
        const x = 1;
      `);

      const result = await detector.detect(file);
      
      const ignoreErrorViolations = result.receipts.filter(r => 
        r.details.patternName === 'IGNORE_ERROR'
      );
      expect(ignoreErrorViolations.length).toBe(0);
    });
  });

  // --- PERFORMANCE TESTS ---
  describe('Performance (Not Cosmetic)', () => {
    it('completes scan of bronze directory in under 10 seconds', async () => {
      const targetPath = 'hot_obsidian_sandbox/bronze';
      
      const startTime = Date.now();
      const result = await detector.detect(targetPath);
      const elapsed = Date.now() - startTime;
      
      expect(elapsed).toBeLessThan(10000);
      expect(result.duration).toBeLessThan(10000);
    });

    it('duration field accurately reflects actual scan time', async () => {
      const targetPath = 'hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P4_RED_REGNANT';
      
      const startTime = Date.now();
      const result = await detector.detect(targetPath);
      const elapsed = Date.now() - startTime;
      
      // Duration should be within 100ms of actual elapsed time
      expect(Math.abs(result.duration - elapsed)).toBeLessThan(100);
    });
  });

  // --- EDGE CASE HANDLING ---
  describe('Edge Case Handling', () => {
    it('handles files with unusual characters in path', async () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blindspot-edge-'));
      const file = path.join(tempDir, 'file-with-dashes.ts');
      fs.writeFileSync(file, 'try {} catch (e) {}');

      try {
        const result = await detector.detect(file);
        expect(result.filesScanned).toBe(1);
        expect(result.violationsFound).toBeGreaterThan(0);
      } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('handles deeply nested directory structures', async () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blindspot-deep-'));
      const deepPath = path.join(tempDir, 'a', 'b', 'c', 'd', 'e');
      fs.mkdirSync(deepPath, { recursive: true });
      fs.writeFileSync(path.join(deepPath, 'deep.ts'), 'try {} catch (e) {}');

      try {
        const result = await detector.detect(tempDir);
        expect(result.filesScanned).toBe(1);
        expect(result.violationsFound).toBeGreaterThan(0);
      } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('handles empty directories gracefully', async () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blindspot-empty-'));
      const emptySubdir = path.join(tempDir, 'empty');
      fs.mkdirSync(emptySubdir);

      try {
        const result = await detector.detect(tempDir);
        expect(result.filesScanned).toBe(0);
        expect(result.violationsFound).toBe(0);
      } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });
  });
});
