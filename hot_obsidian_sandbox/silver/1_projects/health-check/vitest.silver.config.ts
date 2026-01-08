/**
 * Silver Tier Health Check - Vitest Config
 * 
 * @tier SILVER
 * @purpose Periodic verification of Silver artifacts
 * @ports 1, 4, 5
 * 
 * Run: npx vitest run --config hot_obsidian_sandbox/silver/1_projects/health-check/vitest.silver.config.ts
 */
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: [
      // P1 WEB WEAVER Silver tests
      'hot_obsidian_sandbox/silver/2_areas/P1_WEB_WEAVER/*.test.ts',
      'hot_obsidian_sandbox/silver/2_areas/P1_WEB_WEAVER/*.property.test.ts',
      // P4 RED REGNANT Silver tests
      'hot_obsidian_sandbox/silver/2_areas/P4_RED_REGNANT/core/*.test.ts',
      'hot_obsidian_sandbox/silver/2_areas/P4_RED_REGNANT/core/*.property.test.ts',
      // P5 PYRE PRAETORIAN Silver tests
      'hot_obsidian_sandbox/silver/2_areas/P5_PYRE_PRAETORIAN/core/*.test.ts',
      'hot_obsidian_sandbox/silver/2_areas/P5_PYRE_PRAETORIAN/core/*.property.test.ts',
    ],
    globals: true,
    environment: 'node',
    testTimeout: 30000,
    watch: false,
  },
  resolve: {
    alias: {
      '@silver': './hot_obsidian_sandbox/silver',
    },
  },
});
