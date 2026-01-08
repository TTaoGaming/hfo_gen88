/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  packageManager: "npm",
  reporters: ["clear-text", "progress", "json"],
  jsonReporter: {
    fileName: "reports/mutation/silver_mutation.json"
  },
  testRunner: "vitest",
  coverageAnalysis: "perTest",
  mutate: [
    "../../silver/P4_RED_REGNANT/red_regnant_mutation_scream.ts"
  ],
  vitest: {
    configFile: "vitest.config.ts"
  },
  tempDirName: ".stryker-tmp-silver",
  cleanTempDir: true
};
