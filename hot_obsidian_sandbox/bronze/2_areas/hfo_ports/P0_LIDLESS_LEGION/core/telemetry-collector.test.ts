import { describe, it, expect } from 'vitest';
import { TelemetryCollector } from './telemetry-collector';

describe('P0_LIDLESS_LEGION Sub 0: Telemetry Collector', () => {
  const collector = new TelemetryCollector();

  it('should collect frames and store in buffer', () => {
    const frame = collector.collect('test-source', 42);
    expect(frame.source).toBe('test-source');
    expect(frame.value).toBe(42);
    expect(collector.getHistory()).toContain(frame);
  });

  it('should maintain a max buffer size', () => {
    for (let i = 0; i < 110; i++) {
      collector.collect('bench', i);
    }
    expect(collector.getHistory().length).toBe(100);
  });
});
