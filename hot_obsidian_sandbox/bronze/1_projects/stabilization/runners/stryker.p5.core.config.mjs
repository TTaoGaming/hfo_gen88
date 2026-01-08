/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
/**
 * P5 PYRE PRAETORIAN Core - Mutation Testing Config
 * @port 5
 * @target path-classifier.ts (PARA: 2_areas/hfo_ports)
 * @timeout 60s (fast feedback)
 */
export default {
  packageManager: "npm",
  reporters: ["clear-text", "progress", "json"],
  testRunner: "vitest",
  coverageAnalysis: "perTest",
  
  // Target only the new core module
  mutate: [
    "hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P5_PYRE_PRAETORIAN/core/path-classifier.ts"
  ],
  
  // Ignore everything except what we need
  ignorePatterns: [
    "cold_obsidian_sandbox/**",
    ".venv/**",
    ".git/**",
    ".stryker-tmp/**",
    ".stryker-tmp-*/**",
    "node_modules/**",
    "hot_obsidian_sandbox/bronze/1_projects/**",
    "hot_obsidian_sandbox/bronze/3_resources/**",
    "hot_obsidian_sandbox/bronze/4_archive/**",
    "hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P0_*/**",
    "hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P1_*/**",
    "hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P2_*/**",
    "hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P3_*/**",
    "hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P4_*/**",
    "hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P6_*/**",
    "hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P7_*/**",
    "hot_obsidian_sandbox/silver/**",
    "hot_obsidian_sandbox/gold/**",
    "reports/**",
    "audit/**"
  ],
  
  vitest: {
    configFile: "vitest.p4p5.core.config.ts"
  },
  
  // Fast timeout for quick feedback
  timeoutMS: 60000,
  timeoutFactor: 1.5,
  maxTestRunnerReuse: 20,
  concurrency: 2,
  
  // Ignore static code
  ignoreStatic: true,
  
  // Disable type checking for HTML files
  disableTypeChecks: "**/*.{ts,tsx}",
  
  tempDirName: ".stryker-tmp-p5-core",
  cleanTempDir: "always",
  
  jsonReporter: {
    fileName: "reports/mutation-p5-core.json"
  }
};
