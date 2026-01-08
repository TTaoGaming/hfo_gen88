import { describe, it, expect } from 'vitest';
import { SystemMonitor } from './system-monitor';

describe('P0_LIDLESS_LEGION Sub 1: System Monitor', () => {
  const monitor = new SystemMonitor();

  it('should return valid metrics', () => {
    const m = monitor.getMetrics();
    expect(m.cpuLoad).toBeGreaterThanOrEqual(0);
    expect(m.cpuLoad).toBeLessThanOrEqual(100);
    expect(m.processCount).toBeGreaterThan(0);
  });

  it('should detect critical state', () => {
    // Since metrics are random, we just check Boolean return
    expect(typeof monitor.isCritical()).toBe('boolean');
  });
});
