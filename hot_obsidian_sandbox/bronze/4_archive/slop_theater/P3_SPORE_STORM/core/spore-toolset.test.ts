/**
 * P3 Sub 7: Spore Toolset Test
 * @provenance hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P3_SPORE_STORM/core/spore-toolset.test.ts
 */

import { describe, it, expect } from 'vitest';
import { SporeToolset } from './spore-toolset.js';

describe('SporeToolset', () => {
  it('should calculate checksum', () => {
    const tools = new SporeToolset();
    const sum = tools.checksum('test');
    expect(sum).toBeDefined();
    expect(typeof sum).toBe('string');
  });

  it('should format log', () => {
    const tools = new SporeToolset();
    const log = tools.formatLog('Spore Landing');
    expect(log).toContain('[SPORE_STORM]');
    expect(log).toContain('Spore Landing');
  });
});
