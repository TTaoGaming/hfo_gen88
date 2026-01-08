/**
 * P7-SUB-6: HIVE
 * Purpose: Strategic Hive Mind for consensus and collective intelligence.
 */

import { z } from 'zod';

export const ProposalSchema = z.object({
  id: z.string(),
  description: z.string(),
  votes: z.number().default(0),
  threshold: z.number().default(5),
  status: z.enum(['OPEN', 'PASSED', 'FAILED']).default('OPEN'),
});

export type Proposal = z.infer<typeof ProposalSchema>;

export class HiveMind {
  private proposals: Map<string, Proposal> = new Map();

  createProposal(id: string, description: string, threshold: number): void {
    this.proposals.set(id, { id, description, threshold, votes: 0, status: 'OPEN' });
  }

  vote(id: string): void {
    const p = this.proposals.get(id);
    if (p && p.status === 'OPEN') {
      p.votes += 1;
      if (p.votes >= p.threshold) {
        p.status = 'PASSED';
      }
    }
  }

  getProposal(id: string): Proposal | undefined {
    return this.proposals.get(id);
  }
}
