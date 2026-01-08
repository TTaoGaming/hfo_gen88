import { describe, it, expect } from 'vitest';
import { NetworkSniffer } from './network-sniffer';

describe('P0_LIDLESS_LEGION Sub 3: Network Sniffer', () => {
  const sniffer = new NetworkSniffer();

  it('should identify core services by port', () => {
    const p4 = sniffer.sniff(4);
    expect(p4.service).toBe('RED_REGNANT');
    expect(p4.active).toBe(true);

    const p99 = sniffer.sniff(99);
    expect(p99.service).toBe('UNKNOWN');
  });
});
