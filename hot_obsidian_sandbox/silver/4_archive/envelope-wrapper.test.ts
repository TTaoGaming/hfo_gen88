import { describe, it, expect } from 'vitest';
import { EnvelopeWrapper } from './envelope-wrapper';

describe('P1_WEB_WEAVER Sub 2: Envelope Wrapper', () => {
  const wrapper = new EnvelopeWrapper();

  it('should wrap payload in a valid KiroEnvelope', () => {
    const payload = { data: 'test' };
    const headers = { source_port: 0, target_port: 1, verb: 'SENSE' };
    const envelope = wrapper.wrap(payload, headers);

    expect(envelope.version).toBe('kiro.1.0');
    expect(envelope.envelope_id).toBeDefined();
    expect(envelope.timestamp).toBeLessThanOrEqual(Date.now());
    expect(envelope.stigmergy.verb).toBe('SENSE');
    expect(envelope.payload).toEqual(payload);
  });

  it('should throw on invalid headers', () => {
    expect(() => wrapper.wrap({}, { source_port: 'invalid' } as any)).toThrow();
  });
});
