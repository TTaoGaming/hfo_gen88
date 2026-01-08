/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  packageManager: "npm",
  reporters: ["clear-text", "progress", "json"],
  testRunner: "vitest",
  coverageAnalysis: "perTest",
  mutate: ["hot_obsidian_sandbox/bronze/P6_KRAKEN_KEEPER/contracts/index.ts"],
  ignorePatterns: ["cold_obsidian_sandbox/**", "hot_obsidian_sandbox/bronze/archive*/**", "hot_obsidian_sandbox/bronze/quarantine/**", ".git/**", ".venv/**", "node_modules/**", ".stryker-tmp*/**"],
  vitest: { configFile: "vitest.mutation.config.ts" },
  tempDirName: ".stryker-tmp-p6",
  cleanTempDir: "always",
  timeoutMS: 5000,
  timeoutFactor: 1.5,
  concurrency: 2,
  maxTestRunnerReuse: 10,
  disableBail: true,
  jsonReporter: { fileName: "hot_obsidian_sandbox/bronze/P6_KRAKEN_KEEPER/mutation-report.json" }
};
