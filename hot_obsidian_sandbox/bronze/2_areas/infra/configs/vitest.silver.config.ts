/**
 * Vitest Config - Silver Tier Testing
 * @provenance hfo-testing-promotion/7.1
 * Validates: Requirements 7.1, 7.2
 */
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: [
      'hot_obsidian_sandbox/silver/**/*.test.ts',
      'hot_obsidian_sandbox/silver/**/*.property.ts',
    ],
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: ['hot_obsidian_sandbox/silver/**/*.ts'],
      exclude: ['**/*.test.ts', '**/*.property.ts'],
    },
    // Property test configuration
    testTimeout: 30000, // Allow time for 100+ iterations
  },
});
