/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  _comment: "Root Stryker config for HFO Gen 88",
  packageManager: "npm",
  reporters: ["html", "clear-text", "progress", "json"],
  htmlReporter: {
    fileName: "hot_obsidian_sandbox/bronze/infra/reports/mutation/mutation.html"
  },
  jsonReporter: {
    fileName: "hot_obsidian_sandbox/bronze/infra/reports/mutation/mutation.json"
  },
  testRunner: "vitest",
  coverageAnalysis: "off",
  ignorePatterns: [
    "**/*",
    "!hot_obsidian_sandbox/silver/P0_LIDLESS_LEGION/**",
    "!hot_obsidian_sandbox/silver/P1_WEB_WEAVER/**",
    "!hot_obsidian_sandbox/silver/P2_MIRROR_MAGUS/**",
    "!hot_obsidian_sandbox/silver/P3_SPORE_STORM/**",
    "!hot_obsidian_sandbox/silver/P4_RED_REGNANT/**",
    "!hot_obsidian_sandbox/silver/P5_PYRE_PRAETORIAN/**",
    "!hot_obsidian_sandbox/silver/P6_KRAKEN_KEEPER/**",
    "!hot_obsidian_sandbox/silver/P7_SPIDER_SOVEREIGN/**",
    "!hot_obsidian_sandbox/bronze/contracts/**",
    "!hot_obsidian_sandbox/bronze/scripts/**",
    "!hot_obsidian_sandbox/bronze/tests/**",
    "!hot_obsidian_sandbox/bronze/adapters/**",
    "!hot_obsidian_sandbox/**/*.test.ts",
    "!hot_obsidian_sandbox/bronze/infra/package.json",
    "!hot_obsidian_sandbox/bronze/infra/tsconfig.json",
    "!hot_obsidian_sandbox/bronze/*.md",
    "!package.json",
    "!stryker.root.config.mjs",
    "!vitest.root.config.ts",
    "!.gitignore"
  ],
  mutate: [
    "hot_obsidian_sandbox/silver/P0_LIDLESS_LEGION/searcher.ts",
    "hot_obsidian_sandbox/silver/P1_WEB_WEAVER/bridger.ts",
    "hot_obsidian_sandbox/silver/P4_RED_REGNANT/grudge_keeper.ts",
    "hot_obsidian_sandbox/silver/P4_RED_REGNANT/physic_scream.ts",
    "hot_obsidian_sandbox/silver/P4_RED_REGNANT/chaos_injector.ts",
    "hot_obsidian_sandbox/silver/P4_RED_REGNANT/POLICY.ts",
    "hot_obsidian_sandbox/silver/P4_RED_REGNANT/reward_hack_detector.ts",
    "hot_obsidian_sandbox/silver/P5_PYRE_PRAETORIAN/pyre_dance.ts",
    "hot_obsidian_sandbox/silver/P6_KRAKEN_KEEPER/kraken-adapter.ts",
    "hot_obsidian_sandbox/silver/P7_SPIDER_SOVEREIGN/navigator.ts",
    "hot_obsidian_sandbox/silver/P7_SPIDER_SOVEREIGN/durable_workflow.ts",
    "hot_obsidian_sandbox/silver/contracts/envelope.ts"
  ],
  vitest: {
    configFile: "vitest.root.config.ts"
  },
  tempDirName: ".stryker-tmp",
  cleanTempDir: true
};
