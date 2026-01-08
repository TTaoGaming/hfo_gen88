import { describe, it, expect } from 'vitest';
import { MCTSPlanner } from './mcts-planner';

describe('P7-SUB-1: MCTS Planner', () => {
  it('should build a tree and update scores', () => {
    const planner = new MCTSPlanner();
    planner.addNode({ id: 'root', visits: 0, score: 0, children: ['c1', 'c2'] });
    planner.addNode({ id: 'c1', visits: 0, score: 0, children: [], parentId: 'root' });
    planner.addNode({ id: 'c2', visits: 0, score: 0, children: [], parentId: 'root' });
    
    planner.update('c1', 10);
    planner.update('c2', 5);
    
    expect(planner.getBestAction('root')).toBe('c1');
  });
});
