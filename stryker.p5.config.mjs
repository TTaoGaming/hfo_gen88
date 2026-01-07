/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  packageManager: "npm",
  reporters: ["html", "clear-text", "progress", "json"],
  testRunner: "vitest",
  coverageAnalysis: "perTest",
  mutate: [
    "hot_obsidian_sandbox/bronze/P5_PYRE_PRAETORIAN/PYRE_PRAETORIAN.ts"
  ],
  files: [
    "hot_obsidian_sandbox/bronze/P5_PYRE_PRAETORIAN/PYRE_PRAETORIAN.ts",
    "hot_obsidian_sandbox/bronze/P5_PYRE_PRAETORIAN/PYRE_PRAETORIAN.test.ts",
    "vitest.harness.config.ts",
    "package.json"
  ],
  vitest: {
    configFile: "vitest.harness.config.ts"
  },
  tempDirName: ".stryker-tmp-p5",
  cleanTempDir: true,
  timeoutMS: 15000,
  maxTestRunnerReuse: 10,
  jsonReporter: {
    fileName: "hot_obsidian_sandbox/bronze/infra/reports/mutation/mutation.json"
  },
  htmlReporter: {
    baseDir: "hot_obsidian_sandbox/bronze/infra/reports/mutation/html"
  }
};
