export default {
  mutate: [
    '../../silver/**/*.ts',
    '../../bronze/**/*.ts',
    '!../../**/*.test.ts',
    '!../../**/*.spec.ts',
    '!../../bronze/scripts/*.ts'
  ],
  testRunner: 'vitest',
  reporters: ['progress', 'clear-text', 'html'],
  coverageAnalysis: 'perTest',
  vitest: {
    configFile: 'vitest.config.ts'
  },
  forceChecker: true,
  tempDirName: '.stryker-tmp'
};
