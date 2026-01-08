/**
 * P7-SUB-0: OODA
 * Purpose: Observe-Orient-Decide-Act loop logic for strategic decision making.
 */

import { z } from 'zod';

export const OODASchema = z.object({
  id: z.string(),
  phase: z.enum(['OBSERVE', 'ORIENT', 'DECIDE', 'ACT']),
  payload: z.any(),
  timestamp: z.string(),
});

export type OODAState = z.infer<typeof OODASchema>;

export class OODALoop {
  private currentState: OODAState;

  constructor(id: string) {
    this.currentState = {
      id,
      phase: 'OBSERVE',
      payload: {},
      timestamp: new Date().toISOString(),
    };
  }

  transition(phase: OODAState['phase'], payload: any): OODAState {
    this.currentState = {
      ...this.currentState,
      phase,
      payload,
      timestamp: new Date().toISOString(),
    };
    return this.currentState;
  }

  getCurrent(): OODAState {
    return this.currentState;
  }
}
