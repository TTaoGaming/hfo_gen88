/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  _comment: "Stryker config for HFO Gen 88",
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
    "!../P4_RED_REGNANT/psychic_scream.ts",
    "!../P4_RED_REGNANT/psychic_scream.test.ts",
    "!package.json",
    "!vitest.config.ts",
    "!tsconfig.json",
    "!stryker.config.mjs"
  ],
  mutate: [
    "../P4_RED_REGNANT/psychic_scream.ts"
  ],
  vitest: {
    configFile: "vitest.config.ts"
  },
  tempDirName: ".stryker-tmp",
  cleanTempDir: true
};
