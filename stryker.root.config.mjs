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
  ignorePatterns: [
    "**/*",
    "!hot_obsidian_sandbox/silver/P4_RED_REGNANT/**",
    "!hot_obsidian_sandbox/bronze/P4_RED_REGNANT/**",
    "!hot_obsidian_sandbox/silver/P5_PYRE_PRAETORIAN/**",
    "!hot_obsidian_sandbox/bronze/P4_RED_REGNANT/**",
    "!hot_obsidian_sandbox/bronze/contracts/**",
    "!hot_obsidian_sandbox/bronze/scripts/**",
    "!hot_obsidian_sandbox/bronze/tests/**",
    "!hot_obsidian_sandbox/bronze/adapters/**",
    "!hot_obsidian_sandbox/**/*.test.ts",
    "!package.json",
    "!stryker.root.config.mjs",
    "!vitest.root.config.ts",
    "!.gitignore"
  ],
  mutate: [
    "hot_obsidian_sandbox/silver/P4_RED_REGNANT/mutation_scream.ts"
  ],
  vitest: {
    configFile: "vitest.root.config.ts"
  },
  tempDirName: ".stryker-tmp",
  cleanTempDir: true
};
