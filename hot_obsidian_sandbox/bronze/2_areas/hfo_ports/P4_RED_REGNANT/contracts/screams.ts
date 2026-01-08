/**
 * P4 RED REGNANT - 8 SCREAM Types
 * 
 * @port 4
 * @commander RED_REGNANT
 * @verb SCREAM
 * @tier BRONZE (pending Silver promotion)
 * @provenance: .kiro/specs/red-regnant-8-screams/design.md
 * Validates: Requirements 1-9 (all SCREAM types)
 * 
 * The 8 canonical SCREAM types aligned with the 8 Legendary Commanders.
 * Each SCREAM produces a cryptographically verifiable receipt.
 */

import { z } from 'zod';
import { createHash } from 'crypto';

// --- SCREAM TYPE ENUM ---

/**
 * The 8 canonical SCREAM types, aligned with Legendary Commanders
 * 
 * Port 0: BLINDSPOT - Silent failures, missing observations (Lidless Legion)
 * Port 1: BREACH - Contract violations, type safety (Web Weaver)
 * Port 2: THEATER - Fake tests, mock poisoning (Mirror Magus)
 * Port 3: PHANTOM - External deps, supply chain (Spore Storm)
 * Port 4: MUTATION - Mutation score violations (Red Regnant)
 * Port 5: POLLUTION - Root pollution, medallion violations (Pyre Praetorian)
 * Port 6: AMNESIA - Debug logs, technical debt (Kraken Keeper)
 * Port 7: LATTICE - Governance, BDD alignment (Spider Sovereign)
 */
export const ScreamType = z.enum([
  'SCREAM_BLINDSPOT',  // Port 0 - SENSE
  'SCREAM_BREACH',     // Port 1 - FUSE
  'SCREAM_THEATER',    // Port 2 - SHAPE
  'SCREAM_PHANTOM',    // Port 3 - DELIVER
  'SCREAM_MUTATION',   // Port 4 - DISRUPT
  'SCREAM_POLLUTION',  // Port 5 - IMMUNIZE
  'SCREAM_AMNESIA',    // Port 6 - STORE
  'SCREAM_LATTICE',    // Port 7 - DECIDE
]);
export type ScreamType = z.infer<typeof ScreamType>;

// --- SCREAM SEVERITY ---

export const ScreamSeverity = z.enum(['warning', 'error', 'critical']);
export type ScreamSeverity = z.infer<typeof ScreamSeverity>;

// --- SCREAM RECEIPT SCHEMA ---

export const ScreamReceiptSchema = z.object({
  type: ScreamType,
  port: z.number().int().min(0).max(7),
  timestamp: z.number().int().positive(),
  file: z.string().min(1),
  details: z.record(z.unknown()),
  severity: ScreamSeverity,
  receiptHash: z.string().regex(/^sha256:[a-f0-9]{64}$/),
});
export type ScreamReceipt = z.infer<typeof ScreamReceiptSchema>;

// --- PORT TO SCREAM TYPE MAPPING ---

export const PORT_TO_SCREAM: Record<number, ScreamType> = {
  0: 'SCREAM_BLINDSPOT',
  1: 'SCREAM_BREACH',
  2: 'SCREAM_THEATER',
  3: 'SCREAM_PHANTOM',
  4: 'SCREAM_MUTATION',
  5: 'SCREAM_POLLUTION',
  6: 'SCREAM_AMNESIA',
  7: 'SCREAM_LATTICE',
} as const;

export const SCREAM_TO_PORT: Record<ScreamType, number> = {
  'SCREAM_BLINDSPOT': 0,
  'SCREAM_BREACH': 1,
  'SCREAM_THEATER': 2,
  'SCREAM_PHANTOM': 3,
  'SCREAM_MUTATION': 4,
  'SCREAM_POLLUTION': 5,
  'SCREAM_AMNESIA': 6,
  'SCREAM_LATTICE': 7,
} as const;

// --- RECEIPT CREATION ---

/**
 * Create a SCREAM receipt with cryptographic hash
 * 
 * @param type - The SCREAM type
 * @param port - The port number (0-7)
 * @param file - The file path that triggered the SCREAM
 * @param details - Additional details about the violation
 * @param severity - The severity level (default: 'error')
 * @returns ScreamReceipt with SHA-256 hash
 */
export function createScreamReceipt(
  type: ScreamType,
  port: number,
  file: string,
  details: Record<string, unknown>,
  severity: ScreamSeverity = 'error'
): ScreamReceipt {
  // Validate inputs
  if (!file || file.trim().length === 0) {
    throw new TypeError('File path cannot be empty');
  }
  if (port < 0 || port > 7) {
    throw new RangeError('Port must be between 0 and 7');
  }
  
  // Verify port matches SCREAM type
  const expectedType = PORT_TO_SCREAM[port];
  if (expectedType !== type) {
    throw new Error(`Port ${port} expects ${expectedType}, got ${type}`);
  }
  
  const content = {
    type,
    port,
    timestamp: Date.now(),
    file: file.trim(),
    details,
    severity,
  };
  
  // Compute SHA-256 hash of content
  const hash = createHash('sha256')
    .update(JSON.stringify(content))
    .digest('hex');
  
  return {
    ...content,
    receiptHash: `sha256:${hash}`,
  };
}

/**
 * Verify a SCREAM receipt's integrity
 * 
 * Recomputes the hash from receipt content and compares.
 * Returns false if receipt has been tampered with.
 * 
 * @param receipt - The receipt to verify
 * @returns true if receipt is valid, false if tampered
 */
export function verifyScreamReceipt(receipt: ScreamReceipt): boolean {
  const { receiptHash, ...content } = receipt;
  
  const computed = createHash('sha256')
    .update(JSON.stringify(content))
    .digest('hex');
  
  return `sha256:${computed}` === receiptHash;
}

/**
 * Detect tampering in a SCREAM receipt
 * 
 * @param receipt - The receipt to check
 * @returns Object with tampered flag and hash comparison
 */
export function detectTampering(receipt: ScreamReceipt): {
  tampered: boolean;
  expected: string;
  actual: string;
} {
  const { receiptHash, ...content } = receipt;
  
  const computed = `sha256:${createHash('sha256')
    .update(JSON.stringify(content))
    .digest('hex')}`;
  
  return {
    tampered: computed !== receiptHash,
    expected: receiptHash,
    actual: computed,
  };
}

// --- HELPER FUNCTIONS ---

/**
 * Get the SCREAM type for a given port
 */
export function getScreamTypeForPort(port: number): ScreamType {
  const type = PORT_TO_SCREAM[port];
  if (!type) {
    throw new RangeError(`Invalid port: ${port}. Must be 0-7.`);
  }
  return type;
}

/**
 * Get the port for a given SCREAM type
 */
export function getPortForScreamType(type: ScreamType): number {
  return SCREAM_TO_PORT[type];
}

/**
 * Check if a SCREAM type is valid
 */
export function isValidScreamType(type: string): type is ScreamType {
  return ScreamType.safeParse(type).success;
}
