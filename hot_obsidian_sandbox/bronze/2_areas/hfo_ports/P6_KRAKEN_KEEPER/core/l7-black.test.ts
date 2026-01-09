import { describe, it, expect } from 'vitest';
import { L7BlackStorage } from './l7-black';

describe('P6-SUB-6: L7 Black Storage', () => {
  it('should encrypt and decrypt secrets', () => {
    const storage = new L7BlackStorage('master-key-32-chars-long-abc-123');
    storage.encrypt('s1', 'extremely-sensitive-data');
    
    const decrypted = storage.decrypt('s1');
    expect(decrypted).toBe('extremely-sensitive-data');
  });

  it('should return undefined for missing secrets', () => {
    const storage = new L7BlackStorage();
    expect(storage.decrypt('missing')).toBeUndefined();
  });
});
