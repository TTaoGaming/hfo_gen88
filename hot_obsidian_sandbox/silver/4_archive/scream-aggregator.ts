/**
 * P4 RED REGNANT - SCREAM Aggregator
 * 
 * @port 4
 * @commander RED_REGNANT
 * @verb DISRUPT
 * @tier BRONZE
 * @provenance: .kiro/specs/red-regnant-8-screams/design.md
 * Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5
 * 
 * Orchestrates all 8 SCREAM detectors and produces tamper-evident audit receipts.
 * Logs violations to the Blood Book of Grudges.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { createHash } from 'crypto';
import { Detector, DetectorConfig, DetectorResult } from '../contracts/detector.js';
import { 
  ScreamReceipt, 
  ScreamType, 
  verifyScreamReceipt,
  PORT_TO_SCREAM 
} from '../contracts/screams.js';

// Import all 8 detectors
import { BlindspotDetector } from '../detectors/blindspot.js';
import { BreachDetector } from '../detectors/breach.js';
import { TheaterDetector } from '../detectors/theater.js';
import { PhantomDetector } from '../detectors/phantom.js';
import { MutationDetector } from '../detectors/mutation.js';
import { PollutionDetector } from '../detectors/pollution.js';
import { AmnesiaDetector } from '../detectors/amnesia.js';
import { LatticeDetector } from '../detectors/lattice.js';

// --- AUDIT RESULT TYPES ---

export interface AuditResult {
  /** Whether the audit passed (no critical violations) */
  success: boolean;
  
  /** Total violations found across all detectors */
  totalViolations: number;
  
  /** Total files scanned across all detectors */
  totalFilesScanned: number;
  
  /** Results from each detector */
  results: DetectorResult[];
  
  /** All receipts from all detectors */
  receipts: ScreamReceipt[];
  
  /** Audit metadata */
  metadata: AuditMetadata;
  
  /** Tamper-evident audit receipt */
  auditReceipt: AuditReceipt;
}

export interface AuditMetadata {
  /** Timestamp when audit started */
  startTime: number;
  
  /** Timestamp when audit completed */
  endTime: number;
  
  /** Total duration in milliseconds */
  duration: number;
  
  /** Target path that was audited */
  targetPath: string;
  
  /** Number of detectors that ran */
  detectorsRun: number;
  
  /** Breakdown by SCREAM type */
  violationsByType: Record<ScreamType, number>;
}

export interface AuditReceipt {
  /** Unique audit ID */
  auditId: string;
  
  /** Timestamp */
  timestamp: number;
  
  /** Target path */
  targetPath: string;
  
  /** Summary counts */
  summary: {
    totalViolations: number;
    totalFilesScanned: number;
    detectorsRun: number;
    criticalCount: number;
    errorCount: number;
    warningCount: number;
  };
  
  /** Hash of all receipt hashes (Merkle-like) */
  receiptsHash: string;
  
  /** Tamper-evident hash of entire audit */
  auditHash: string;
}

// --- SCREAM AGGREGATOR ---

export class ScreamAggregator {
  private detectors: Detector[];
  private bloodBookPath: string;

  constructor(bloodBookPath?: string) {
    // Initialize all 8 detectors in port order
    this.detectors = [
      new BlindspotDetector(),  // Port 0
      new BreachDetector(),     // Port 1
      new TheaterDetector(),    // Port 2
      new PhantomDetector(),    // Port 3
      new MutationDetector(),   // Port 4
      new PollutionDetector(),  // Port 5
      new AmnesiaDetector(),    // Port 6
      new LatticeDetector(),    // Port 7
    ];
    
    this.bloodBookPath = bloodBookPath || 'BLOOD_BOOK_OF_GRUDGES.jsonl';
  }

  /**
   * Perform a full SCREAM audit on the target path
   */
  async performScreamAudit(
    targetPath: string,
    config?: Partial<DetectorConfig>
  ): Promise<AuditResult> {
    const startTime = Date.now();
    const results: DetectorResult[] = [];
    const allReceipts: ScreamReceipt[] = [];
    let totalFilesScanned = 0;

    // Run all 8 detectors
    for (const detector of this.detectors) {
      const result = await detector.detect(targetPath, config);
      results.push(result);
      allReceipts.push(...result.receipts);
      totalFilesScanned += result.filesScanned;
    }

    const endTime = Date.now();

    // Calculate violation breakdown by type
    const violationsByType = this.calculateViolationsByType(allReceipts);

    // Calculate severity counts
    const severityCounts = this.calculateSeverityCounts(allReceipts);

    // Create audit metadata
    const metadata: AuditMetadata = {
      startTime,
      endTime,
      duration: endTime - startTime,
      targetPath,
      detectorsRun: this.detectors.length,
      violationsByType,
    };

    // Create tamper-evident audit receipt
    const auditReceipt = this.createAuditReceipt(
      targetPath,
      allReceipts,
      totalFilesScanned,
      severityCounts
    );

    // Log to Blood Book
    await this.logToBloodBook(allReceipts, auditReceipt);

    // Determine success (no critical violations)
    const success = severityCounts.critical === 0;

    return {
      success,
      totalViolations: allReceipts.length,
      totalFilesScanned,
      results,
      receipts: allReceipts,
      metadata,
      auditReceipt,
    };
  }

  /**
   * Run a single detector by port number
   */
  async runDetector(
    port: number,
    targetPath: string,
    config?: Partial<DetectorConfig>
  ): Promise<DetectorResult> {
    if (port < 0 || port > 7) {
      throw new RangeError(`Invalid port: ${port}. Must be 0-7.`);
    }
    
    return this.detectors[port].detect(targetPath, config);
  }

  /**
   * Get detector by port number
   */
  getDetector(port: number): Detector {
    if (port < 0 || port > 7) {
      throw new RangeError(`Invalid port: ${port}. Must be 0-7.`);
    }
    return this.detectors[port];
  }

  /**
   * Verify all receipts in an audit result
   */
  verifyAllReceipts(receipts: ScreamReceipt[]): boolean {
    return receipts.every(r => verifyScreamReceipt(r));
  }

  /**
   * Verify an audit receipt's integrity
   */
  verifyAuditReceipt(auditReceipt: AuditReceipt): boolean {
    const { auditHash, ...content } = auditReceipt;
    const computed = createHash('sha256')
      .update(JSON.stringify(content))
      .digest('hex');
    return `sha256:${computed}` === auditHash;
  }

  /**
   * Calculate violations by SCREAM type
   */
  private calculateViolationsByType(
    receipts: ScreamReceipt[]
  ): Record<ScreamType, number> {
    const counts: Record<ScreamType, number> = {
      'SCREAM_BLINDSPOT': 0,
      'SCREAM_BREACH': 0,
      'SCREAM_THEATER': 0,
      'SCREAM_PHANTOM': 0,
      'SCREAM_MUTATION': 0,
      'SCREAM_POLLUTION': 0,
      'SCREAM_AMNESIA': 0,
      'SCREAM_LATTICE': 0,
    };

    for (const receipt of receipts) {
      counts[receipt.type]++;
    }

    return counts;
  }

  /**
   * Calculate severity counts
   */
  private calculateSeverityCounts(receipts: ScreamReceipt[]): {
    critical: number;
    error: number;
    warning: number;
  } {
    let critical = 0;
    let error = 0;
    let warning = 0;

    for (const receipt of receipts) {
      switch (receipt.severity) {
        case 'critical':
          critical++;
          break;
        case 'error':
          error++;
          break;
        case 'warning':
          warning++;
          break;
      }
    }

    return { critical, error, warning };
  }

  /**
   * Create a tamper-evident audit receipt
   */
  private createAuditReceipt(
    targetPath: string,
    receipts: ScreamReceipt[],
    totalFilesScanned: number,
    severityCounts: { critical: number; error: number; warning: number }
  ): AuditReceipt {
    const auditId = this.generateAuditId();
    const timestamp = Date.now();

    // Create Merkle-like hash of all receipt hashes
    const receiptHashes = receipts.map(r => r.receiptHash);
    const receiptsHash = createHash('sha256')
      .update(receiptHashes.join(''))
      .digest('hex');

    const content = {
      auditId,
      timestamp,
      targetPath,
      summary: {
        totalViolations: receipts.length,
        totalFilesScanned,
        detectorsRun: 8,
        criticalCount: severityCounts.critical,
        errorCount: severityCounts.error,
        warningCount: severityCounts.warning,
      },
      receiptsHash: `sha256:${receiptsHash}`,
    };

    // Create tamper-evident hash of entire audit
    const auditHash = createHash('sha256')
      .update(JSON.stringify(content))
      .digest('hex');

    return {
      ...content,
      auditHash: `sha256:${auditHash}`,
    };
  }

  /**
   * Generate unique audit ID
   */
  private generateAuditId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `AUDIT-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Log receipts to Blood Book
   */
  private async logToBloodBook(
    receipts: ScreamReceipt[],
    auditReceipt: AuditReceipt
  ): Promise<void> {
    try {
      // Ensure directory exists
      const dir = path.dirname(this.bloodBookPath);
      if (dir && dir !== '.' && !fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Log each receipt
      for (const receipt of receipts) {
        const entry = {
          timestamp: new Date().toISOString(),
          type: 'SCREAM_RECEIPT',
          receipt,
        };
        fs.appendFileSync(this.bloodBookPath, JSON.stringify(entry) + '\n');
      }

      // Log audit summary
      const summaryEntry = {
        timestamp: new Date().toISOString(),
        type: 'AUDIT_SUMMARY',
        auditReceipt,
      };
      fs.appendFileSync(this.bloodBookPath, JSON.stringify(summaryEntry) + '\n');
    } catch {
      // Silently fail if Blood Book can't be written
      // This shouldn't block the audit
    }
  }

  /**
   * Set Blood Book path
   */
  setBloodBookPath(bloodBookPath: string): void {
    this.bloodBookPath = bloodBookPath;
  }

  /**
   * Get all detector names
   */
  getDetectorNames(): string[] {
    return this.detectors.map(d => d.name);
  }

  /**
   * Get detector count
   */
  getDetectorCount(): number {
    return this.detectors.length;
  }
}

// --- FACTORY FUNCTION ---

export function createScreamAggregator(bloodBookPath?: string): ScreamAggregator {
  return new ScreamAggregator(bloodBookPath);
}

// --- STANDALONE AUDIT FUNCTION ---

/**
 * Perform a quick SCREAM audit without instantiating the aggregator
 */
export async function performQuickAudit(
  targetPath: string,
  config?: Partial<DetectorConfig>
): Promise<AuditResult> {
  const aggregator = new ScreamAggregator();
  return aggregator.performScreamAudit(targetPath, config);
}
