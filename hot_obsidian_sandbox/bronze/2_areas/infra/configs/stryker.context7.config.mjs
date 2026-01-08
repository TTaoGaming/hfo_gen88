/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  packageManager: "npm",
  reporters: ["clear-text", "progress", "json"],
  testRunner: "vitest",
  coverageAnalysis: "perTest",
  mutate: ["hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P0_LIDLESS_LEGION/sensors/Context7Sensor.ts"],
  ignorePatterns: [
    "cold_obsidian_sandbox/**", 
    "hot_obsidian_sandbox/bronze/archive*/**", 
    "hot_obsidian_sandbox/bronze/quarantine/**", 
    ".git/**", 
    ".venv/**", 
    "node_modules/**", 
    ".stryker-tmp*/**"
  ],
  vitest: { configFile: "vitest.context7.config.ts" },
  tempDirName: ".stryker-tmp-context7",
  cleanTempDir: "always",
  timeoutMS: 5000,
  timeoutFactor: 1.5,
  concurrency: 2,
  maxTestRunnerReuse: 10,
  disableBail: true,
  jsonReporter: { fileName: "reports/mutation/context7-report.json" }
};
