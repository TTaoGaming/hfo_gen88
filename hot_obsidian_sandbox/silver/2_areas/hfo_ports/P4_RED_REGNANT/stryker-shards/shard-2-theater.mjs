/** Shard 2: SCREAM_THEATER (Port 2 - Mirror Magus) */
export default {
  packageManager: 'npm',
  reporters: ['json', 'clear-text'],
  testRunner: 'vitest',
  coverageAnalysis: 'perTest',
  vitest: { configFile: 'vitest.screams.config.ts' },
  mutate: ['detectors/theater.ts'],
  ignoreStatic: true,
  timeoutMS: 60000,
  concurrency: 2,
  tempDirName: '.stryker-tmp-shard2',
  jsonReporter: { fileName: 'reports/shard-2-theater.json' },
};
