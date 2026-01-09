/**
 * Vitest config for SCREAM mutation testing
 * Excludes tests that require external files (blackboard)
 */
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: [
      'contracts/**/*.test.ts',
      'contracts/**/*.property.test.ts',
      'detectors/**/*.test.ts',
      'core/**/*.test.ts',
      'core/**/*.property.test.ts',
    ],
    exclude: [
      '**/node_modules/**',
      '**/hive_agent_rules.test.ts',
      '**/RED_REGNANT.test.ts',
      '**/RED_REGNANT.integration.test.ts',
      '**/*.integration.test.ts',
    ],
    globals: true,
  },
});
