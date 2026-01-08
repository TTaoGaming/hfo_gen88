/**
 * 👁️ P0-SUB-3: NETWORK SNIFFER
 * Senses network activity and port occupancy.
 */

export interface NetworkPulse {
  port: number;
  active: boolean;
  service?: string;
}

export class NetworkSniffer {
  /**
   * Senses if a specific port is active (Mocked).
   */
  public sniff(port: number): NetworkPulse {
    const commonPorts: Record<number, string> = {
      0: 'SENSE',
      1: 'FUSE',
      2: 'SHAPE',
      3: 'DELIVER',
      4: 'RED_REGNANT',
      5: 'PYRE_PRAETORIAN',
    };

    return {
      port,
      active: port === 4 || port === 0, // Mock: P4 and P0 always active
      service: commonPorts[port] || 'UNKNOWN',
    };
  }
}
