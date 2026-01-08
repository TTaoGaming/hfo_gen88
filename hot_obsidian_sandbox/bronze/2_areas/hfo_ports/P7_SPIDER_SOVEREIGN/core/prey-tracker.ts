/**
 * P7-SUB-7: PREY
 * Purpose: Tactical Execution and target tracking for the HFO system.
 */

import { z } from 'zod';

export const TargetSchema = z.object({
  id: z.string(),
  priority: z.number(),
  metadata: z.record(z.any()).default({}),
  locked: z.boolean().default(false),
});

export type Target = z.infer<typeof TargetSchema>;

export class PreyTracker {
  private targets: Target[] = [];

  acquire(target: Omit<Target, 'locked'>): void {
    this.targets.push({ ...target, locked: true });
  }

  release(id: string): void {
    const t = this.targets.find(target => target.id === id);
    if (t) t.locked = false;
  }

  getActiveTargets(): Target[] {
    return this.targets.filter(t => t.locked);
  }
}
