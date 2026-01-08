/** 
 * @type {import('@stryker-mutator/api/core').PartialStrykerOptions} 
 * 
 * 🛡️ SAFETY TRIPWIRES - Gen 88 Canalization
 * 
 * CLASS 2: Slow Integration Tests (8 minute timeout)
 * 
 * This config runs mutation testing against integration tests that:
 * - Test I/O operations (fs, child_process)
 * - May have longer execution times
 * - Need extended timeouts to prevent false "timeout" kills
 * 
 * Run separately: npx stryker run -c stryker.p4.integration.config.mjs
 */
export default {
  packageManager: "npm",
  reporters: ["html", "clear-text", "progress", "json"],
  testRunner: "vitest",
  coverageAnalysis: "perTest",
  mutate: [
    "hot_obsidian_sandbox/bronze/P4_RED_REGNANT/RED_REGNANT.ts"
  ],
  ignorePatterns: [
    "cold_obsidian_sandbox/**",
    "hot_obsidian_sandbox/bronze/archive_jan_5/**",
    "hot_obsidian_sandbox/bronze/quarantine/**",
    "hot_obsidian_sandbox/bronze/P0_GESTURE_MONOLITH/**",
    ".git/**",
    ".venv/**",
    "node_modules/**",
    ".stryker-tmp/**",
    "reports/**"
  ],
  vitest: {
    configFile: "vitest.p4.integration.config.ts"
  },
  tempDirName: ".stryker-tmp-p4-int",
  cleanTempDir: "always",
  
  // ═══════════════════════════════════════════════════════════════════════════
  // 🛡️ CLASS 2: Slow Tests (8 minute timeout)
  // ═══════════════════════════════════════════════════════════════════════════
  
  timeoutMS: 480000,          // 8 minutes for slow integration tests
  timeoutFactor: 1.5,         // Allow 50% buffer
  maxTestRunnerReuse: 5,      // Restart more frequently for I/O tests
  concurrency: 1,             // Single thread to prevent I/O race conditions
  
  disableBail: false,
  ignoreStatic: true,
  
  jsonReporter: {
    fileName: "hot_obsidian_sandbox/bronze/infra/reports/mutation/mutation-p4-integration.json"
  },
  htmlReporter: {
    fileName: "hot_obsidian_sandbox/bronze/infra/reports/mutation/html-p4-integration/index.html"
  }
};
