/**
 * P4 RED REGNANT - SCREAM Aggregator Tests
 * 
 * @port 4
 * @commander RED_REGNANT
 * @verb DISRUPT
 * @tier BRONZE
 * @provenance: .kiro/specs/red-regnant-8-screams/tasks.md
 * Validates: Requirements 10.1, 10.2, 10.3, 10.4, 11.1
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { 
  ScreamAggregator, 
  createScreamAggregator, 
  performQuickAudit,
  AuditResult,
  AuditReceipt 
} from './scream-aggregator.js';
import { verifyScreamReceipt, ScreamType } from '../contracts/screams.js';

describe('SCREAM Aggregator (Port 4)', () => {
  let tempDir: string;
  let bloodBookPath: string;
  let aggregator: ScreamAggregator;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aggregator-test-'));
    bloodBookPath = path.join(tempDir, 'BLOOD_BOOK_OF_GRUDGES.jsonl');
    aggregator = new ScreamAggregator(bloodBookPath);
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  // --- AGGREGATOR INITIALIZATION ---
  describe('Aggregator Initialization', () => {
    it('initializes with 8 detectors', () => {
      expect(aggregator.getDetectorCount()).toBe(8);
    });

    it('has all 8 detector names', () => {
      const names = aggregator.getDetectorNames();
      expect(names).toContain('SCREAM_BLINDSPOT');
      expect(names).toContain('SCREAM_BREACH');
      expect(names).toContain('SCREAM_THEATER');
      expect(names).toContain('SCREAM_PHANTOM');
      expect(names).toContain('SCREAM_MUTATION');
      expect(names).toContain('SCREAM_POLLUTION');
      expect(names).toContain('SCREAM_AMNESIA');
      expect(names).toContain('SCREAM_LATTICE');
    });

    it('detectors are in port order (0-7)', () => {
      for (let port = 0; port < 8; port++) {
        const detector = aggregator.getDetector(port);
        expect(detector.port).toBe(port);
      }
    });
  });

  // --- FACTORY FUNCTION ---
  describe('Factory Function', () => {
    it('createScreamAggregator returns an aggregator', () => {
      const created = createScreamAggregator();
      expect(created.getDetectorCount()).toBe(8);
    });

    it('createScreamAggregator accepts custom blood book path', () => {
      const customPath = path.join(tempDir, 'custom-blood-book.jsonl');
      const created = createScreamAggregator(customPath);
      expect(created).toBeInstanceOf(ScreamAggregator);
    });
  });

  // --- GET DETECTOR ---
  describe('getDetector', () => {
    it('returns correct detector for each port', () => {
      const expectedTypes: ScreamType[] = [
        'SCREAM_BLINDSPOT',
        'SCREAM_BREACH',
        'SCREAM_THEATER',
        'SCREAM_PHANTOM',
        'SCREAM_MUTATION',
        'SCREAM_POLLUTION',
        'SCREAM_AMNESIA',
        'SCREAM_LATTICE',
      ];

      for (let port = 0; port < 8; port++) {
        const detector = aggregator.getDetector(port);
        expect(detector.screamType).toBe(expectedTypes[port]);
      }
    });

    it('throws RangeError for port < 0', () => {
      expect(() => aggregator.getDetector(-1)).toThrow(RangeError);
    });

    it('throws RangeError for port > 7', () => {
      expect(() => aggregator.getDetector(8)).toThrow(RangeError);
    });
  });

  // --- RUN SINGLE DETECTOR ---
  describe('runDetector', () => {
    it('runs detector for specified port', async () => {
      const file = path.join(tempDir, 'test.ts');
      fs.writeFileSync(file, 'try {} catch (e) {}');

      const result = await aggregator.runDetector(0, file);
      expect(result.screamType).toBe('SCREAM_BLINDSPOT');
      expect(result.violationsFound).toBeGreaterThan(0);
    });

    it('throws RangeError for invalid port', async () => {
      await expect(aggregator.runDetector(10, tempDir)).rejects.toThrow(RangeError);
    });

    it('throws RangeError for negative port', async () => {
      await expect(aggregator.runDetector(-1, tempDir)).rejects.toThrow(RangeError);
    });
  });

  // --- PERFORM SCREAM AUDIT ---
  describe('performScreamAudit', () => {
    it('runs all 8 detectors', async () => {
      const file = path.join(tempDir, 'clean.ts');
      fs.writeFileSync(file, 'const x = 1;');

      const result = await aggregator.performScreamAudit(tempDir);
      expect(result.results.length).toBe(8);
    });

    it('returns success=true when no critical violations', async () => {
      const file = path.join(tempDir, 'clean.ts');
      fs.writeFileSync(file, 'const x = 1;');

      const result = await aggregator.performScreamAudit(tempDir);
      expect(result.success).toBe(true);
    });

    it('aggregates violations from all detectors', async () => {
      const file = path.join(tempDir, 'violations.ts');
      fs.writeFileSync(file, `
        try {} catch (e) {}
        const x: any = 1;
      `);

      const result = await aggregator.performScreamAudit(tempDir);
      expect(result.totalViolations).toBeGreaterThan(0);
    });

    it('includes metadata with timing', async () => {
      const file = path.join(tempDir, 'test.ts');
      fs.writeFileSync(file, 'const x = 1;');

      const result = await aggregator.performScreamAudit(tempDir);
      expect(result.metadata.startTime).toBeLessThanOrEqual(result.metadata.endTime);
      expect(result.metadata.duration).toBeGreaterThanOrEqual(0);
      expect(result.metadata.detectorsRun).toBe(8);
    });

    it('includes violation breakdown by type', async () => {
      const file = path.join(tempDir, 'test.ts');
      fs.writeFileSync(file, 'try {} catch (e) {}');

      const result = await aggregator.performScreamAudit(tempDir);
      expect(result.metadata.violationsByType).toHaveProperty('SCREAM_BLINDSPOT');
      expect(result.metadata.violationsByType).toHaveProperty('SCREAM_BREACH');
    });

    it('generates tamper-evident audit receipt', async () => {
      const file = path.join(tempDir, 'test.ts');
      fs.writeFileSync(file, 'const x = 1;');

      const result = await aggregator.performScreamAudit(tempDir);
      expect(result.auditReceipt.auditId).toMatch(/^AUDIT-/);
      expect(result.auditReceipt.auditHash).toMatch(/^sha256:[a-f0-9]{64}$/);
    });
  });

  // --- AUDIT RECEIPT VERIFICATION ---
  describe('Audit Receipt Verification', () => {
    it('verifyAuditReceipt returns true for valid receipt', async () => {
      const file = path.join(tempDir, 'test.ts');
      fs.writeFileSync(file, 'const x = 1;');

      const result = await aggregator.performScreamAudit(tempDir);
      expect(aggregator.verifyAuditReceipt(result.auditReceipt)).toBe(true);
    });

    it('verifyAuditReceipt returns false for tampered receipt', async () => {
      const file = path.join(tempDir, 'test.ts');
      fs.writeFileSync(file, 'const x = 1;');

      const result = await aggregator.performScreamAudit(tempDir);
      const tampered: AuditReceipt = {
        ...result.auditReceipt,
        summary: { ...result.auditReceipt.summary, totalViolations: 999 },
      };
      expect(aggregator.verifyAuditReceipt(tampered)).toBe(false);
    });

    it('verifyAuditReceipt detects auditId tampering', async () => {
      const file = path.join(tempDir, 'test.ts');
      fs.writeFileSync(file, 'const x = 1;');

      const result = await aggregator.performScreamAudit(tempDir);
      const tampered: AuditReceipt = {
        ...result.auditReceipt,
        auditId: 'AUDIT-FAKE-ID',
      };
      expect(aggregator.verifyAuditReceipt(tampered)).toBe(false);
    });
  });

  // --- SCREAM RECEIPT VERIFICATION ---
  describe('SCREAM Receipt Verification', () => {
    it('verifyAllReceipts returns true for valid receipts', async () => {
      const file = path.join(tempDir, 'test.ts');
      fs.writeFileSync(file, 'try {} catch (e) {}');

      const result = await aggregator.performScreamAudit(tempDir);
      expect(aggregator.verifyAllReceipts(result.receipts)).toBe(true);
    });

    it('verifyAllReceipts returns true for empty array', () => {
      expect(aggregator.verifyAllReceipts([])).toBe(true);
    });

    it('all receipts verify individually', async () => {
      const file = path.join(tempDir, 'test.ts');
      fs.writeFileSync(file, 'try {} catch (e) {}');

      const result = await aggregator.performScreamAudit(tempDir);
      for (const receipt of result.receipts) {
        expect(verifyScreamReceipt(receipt)).toBe(true);
      }
    });
  });

  // --- BLOOD BOOK LOGGING ---
  describe('Blood Book Logging', () => {
    it('logs receipts to Blood Book', async () => {
      const file = path.join(tempDir, 'test.ts');
      fs.writeFileSync(file, 'try {} catch (e) {}');

      await aggregator.performScreamAudit(tempDir);
      expect(fs.existsSync(bloodBookPath)).toBe(true);
    });

    it('Blood Book contains SCREAM_RECEIPT entries', async () => {
      const file = path.join(tempDir, 'test.ts');
      fs.writeFileSync(file, 'try {} catch (e) {}');

      await aggregator.performScreamAudit(tempDir);
      const content = fs.readFileSync(bloodBookPath, 'utf-8');
      expect(content).toContain('SCREAM_RECEIPT');
    });

    it('Blood Book contains AUDIT_SUMMARY entry', async () => {
      const file = path.join(tempDir, 'test.ts');
      fs.writeFileSync(file, 'const x = 1;');

      await aggregator.performScreamAudit(tempDir);
      const content = fs.readFileSync(bloodBookPath, 'utf-8');
      expect(content).toContain('AUDIT_SUMMARY');
    });

    it('setBloodBookPath changes log location', async () => {
      const newPath = path.join(tempDir, 'new-blood-book.jsonl');
      aggregator.setBloodBookPath(newPath);

      const file = path.join(tempDir, 'test.ts');
      fs.writeFileSync(file, 'const x = 1;');

      await aggregator.performScreamAudit(tempDir);
      expect(fs.existsSync(newPath)).toBe(true);
    });
  });

  // --- QUICK AUDIT FUNCTION ---
  describe('performQuickAudit', () => {
    it('performs audit without instantiating aggregator', async () => {
      const file = path.join(tempDir, 'test.ts');
      fs.writeFileSync(file, 'const x = 1;');

      const result = await performQuickAudit(tempDir);
      expect(result.results.length).toBe(8);
    });

    it('returns valid AuditResult', async () => {
      const file = path.join(tempDir, 'test.ts');
      fs.writeFileSync(file, 'try {} catch (e) {}');

      const result = await performQuickAudit(tempDir);
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('totalViolations');
      expect(result).toHaveProperty('auditReceipt');
    });
  });

  // --- AUDIT RESULT STRUCTURE ---
  describe('AuditResult Structure', () => {
    it('has all required fields', async () => {
      const file = path.join(tempDir, 'test.ts');
      fs.writeFileSync(file, 'const x = 1;');

      const result = await aggregator.performScreamAudit(tempDir);
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('totalViolations');
      expect(result).toHaveProperty('totalFilesScanned');
      expect(result).toHaveProperty('results');
      expect(result).toHaveProperty('receipts');
      expect(result).toHaveProperty('metadata');
      expect(result).toHaveProperty('auditReceipt');
    });

    it('results array has 8 DetectorResults', async () => {
      const file = path.join(tempDir, 'test.ts');
      fs.writeFileSync(file, 'const x = 1;');

      const result = await aggregator.performScreamAudit(tempDir);
      expect(result.results.length).toBe(8);
      for (const r of result.results) {
        expect(r).toHaveProperty('screamType');
        expect(r).toHaveProperty('receipts');
        expect(r).toHaveProperty('filesScanned');
      }
    });
  });

  // --- AUDIT RECEIPT STRUCTURE ---
  describe('AuditReceipt Structure', () => {
    it('has unique auditId', async () => {
      const file = path.join(tempDir, 'test.ts');
      fs.writeFileSync(file, 'const x = 1;');

      const result1 = await aggregator.performScreamAudit(tempDir);
      const result2 = await aggregator.performScreamAudit(tempDir);
      expect(result1.auditReceipt.auditId).not.toBe(result2.auditReceipt.auditId);
    });

    it('has receiptsHash (Merkle-like)', async () => {
      const file = path.join(tempDir, 'test.ts');
      fs.writeFileSync(file, 'try {} catch (e) {}');

      const result = await aggregator.performScreamAudit(tempDir);
      expect(result.auditReceipt.receiptsHash).toMatch(/^sha256:[a-f0-9]{64}$/);
    });

    it('summary counts match actual data', async () => {
      const file = path.join(tempDir, 'test.ts');
      fs.writeFileSync(file, 'const x = 1;');

      const result = await aggregator.performScreamAudit(tempDir);
      expect(result.auditReceipt.summary.totalViolations).toBe(result.totalViolations);
      expect(result.auditReceipt.summary.totalFilesScanned).toBe(result.totalFilesScanned);
      expect(result.auditReceipt.summary.detectorsRun).toBe(8);
    });
  });

  // --- EDGE CASES ---
  describe('Edge Cases', () => {
    it('handles empty directory', async () => {
      const result = await aggregator.performScreamAudit(tempDir);
      expect(result.success).toBe(true);
      expect(result.totalViolations).toBe(0);
    });

    it('handles non-existent path gracefully', async () => {
      const result = await aggregator.performScreamAudit('/non/existent/path');
      expect(result.success).toBe(true);
      expect(result.totalFilesScanned).toBe(0);
    });

    it('handles config overrides', async () => {
      const file = path.join(tempDir, 'test.ts');
      fs.writeFileSync(file, 'try {} catch (e) {}');

      const result = await aggregator.performScreamAudit(tempDir, { enabled: false });
      expect(result.totalViolations).toBe(0);
    });
  });
});
