/**
 * P7-SUB-2: MDP
 * Purpose: Markov Decision Process (MDP) for policy evaluation and rewards.
 */

import { z } from 'zod';

export const MDPSchema = z.object({
  states: z.array(z.string()),
  actions: z.array(z.string()),
  gamma: z.number().default(0.9), // Discount factor
});

export type MDPConfig = z.infer<typeof MDPSchema>;

export class MDPPolicy {
  private values: Map<string, number> = new Map();
  private policy: Map<string, string> = new Map();

  constructor(private config: MDPConfig) {
    config.states.forEach(s => this.values.set(s, 0));
  }

  updateValue(state: string, newValue: number): void {
    this.values.set(state, newValue);
  }

  setBestAction(state: string, action: string): void {
    this.policy.set(state, action);
  }

  getValue(state: string): number {
    return this.values.get(state) || 0;
  }

  getAction(state: string): string | undefined {
    return this.policy.get(state);
  }
}
