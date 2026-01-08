/**
 * Vitest config for P4 Red Regnant Stryker mutation testing
 * 
 * 🛡️ SAFETY TRIPWIRES - Gen 88 Canalization
 * 
 * This config is optimized for mutation testing with safety timeouts:
 * - Class 1 (Fast): Unit tests, property tests = 60s timeout
 * - Class 2 (Slow): Integration tests EXCLUDED to prevent freezes
 * 
 * Integration tests (RED_REGNANT.integration.test.ts) are excluded because:
 * 1. They test I/O operations (fs, child_process) which are slow
 * 2. Stryker mutates code that can cause infinite loops in I/O
 * 3. They are tested separately with longer timeouts
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
    // CLASS 1: Fast Tests Only (60s timeout in Stryker)
    // ═══════════════════════════════════════════════════════════════════════
    include: [
      // P4 Red Regnant - Unit and Property tests only
      'hot_obsidian_sandbox/bronze/P4_RED_REGNANT/RED_REGNANT.test.ts',
      'hot_obsidian_sandbox/bronze/P4_RED_REGNANT/RED_REGNANT.property.test.ts',
      'hot_obsidian_sandbox/bronze/P4_RED_REGNANT/debug.test.ts',
      'hot_obsidian_sandbox/bronze/P4_RED_REGNANT/hive_agent_rules.test.ts',
      'hot_obsidian_sandbox/bronze/P4_RED_REGNANT/test_root_mutation/**/*.test.ts',
      'hot_obsidian_sandbox/bronze/P4_RED_REGNANT/silver_sim/**/*.test.ts',
      // Contracts that P4 depends on
      'hot_obsidian_sandbox/bronze/P4_RED_REGNANT/contracts/**/*.test.ts',
    ],
    
    // ═══════════════════════════════════════════════════════════════════════
    // CLASS 2: Slow Tests EXCLUDED (would need 480s timeout)
    // ═══════════════════════════════════════════════════════════════════════
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.stryker-tmp*/**',
      '**/quarantine/**',
      // CRITICAL: Exclude integration tests - they have I/O and can freeze
      'hot_obsidian_sandbox/bronze/P4_RED_REGNANT/RED_REGNANT.integration.test.ts',
    ],
    
    // Per-test timeout (Class 1 = 60s)
    testTimeout: 60000,
    hookTimeout: 30000,
    
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
