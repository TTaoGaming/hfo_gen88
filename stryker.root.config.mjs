/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  _comment: "Root Stryker config for HFO Gen 88",
  packageManager: "npm",
  reporters: ["html", "clear-text", "progress"],
  htmlReporter: {
    fileName: "hot_obsidian_sandbox/bronze/infra/reports/mutation/mutation.html"
  },
  testRunner: "vitest",
  coverageAnalysis: "off",
  ignorePatterns: [
    "**/*",
    "!hot_obsidian_sandbox/silver/P0_LIDLESS_LEGION/searcher.ts",
    "!hot_obsidian_sandbox/silver/P0_LIDLESS_LEGION/searcher.test.ts",
    "!hot_obsidian_sandbox/silver/P1_WEB_WEAVER/bridger.ts",
    "!hot_obsidian_sandbox/silver/P1_WEB_WEAVER/bridger.test.ts",
    "!hot_obsidian_sandbox/silver/P7_SPIDER_SOVEREIGN/navigator.ts",
    "!hot_obsidian_sandbox/silver/P7_SPIDER_SOVEREIGN/navigator.test.ts",
    "!hot_obsidian_sandbox/silver/P7_SPIDER_SOVEREIGN/durable_workflow.ts",
    "!hot_obsidian_sandbox/silver/P7_SPIDER_SOVEREIGN/durable_workflow.test.ts",
    "!hot_obsidian_sandbox/bronze/adapters/kraken-adapter.ts",
    "!hot_obsidian_sandbox/bronze/adapters/kraken-adapter.test.ts",
    "!hot_obsidian_sandbox/bronze/infra/package.json",
    "!hot_obsidian_sandbox/bronze/infra/vitest.config.ts",
    "!hot_obsidian_sandbox/bronze/infra/tsconfig.json",
    "!package.json",
    "!stryker.root.config.mjs",
    "!vitest.root.config.ts"
  ],
  mutate: [
    "hot_obsidian_sandbox/silver/P0_LIDLESS_LEGION/searcher.ts",
    "hot_obsidian_sandbox/silver/P1_WEB_WEAVER/bridger.ts",
    "hot_obsidian_sandbox/silver/P7_SPIDER_SOVEREIGN/navigator.ts",
    "hot_obsidian_sandbox/silver/P7_SPIDER_SOVEREIGN/durable_workflow.ts",
    "hot_obsidian_sandbox/bronze/adapters/kraken-adapter.ts"
  ],
  vitest: {
    configFile: "vitest.root.config.ts"
  },
  tempDirName: ".stryker-tmp",
  cleanTempDir: true
};
