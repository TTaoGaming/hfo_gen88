import { describe, it, expect } from 'vitest';
import { L6GraphStore } from './l6-graph';

describe('P6-SUB-5: L6 Graph Store', () => {
  it('should add nodes and create edges', () => {
    const graph = new L6GraphStore();
    graph.addNode({ id: 'n1', type: 'Subject', properties: {} });
    graph.addNode({ id: 'n2', type: 'Object', properties: {} });
    graph.addEdge({ from: 'n1', to: 'n2', relation: 'OBSERVES', weight: 1.0 });

    const neighbors = graph.getNeighbors('n1');
    expect(neighbors).toContain('n2');
  });

  it('should filter nodes by type', () => {
    const graph = new L6GraphStore();
    graph.addNode({ id: 'n1', type: 'User', properties: {} });
    graph.addNode({ id: 'n2', type: 'Agent', properties: {} });
    
    const agents = graph.query('Agent');
    expect(agents.length).toBe(1);
    expect(agents[0].id).toBe('n2');
  });
});
