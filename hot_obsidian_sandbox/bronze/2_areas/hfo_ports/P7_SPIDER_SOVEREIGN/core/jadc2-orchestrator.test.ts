import { describe, it, expect } from 'vitest';
import { JADC2Orchestrator } from './jadc2-orchestrator';

describe('P7-SUB-4: JADC2 Orchestrator', () => {
  it('should issue and acknowledge commands', () => {
    const jadc2 = new JADC2Orchestrator();
    const cmd = jadc2.issue({ id: 'cmd-1', targetPort: 6, action: 'FLUSH_L1', priority: 10 });
    
    expect(cmd.status).toBe('PENDING');
    expect(jadc2.getPending().length).toBe(1);
    
    jadc2.acknowledge('cmd-1');
    expect(jadc2.getPending()[0].status).toBe('ACKNOWLEDGED');
  });
});
