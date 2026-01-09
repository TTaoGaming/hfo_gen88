/** Shard 6: SCREAM_AMNESIA (Port 6 - Kraken Keeper) */
export default {
  packageManager: 'npm',
  reporters: ['json', 'clear-text'],
  testRunner: 'vitest',
  coverageAnalysis: 'perTest',
  vitest: { configFile: 'vitest.screams.config.ts' },
  mutate: ['detectors/amnesia.ts'],
  ignoreStatic: true,
  timeoutMS: 60000,
  concurrency: 2,
  tempDirName: '.stryker-tmp-shard6',
  jsonReporter: { fileName: 'reports/shard-6-amnesia.json' },
};
