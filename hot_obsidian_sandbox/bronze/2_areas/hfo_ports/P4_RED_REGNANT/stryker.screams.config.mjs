/**
 * Stryker Config for P4 Red Regnant 8 SCREAM Detectors
 * 
 * Runs mutation testing on all 8 SCREAM detectors + contracts + aggregator
 * Target: Goldilocks range (80-98.99%)
 */
export default {
  packageManager: 'npm',
  reporters: ['html', 'clear-text', 'progress', 'json'],
  testRunner: 'vitest',
  coverageAnalysis: 'perTest',
  vitest: {
    configFile: 'vitest.screams.config.ts',
  },
  mutate: [
    // Contracts
    'contracts/screams.ts',
    'contracts/detector.ts',
    // All 8 detectors
    'detectors/blindspot.ts',
    'detectors/breach.ts',
    'detectors/theater.ts',
    'detectors/phantom.ts',
    'detectors/mutation.ts',
    'detectors/pollution.ts',
    'detectors/amnesia.ts',
    'detectors/lattice.ts',
    // Core
    'core/score-classifier.ts',
    'core/scream-aggregator.ts',
  ],
  ignoreStatic: true,
  timeoutMS: 60000,
  concurrency: 4,
  tempDirName: '.stryker-tmp-screams',
  jsonReporter: {
    fileName: 'mutation-screams-report.json',
  },
};
