/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  _comment: "Stryker config for HFO Gen 88",
  packageManager: "npm",
  reporters: ["html", "clear-text", "progress", "json"],
  htmlReporter: {
    fileName: "hot_obsidian_sandbox/bronze/infra/reports/mutation/mutation.html"
  },
  jsonReporter: {
    fileName: "hot_obsidian_sandbox/bronze/infra/reports/mutation/mutation.json"
  },
  testRunner: "vitest",
  coverageAnalysis: "perTest",
  ignorePatterns: [
    "**/*",
    "!../../silver/P0_LIDLESS_LEGION/searcher.ts",
    "!../../silver/P0_LIDLESS_LEGION/searcher.test.ts",
    "!../../silver/P1_WEB_WEAVER/bridger.ts",
    "!../../silver/P1_WEB_WEAVER/bridger.test.ts",
    "!../../silver/P7_SPIDER_SOVEREIGN/navigator.ts",
    "!../../silver/P7_SPIDER_SOVEREIGN/navigator.test.ts",
    "!../../silver/P7_SPIDER_SOVEREIGN/durable_workflow.ts",
    "!../../silver/P7_SPIDER_SOVEREIGN/durable_workflow.test.ts",
    "!../../silver/P4_RED_REGNANT/envelope.ts",
    "!../../silver/P4_RED_REGNANT/schemas.ts",
    "!../../silver/P4_RED_REGNANT/grudge_keeper.ts",
    "!../../silver/P4_RED_REGNANT/grudge_keeper.test.ts",
    "!../adapters/kraken-adapter.ts",
    "!../adapters/kraken-adapter.test.ts",
    "!package.json",
    "!vitest.config.ts",
    "!tsconfig.json",
    "!stryker.config.mjs"
  ],
  mutate: [
    "../../silver/P0_LIDLESS_LEGION/searcher.ts",
    "../../silver/P1_WEB_WEAVER/bridger.ts",
    "../../silver/P7_SPIDER_SOVEREIGN/navigator.ts",
    "../../silver/P7_SPIDER_SOVEREIGN/durable_workflow.ts",
    "../../silver/P4_RED_REGNANT/grudge_keeper.ts",
    "../adapters/kraken-adapter.ts"
  ],
  vitest: {
    configFile: "vitest.config.ts"
  },
  tempDirName: ".stryker-tmp",
  cleanTempDir: true
};
