export default {
  packageManager: 'npm',
  reporters: ['html', 'clear-text', 'progress'],
  testRunner: 'vitest',
  testRunner_static_config: {
    config: 'vitest.root.config.ts',
  },
  coverageAnalysis: 'perTest',
  mutate: [
    'hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P1_WEB_WEAVER/**/*.ts',
    '!hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P1_WEB_WEAVER/**/*.test.ts',
    '!hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P1_WEB_WEAVER/contracts/*.ts',
  ],
  tempDirName: '.stryker-tmp-p1',
  ignorePatterns: [
    '**/*',
    '!package.json',
    '!tsconfig.json',
    '!vitest.root.config.ts',
    '!hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P1_WEB_WEAVER/**',
  ],
};
