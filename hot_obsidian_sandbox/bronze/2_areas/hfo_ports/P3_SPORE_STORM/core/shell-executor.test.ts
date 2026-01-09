/**
 * P3 Sub 4: Shell Executor Test
 * @provenance hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P3_SPORE_STORM/core/shell-executor.test.ts
 */

import { describe, it, expect } from 'vitest';
import { ShellExecutor } from './shell-executor.js';

describe('ShellExecutor', () => {
  it('should execute a simple command', () => {
    const executor = new ShellExecutor();
    const result = executor.execute('echo "HELLO"');
    expect(result.success).toBe(true);
    expect(result.output.trim()).toBe('"HELLO"');
  });

  it('should handle errors', () => {
    const executor = new ShellExecutor();
    const result = executor.execute('invalid_command_xyz');
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
