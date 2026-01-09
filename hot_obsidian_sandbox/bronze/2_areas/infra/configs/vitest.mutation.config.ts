import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

/**
 * HARDENED MUTATION TESTING CONFIG
 * - Aggressive timeouts to prevent freezing
 * - Isolated test runs
 * - Bail on first failure for faster feedback
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    env: {
      HFO_TEST_MODE: 'true',
      HFO_MUTATION_MODE: 'true'
    },
    include: [
      'hot_obsidian_sandbox/bronze/**/*.test.ts'
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.stryker-tmp*/**',
      'cold_obsidian_sandbox/**',
      '**/quarantine/**',
      '**/archive/**',
      '**/archive_jan_5/**',
      '**/archive_2026_1_6/**',
      'hot_obsidian_sandbox/bronze/P0_GESTURE_MONOLITH/**',
      'hot_obsidian_sandbox/bronze/demoted_silver/**',
      'hot_obsidian_sandbox/bronze/adapters/**',
      'hot_obsidian_sandbox/bronze/tests/**',
      'hot_obsidian_sandbox/bronze/1_projects/**',
      'hot_obsidian_sandbox/bronze/4_archive/**',
      'hot_obsidian_sandbox/bronze/P4_RED_REGNANT/**',
      'hot_obsidian_sandbox/bronze/P4_PYRE_PRAETORIAN/test_root_mutation/**',
      'hot_obsidian_sandbox/bronze/P4_RED_REGNANT/test_root_mutation/**',
      'hot_obsidian_sandbox/bronze/P4_RED_REGNANT/ttv-sensor-fusion.test.ts',
      'hot_obsidian_sandbox/bronze/baton-validator.test.ts',
    ],
    alias: {
      'zod': resolve(__dirname, 'node_modules/zod'),
    },
    // HARDENED TIMEOUT GUARDS
    testTimeout: 3000,      // 3s per test max
    hookTimeout: 2000,      // 2s for setup/teardown
    teardownTimeout: 1000,  // 1s for cleanup
    // ISOLATION
    isolate: true,
    pool: 'forks',          // Use forks for better isolation
    poolOptions: {
      forks: {
        singleFork: false,
        isolate: true
      }
    },
    // FAST FAIL
    bail: 1,                // Stop on first failure (mutation testing)
    passWithNoTests: false,
    // RETRY PROTECTION
    retry: 0,               // No retries in mutation mode
    // REPORTER
    reporter: 'basic',      // Minimal output for speed
  },
  resolve: {
    extensionAlias: {
      '.js': ['.ts', '.js'],
    },
  },
});
