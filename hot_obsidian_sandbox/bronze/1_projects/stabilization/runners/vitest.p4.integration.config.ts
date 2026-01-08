/**
 * Vitest config for P4 Red Regnant Integration Tests (Stryker)
 * 
 * 🛡️ SAFETY TRIPWIRES - Gen 88 Canalization
 * 
 * CLASS 2: Slow Integration Tests (8 minute timeout)
 * 
 * These tests involve I/O operations and need extended timeouts.
 */
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    env: {
      HFO_TEST_MODE: 'true'
    },
    
    // ═══════════════════════════════════════════════════════════════════════
    // CLASS 2: Integration Tests Only (8 minute timeout in Stryker)
    // ═══════════════════════════════════════════════════════════════════════
    include: [
      'hot_obsidian_sandbox/bronze/P4_RED_REGNANT/RED_REGNANT.integration.test.ts',
    ],
    
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.stryker-tmp*/**',
      '**/quarantine/**',
    ],
    
    // Per-test timeout (Class 2 = 8 minutes)
    testTimeout: 480000,
    hookTimeout: 60000,
    
    alias: {
      'zod': resolve(__dirname, 'node_modules/zod'),
    },
  },
  resolve: {
    extensionAlias: {
      '.js': ['.ts', '.js'],
    },
  },
});
