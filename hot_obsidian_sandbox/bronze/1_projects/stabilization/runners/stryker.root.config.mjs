/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  _comment: "Root Stryker config for HFO Gen 88",
  packageManager: "npm",
  reporters: ["html", "clear-text", "progress", "json"],
  htmlReporter: {
    fileName: "hot_obsidian_sandbox/bronze/infra/reports/mutation/mutation.html"
  },
  jsonReporter: {
    fileName: "hot_obsidian_sandbox/bronze/infra/reports/mutation/mutation.json"
  },
  testRunner: "vitest",
  coverageAnalysis: "perTest",
  mutate: [
    "hot_obsidian_sandbox/bronze/P4_RED_REGNANT/RED_REGNANT.ts",
    "hot_obsidian_sandbox/bronze/P5_PYRE_PRAETORIAN/PYRE_DANCE.ts"
  ],
  files: [
    "hot_obsidian_sandbox/bronze/P4_RED_REGNANT/**/*",
    "hot_obsidian_sandbox/bronze/P5_PYRE_PRAETORIAN/**/*",
    "hot_obsidian_sandbox/bronze/infra/**/*",
    "vitest.harness.config.ts",
    "package.json"
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
    configFile: "vitest.harness.config.ts"
  },
  tempDirName: ".stryker-tmp",
  cleanTempDir: true
};
