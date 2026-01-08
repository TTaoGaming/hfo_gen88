/**
 * Stryker Mutation Testing Config - Silver Tier
 * @provenance hfo-testing-promotion/6.1-6.3
 * Validates: Requirements 6.1, 6.2, 6.3
 */
export default {
  packageManager: 'npm',
  reporters: ['html', 'clear-text', 'progress'],
  testRunner: 'vitest',
  vitest: {
    configFile: 'vitest.silver.config.ts',
  },
  mutate: [
    'hot_obsidian_sandbox/silver/ledger/**/*.ts',
    'hot_obsidian_sandbox/silver/schemas/**/*.ts',
    'hot_obsidian_sandbox/silver/fitness/**/*.ts',
    'hot_obsidian_sandbox/silver/concurrency/**/*.ts',
    'hot_obsidian_sandbox/silver/model-client/**/*.ts',
    '!hot_obsidian_sandbox/silver/**/*.test.ts',
    '!hot_obsidian_sandbox/silver/**/*.property.ts',
  ],
  ignorePatterns: [
    'node_modules',
    '.venv',
    '.git',
    '.stryker-tmp',
    'cold_obsidian_sandbox',
    '**/*.html',
  ],
  disableTypeChecks: 'hot_obsidian_sandbox/silver/**/*.ts',
  thresholds: {
    high: 80,
    low: 60,
    break: 80,  // Fail if mutation score < 80%
  },
  concurrency: 4,
  timeoutMS: 10000,
  tempDirName: '.stryker-tmp',
};
