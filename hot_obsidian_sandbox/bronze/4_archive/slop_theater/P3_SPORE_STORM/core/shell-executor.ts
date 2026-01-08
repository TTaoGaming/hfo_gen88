/**
 * P3 Sub 4: Shell Executor
 * @provenance hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P3_SPORE_STORM/core/shell-executor.ts
 * "The command is issued, the intent is realized. Kinetic projection."
 */

import { execSync } from 'node:child_process';

/**
 * Shell Executor - Responsible for executing delivered kinetic commands.
 */
export class ShellExecutor {
  /**
   * Execute a command and return the result.
   */
  execute(command: string): { success: boolean; output: string; error?: string } {
    try {
      const output = execSync(command, { encoding: 'utf8' });
      return { success: true, output };
    } catch (e) {
      return { 
        success: false, 
        output: '', 
        error: (e as Error).message 
      };
    }
  }

  /**
   * Execute a script file.
   */
  executeScript(scriptPath: string): { success: boolean; output: string; error?: string } {
    return this.execute(`node ${scriptPath}`);
  }
}
