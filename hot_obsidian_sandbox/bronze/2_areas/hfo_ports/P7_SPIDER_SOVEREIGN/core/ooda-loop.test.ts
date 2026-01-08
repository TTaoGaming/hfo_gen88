import { describe, it, expect } from 'vitest';
import { OODALoop } from './ooda-loop';

describe('P7-SUB-0: OODA Loop', () => {
  it('should initialize and transition phases', () => {
    const loop = new OODALoop('strategic-1 ');
    expect(loop.getCurrent().phase).toBe('OBSERVE');
    
    loop.transition('ORIENT', { detected: 'anomaly' });
    expect(loop.getCurrent().phase).toBe('ORIENT');
    expect(loop.getCurrent().payload.detected).toBe('anomaly');
  });
});
