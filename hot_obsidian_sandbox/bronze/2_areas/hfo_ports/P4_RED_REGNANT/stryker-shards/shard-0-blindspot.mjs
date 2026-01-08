/** Shard 0: SCREAM_BLINDSPOT (Port 0 - Lidless Legion) */
export default {
  packageManager: 'npm',
  reporters: ['json', 'clear-text'],
  testRunner: 'vitest',
  coverageAnalysis: 'perTest',
  vitest: { configFile: 'vitest.screams.config.ts' },
  mutate: ['detectors/blindspot.ts'],
  ignoreStatic: true,
  timeoutMS: 60000,
  concurrency: 2,
  tempDirName: '.stryker-tmp-shard0',
  jsonReporter: { fileName: 'reports/shard-0-blindspot.json' },
};
