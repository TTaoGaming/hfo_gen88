/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  packageManager: "npm",
  reporters: ["clear-text", "progress", "json"],
  testRunner: "vitest",
  coverageAnalysis: "perTest",
  mutate: ["hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P1_WEB_WEAVER/contracts/index.ts"],
  ignorePatterns: [
    "cold_obsidian_sandbox/**",
    "**/4_archive/**",
    "**/quarantine/**",
    "**/hfo_ports/P0_**",
    "**/hfo_ports/P2_**",
    "**/hfo_ports/P3_**",
    "**/hfo_ports/P4_**",
    "**/hfo_ports/P5_**",
    "**/hfo_ports/P6_**",
    "**/hfo_ports/P7_**",
    ".git/**",
    "**/.venv/**",
    "node_modules/**",
    "**/.stryker-tmp*/**"
  ],
  vitest: { 
    configFile: "vitest.p1.mutation.config.ts"
  },
  tempDirName: ".stryker-tmp-p1",
  cleanTempDir: "always",
  timeoutMS: 5000,
  timeoutFactor: 1.5,
  concurrency: 2,
  maxTestRunnerReuse: 10,
  disableBail: true,
  jsonReporter: { fileName: "hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P1_WEB_WEAVER/mutation-report.json" }
};
