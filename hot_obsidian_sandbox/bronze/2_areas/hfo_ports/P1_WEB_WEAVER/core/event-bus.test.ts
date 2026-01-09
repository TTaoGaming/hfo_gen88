import { describe, it, expect, vi } from 'vitest';
import { EventBus } from './event-bus';

describe('P1_WEB_WEAVER Sub 5: Event Bus', () => {
  it('should publish and subscribe to events', () => {
    const bus = new EventBus();
    const handler = vi.fn();
    
    bus.subscribe('SENSE_PEAK', handler);
    bus.publish('SENSE_PEAK', { val: 100 });
    
    expect(handler).toHaveBeenCalledWith({ val: 100 });
  });

  it('should handle events with no subscribers gracefully', () => {
    const bus = new EventBus();
    expect(() => bus.publish('UNKNOWN', {})).not.toThrow();
  });
});
