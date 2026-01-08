/**
 * P6-SUB-7: L8 COLD
 * Purpose: Frozen, immutable storage for long-term historical archives.
 */

import { z } from 'zod';

export const SnapshotSchema = z.object({
  id: z.string(),
  state: z.any(),
  frozenAt: z.string(),
  version: z.number(),
});

export type Snapshot = z.infer<typeof SnapshotSchema>;

export class L8ColdStorage {
  private archives: Map<string, Snapshot[]> = new Map();

  freeze(id: string, state: any): Snapshot {
    const history = this.archives.get(id) || [];
    const snapshot: Snapshot = {
      id,
      state: JSON.parse(JSON.stringify(state)), // Deep clone to freeze
      frozenAt: new Date().toISOString(),
      version: history.length + 1,
    };
    history.push(snapshot);
    this.archives.set(id, history);
    return snapshot;
  }

  thaw(id: string, version?: number): Snapshot | undefined {
    const history = this.archives.get(id);
    if (!history) return undefined;
    if (version !== undefined) {
      return history.find(s => s.version === version);
    }
    return history[history.length - 1];
  }

  getHistory(id: string): Snapshot[] {
    return this.archives.get(id) || [];
  }
}
