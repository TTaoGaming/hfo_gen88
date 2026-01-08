/**
 * P4 RED REGNANT - SCREAM Contracts Tests
 * 
 * @port 4
 * @commander RED_REGNANT
 * @verb SCREAM
 * @tier SILVER
 * @provenance: .kiro/specs/silver-promotion-blindspot/design.md
 * Validates: Requirements 2.1, 2.3, 2.4
 */

import { describe, it, expect } from 'vitest';
import {
  ScreamType,
  ScreamSeverity,
  ScreamReceiptSchema,
  PORT_TO_SCREAM,
  SCREAM_TO_PORT,
  createScreamReceipt,
  verifyScreamReceipt,
  detectTampering,
  getScreamTypeForPort,
  getPortForScreamType,
  isValidScreamType,
} from './screams.js';

describe('SCREAM Contracts (Silver)', () => {
  // --- SCREAM TYPE ENUM ---
  describe('ScreamType', () => {
    it('has exactly 8 SCREAM types', () => {
      const types = ScreamType.options;
      expect(types).toHaveLength(8);
    });

    it('includes all 8 canonical types', () => {
      const types = ScreamType.options;
      expect(types).toContain('SCREAM_BLINDSPOT');
      expect(types).toContain('SCREAM_BREACH');
      expect(types).toContain('SCREAM_THEATER');
      expect(types).toContain('SCREAM_PHANTOM');
      expect(types).toContain('SCREAM_MUTATION');
      expect(types).toContain('SCREAM_POLLUTION');
      expect(types).toContain('SCREAM_AMNESIA');
      expect(types).toContain('SCREAM_LATTICE');
    });

    it('validates valid SCREAM types', () => {
      expect(ScreamType.safeParse('SCREAM_BLINDSPOT').success).toBe(true);
      expect(ScreamType.safeParse('SCREAM_MUTATION').success).toBe(true);
    });

    it('rejects invalid SCREAM types', () => {
      expect(ScreamType.safeParse('INVALID').success).toBe(false);
      expect(ScreamType.safeParse('').success).toBe(false);
      expect(ScreamType.safeParse(null).success).toBe(false);
    });
  });

  // --- SCREAM SEVERITY ---
  describe('ScreamSeverity', () => {
    it('has exactly 3 severity levels', () => {
      expect(ScreamSeverity.options).toHaveLength(3);
    });

    it('includes warning, error, critical', () => {
      expect(ScreamSeverity.options).toContain('warning');
      expect(ScreamSeverity.options).toContain('error');
      expect(ScreamSeverity.options).toContain('critical');
    });

    it('validates valid severities', () => {
      expect(ScreamSeverity.safeParse('warning').success).toBe(true);
      expect(ScreamSeverity.safeParse('error').success).toBe(true);
      expect(ScreamSeverity.safeParse('critical').success).toBe(true);
    });

    it('rejects invalid severities', () => {
      expect(ScreamSeverity.safeParse('info').success).toBe(false);
      expect(ScreamSeverity.safeParse('').success).toBe(false);
    });
  });

  // --- PORT MAPPINGS ---
  describe('Port Mappings', () => {
    it('PORT_TO_SCREAM maps all 8 ports', () => {
      expect(Object.keys(PORT_TO_SCREAM)).toHaveLength(8);
      for (let i = 0; i < 8; i++) {
        expect(PORT_TO_SCREAM[i]).toBeDefined();
      }
    });

    it('SCREAM_TO_PORT maps all 8 types', () => {
      expect(Object.keys(SCREAM_TO_PORT)).toHaveLength(8);
    });

    it('mappings are bidirectional', () => {
      for (let port = 0; port < 8; port++) {
        const type = PORT_TO_SCREAM[port];
        expect(SCREAM_TO_PORT[type]).toBe(port);
      }
    });

    it('Port 0 is BLINDSPOT', () => {
      expect(PORT_TO_SCREAM[0]).toBe('SCREAM_BLINDSPOT');
    });

    it('Port 4 is MUTATION', () => {
      expect(PORT_TO_SCREAM[4]).toBe('SCREAM_MUTATION');
    });
  });

  // --- RECEIPT SCHEMA ---
  describe('ScreamReceiptSchema', () => {
    const validReceipt = {
      type: 'SCREAM_BLINDSPOT',
      port: 0,
      timestamp: Date.now(),
      file: '/path/to/file.ts',
      details: { patternName: 'EMPTY_CATCH' },
      severity: 'error',
      receiptHash: 'sha256:' + 'a'.repeat(64),
    };

    it('validates a valid receipt', () => {
      const result = ScreamReceiptSchema.safeParse(validReceipt);
      expect(result.success).toBe(true);
    });

    it('rejects receipt with invalid type', () => {
      const invalid = { ...validReceipt, type: 'INVALID' };
      expect(ScreamReceiptSchema.safeParse(invalid).success).toBe(false);
    });

    it('rejects receipt with port out of range', () => {
      const invalid = { ...validReceipt, port: 8 };
      expect(ScreamReceiptSchema.safeParse(invalid).success).toBe(false);
    });

    it('rejects receipt with negative port', () => {
      const invalid = { ...validReceipt, port: -1 };
      expect(ScreamReceiptSchema.safeParse(invalid).success).toBe(false);
    });

    it('rejects receipt with empty file', () => {
      const invalid = { ...validReceipt, file: '' };
      expect(ScreamReceiptSchema.safeParse(invalid).success).toBe(false);
    });

    it('rejects receipt with invalid hash format', () => {
      const invalid = { ...validReceipt, receiptHash: 'invalid' };
      expect(ScreamReceiptSchema.safeParse(invalid).success).toBe(false);
    });

    it('rejects receipt with wrong hash prefix', () => {
      const invalid = { ...validReceipt, receiptHash: 'md5:' + 'a'.repeat(64) };
      expect(ScreamReceiptSchema.safeParse(invalid).success).toBe(false);
    });

    it('rejects receipt with wrong hash length', () => {
      const invalid = { ...validReceipt, receiptHash: 'sha256:' + 'a'.repeat(32) };
      expect(ScreamReceiptSchema.safeParse(invalid).success).toBe(false);
    });
  });

  // --- CREATE SCREAM RECEIPT ---
  describe('createScreamReceipt', () => {
    it('creates a valid receipt', () => {
      const receipt = createScreamReceipt(
        'SCREAM_BLINDSPOT',
        0,
        '/path/to/file.ts',
        { patternName: 'EMPTY_CATCH' }
      );

      expect(receipt.type).toBe('SCREAM_BLINDSPOT');
      expect(receipt.port).toBe(0);
      expect(receipt.file).toBe('/path/to/file.ts');
      expect(receipt.severity).toBe('error'); // default
      expect(receipt.receiptHash).toMatch(/^sha256:[a-f0-9]{64}$/);
    });

    it('uses provided severity', () => {
      const receipt = createScreamReceipt(
        'SCREAM_BLINDSPOT',
        0,
        '/path/to/file.ts',
        {},
        'critical'
      );
      expect(receipt.severity).toBe('critical');
    });

    it('trims file path', () => {
      const receipt = createScreamReceipt(
        'SCREAM_BLINDSPOT',
        0,
        '  /path/to/file.ts  ',
        {}
      );
      expect(receipt.file).toBe('/path/to/file.ts');
    });

    it('throws on empty file path', () => {
      expect(() => createScreamReceipt('SCREAM_BLINDSPOT', 0, '', {}))
        .toThrow(TypeError);
    });

    it('throws on whitespace-only file path', () => {
      expect(() => createScreamReceipt('SCREAM_BLINDSPOT', 0, '   ', {}))
        .toThrow(TypeError);
    });

    it('throws on port out of range (high)', () => {
      expect(() => createScreamReceipt('SCREAM_BLINDSPOT', 8, '/file.ts', {}))
        .toThrow(RangeError);
    });

    it('throws on port out of range (negative)', () => {
      expect(() => createScreamReceipt('SCREAM_BLINDSPOT', -1, '/file.ts', {}))
        .toThrow(RangeError);
    });

    it('throws on port/type mismatch', () => {
      expect(() => createScreamReceipt('SCREAM_BLINDSPOT', 1, '/file.ts', {}))
        .toThrow(/Port 1 expects SCREAM_BREACH/);
    });

    it('includes timestamp', () => {
      const before = Date.now();
      const receipt = createScreamReceipt('SCREAM_BLINDSPOT', 0, '/file.ts', {});
      const after = Date.now();

      expect(receipt.timestamp).toBeGreaterThanOrEqual(before);
      expect(receipt.timestamp).toBeLessThanOrEqual(after);
    });
  });

  // --- VERIFY SCREAM RECEIPT ---
  describe('verifyScreamReceipt', () => {
    it('returns true for valid receipt', () => {
      const receipt = createScreamReceipt('SCREAM_BLINDSPOT', 0, '/file.ts', {});
      expect(verifyScreamReceipt(receipt)).toBe(true);
    });

    it('returns false for tampered type', () => {
      const receipt = createScreamReceipt('SCREAM_BLINDSPOT', 0, '/file.ts', {});
      const tampered = { ...receipt, type: 'SCREAM_BREACH' as const };
      expect(verifyScreamReceipt(tampered)).toBe(false);
    });

    it('returns false for tampered file', () => {
      const receipt = createScreamReceipt('SCREAM_BLINDSPOT', 0, '/file.ts', {});
      const tampered = { ...receipt, file: '/other.ts' };
      expect(verifyScreamReceipt(tampered)).toBe(false);
    });

    it('returns false for tampered details', () => {
      const receipt = createScreamReceipt('SCREAM_BLINDSPOT', 0, '/file.ts', { a: 1 });
      const tampered = { ...receipt, details: { a: 2 } };
      expect(verifyScreamReceipt(tampered)).toBe(false);
    });

    it('returns false for tampered timestamp', () => {
      const receipt = createScreamReceipt('SCREAM_BLINDSPOT', 0, '/file.ts', {});
      const tampered = { ...receipt, timestamp: receipt.timestamp + 1 };
      expect(verifyScreamReceipt(tampered)).toBe(false);
    });
  });

  // --- DETECT TAMPERING ---
  describe('detectTampering', () => {
    it('returns tampered=false for valid receipt', () => {
      const receipt = createScreamReceipt('SCREAM_BLINDSPOT', 0, '/file.ts', {});
      const result = detectTampering(receipt);
      expect(result.tampered).toBe(false);
      expect(result.expected).toBe(result.actual);
    });

    it('returns tampered=true for modified receipt', () => {
      const receipt = createScreamReceipt('SCREAM_BLINDSPOT', 0, '/file.ts', {});
      const tampered = { ...receipt, file: '/other.ts' };
      const result = detectTampering(tampered);
      expect(result.tampered).toBe(true);
      expect(result.expected).not.toBe(result.actual);
    });
  });

  // --- HELPER FUNCTIONS ---
  describe('getScreamTypeForPort', () => {
    it('returns correct type for each port', () => {
      expect(getScreamTypeForPort(0)).toBe('SCREAM_BLINDSPOT');
      expect(getScreamTypeForPort(1)).toBe('SCREAM_BREACH');
      expect(getScreamTypeForPort(4)).toBe('SCREAM_MUTATION');
      expect(getScreamTypeForPort(7)).toBe('SCREAM_LATTICE');
    });

    it('throws for invalid port', () => {
      expect(() => getScreamTypeForPort(8)).toThrow(RangeError);
      expect(() => getScreamTypeForPort(-1)).toThrow(RangeError);
    });
  });

  describe('getPortForScreamType', () => {
    it('returns correct port for each type', () => {
      expect(getPortForScreamType('SCREAM_BLINDSPOT')).toBe(0);
      expect(getPortForScreamType('SCREAM_BREACH')).toBe(1);
      expect(getPortForScreamType('SCREAM_MUTATION')).toBe(4);
      expect(getPortForScreamType('SCREAM_LATTICE')).toBe(7);
    });
  });

  describe('isValidScreamType', () => {
    it('returns true for valid types', () => {
      expect(isValidScreamType('SCREAM_BLINDSPOT')).toBe(true);
      expect(isValidScreamType('SCREAM_MUTATION')).toBe(true);
    });

    it('returns false for invalid types', () => {
      expect(isValidScreamType('INVALID')).toBe(false);
      expect(isValidScreamType('')).toBe(false);
    });
  });
});
