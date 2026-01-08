import { describe, it, expect } from 'vitest';
import { ModuleRegistry } from './module-registry';

describe('P1_WEB_WEAVER Sub 3: Module Registry', () => {
  const registry = new ModuleRegistry();

  it('should register and retrieve modules', () => {
    const mod = { port: 4, commander: 'Red Regnant', entry: './P4.ts' };
    registry.register(mod);
    expect(registry.getModule(4)).toEqual(mod);
  });

  it('should throw on duplicate ports', () => {
    const mod = { port: 4, commander: 'Another', entry: './A.ts' };
    expect(() => registry.register(mod)).toThrow(/already registered/);
  });

  it('should list registered ports', () => {
    expect(registry.listPorts()).toContain(4);
  });
});
