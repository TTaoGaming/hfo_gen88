/**
 * P4 RED REGNANT - SCREAM_BLINDSPOT Integration Tests
 * 
 * @port 0
 * @commander LIDLESS_LEGION (aligned)
 * @verb SENSE
 * @tier SILVER
 * @provenance: .kiro/specs/silver-promotion-blindspot/design.md
 * @purpose ANTI-THEATER - Verify detector works against REAL code
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { BlindspotDetector } from './blindspot.js';
import { verifyScreamReceipt } from '../contracts/screams.js';

describe('SCREAM_BLINDSPOT Integration Tests (Silver)', () => {
  let detector: BlindspotDetector;

  beforeEach(() => {
    detector = new BlindspotDetector();
  });

  // --- REAL CODEBASE SCANNING ---
  describe('Real Codebase Scanning', () => {
    it('can scan the Silver P4 directory without crashing', async () => {
      const targetPath = 'hot_obsidian_sandbox/silver/2_areas/P4_RED_REGNANT';
      
      const result = await detector.detect(targetPath);
      
      expect(result.filesScanned).toBeGreaterThan(0);
      expect(result.duration).toBeLessThan(30000);
      expect(result.screamType).toBe('SCREAM_BLINDSPOT');
    });

    it('can scan the Bronze directory', async () => {
      const targetPath = 'hot_obsidian_sandbox/bronze';
      
      const result = await detector.detect(targetPath);
      
      expect(result.filesScanned).toBeGreaterThan(5);
      for (const receipt of result.receipts) {
        expect(verifyScreamReceipt(receipt)).toBe(true);
      }
    });

    it('produces receipts with real file paths', async () => {
      const targetPath = 'hot_obsidian_sandbox/silver/2_areas/P4_RED_REGNANT';
      
      const result = await detector.detect(targetPath);
      
      for (const receipt of result.receipts) {
        expect(receipt.file).toBeTruthy();
        expect(receipt.file).not.toContain(os.tmpdir());
        expect(receipt.file).toMatch(/\.(ts|js|tsx|jsx)$/);
      }
    });
  });

  // --- PLANTED VIOLATION TESTS ---
  describe('Planted Violation Detection', () => {
    let tempDir: string;

    beforeEach(() => {
      tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blindspot-silver-int-'));
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
          } catch (error) {` + `}  // BLINDSPOT: Silent failure!
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

    it('detects multiple violations in a single realistic file', async () => {
      const file = path.join(tempDir, 'legacy-service.ts');
      fs.writeFileSync(file, `
        // @ignore-error - Legacy code, don't touch
        
        export class LegacyService {
          async fetchData() {
            try {
              return await this.callApi();
            } catch (err) {` + `}  // Silent failure
          }
          
          processResult(promise: Promise<unknown>) {
            promise.then(() => {});  // Ignored result
          }
          
          logError(error: Error) {
            try {
              this.sendToLogging(error);
            } catch (e) { console.` + `warn(e); }  // Console only
          }
          
          private async callApi() { return {}; }
          private sendToLogging(e: Error) {}
        }
      `);

      const result = await detector.detect(file);
      
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
      tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blindspot-silver-integrity-'));
    });

    afterEach(() => {
      fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('all receipts pass cryptographic verification', async () => {
      const file = path.join(tempDir, 'test.ts');
      fs.writeFileSync(file, `
        try {} catch (e) {` + `}
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
      fs.writeFileSync(file, 'try {} catch (e) {' + '}');

      const result = await detector.detect(file);
      const receipt = result.receipts[0];
      
      const tamperedReceipt = {
        ...receipt,
        details: { ...receipt.details, matchCount: 999 },
      };
      
      expect(verifyScreamReceipt(tamperedReceipt)).toBe(false);
    });

    it('receipts have valid SHA-256 hash format', async () => {
      const file = path.join(tempDir, 'test.ts');
      fs.writeFileSync(file, 'try {} catch (e) {' + '}');

      const result = await detector.detect(file);
      
      for (const receipt of result.receipts) {
        expect(receipt.receiptHash).toMatch(/^sha256:[a-f0-9]{64}$/);
      }
    });
  });

  // --- PERFORMANCE TESTS ---
  describe('Performance', () => {
    it('completes scan of bronze directory in under 10 seconds', async () => {
      const targetPath = 'hot_obsidian_sandbox/bronze';
      
      const startTime = Date.now();
      const result = await detector.detect(targetPath);
      const elapsed = Date.now() - startTime;
      
      expect(elapsed).toBeLessThan(10000);
      expect(result.duration).toBeLessThan(10000);
    });

    it('duration field accurately reflects actual scan time', async () => {
      const targetPath = 'hot_obsidian_sandbox/silver/2_areas/P4_RED_REGNANT';
      
      const startTime = Date.now();
      const result = await detector.detect(targetPath);
      const elapsed = Date.now() - startTime;
      
      expect(Math.abs(result.duration - elapsed)).toBeLessThan(100);
    });
  });
});
