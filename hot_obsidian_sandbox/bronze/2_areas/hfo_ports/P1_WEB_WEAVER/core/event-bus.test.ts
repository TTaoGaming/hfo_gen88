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

  it('should support multiple subscribers to the same event', () => {
    const bus = new EventBus();
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    
    bus.subscribe('EVENT', handler1);
    bus.subscribe('EVENT', handler2);
    bus.publish('EVENT', 'payload');
    
    expect(handler1).toHaveBeenCalledWith('payload');
    expect(handler2).toHaveBeenCalledWith('payload');
  });

  it('should handle events with no subscribers gracefully', () => {
    const bus = new EventBus();
    expect(() => bus.publish('UNKNOWN', {})).not.toThrow();
  });
});
