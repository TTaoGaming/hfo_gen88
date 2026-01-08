import { describe, it, expect } from 'vitest';
import { PreyTracker } from './prey-tracker';

describe('P7-SUB-7: Prey Tracker', () => {
  it('should acquire and release targets', () => {
    const tracker = new PreyTracker();
    tracker.acquire({ id: 'target-alpha', priority: 1, metadata: { type: 'vulnerability' } });
    
    expect(tracker.getActiveTargets().length).toBe(1);
    expect(tracker.getActiveTargets()[0].id).toBe('target-alpha');
    
    tracker.release('target-alpha');
    expect(tracker.getActiveTargets().length).toBe(0);
  });
});
