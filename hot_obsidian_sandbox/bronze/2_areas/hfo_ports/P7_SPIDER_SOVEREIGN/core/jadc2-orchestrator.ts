/**
 * P7-SUB-4: JADC2
 * Purpose: Joint All-Domain Command and Control for cross-port orchestration.
 */

import { z } from 'zod';

export const CommandSchema = z.object({
  id: z.string(),
  targetPort: z.number(),
  action: z.string(),
  priority: z.number().default(1),
  status: z.enum(['PENDING', 'SENT', 'ACKNOWLEDGED', 'COMPLETED']).default('PENDING'),
});

export type Command = z.infer<typeof CommandSchema>;

export class JADC2Orchestrator {
  private commandQueue: Command[] = [];

  issue(command: Omit<Command, 'status'>): Command {
    const fullCommand: Command = { ...command, status: 'PENDING' };
    this.commandQueue.push(fullCommand);
    return fullCommand;
  }

  acknowledge(id: string): void {
    const cmd = this.commandQueue.find(c => c.id === id);
    if (cmd) cmd.status = 'ACKNOWLEDGED';
  }

  getPending(): Command[] {
    return this.commandQueue.filter(c => c.status !== 'COMPLETED');
  }
}
