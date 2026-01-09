/**
 * P2 MIRROR MAGUS - Signal Tests (Silver)
 */

import { describe, it, expect } from 'vitest';
import { shapeSignal } from './signals.js';

describe('Mirror Signals (Silver)', () => {
  it('shapes signals correctly', () => {
    const raw = {
      id: 'sig1',
      source: 'test',
      payload: '  noisy payload  ',
      ts: 0
    };
    
    const shaped = shapeSignal(raw);
    expect(shaped.payload).toBe('noisy payload');
    expect(shaped.ts).toBeGreaterThan(0);
  });
});
