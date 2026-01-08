import { describe, it, expect } from 'vitest';
import { HiveMind } from './hive-mind';

describe('P7-SUB-6: Hive Mind', () => {
  it('should manage proposals and consensus', () => {
    const hive = new HiveMind();
    hive.createProposal('p1', 'Scale L1 Cache', 2);
    
    hive.vote('p1');
    expect(hive.getProposal('p1')?.status).toBe('OPEN');
    
    hive.vote('p1');
    expect(hive.getProposal('p1')?.status).toBe('PASSED');
  });
});
