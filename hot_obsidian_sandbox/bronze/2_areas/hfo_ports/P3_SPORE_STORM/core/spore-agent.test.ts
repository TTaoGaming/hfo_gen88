/**
 * P3 Sub 6: Spore Agent Test
 * @provenance hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P3_SPORE_STORM/core/spore-agent.test.ts
 */

import { describe, it, expect } from 'vitest';
import { SporeAgent, AgentTask } from './spore-agent.js';

describe('SporeAgent', () => {
  it('should run tasks and return results', () => {
    const agent = new SporeAgent('spore-001');
    const tasks: AgentTask[] = [
      { id: 't1', action: 'SCAN', target: './' },
      { id: 't2', action: 'CLEANUP', target: './tmp' }
    ];

    const result = agent.run(tasks);
    expect(result.id).toBe('spore-001');
    expect(result.results).toHaveLength(2);
    expect(result.results[0].status).toBe('completed');
  });
});
