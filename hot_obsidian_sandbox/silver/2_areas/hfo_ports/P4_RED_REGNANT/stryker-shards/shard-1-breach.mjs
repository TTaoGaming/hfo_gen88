/** Shard 1: SCREAM_BREACH (Port 1 - Web Weaver) */
export default {
  packageManager: 'npm',
  reporters: ['json', 'clear-text'],
  testRunner: 'vitest',
  coverageAnalysis: 'perTest',
  vitest: { configFile: 'vitest.screams.config.ts' },
  mutate: ['detectors/breach.ts'],
  ignoreStatic: true,
  timeoutMS: 60000,
  concurrency: 2,
  tempDirName: '.stryker-tmp-shard1',
  jsonReporter: { fileName: 'reports/shard-1-breach.json' },
};
