import { describe, it, expect } from 'vitest';
import { HfoEnvelopeSchema, bridge } from './index.ts';
import { z } from 'zod';

describe('P1 CONTRACT HARDENING - Mutant Kills', () => {
  it('should kill Mutation: HfoEnvelopeSchema ObjectLiteral to {}', () => {
    const result = HfoEnvelopeSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      // Must check for specific missing fields to ensure the schema isn't an empty object
      const errorPaths = result.error.errors.map(e => e.path[0]);
      expect(errorPaths).toContain('id');
      expect(errorPaths).toContain('timestamp');
      expect(errorPaths).toContain('sourcePort');
      expect(errorPaths).toContain('verb');
    }
  });

  it('should kill Mutation: min(0) to max(0) or similar for ports', () => {
    const invalidPort = {
      id: '00000000-0000-0000-0000-000000000000',
      timestamp: Date.now(),
      sourcePort: -1,
      targetPort: 8,
      verb: 'BRIDGE',
      payload: {},
      metadata: { priority: 'normal' }
    };
    const result = HfoEnvelopeSchema.safeParse(invalidPort);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors.some(e => e.path.includes('sourcePort'))).toBe(true);
      expect(result.error.errors.some(e => e.path.includes('targetPort'))).toBe(true);
    }
  });

  it('should kill Mutation: Enum values for priority', () => {
    const invalidPriority = {
      id: '00000000-0000-0000-0000-000000000000',
      timestamp: Date.now(),
      sourcePort: 1,
      targetPort: 2,
      verb: 'BRIDGE',
      payload: {},
      metadata: { priority: 'ULTRA_HIGH' }
    };
    const result = HfoEnvelopeSchema.safeParse(invalidPriority);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors.some(e => e.path.includes('priority'))).toBe(true);
    }
  });

  it('should kill Mutation: Error path join(".") in bridge function', () => {
    const invalidNested = {
       metadata: { priority: 123 } // Invalid type, invalid enum
    };
    
    // We use a custom schema to test bridge's error formatting
    const schema = z.object({
       deep: z.object({
          field: z.string()
       })
    });
    
    const result = bridge({ deep: { field: 123 } }, schema);
    expect(result.success).toBe(false);
    if (!result.success) {
      // If .join('.') was mutated to .join(''), this will fail
      expect(result.errors[0]).toContain('deep.field');
    }
  });

  it('should verify metadata required fields to kill ObjectLiteral mutation', () => {
    const invalidMetadata = {
      id: '00000000-0000-0000-0000-000000000000',
      timestamp: Date.now(),
      sourcePort: 1,
      targetPort: 2,
      verb: 'BRIDGE',
      payload: {},
      metadata: {} // Missing priority
    };
    const result = HfoEnvelopeSchema.safeParse(invalidMetadata);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors.some(e => e.path.includes('priority'))).toBe(true);
    }
  });
});
