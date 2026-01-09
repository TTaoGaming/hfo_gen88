import { describe, it, expect } from 'vitest';
import { IntentResolver } from './intent-resolver';

describe('P2_MIRROR_MAGUS Sub 5: Intent Resolver', () => {
  const resolver = new IntentResolver();

  it('should resolve ACTIVATE for TAP', () => {
    expect(resolver.resolve('TAP', 0.9)).toBe('ACTIVATE');
  });

  it('should resolve NONE for low confidence', () => {
    expect(resolver.resolve('TAP', 0.5)).toBe('NONE');
  });

  it('should resolve NAVIGATE for SWIPE', () => {
    expect(resolver.resolve('SWIPE', 1.0)).toBe('NAVIGATE');
  });
});
