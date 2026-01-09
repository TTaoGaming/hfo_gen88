import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    env: {
      HFO_TEST_MODE: 'true'
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
      'hot_obsidian_sandbox/bronze/P0_GESTURE_MONOLITH/**',
      'hot_obsidian_sandbox/bronze/demoted_silver/**',
      'hot_obsidian_sandbox/bronze/adapters/**',
      'hot_obsidian_sandbox/bronze/tests/**',
      'hot_obsidian_sandbox/bronze/1_projects/**',
      // 'hot_obsidian_sandbox/bronze/2_areas/**', // DISABLED FOR STABILIZATION RUNS
      'hot_obsidian_sandbox/bronze/P4_PYRE_PRAETORIAN/test_root_mutation/**',
    ],
    alias: {
      'zod': resolve(process.cwd(), 'node_modules/zod'),
    },
  },
  resolve: {
    extensionAlias: {
      '.js': ['.ts', '.js'],
    },
  },
});
