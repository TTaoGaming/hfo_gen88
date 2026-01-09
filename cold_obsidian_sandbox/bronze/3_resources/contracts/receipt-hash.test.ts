/**
 * Receipt Hash Integrity - Property Tests
 * 
 * @provenance: LEGENDARY_COMMANDERS_V9.md
 * Validates: Property 17 (Receipt Hash Integrity)
 */

import { describe, it, expect } from 'vitest';
import {
  PromotionReceiptSchema,
  computeHashSync,
  createReceiptContent,
  verifyReceiptHash,
  createPromotionReceipt,
  validateSilverStandard,
} from './receipt-hash.js';

describe('Property 17: Receipt Hash Integrity', () => {
  // --- Hash Computation ---
  describe('Hash Computation', () => {
    it('same content produces same hash', () => {
      const content = 'test content';
      const hash1 = computeHashSync(content);
      const hash2 = computeHashSync(content);
      expect(hash1).toBe(hash2);
    });

    it('different content produces different hash', () => {
      const hash1 = computeHashSync('content A');
      const hash2 = computeHashSync('content B');
      expect(hash1).not.toBe(hash2);
    });

    it('hash has correct format', () => {
      const hash = computeHashSync('test');
      expect(hash).toMatch(/^sha256:[a-f0-9]{64}$/);
    });
  });

  // --- Receipt Creation ---
  describe('Receipt Creation', () => {
    it('creates valid receipt with hash', () => {
      const receipt = createPromotionReceipt(
        'P4_RED_REGNANT/contracts/index.ts',
        'bronze',
        'silver',
        88.5,
        {
          propertyTestsPassed: true,
          zodContractsPresent: true,
          provenanceHeadersPresent: true,
        }
      );
      
      expect(receipt.hash).toMatch(/^sha256:[a-f0-9]{64}$/);
      expect(receipt.artifact).toBe('P4_RED_REGNANT/contracts/index.ts');
      expect(receipt.mutationScore).toBe(88.5);
    });

    it('receipt validates against schema', () => {
      const receipt = createPromotionReceipt(
        'test-artifact',
        'bronze',
        'silver',
        90,
        {
          propertyTestsPassed: true,
          zodContractsPresent: true,
          provenanceHeadersPresent: true,
        }
      );
      
      const result = PromotionReceiptSchema.safeParse(receipt);
      expect(result.success).toBe(true);
    });

    it('receipt has valid UUID', () => {
      const receipt = createPromotionReceipt('test', 'bronze', 'silver', 85, {
        propertyTestsPassed: true,
        zodContractsPresent: true,
        provenanceHeadersPresent: true,
      });
      
      expect(receipt.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });
  });

  // --- Hash Verification ---
  describe('Hash Verification', () => {
    it('valid receipt passes verification', () => {
      const receipt = createPromotionReceipt('test', 'bronze', 'silver', 88, {
        propertyTestsPassed: true,
        zodContractsPresent: true,
        provenanceHeadersPresent: true,
      });
      
      expect(verifyReceiptHash(receipt)).toBe(true);
    });

    it('tampered receipt fails verification', () => {
      const receipt = createPromotionReceipt('test', 'bronze', 'silver', 88, {
        propertyTestsPassed: true,
        zodContractsPresent: true,
        provenanceHeadersPresent: true,
      });
      
      // Tamper with mutation score
      const tampered = { ...receipt, mutationScore: 99 };
      expect(verifyReceiptHash(tampered)).toBe(false);
    });

    it('tampered artifact fails verification', () => {
      const receipt = createPromotionReceipt('original', 'bronze', 'silver', 88, {
        propertyTestsPassed: true,
        zodContractsPresent: true,
        provenanceHeadersPresent: true,
      });
      
      const tampered = { ...receipt, artifact: 'tampered' };
      expect(verifyReceiptHash(tampered)).toBe(false);
    });
  });

  // --- Silver Standard Validation ---
  describe('Silver Standard Validation', () => {
    it('valid receipt passes Silver Standard', () => {
      const receipt = createPromotionReceipt('test', 'bronze', 'silver', 88, {
        propertyTestsPassed: true,
        zodContractsPresent: true,
        provenanceHeadersPresent: true,
      });
      
      const result = validateSilverStandard(receipt);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('low mutation score fails', () => {
      const receipt = createPromotionReceipt('test', 'bronze', 'silver', 79, {
        propertyTestsPassed: true,
        zodContractsPresent: true,
        provenanceHeadersPresent: true,
      });
      
      // Force schema to accept for testing
      const result = validateSilverStandard({ ...receipt, mutationScore: 79 } as any);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('below minimum'))).toBe(true);
    });

    it('theater score (>98.99%) fails', () => {
      const receipt = createPromotionReceipt('test', 'bronze', 'silver', 99, {
        propertyTestsPassed: true,
        zodContractsPresent: true,
        provenanceHeadersPresent: true,
      });
      
      const result = validateSilverStandard({ ...receipt, mutationScore: 99 } as any);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Theater'))).toBe(true);
    });

    it('missing property tests fails', () => {
      const receipt = createPromotionReceipt('test', 'bronze', 'silver', 88, {
        propertyTestsPassed: false,
        zodContractsPresent: true,
        provenanceHeadersPresent: true,
      });
      
      const result = validateSilverStandard(receipt);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Property tests'))).toBe(true);
    });

    it('missing Zod contracts fails', () => {
      const receipt = createPromotionReceipt('test', 'bronze', 'silver', 88, {
        propertyTestsPassed: true,
        zodContractsPresent: false,
        provenanceHeadersPresent: true,
      });
      
      const result = validateSilverStandard(receipt);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Zod contracts'))).toBe(true);
    });

    it('missing provenance headers fails', () => {
      const receipt = createPromotionReceipt('test', 'bronze', 'silver', 88, {
        propertyTestsPassed: true,
        zodContractsPresent: true,
        provenanceHeadersPresent: false,
      });
      
      const result = validateSilverStandard(receipt);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Provenance'))).toBe(true);
    });
  });
});
