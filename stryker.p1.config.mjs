/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  packageManager: "npm",
  reporters: ["html", "clear-text", "progress", "json"],
  testRunner: "vitest",
  coverageAnalysis: "perTest",
  mutate: [
    "hot_obsidian_sandbox/bronze/contracts/obsidian-stigmergy.ts",
    "hot_obsidian_sandbox/bronze/P1_BRIDGE_VERIFICATION.ts",
    "hot_obsidian_sandbox/bronze/P1_SYNDICATE_NATS_BRIDGE.ts"
  ],
  vitest: {
    configFile: "vitest.harness.config.ts"
  },
  tempDirName: ".stryker-tmp-p1",
  cleanTempDir: true,
  timeoutMS: 15000,
  jsonReporter: {
    fileName: "hot_obsidian_sandbox/bronze/infra/reports/mutation/mutation-p1.json"
  },
  htmlReporter: {
    baseDir: "hot_obsidian_sandbox/bronze/infra/reports/mutation/html-p1"
  }
};
