export default {
  mutate: [
    'hot_obsidian_sandbox/silver/**/*.ts',
    'hot_obsidian_sandbox/bronze/**/*.ts',
    '!**/*.test.ts',
    '!**/*.spec.ts',
    '!hot_obsidian_sandbox/bronze/scripts/*.ts'
  ],
  testRunner: 'vitest',
  reporters: ['progress', 'clear-text', 'html'],
  coverageAnalysis: 'perTest',
  vitest: {
    configFile: 'hot_obsidian_sandbox/bronze/infra/vitest.config.ts'
  },
  forceChecker: true,
  tempDirName: '.stryker-tmp',
  ignorePatterns: [
    'cold_obsidian_sandbox/**',
    '.git/**',
    'node_modules/**',
    '.stryker-tmp/**'
  ]
};
