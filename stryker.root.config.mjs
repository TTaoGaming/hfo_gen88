export default {
  mutate: [
    'hot_obsidian_sandbox/silver/P7_SPIDER_SOVEREIGN/navigator.ts'
  ],
  testRunner: 'vitest',
  reporters: ['progress', 'clear-text', 'html'],
  coverageAnalysis: 'perTest',
  vitest: {
    configFile: 'hot_obsidian_sandbox/bronze/infra/vitest.config.ts'
  },
  tempDirName: '.stryker-tmp',
  ignorePatterns: [
    'cold_obsidian_sandbox/**',
    '.git/**',
    'node_modules/**',
    '.stryker-tmp/**',
    'reports/**'
  ]
};
