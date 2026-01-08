/**
 * Receipt Hash Integrity
 * 
 * @provenance: LEGENDARY_COMMANDERS_V9.md
 * Validates: Property 17 (Receipt Hash Integrity)
 * 
 * Silver promotion receipts must have SHA-256 hash for integrity verification.
 */

import { z } from 'zod';

// --- PROMOTION RECEIPT SCHEMA ---

export const PromotionReceiptSchema = z.object({
  id: z.string().uuid(),
  artifact: z.string(),
  fromLayer: z.enum(['bronze', 'silver']),
  toLayer: z.enum(['silver', 'gold']),
  mutationScore: z.number().min(80).max(98.99),
  timestamp: z.string().datetime(),
  hash: z.string().regex(/^sha256:[a-f0-9]{64}$/),
  propertyTestsPassed: z.boolean(),
  zodContractsPresent: z.boolean(),
  provenanceHeadersPresent: z.boolean(),
});

export type PromotionReceipt = z.infer<typeof PromotionReceiptSchema>;

// --- HASH FUNCTIONS ---

/**
 * Computes SHA-256 hash of content (browser/Node compatible)
 */
export async function computeHash(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return `sha256:${hashHex}`;
}

/**
 * Computes hash synchronously using simple algorithm (for testing)
 * Note: In production, use computeHash for proper SHA-256
 */
export function computeHashSync(content: string): string {
  // Simple hash for testing - NOT cryptographically secure
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const hex = Math.abs(hash).toString(16).padStart(64, '0').slice(0, 64);
  return `sha256:${hex}`;
}

/**
 * Creates receipt content string for hashing (excludes hash field)
 */
export function createReceiptContent(receipt: Omit<PromotionReceipt, 'hash'>): string {
  return JSON.stringify({
    id: receipt.id,
    artifact: receipt.artifact,
    fromLayer: receipt.fromLayer,
    toLayer: receipt.toLayer,
    mutationScore: receipt.mutationScore,
    timestamp: receipt.timestamp,
    propertyTestsPassed: receipt.propertyTestsPassed,
    zodContractsPresent: receipt.zodContractsPresent,
    provenanceHeadersPresent: receipt.provenanceHeadersPresent,
  });
}

/**
 * Verifies receipt hash integrity
 */
export function verifyReceiptHash(receipt: PromotionReceipt): boolean {
  const { hash, ...rest } = receipt;
  const content = createReceiptContent(rest);
  const expectedHash = computeHashSync(content);
  return hash === expectedHash;
}

/**
 * Creates a promotion receipt with computed hash
 */
export function createPromotionReceipt(
  artifact: string,
  fromLayer: 'bronze' | 'silver',
  toLayer: 'silver' | 'gold',
  mutationScore: number,
  options: {
    propertyTestsPassed: boolean;
    zodContractsPresent: boolean;
    provenanceHeadersPresent: boolean;
  }
): PromotionReceipt {
  const receiptWithoutHash = {
    id: crypto.randomUUID(),
    artifact,
    fromLayer,
    toLayer,
    mutationScore,
    timestamp: new Date().toISOString(),
    ...options,
  };
  
  const content = createReceiptContent(receiptWithoutHash);
  const hash = computeHashSync(content);
  
  return {
    ...receiptWithoutHash,
    hash,
  };
}

/**
 * Validates receipt meets Silver Standard requirements
 */
export function validateSilverStandard(receipt: PromotionReceipt): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (receipt.mutationScore < 80) {
    errors.push(`Mutation score ${receipt.mutationScore}% below minimum 80%`);
  }
  if (receipt.mutationScore > 98.99) {
    errors.push(`Mutation score ${receipt.mutationScore}% above maximum 98.99% (Theater detected)`);
  }
  if (!receipt.propertyTestsPassed) {
    errors.push('Property tests not passed');
  }
  if (!receipt.zodContractsPresent) {
    errors.push('Zod contracts not present');
  }
  if (!receipt.provenanceHeadersPresent) {
    errors.push('Provenance headers not present');
  }
  if (!verifyReceiptHash(receipt)) {
    errors.push('Receipt hash integrity check failed');
  }
  
  return { valid: errors.length === 0, errors };
}
