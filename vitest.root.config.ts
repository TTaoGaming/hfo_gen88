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
      'hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P7_SPIDER_SOVEREIGN/**/*.test.ts'
    ],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.stryker-tmp*/**', 'cold_obsidian_sandbox/**', '**/quarantine/**'],
    alias: {
      'zod': resolve(ROOT_DIR, 'node_modules/zod'),
      'duckdb': resolve(ROOT_DIR, 'node_modules/duckdb'),
    },
  },
  resolve: {
    extensionAlias: {
      '.js': ['.ts', '.js'],
    },
  },
});
