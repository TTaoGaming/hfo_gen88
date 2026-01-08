import { describe, it, expect } from 'vitest';
import { L8ColdStorage } from './l8-cold';

describe('P6-SUB-7: L8 Cold Storage', () => {
  it('should freeze and thaw state', () => {
    const storage = new L8ColdStorage();
    const state = { temperature: -50, pressure: 'high' };
    storage.freeze('core-1', state);
    
    // Modify original object
    state.temperature = 20;
    
    const thawed = storage.thaw('core-1');
    expect(thawed?.state.temperature).toBe(-50);
  });

  it('should handle versioning', () => {
    const storage = new L8ColdStorage();
    storage.freeze('v', { val: 1 });
    storage.freeze('v', { val: 2 });
    
    expect(storage.getHistory('v').length).toBe(2);
    expect(storage.thaw('v', 1)?.state.val).toBe(1);
    expect(storage.thaw('v', 2)?.state.val).toBe(2);
  });
});
