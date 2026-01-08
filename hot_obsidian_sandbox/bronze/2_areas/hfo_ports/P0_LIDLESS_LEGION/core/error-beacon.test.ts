import { describe, it, expect } from 'vitest';
import { ErrorBeacon } from './error-beacon';

describe('P0_LIDLESS_LEGION Sub 7: Error Beacon', () => {
  const beacon = new ErrorBeacon();

  it('should capture error signals', () => {
    const sig = beacon.beacon(new Error('Test Crash'), 'FATAL');
    expect(sig.message).toBe('Test Crash');
    expect(sig.severity).toBe('FATAL');
    expect(beacon.getSignals()).toContain(sig);
  });
});
