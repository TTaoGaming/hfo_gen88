/**
 * QUICK MUTATION TEST CONFIG
 * Ultra-aggressive timeouts for fast feedback
 * Use for smoke testing mutation setup
 */
export default {
  packageManager: "npm",
  reporters: ["clear-text", "json"],
  testRunner: "vitest",
  coverageAnalysis: "off",  // Skip coverage for speed
  mutate: ["hot_obsidian_sandbox/bronze/contracts/receipt-hash.ts"],  // Small file
  ignorePatterns: ["cold_obsidian_sandbox/**", ".git/**", ".venv/**", "node_modules/**", ".stryker-tmp*/**"],
  vitest: { configFile: "vitest.mutation.config.ts" },
  tempDirName: ".stryker-tmp-quick",
  cleanTempDir: "always",
  timeoutMS: 2000,
  timeoutFactor: 1.2,
  concurrency: 1,
  maxTestRunnerReuse: 5,
  disableBail: true,
  jsonReporter: { fileName: "hot_obsidian_sandbox/bronze/infra/stryker/quick-report.json" }
};
