import { defineConfig } from 'vitest/config';

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
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.stryker-tmp*/**',
      'cold_obsidian_sandbox/**',
      '**/quarantine/**',
      '**/4_archive/**',
    ],
  },
  resolve: {
    extensionAlias: {
      '.js': ['.ts', '.js'],
    },
  },
});
