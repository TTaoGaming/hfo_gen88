import { describe, it, expect } from 'vitest';
import { MDPPolicy } from './mdp-policy';

describe('P7-SUB-2: MDP Policy', () => {
  it('should initialize values and set actions', () => {
    const config = { states: ['s1', 's2'], actions: ['a1', 'a2'], gamma: 0.9 };
    const mdp = new MDPPolicy(config);
    
    mdp.updateValue('s1', 100);
    mdp.setBestAction('s1', 'a1');
    
    expect(mdp.getValue('s1')).toBe(100);
    expect(mdp.getAction('s1')).toBe('a1');
  });
});
