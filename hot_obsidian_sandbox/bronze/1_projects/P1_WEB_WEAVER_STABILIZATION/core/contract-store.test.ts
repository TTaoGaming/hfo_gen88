import { describe, it, expect } from 'vitest';
import { ContractStore } from './contract-store';
import { z } from 'zod';

describe('P1_WEB_WEAVER Sub 4: Contract Store', () => {
  const store = new ContractStore();
  const UserSchema = z.object({ name: z.string() });

  it('should register and validate against contracts', () => {
    store.register('User', UserSchema);
    const valid = { name: 'Alice' };
    expect(store.validate('User', valid)).toEqual(valid);
  });

  it('should throw for unknown contracts', () => {
    expect(() => store.get('Unknown')).toThrow(/not found/);
  });
});
