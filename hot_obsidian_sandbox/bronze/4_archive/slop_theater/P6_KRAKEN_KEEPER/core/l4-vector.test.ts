import { describe, it, expect } from 'vitest';
import { L4VectorStore } from './l4-vector';

describe('P6-SUB-3: L4 Vector Store', () => {
  it('should store and retrieve vectors', () => {
    const store = new L4VectorStore();
    const vec = { id: 'v1', dimensions: [1, 0, 0] };
    store.upsert(vec);
    expect(store.get('v1')).toEqual(vec);
  });

  it('should calculate similarity and search', () => {
    const store = new L4VectorStore();
    store.upsert({ id: 'v1', dimensions: [1, 0, 0] });
    store.upsert({ id: 'v2', dimensions: [0, 1, 0] });
    
    const results = store.search([0.9, 0.1, 0], 1);
    expect(results[0].id).toBe('v1');
    
    const sim = store.similarity([1, 0], [1, 0]);
    expect(sim).toBe(1);
  });
});
