// HFO Gen 88 - Port 5 Hardening (Goldilocks Target: 88%)
export default {
  packageManager: "npm",
  reporters: ["html", "clear-text", "progress"],
  testRunner: "vitest",
  vitest: {
    configFile: "hot_obsidian_sandbox/bronze/2_areas/infra/configs/vitest.p5.config.ts"
  },
  coverageAnalysis: "perTest",
  mutate: [
    "hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P5_PYRE_PRAETORIAN/PYRE_DANCE.ts",
    "hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P5_PYRE_PRAETORIAN/RESURRECTION_LOOP.ts"
  ],
  tempDirName: ".stryker-tmp",
  cleanTempDir: true
};
