/** Shard 7: SCREAM_LATTICE (Port 7 - Spider Sovereign) */
export default {
  packageManager: 'npm',
  reporters: ['json', 'clear-text'],
  testRunner: 'vitest',
  coverageAnalysis: 'perTest',
  vitest: { configFile: 'vitest.screams.config.ts' },
  mutate: ['detectors/lattice.ts'],
  ignoreStatic: true,
  timeoutMS: 60000,
  concurrency: 2,
  tempDirName: '.stryker-tmp-shard7',
  jsonReporter: { fileName: 'reports/shard-7-lattice.json' },
};
