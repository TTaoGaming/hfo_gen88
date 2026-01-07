/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  _comment: "Stryker config for OBSIDIAN Stigmergy Format",
  packageManager: "npm",
  reporters: ["clear-text", "progress"],
  testRunner: "vitest",
  coverageAnalysis: "perTest",
  mutate: [
    "hot_obsidian_sandbox/bronze/contracts/obsidian-stigmergy.ts"
  ],
  vitest: {
    configFile: "hot_obsidian_sandbox/bronze/contracts/vitest.stryker.config.ts"
  },

  tempDirName: ".stryker-tmp",
  cleanTempDir: true,
  disableTypeChecks: "**/*.{js,ts,jsx,tsx,html,vue,mts,cts}",
  ignorePatterns: [
    "node_modules",
    ".stryker-tmp",
    ".venv",
    "cold_obsidian_sandbox",
    "**/*.md"
  ]
};
