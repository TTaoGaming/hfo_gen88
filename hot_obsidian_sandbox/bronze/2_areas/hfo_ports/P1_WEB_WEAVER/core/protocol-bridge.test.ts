import { describe, it, expect } from 'vitest';
import { ProtocolBridge } from './protocol-bridge';
import { z } from 'zod';

describe('P1_WEB_WEAVER Sub 0: Protocol Bridge', () => {
  const bridge = new ProtocolBridge();
  const schema = z.object({ id: z.string(), val: z.number() });

  it('should pass valid data through the bridge', () => {
    const data = { id: 'test', val: 123 };
    const result = bridge.bridge(data, schema);
    expect(result).toEqual(data);
  });

  it('should throw error on invalid data with detailed message', () => {
    const data = { id: 123, val: 'not-a-number' }; // Both invalid
    expect(() => bridge.bridge(data, schema)).toThrow(/Expected string, received number, Expected number, received string/);
  });
});
