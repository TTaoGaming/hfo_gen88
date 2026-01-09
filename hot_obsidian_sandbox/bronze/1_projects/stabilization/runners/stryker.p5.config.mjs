/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  packageManager: "npm",
  reporters: ["html", "clear-text", "progress", "json"],
  testRunner: "vitest",
  coverageAnalysis: "perTest",
  mutate: [
    "hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P5_PYRE_PRAETORIAN/PYRE_DANCE.ts"
  ],
  files: [
    "hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P5_PYRE_PRAETORIAN/PYRE_DANCE.ts",
    "hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P5_PYRE_PRAETORIAN/PHOENIX_CONTRACTS.ts",
    "hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P5_PYRE_PRAETORIAN/RED_BLUE_DANCE.test.ts",
    "hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P4_RED_REGNANT/RED_REGNANT.ts",
    "hot_obsidian_sandbox/bronze/1_projects/stabilization/runners/vitest.harness.config.ts",
    "package.json"
  ],
  vitest: {
    configFile: "hot_obsidian_sandbox/bronze/1_projects/stabilization/runners/vitest.harness.config.ts"
  },
  tempDirName: ".stryker-tmp-p5",
  cleanTempDir: true,
  timeoutMS: 15000,
  maxTestRunnerReuse: 10,
  jsonReporter: {
    fileName: "hot_obsidian_sandbox/bronze/infra/reports/mutation/mutation-p5.json"
  },
  htmlReporter: {
    baseDir: "hot_obsidian_sandbox/bronze/infra/reports/mutation/html-p5"
  }
};
