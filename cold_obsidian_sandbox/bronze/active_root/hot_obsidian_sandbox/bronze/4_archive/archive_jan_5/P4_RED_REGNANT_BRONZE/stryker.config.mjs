/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  _comment: "Isolated Stryker config for Port 4 (Red Regnant)",
  packageManager: "npm",
  reporters: ["clear-text", "progress", "json"],
  jsonReporter: {
    fileName: "mutation.json"
  },
  testRunner: "vitest",
  coverageAnalysis: "perTest",
  mutate: [
    "psychic_scream.ts"
  ],
  vitest: {
    configFile: "vitest.config.ts"
  },
  tempDirName: ".stryker-tmp",
  cleanTempDir: true,
  concurrency: 4
};
