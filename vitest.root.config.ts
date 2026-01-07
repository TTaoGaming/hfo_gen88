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
      'hot_obsidian_sandbox/silver/**/*.test.ts',
      'hot_obsidian_sandbox/bronze/**/*.test.ts',
      'hot_obsidian_sandbox/bronze/P4_RED_REGNANT/**/*.test.ts',
      'hot_obsidian_sandbox/bronze/tests/**/*.test.ts'
    ],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.stryker-tmp/**', 'cold_obsidian_sandbox/**'],
    alias: {
      'zod': resolve(__dirname, 'node_modules/zod'),
      'duckdb': resolve(__dirname, 'node_modules/duckdb'),
    },
  },
  resolve: {
    extensionAlias: {
      '.js': ['.ts', '.js'],
    },
  },
});
