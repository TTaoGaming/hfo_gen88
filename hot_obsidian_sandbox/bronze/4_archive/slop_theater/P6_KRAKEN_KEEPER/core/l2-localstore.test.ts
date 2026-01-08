import { describe, it, expect } from 'vitest';
import { L2LocalStore } from './l2-localstore';

describe('P6_KRAKEN_KEEPER Sub 1: L2 LocalStore', () => {
  const store = new L2LocalStore();

  it('should save and fetch data', () => {
    store.save('user', { name: 'Bob' });
    expect(store.fetch('user')).toEqual({ name: 'Bob' });
  });

  it('should export to JSON', () => {
    const json = store.export();
    expect(json).toContain('"name":"Bob"');
  });
});
