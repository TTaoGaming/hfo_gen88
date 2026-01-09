import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P1_WEB_WEAVER/**/*.test.ts'],
    exclude: ['**/4_archive/**'],
    testTimeout: 5000,
    hookTimeout: 5000,
    bail: 1,
    passWithNoTests: false,
  },
  resolve: {
    extensionAlias: {
      '.js': ['.ts', '.js'],
    },
  },
});
