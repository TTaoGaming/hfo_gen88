/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  packageManager: "npm",
  reporters: ["html", "clear-text", "progress", "json"],
  testRunner: "vitest",
  coverageAnalysis: "perTest",
  mutate: [
    "hot_obsidian_sandbox/bronze/P4_RED_REGNANT/RED_REGNANT.ts"
  ],
  ignorePatterns: [
    "cold_obsidian_sandbox",
    "cold_obsidian_sandbox/**/*",
    "hot_obsidian_sandbox/bronze/archive_jan_5/**",
    "hot_obsidian_sandbox/bronze/archive_2026_1_6/**",
    "hot_obsidian_sandbox/bronze/quarantine/**",
    "hot_obsidian_sandbox/bronze/provenance/**",
    "hot_obsidian_sandbox/bronze/1_projects/**",
    "hot_obsidian_sandbox/bronze/2_areas/**",
    "hot_obsidian_sandbox/bronze/4_archive/**",
    "hot_obsidian_sandbox/bronze/artifacts/**",
    "hot_obsidian_sandbox/bronze/exemplars/**",
    "hot_obsidian_sandbox/bronze/gen88_hand_off_document_for_gen89/**",
    "hot_obsidian_sandbox/bronze/HANDOFF_ANALYSIS_CONSOLIDATED/**",
    "hot_obsidian_sandbox/bronze/hfo_vertical_slice_2026_1_6/**",
    "hot_obsidian_sandbox/bronze/kiro_gen89_vertical_spike_summary/**",
    "hot_obsidian_sandbox/bronze/map-elite/**",
    "hot_obsidian_sandbox/bronze/P0_GESTURE_MONOLITH/**",
    ".git/**",
    ".venv/**",
    "node_modules/**",
    ".stryker-tmp/**",
    "reports/**"
  ],
  vitest: {
    configFile: "vitest.p4.stryker.config.ts"
  },
  tempDirName: ".stryker-tmp",
  cleanTempDir: "always",
  
  // ═══════════════════════════════════════════════════════════════════════════
  // 🛡️ SAFETY TRIPWIRES - Gen 88 Canalization
  // ═══════════════════════════════════════════════════════════════════════════
  // Class 1 (Fast): Unit tests, property tests, pure functions = 60s timeout
  // Class 2 (Slow): Integration tests with I/O, fs, child_process = 480s timeout
  // 
  // Default timeout is for Class 1 (fast tests)
  // Integration tests are excluded from mutation to prevent freezes
  // ═══════════════════════════════════════════════════════════════════════════
  
  timeoutMS: 60000,           // 1 minute for fast tests (Class 1)
  timeoutFactor: 1.5,         // Allow 50% buffer for slow machines
  maxTestRunnerReuse: 10,     // Restart runner frequently to prevent memory leaks
  concurrency: 2,             // Reduce concurrency to prevent race conditions
  
  // Kill stuck processes aggressively
  disableBail: false,
  
  // Ignore static code that can't be meaningfully mutated
  ignoreStatic: true,
  
  jsonReporter: {
    fileName: "hot_obsidian_sandbox/bronze/infra/reports/mutation/mutation-p4.json"
  },
  htmlReporter: {
    fileName: "hot_obsidian_sandbox/bronze/infra/reports/mutation/html-p4/index.html"
  }
};
