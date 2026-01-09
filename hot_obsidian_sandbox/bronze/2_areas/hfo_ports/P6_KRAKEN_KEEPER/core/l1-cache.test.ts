import { describe, it, expect, vi } from 'vitest';
import { L1Cache } from './l1-cache';

describe('P6_KRAKEN_KEEPER Sub 0: L1 Cache', () => {
  it('should store and retrieve values', () => {
    const cache = new L1Cache();
    cache.set('key', 'val');
    expect(cache.get('key')).toBe('val');
  });

  it('should expire values after TTL', async () => {
    const cache = new L1Cache();
    cache.set('key', 'val', 10); // 10ms
    
    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 20));
    
    expect(cache.get('key')).toBeUndefined();
  });
});
