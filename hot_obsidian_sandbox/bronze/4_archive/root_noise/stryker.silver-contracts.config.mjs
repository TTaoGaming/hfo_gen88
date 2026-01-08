/**
 * Stryker config for Silver P4 Contracts
 * @tier SILVER
 * @artifact P4_RED_REGNANT/contracts
 */
export default {
  packageManager: 'npm',
  reporters: ['html', 'clear-text', 'progress', 'json'],
  testRunner: 'vitest',
  vitest: {
    configFile: 'vitest.config.ts',
  },
  coverageAnalysis: 'perTest',
  mutate: [
    'hot_obsidian_sandbox/silver/2_areas/P4_RED_REGNANT/contracts/index.ts',
  ],
  tempDirName: '.stryker-tmp-silver-contracts',
  ignorePatterns: [
    '**/*',
    '!package.json',
    '!package-lock.json',
    '!tsconfig.json',
    '!vitest.config.ts',
    '!node_modules/**',
    '!hot_obsidian_sandbox/silver/**',
  ],
  jsonReporter: {
    fileName: 'reports/mutation/silver-contracts.json',
  },
  htmlReporter: {
    fileName: 'reports/mutation/silver-contracts.html',
  },
  timeoutMS: 30000,
  concurrency: 4,
};
