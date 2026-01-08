/**
 * P5 Sub 5: Proof of Verification
 * @provenance hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P5_PYRE_PRAETORIAN/core/proof-of-verification.ts
 * "To state is not to be. Show the proof or remain a ghost."
 */

export interface CommanderProof {
  port: number;
  commander: string;
  density: number; // 0-8
  subParts: {
    name: string;
    status: 'conceptual' | 'property-tested' | 'mutation-goldilock' | 'silverized';
  }[];
  isIncarnated: boolean;
}

/**
 * Proof of Verification (PoV) Engine.
 * Calculates the Incarnation Density of each Commander.
 */
export class ProofOfVerification {
  /**
   * Verifies the proof for a commander based on directory state and manifests.
   */
  verify(port: number, subPartStatuses: ('C' | 'P' | 'M' | 'S')[]): CommanderProof {
    const density = subPartStatuses.length;
    const isIncarnated = density === 8 && subPartStatuses.every(s => s !== 'C');

    return {
      port,
      commander: `PORT_${port}`,
      density,
      subParts: subPartStatuses.map((s, i) => ({
        name: `Sub_${i}`,
        status: this.mapStatus(s)
      })),
      isIncarnated
    };
  }

  private mapStatus(s: 'C' | 'P' | 'M' | 'S') {
    switch (s) {
      case 'C': return 'conceptual';
      case 'P': return 'property-tested';
      case 'M': return 'mutation-goldilock';
      case 'S': return 'silverized';
    }
  }
}
