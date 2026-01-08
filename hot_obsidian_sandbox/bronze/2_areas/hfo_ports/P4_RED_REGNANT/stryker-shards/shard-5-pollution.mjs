/** Shard 5: SCREAM_POLLUTION (Port 5 - Pyre Praetorian) */
export default {
  packageManager: 'npm',
  reporters: ['json', 'clear-text'],
  testRunner: 'vitest',
  coverageAnalysis: 'perTest',
  vitest: { configFile: 'vitest.screams.config.ts' },
  mutate: ['detectors/pollution.ts'],
  ignoreStatic: true,
  timeoutMS: 60000,
  concurrency: 2,
  tempDirName: '.stryker-tmp-shard5',
  jsonReporter: { fileName: 'reports/shard-5-pollution.json' },
};
