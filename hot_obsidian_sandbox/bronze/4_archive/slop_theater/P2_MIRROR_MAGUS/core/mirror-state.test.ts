import { describe, it, expect } from 'vitest';
import { MirrorStateMachine } from './mirror-state';

describe('P2_MIRROR_MAGUS Sub 6: Mirror State', () => {
  it('should manage lifecycle transitions', () => {
    const fsm = new MirrorStateMachine();
    
    expect(fsm.getState()).toBe('IDLE');
    
    fsm.transition('START');
    expect(fsm.getState()).toBe('TRACKING');
    
    fsm.transition('STOP');
    expect(fsm.getState()).toBe('COOLING');
    
    fsm.transition('RESET');
    expect(fsm.getState()).toBe('IDLE');
  });
});
