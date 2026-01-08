/** Shard 4: SCREAM_MUTATION (Port 4 - Red Regnant) */
export default {
  packageManager: 'npm',
  reporters: ['json', 'clear-text'],
  testRunner: 'vitest',
  coverageAnalysis: 'perTest',
  vitest: { configFile: 'vitest.screams.config.ts' },
  mutate: ['detectors/mutation.ts'],
  ignoreStatic: true,
  timeoutMS: 60000,
  concurrency: 2,
  tempDirName: '.stryker-tmp-shard4',
  jsonReporter: { fileName: 'reports/shard-4-mutation.json' },
};
