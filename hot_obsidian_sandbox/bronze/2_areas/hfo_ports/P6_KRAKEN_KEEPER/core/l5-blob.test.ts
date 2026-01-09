import { describe, it, expect } from 'vitest';
import { L5BlobStorage } from './l5-blob';

describe('P6-SUB-4: L5 Blob Storage', () => {
  it('should store binary data and calculate hash', () => {
    const storage = new L5BlobStorage();
    const data = Buffer.from('kraken-ink');
    const hash = storage.store('b1', data);
    
    expect(hash).toBeDefined();
    const retrieved = storage.get('b1');
    expect(retrieved?.data.toString()).toBe('kraken-ink');
  });

  it('should verify blob integrity', () => {
    const storage = new L5BlobStorage();
    const data = Buffer.from('integrity-check');
    storage.store('b2', data);
    
    expect(storage.verify('b2')).toBe(true);
    
    // Manual corruption simulation
    const blob = storage.get('b2');
    if (blob) {
      (blob as any).data = Buffer.from('corrupted');
    }
    expect(storage.verify('b2')).toBe(false);
  });
});
