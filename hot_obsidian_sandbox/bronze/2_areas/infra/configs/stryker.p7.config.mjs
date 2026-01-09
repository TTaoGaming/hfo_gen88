export default {
  packageManager: 'npm',
  reporters: ['html', 'clear-text', 'progress'],
  testRunner: 'vitest',
  vitest: {
    configFile: 'vitest.root.config.ts',
  },
  coverageAnalysis: 'perTest',
  mutate: [
    'hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P7_SPIDER_SOVEREIGN/**/*.ts',
    '!hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P7_SPIDER_SOVEREIGN/**/*.test.ts',
    '!hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P7_SPIDER_SOVEREIGN/contracts/*.ts',
    '!**/node_modules/**',
  ],
  tempDirName: '.stryker-tmp-p7',
  ignorePatterns: [
    'node_modules',
    '.venv',
    '.git',
    '.stryker-tmp*',
    'cold_obsidian_sandbox',
    '**/*.html',
  ],
};
