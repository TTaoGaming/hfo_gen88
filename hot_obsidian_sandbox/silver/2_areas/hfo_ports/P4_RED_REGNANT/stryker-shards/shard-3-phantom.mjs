/** Shard 3: SCREAM_PHANTOM (Port 3 - Spore Storm) */
export default {
  packageManager: 'npm',
  reporters: ['json', 'clear-text'],
  testRunner: 'vitest',
  coverageAnalysis: 'perTest',
  vitest: { configFile: 'vitest.screams.config.ts' },
  mutate: ['detectors/phantom.ts'],
  ignoreStatic: true,
  timeoutMS: 60000,
  concurrency: 2,
  tempDirName: '.stryker-tmp-shard3',
  jsonReporter: { fileName: 'reports/shard-3-phantom.json' },
};
