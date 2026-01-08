/**
 * P5 PYRE PRAETORIAN - Path Classifier Unit Tests
 * 
 * @port 5
 * @commander PYRE_PRAETORIAN
 * @provenance: p4-p5-silver-sprint/design.md
 * Validates: Requirements 2.1, 2.6, 5.4, 5.5
 */

import { describe, it, expect } from 'vitest';
import {
  classifyPath,
  isRootWhitelisted,
  evaluatePolicy,
  createPolicyReceipt,
  verifyPolicyReceipt,
  PolicyReceiptSchema,
} from './path-classifier.js';

describe('P5 Path Classifier', () => {
  // --- classifyPath ---
  describe('classifyPath', () => {
    describe('Hot sandbox paths', () => {
      it('classifies hot bronze paths', () => {
        expect(classifyPath('hot_obsidian_sandbox/bronze/test.ts'))
          .toEqual({ medallion: 'BRONZE', temperature: 'HOT' });
      });

      it('classifies hot bronze nested paths', () => {
        expect(classifyPath('hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P4/test.ts'))
          .toEqual({ medallion: 'BRONZE', temperature: 'HOT' });
      });

      it('classifies hot silver paths', () => {
        expect(classifyPath('hot_obsidian_sandbox/silver/test.ts'))
          .toEqual({ medallion: 'SILVER', temperature: 'HOT' });
      });

      it('classifies hot gold paths', () => {
        expect(classifyPath('hot_obsidian_sandbox/gold/manifest.md'))
          .toEqual({ medallion: 'GOLD', temperature: 'HOT' });
      });
    });

    describe('Cold sandbox paths', () => {
      it('classifies cold bronze paths', () => {
        expect(classifyPath('cold_obsidian_sandbox/bronze/archive.ts'))
          .toEqual({ medallion: 'BRONZE', temperature: 'COLD' });
      });

      it('classifies cold silver paths', () => {
        expect(classifyPath('cold_obsidian_sandbox/silver/frozen.ts'))
          .toEqual({ medallion: 'SILVER', temperature: 'COLD' });
      });

      it('classifies cold gold paths', () => {
        expect(classifyPath('cold_obsidian_sandbox/gold/immutable.md'))
          .toEqual({ medallion: 'GOLD', temperature: 'COLD' });
      });
    });

    describe('Root paths', () => {
      it('classifies root files as ROOT', () => {
        expect(classifyPath('random-file.txt'))
          .toEqual({ medallion: 'ROOT', temperature: null });
      });

      it('classifies AGENTS.md as ROOT', () => {
        expect(classifyPath('AGENTS.md'))
          .toEqual({ medallion: 'ROOT', temperature: null });
      });
    });

    describe('Path normalization', () => {
      it('handles Windows backslashes', () => {
        expect(classifyPath('hot_obsidian_sandbox\\bronze\\test.ts'))
          .toEqual({ medallion: 'BRONZE', temperature: 'HOT' });
      });

      it('handles leading slashes', () => {
        expect(classifyPath('/hot_obsidian_sandbox/bronze/test.ts'))
          .toEqual({ medallion: 'BRONZE', temperature: 'HOT' });
      });
    });

    describe('Error handling', () => {
      it('throws TypeError for empty path', () => {
        expect(() => classifyPath('')).toThrow(TypeError);
      });

      it('throws TypeError for null path', () => {
        expect(() => classifyPath(null as any)).toThrow(TypeError);
      });
    });
  });


  // --- isRootWhitelisted ---
  describe('isRootWhitelisted', () => {
    describe('Whitelisted files', () => {
      it('allows AGENTS.md', () => {
        expect(isRootWhitelisted('AGENTS.md')).toBe(true);
      });

      it('allows llms.txt', () => {
        expect(isRootWhitelisted('llms.txt')).toBe(true);
      });

      it('allows obsidianblackboard.jsonl', () => {
        expect(isRootWhitelisted('obsidianblackboard.jsonl')).toBe(true);
      });

      it('allows package.json', () => {
        expect(isRootWhitelisted('package.json')).toBe(true);
      });
    });

    describe('Whitelisted patterns', () => {
      it('allows ttao-notes-*.md pattern', () => {
        expect(isRootWhitelisted('ttao-notes-2026-01-07.md')).toBe(true);
      });

      it('allows vitest.*.config.ts pattern', () => {
        expect(isRootWhitelisted('vitest.root.config.ts')).toBe(true);
      });

      it('allows stryker.*.config.mjs pattern', () => {
        expect(isRootWhitelisted('stryker.p4.config.mjs')).toBe(true);
      });
    });

    describe('Whitelisted directories', () => {
      it('allows hot_obsidian_sandbox', () => {
        expect(isRootWhitelisted('hot_obsidian_sandbox')).toBe(true);
      });

      it('allows cold_obsidian_sandbox', () => {
        expect(isRootWhitelisted('cold_obsidian_sandbox')).toBe(true);
      });

      it('allows .kiro', () => {
        expect(isRootWhitelisted('.kiro')).toBe(true);
      });

      it('allows node_modules', () => {
        expect(isRootWhitelisted('node_modules')).toBe(true);
      });

      it('allows paths within whitelisted dirs', () => {
        expect(isRootWhitelisted('.kiro/specs/test.md')).toBe(true);
      });
    });

    describe('Non-whitelisted files', () => {
      it('denies random files', () => {
        expect(isRootWhitelisted('random-file.txt')).toBe(false);
      });

      it('denies src directory', () => {
        expect(isRootWhitelisted('src')).toBe(false);
      });

      it('denies dist directory', () => {
        expect(isRootWhitelisted('dist')).toBe(false);
      });
    });
  });

  // --- evaluatePolicy ---
  describe('evaluatePolicy', () => {
    describe('Bronze tier', () => {
      it('allows writes to hot bronze', () => {
        const result = evaluatePolicy('hot_obsidian_sandbox/bronze/test.ts');
        expect(result.decision).toBe('ALLOWED');
        expect(result.reason).toContain('Bronze');
      });

      it('allows writes to cold bronze', () => {
        const result = evaluatePolicy('cold_obsidian_sandbox/bronze/test.ts');
        expect(result.decision).toBe('ALLOWED');
      });
    });

    describe('Silver tier', () => {
      it('denies writes to hot silver', () => {
        const result = evaluatePolicy('hot_obsidian_sandbox/silver/test.ts');
        expect(result.decision).toBe('DENIED');
        expect(result.reason).toContain('WARLOCK_APPROVAL');
      });

      it('denies writes to cold silver', () => {
        const result = evaluatePolicy('cold_obsidian_sandbox/silver/test.ts');
        expect(result.decision).toBe('DENIED');
      });
    });

    describe('Gold tier', () => {
      it('denies writes to hot gold', () => {
        const result = evaluatePolicy('hot_obsidian_sandbox/gold/manifest.md');
        expect(result.decision).toBe('DENIED');
        expect(result.reason).toContain('WARLOCK_APPROVAL');
      });

      it('denies writes to cold gold', () => {
        const result = evaluatePolicy('cold_obsidian_sandbox/gold/manifest.md');
        expect(result.decision).toBe('DENIED');
      });
    });

    describe('Root tier', () => {
      it('allows whitelisted root files', () => {
        const result = evaluatePolicy('AGENTS.md');
        expect(result.decision).toBe('ALLOWED');
        expect(result.reason).toContain('whitelisted');
      });

      it('denies non-whitelisted root files', () => {
        const result = evaluatePolicy('random-file.txt');
        expect(result.decision).toBe('DENIED');
        expect(result.reason).toContain('pollution');
      });
    });
  });


  // --- createPolicyReceipt ---
  describe('createPolicyReceipt', () => {
    it('creates receipt for bronze path', () => {
      const receipt = createPolicyReceipt('hot_obsidian_sandbox/bronze/test.ts');
      expect(receipt.medallion).toBe('BRONZE');
      expect(receipt.temperature).toBe('HOT');
      expect(receipt.decision).toBe('ALLOWED');
      expect(receipt.port).toBe(5);
      expect(receipt.type).toBe('POLICY');
    });

    it('creates receipt for silver path', () => {
      const receipt = createPolicyReceipt('hot_obsidian_sandbox/silver/test.ts');
      expect(receipt.medallion).toBe('SILVER');
      expect(receipt.decision).toBe('DENIED');
    });

    it('receipt has valid SHA-256 hash format', () => {
      const receipt = createPolicyReceipt('hot_obsidian_sandbox/bronze/test.ts');
      expect(receipt.receiptHash).toMatch(/^sha256:[a-f0-9]{64}$/);
    });

    it('receipt validates against schema', () => {
      const receipt = createPolicyReceipt('hot_obsidian_sandbox/bronze/test.ts');
      const result = PolicyReceiptSchema.safeParse(receipt);
      expect(result.success).toBe(true);
    });

    it('throws TypeError for empty path', () => {
      expect(() => createPolicyReceipt('')).toThrow(TypeError);
    });

    it('throws TypeError for whitespace-only path', () => {
      expect(() => createPolicyReceipt('   ')).toThrow(TypeError);
    });
  });

  // --- verifyPolicyReceipt ---
  describe('verifyPolicyReceipt', () => {
    it('returns true for valid receipt', () => {
      const receipt = createPolicyReceipt('hot_obsidian_sandbox/bronze/test.ts');
      expect(verifyPolicyReceipt(receipt)).toBe(true);
    });

    it('returns false for tampered path', () => {
      const receipt = createPolicyReceipt('hot_obsidian_sandbox/bronze/original.ts');
      const tampered = { ...receipt, path: 'hot_obsidian_sandbox/bronze/tampered.ts' };
      expect(verifyPolicyReceipt(tampered)).toBe(false);
    });

    it('returns false for tampered decision', () => {
      const receipt = createPolicyReceipt('hot_obsidian_sandbox/silver/test.ts');
      const tampered = { ...receipt, decision: 'ALLOWED' as const };
      expect(verifyPolicyReceipt(tampered)).toBe(false);
    });

    it('returns false for tampered medallion', () => {
      const receipt = createPolicyReceipt('hot_obsidian_sandbox/bronze/test.ts');
      const tampered = { ...receipt, medallion: 'SILVER' as const };
      expect(verifyPolicyReceipt(tampered)).toBe(false);
    });

    it('returns false for tampered timestamp', () => {
      const receipt = createPolicyReceipt('hot_obsidian_sandbox/bronze/test.ts');
      const tampered = { ...receipt, timestamp: receipt.timestamp + 1000 };
      expect(verifyPolicyReceipt(tampered)).toBe(false);
    });
  });
});
