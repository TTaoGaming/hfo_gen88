/**
 * Receipt Verification - Universal Receipt Integrity Checker
 * 
 * @provenance: p4-p5-silver-sprint/design.md
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4
 * 
 * Provides generic receipt verification for any receipt type
 * that includes a receiptHash field.
 */

import { z } from 'zod';
import { createHash } from 'crypto';

// --- BASE RECEIPT SCHEMA ---

export const BaseReceiptSchema = z.object({
  receiptHash: z.string().regex(/^sha256:[a-f0-9]{64}$/),
});

export type BaseReceipt = z.infer<typeof BaseReceiptSchema>;

/**
 * Verify any receipt by recomputing its hash
 * 
 * Works with any receipt type that has a receiptHash field.
 * Recomputes SHA-256 hash from all other fields and compares.
 * 
 * @param receipt - The receipt to verify (must have receiptHash field)
 * @returns true if receipt is valid, false if tampered
 */
export function verifyReceipt<T extends BaseReceipt>(receipt: T): boolean {
  const { receiptHash, ...content } = receipt;
  
  const computed = createHash('sha256')
    .update(JSON.stringify(content))
    .digest('hex');
  
  return `sha256:${computed}` === receiptHash;
}

/**
 * Tamper detection - returns detailed information about tampering
 * 
 * @param receipt - The receipt to check
 * @returns Object with tampered flag and hash comparison
 */
export function detectTampering<T extends BaseReceipt>(
  receipt: T
): { tampered: boolean; expected: string; actual: string } {
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

/**
 * Create a hash for receipt content
 * 
 * @param content - The content to hash (without receiptHash field)
 * @returns SHA-256 hash in format "sha256:..."
 */
export function createReceiptHash(content: Record<string, unknown>): string {
  const hash = createHash('sha256')
    .update(JSON.stringify(content))
    .digest('hex');
  
  return `sha256:${hash}`;
}

/**
 * Validate that a hash string is in the correct format
 * 
 * @param hash - The hash string to validate
 * @returns true if valid SHA-256 format
 */
export function isValidHashFormat(hash: string): boolean {
  return /^sha256:[a-f0-9]{64}$/.test(hash);
}
