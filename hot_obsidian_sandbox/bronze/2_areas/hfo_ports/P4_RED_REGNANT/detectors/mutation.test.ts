/**
 * P4 RED REGNANT - SCREAM_MUTATION Detector Tests
 * 
 * @port 4
 * @commander RED_REGNANT (self-aligned)
 * @verb DISRUPT
 * @tier BRONZE
 * @provenance: .kiro/specs/red-regnant-8-screams/tasks.md
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 11.1
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { 
  MutationDetector, 
  createMutationDetector, 
  MUTATION_THRESHOLDS,
  calculateMutationScore,
  isGoldilocks,
  MutationReport
} from './mutation.js';
import { verifyScreamReceipt } from '../contracts/screams.js';

describe('SCREAM_MUTATION Detector (Port 4)', () => {
  let tempDir: string;
  let detector: MutationDetector;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mutation-test-'));
    detector = new MutationDetector();
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  // --- HELPER: Create mutation report ---
  function createMutationReport(killed: number, total: number): MutationReport {
    const mutants = [];
    for (let i = 0; i < killed; i++) {
      mutants.push({
        id: `m${i}`,
        mutatorName: 'BooleanLiteral',
        status: 'Killed' as const,
        location: { start: { line: i + 1, column: 1 }, end: { line: i + 1, column: 10 } }
      });
    }
    for (let i = killed; i < total; i++) {
      mutants.push({
        id: `m${i}`,
        mutatorName: 'ArithmeticOperator',
        status: 'Survived' as const,
        location: { start: { line: i + 1, column: 1 }, end: { line: i + 1, column: 10 } }
      });
    }
    return {
      schemaVersion: '1.0',
      thresholds: { high: 80, low: 60 },
      files: {
        'src/module.ts': {
          language: 'typescript',
          mutants,
          source: 'const x = 1;'
        }
      }
    };
  }

  // --- DETECTOR METADATA ---
  describe('Detector Metadata', () => {
    it('has correct name', () => {
      expect(detector.name).toBe('SCREAM_MUTATION');
    });

    it('is aligned with Port 4', () => {
      expect(detector.port).toBe(4);
    });

    it('produces SCREAM_MUTATION type', () => {
      expect(detector.screamType).toBe('SCREAM_MUTATION');
    });

    it('has a description', () => {
      expect(detector.description).toBeTruthy();
    });
  });

  // --- FACTORY FUNCTION ---
  describe('Factory Function', () => {
    it('createMutationDetector returns a Detector', () => {
      const created = createMutationDetector();
      expect(created.name).toBe('SCREAM_MUTATION');
      expect(created.port).toBe(4);
    });
  });

  // --- SCORE FAILURE DETECTION ---
  describe('SCORE_FAILURE Detection', () => {
    it('detects score below 80%', async () => {
      const reportsDir = path.join(tempDir, 'reports');
      fs.mkdirSync(reportsDir);
      const reportFile = path.join(reportsDir, 'mutation.json');
      
      // 70% score (70 killed, 100 total)
      const report = createMutationReport(70, 100);
      fs.writeFileSync(reportFile, JSON.stringify(report));

      const result = await detector.detect(tempDir);
      const failures = result.receipts.filter(
        r => r.details.mutationType === 'SCORE_FAILURE'
      );
      expect(failures.length).toBeGreaterThan(0);
      expect(failures[0].details.score).toBe(70);
    });

    it('does NOT flag score at exactly 80%', async () => {
      const reportsDir = path.join(tempDir, 'reports');
      fs.mkdirSync(reportsDir);
      const reportFile = path.join(reportsDir, 'mutation.json');
      
      const report = createMutationReport(80, 100);
      fs.writeFileSync(reportFile, JSON.stringify(report));

      const result = await detector.detect(tempDir);
      const failures = result.receipts.filter(
        r => r.details.mutationType === 'SCORE_FAILURE'
      );
      expect(failures.length).toBe(0);
    });
  });

  // --- SCORE THEATER DETECTION ---
  describe('SCORE_THEATER Detection', () => {
    it('detects score above 98.99%', async () => {
      const reportsDir = path.join(tempDir, 'reports');
      fs.mkdirSync(reportsDir);
      const reportFile = path.join(reportsDir, 'mutation.json');
      
      // 100% score (suspiciously perfect)
      const report = createMutationReport(100, 100);
      fs.writeFileSync(reportFile, JSON.stringify(report));

      const result = await detector.detect(tempDir);
      const theater = result.receipts.filter(
        r => r.details.mutationType === 'SCORE_THEATER'
      );
      expect(theater.length).toBeGreaterThan(0);
    });

    it('does NOT flag score at 98%', async () => {
      const reportsDir = path.join(tempDir, 'reports');
      fs.mkdirSync(reportsDir);
      const reportFile = path.join(reportsDir, 'mutation.json');
      
      const report = createMutationReport(98, 100);
      fs.writeFileSync(reportFile, JSON.stringify(report));

      const result = await detector.detect(tempDir);
      const theater = result.receipts.filter(
        r => r.details.mutationType === 'SCORE_THEATER'
      );
      expect(theater.length).toBe(0);
    });
  });

  // --- GOLDILOCKS RANGE ---
  describe('Goldilocks Range (80-98.99%)', () => {
    it('accepts 85% score without failure or theater', async () => {
      const reportsDir = path.join(tempDir, 'reports');
      fs.mkdirSync(reportsDir);
      const reportFile = path.join(reportsDir, 'mutation.json');
      
      const report = createMutationReport(85, 100);
      fs.writeFileSync(reportFile, JSON.stringify(report));

      const result = await detector.detect(tempDir);
      const failures = result.receipts.filter(
        r => r.details.mutationType === 'SCORE_FAILURE'
      );
      const theater = result.receipts.filter(
        r => r.details.mutationType === 'SCORE_THEATER'
      );
      expect(failures.length).toBe(0);
      expect(theater.length).toBe(0);
    });

    it('reports survivors in Goldilocks range', async () => {
      const reportsDir = path.join(tempDir, 'reports');
      fs.mkdirSync(reportsDir);
      const reportFile = path.join(reportsDir, 'mutation.json');
      
      const report = createMutationReport(90, 100);
      fs.writeFileSync(reportFile, JSON.stringify(report));

      const result = await detector.detect(tempDir);
      const survivors = result.receipts.filter(
        r => r.details.mutationType === 'SURVIVORS_DETECTED'
      );
      expect(survivors.length).toBeGreaterThan(0);
      expect(survivors[0].details.survivedCount).toBe(10);
    });
  });

  // --- MALFORMED REPORT DETECTION ---
  describe('MALFORMED_REPORT Detection', () => {
    it('detects invalid JSON', async () => {
      const reportsDir = path.join(tempDir, 'reports');
      fs.mkdirSync(reportsDir);
      const reportFile = path.join(reportsDir, 'mutation.json');
      fs.writeFileSync(reportFile, 'not valid json');

      const result = await detector.detect(tempDir);
      const malformed = result.receipts.filter(
        r => r.details.mutationType === 'MALFORMED_REPORT'
      );
      expect(malformed.length).toBeGreaterThan(0);
    });

    it('detects missing files section', async () => {
      const reportsDir = path.join(tempDir, 'reports');
      fs.mkdirSync(reportsDir);
      const reportFile = path.join(reportsDir, 'mutation.json');
      fs.writeFileSync(reportFile, JSON.stringify({ schemaVersion: '1.0' }));

      const result = await detector.detect(tempDir);
      const malformed = result.receipts.filter(
        r => r.details.mutationType === 'MALFORMED_REPORT'
      );
      expect(malformed.length).toBeGreaterThan(0);
    });
  });

  // --- REPORT FILE DETECTION ---
  describe('Report File Detection', () => {
    it('finds mutation.json in reports directory', async () => {
      const reportsDir = path.join(tempDir, 'reports');
      fs.mkdirSync(reportsDir);
      const reportFile = path.join(reportsDir, 'mutation.json');
      
      const report = createMutationReport(85, 100);
      fs.writeFileSync(reportFile, JSON.stringify(report));

      const result = await detector.detect(tempDir);
      expect(result.filesScanned).toBe(1);
    });

    it('finds *.mutation.json files', async () => {
      const reportsDir = path.join(tempDir, 'reports');
      fs.mkdirSync(reportsDir);
      const reportFile = path.join(reportsDir, 'project.mutation.json');
      
      const report = createMutationReport(85, 100);
      fs.writeFileSync(reportFile, JSON.stringify(report));

      const result = await detector.detect(tempDir);
      expect(result.filesScanned).toBe(1);
    });

    it('scans single report file directly', async () => {
      const reportFile = path.join(tempDir, 'mutation.json');
      const report = createMutationReport(85, 100);
      fs.writeFileSync(reportFile, JSON.stringify(report));

      const result = await detector.detect(reportFile);
      expect(result.filesScanned).toBe(1);
    });
  });

  // --- RECEIPT GENERATION ---
  describe('Receipt Generation', () => {
    it('generates valid SCREAM receipts', async () => {
      const reportsDir = path.join(tempDir, 'reports');
      fs.mkdirSync(reportsDir);
      const reportFile = path.join(reportsDir, 'mutation.json');
      
      const report = createMutationReport(70, 100);
      fs.writeFileSync(reportFile, JSON.stringify(report));

      const result = await detector.detect(tempDir);
      expect(result.receipts.length).toBeGreaterThan(0);

      for (const receipt of result.receipts) {
        expect(receipt.type).toBe('SCREAM_MUTATION');
        expect(receipt.port).toBe(4);
        expect(verifyScreamReceipt(receipt)).toBe(true);
      }
    });
  });

  // --- CONFIG OPTIONS ---
  describe('Configuration', () => {
    it('respects enabled=false', async () => {
      const reportsDir = path.join(tempDir, 'reports');
      fs.mkdirSync(reportsDir);
      const reportFile = path.join(reportsDir, 'mutation.json');
      
      const report = createMutationReport(70, 100);
      fs.writeFileSync(reportFile, JSON.stringify(report));

      const result = await detector.detect(tempDir, { enabled: false });
      expect(result.violationsFound).toBe(0);
    });
  });

  // --- EDGE CASES ---
  describe('Edge Cases', () => {
    it('handles non-existent path', async () => {
      const result = await detector.detect('/non/existent/path');
      expect(result.filesScanned).toBe(0);
    });

    it('handles empty reports directory', async () => {
      const reportsDir = path.join(tempDir, 'reports');
      fs.mkdirSync(reportsDir);

      const result = await detector.detect(tempDir);
      expect(result.filesScanned).toBe(0);
    });

    it('handles report with no mutants', async () => {
      const reportsDir = path.join(tempDir, 'reports');
      fs.mkdirSync(reportsDir);
      const reportFile = path.join(reportsDir, 'mutation.json');
      
      const report = createMutationReport(0, 0);
      fs.writeFileSync(reportFile, JSON.stringify(report));

      const result = await detector.detect(tempDir);
      // Should not crash, just skip empty files
      expect(result.filesScanned).toBe(1);
    });
  });

  // --- HELPER FUNCTIONS ---
  describe('Helper Functions', () => {
    describe('calculateMutationScore', () => {
      it('calculates correct score', () => {
        const report = createMutationReport(85, 100);
        expect(calculateMutationScore(report)).toBe(85);
      });

      it('returns 0 for empty report', () => {
        const report = createMutationReport(0, 0);
        expect(calculateMutationScore(report)).toBe(0);
      });
    });

    describe('isGoldilocks', () => {
      it('returns true for 85%', () => {
        expect(isGoldilocks(85)).toBe(true);
      });

      it('returns true for 80%', () => {
        expect(isGoldilocks(80)).toBe(true);
      });

      it('returns true for 98.99%', () => {
        expect(isGoldilocks(98.99)).toBe(true);
      });

      it('returns false for 79%', () => {
        expect(isGoldilocks(79)).toBe(false);
      });

      it('returns false for 99%', () => {
        expect(isGoldilocks(99)).toBe(false);
      });
    });
  });

  // --- RESULT STRUCTURE ---
  describe('Result Structure', () => {
    it('returns correct screamType', async () => {
      const result = await detector.detect(tempDir);
      expect(result.screamType).toBe('SCREAM_MUTATION');
    });

    it('returns duration in milliseconds', async () => {
      const result = await detector.detect(tempDir);
      expect(typeof result.duration).toBe('number');
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });
  });
});
