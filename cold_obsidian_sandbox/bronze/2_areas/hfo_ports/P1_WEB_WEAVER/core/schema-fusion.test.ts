import { describe, it, expect } from 'vitest';
import { SchemaFusion } from './schema-fusion';
import { z } from 'zod';

describe('P1_WEB_WEAVER Sub 1: Schema Fusion', () => {
  const fusion = new SchemaFusion();

  it('should merge two object schemas', () => {
    const s1 = z.object({ a: z.string() });
    const s2 = z.object({ b: z.number() });
    const fused = fusion.fuse(s1, s2);
    
    expect(fused.parse({ a: 'hi', b: 1 })).toEqual({ a: 'hi', b: 1 });
  });

  it('should create an intersection lattice', () => {
    const s1 = z.object({ a: z.string() });
    const s2 = z.object({ a: z.literal('target') });
    const lat = fusion.lattice([s1, s2]);

    expect(lat.parse({ a: 'target' })).toEqual({ a: 'target' });
    expect(() => lat.parse({ a: 'wrong' })).toThrow();
  });
});
