/**
 * Vitest config for P4/P5 Core Mutation Testing
 * @ports 4, 5
 * @target score-classifier.ts, path-classifier.ts
 * 
 * Runs ONLY the core module tests for fast mutation feedback.
 */
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: [
      // P4 core tests
      'hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P4_RED_REGNANT/core/score-classifier.test.ts',
      'hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P4_RED_REGNANT/core/score-classifier.property.test.ts',
      // P5 core tests
      'hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P5_PYRE_PRAETORIAN/core/path-classifier.test.ts',
      'hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P5_PYRE_PRAETORIAN/core/path-classifier.property.test.ts',
    ],
    globals: true,
    environment: 'node',
    testTimeout: 30000,
    // Disable watch mode for mutation testing
    watch: false,
  },
  resolve: {
    alias: {
      '@': './hot_obsidian_sandbox/bronze',
    },
  },
});
