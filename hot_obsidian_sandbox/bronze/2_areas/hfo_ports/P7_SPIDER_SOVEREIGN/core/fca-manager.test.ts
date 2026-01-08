import { describe, it, expect } from 'vitest';
import { FCAManager } from './fca-manager';

describe('P7-SUB-3: FCA Manager', () => {
  it('should extract concepts and check fit', () => {
    const manager = new FCAManager();
    const concept = manager.extractConcept(['agent1', 'agent2'], ['can-sense', 'can-move']);
    
    expect(manager.fits(['can-sense', 'can-move', 'can-talk'], concept)).toBe(true);
    expect(manager.fits(['can-sense'], concept)).toBe(false);
  });
});
