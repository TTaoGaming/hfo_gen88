export default {
  packageManager: "npm",
  reporters: ["clear-text", "progress", "json"],
  jsonReporter: {
    fileName: "reports/mutation/mutation.json"
  },
  testRunner: "vitest",
  coverageAnalysis: "perTest",
  mutate: ["../P4_RED_REGNANT/red_regnant_mutation_scream.ts"],
  vitest: {
    configFile: "vitest.config.ts"
  },
  tempDirName: ".stryker-tmp-p4",
  cleanTempDir: true
};
