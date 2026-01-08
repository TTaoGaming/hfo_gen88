/**
 * P4 RED REGNANT - SCREAM Receipt Property Tests
 * 
 * @port 4
 * @commander RED_REGNANT
 * @verb SCREAM
 * @tier BRONZE
 * @provenance: .kiro/specs/red-regnant-8-screams/design.md
 * 
 * Property 1: SCREAM Receipt Integrity
 * Validates: Requirements 9.3, 9.4
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  ScreamType,
  ScreamSeverity,
  createScreamReceipt,
  verifyScreamReceipt,
  detectTampering,
  getScreamTypeForPort,
  getPortForScreamType,
  PORT_TO_SCREAM,
} from './screams.js';

// --- ARBITRARIES ---

const screamTypeArb = fc.constantFrom(...ScreamType.options);
const severityArb = fc.constantFrom(...ScreamSeverity.options);
const portArb = fc.integer({ min: 0, max: 7 });
const filePathArb = fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0);
const detailsArb = fc.dictionary(
  fc.string({ minLength: 1, maxLength: 20 }),
  fc.oneof(fc.string(), fc.integer(), fc.boolean())
);

// Generate valid port-type pairs
const validPortTypePairArb = portArb.map(port => ({
  port,
  type: PORT_TO_SCREAM[port] as ScreamType,
}));

// --- PROPERTY TESTS ---

/**
 * Feature: red-regnant-8-screams
 * Property 1: SCREAM Receipt Integrity
 * Validates: Requirements 9.3, 9.4
 */
describe('Property 1: SCREAM Receipt Integrity', () => {
  it('valid receipts verify correctly', () => {
    fc.assert(
      fc.property(
        validPortTypePairArb,
        filePathArb,
        detailsArb,
        severityArb,
        ({ port, type }, file, details, severity) => {
          const receipt = createScreamReceipt(type, port, file, details, severity);
          return verifyScreamReceipt(receipt) === true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('tampered receipts fail verification - modified port', () => {
    fc.assert(
      fc.property(
        validPortTypePairArb,
        filePathArb,
        detailsArb,
        ({ port, type }, file, details) => {
          const receipt = createScreamReceipt(type, port, file, details);
          const tampered = { ...receipt, port: (port + 1) % 8 };
          return verifyScreamReceipt(tampered) === false;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('tampered receipts fail verification - modified file', () => {
    fc.assert(
      fc.property(
        validPortTypePairArb,
        filePathArb,
        filePathArb,
        detailsArb,
        ({ port, type }, file, differentFile, details) => {
          fc.pre(file !== differentFile);
          const receipt = createScreamReceipt(type, port, file, details);
          const tampered = { ...receipt, file: differentFile };
          return verifyScreamReceipt(tampered) === false;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('tampered receipts fail verification - modified timestamp', () => {
    fc.assert(
      fc.property(
        validPortTypePairArb,
        filePathArb,
        detailsArb,
        ({ port, type }, file, details) => {
          const receipt = createScreamReceipt(type, port, file, details);
          const tampered = { ...receipt, timestamp: receipt.timestamp + 1 };
          return verifyScreamReceipt(tampered) === false;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('tampered receipts fail verification - modified severity', () => {
    fc.assert(
      fc.property(
        validPortTypePairArb,
        filePathArb,
        detailsArb,
        ({ port, type }, file, details) => {
          const receipt = createScreamReceipt(type, port, file, details, 'error');
          const tampered = { ...receipt, severity: 'critical' as const };
          return verifyScreamReceipt(tampered) === false;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('detectTampering correctly identifies tampered receipts', () => {
    fc.assert(
      fc.property(
        validPortTypePairArb,
        filePathArb,
        detailsArb,
        ({ port, type }, file, details) => {
          const receipt = createScreamReceipt(type, port, file, details);
          
          // Valid receipt should not be tampered
          const validResult = detectTampering(receipt);
          expect(validResult.tampered).toBe(false);
          expect(validResult.expected).toBe(validResult.actual);
          
          // Tampered receipt should be detected
          const tampered = { ...receipt, port: (port + 1) % 8 };
          const tamperedResult = detectTampering(tampered);
          expect(tamperedResult.tampered).toBe(true);
          expect(tamperedResult.expected).not.toBe(tamperedResult.actual);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 4: Port Alignment
 * Validates: Requirements 1-8
 */
describe('Property 4: Port Alignment', () => {
  it('port and SCREAM type are always aligned', () => {
    fc.assert(
      fc.property(
        portArb,
        (port) => {
          const type = getScreamTypeForPort(port);
          const backToPort = getPortForScreamType(type);
          return backToPort === port;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('all 8 ports map to unique SCREAM types', () => {
    const types = new Set<ScreamType>();
    for (let port = 0; port <= 7; port++) {
      types.add(getScreamTypeForPort(port));
    }
    expect(types.size).toBe(8);
  });

  it('createScreamReceipt rejects mismatched port-type pairs', () => {
    fc.assert(
      fc.property(
        portArb,
        filePathArb,
        (port) => {
          const wrongType = PORT_TO_SCREAM[(port + 1) % 8] as ScreamType;
          expect(() => createScreamReceipt(wrongType, port, 'test.ts', {})).toThrow();
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property: Receipt Hash Format
 */
describe('Receipt Hash Format', () => {
  it('receipt hash always starts with sha256:', () => {
    fc.assert(
      fc.property(
        validPortTypePairArb,
        filePathArb,
        detailsArb,
        ({ port, type }, file, details) => {
          const receipt = createScreamReceipt(type, port, file, details);
          return receipt.receiptHash.startsWith('sha256:');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('receipt hash is always 71 characters (sha256: + 64 hex)', () => {
    fc.assert(
      fc.property(
        validPortTypePairArb,
        filePathArb,
        detailsArb,
        ({ port, type }, file, details) => {
          const receipt = createScreamReceipt(type, port, file, details);
          return receipt.receiptHash.length === 71;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('receipt hash contains only valid hex characters after prefix', () => {
    fc.assert(
      fc.property(
        validPortTypePairArb,
        filePathArb,
        detailsArb,
        ({ port, type }, file, details) => {
          const receipt = createScreamReceipt(type, port, file, details);
          const hexPart = receipt.receiptHash.slice(7);
          return /^[a-f0-9]{64}$/.test(hexPart);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property: Input Validation
 */
describe('Input Validation', () => {
  it('rejects empty file paths', () => {
    const type = 'SCREAM_MUTATION';
    expect(() => createScreamReceipt(type, 4, '', {})).toThrow(TypeError);
    expect(() => createScreamReceipt(type, 4, '   ', {})).toThrow(TypeError);
  });

  it('rejects invalid port numbers', () => {
    const type = 'SCREAM_MUTATION';
    expect(() => createScreamReceipt(type, -1, 'test.ts', {})).toThrow(RangeError);
    expect(() => createScreamReceipt(type, 8, 'test.ts', {})).toThrow(RangeError);
    expect(() => createScreamReceipt(type, 100, 'test.ts', {})).toThrow(RangeError);
  });

  it('getScreamTypeForPort rejects invalid ports', () => {
    expect(() => getScreamTypeForPort(-1)).toThrow(RangeError);
    expect(() => getScreamTypeForPort(8)).toThrow(RangeError);
  });
});
