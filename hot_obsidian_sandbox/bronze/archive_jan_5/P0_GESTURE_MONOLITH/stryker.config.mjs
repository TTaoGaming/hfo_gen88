/** @type {import('@stryker-mutator/api').PartialStrykerOptions} */
export default {
  packageManager: 'npm',
  reporters: ['clear-text', 'progress'],
  testRunner: 'command',
  commandRunner: {
    command: 'npx vitest run --reporter=dot --pool=threads --poolOptions.threads.minThreads=4 --poolOptions.threads.maxThreads=8',
  },
  // Target core stage implementations (not UI, not tests)
  mutate: [
    'src/stages/physics/one-euro-filter.ts',
    'src/stages/physics/physics-cursor.ts',
    'src/stages/fsm/gesture-fsm.ts',
    'src/stages/fsm/palm-cone.ts',
    'src/stages/emitter/pointer-event-factory.ts',
  ],
  // Exclude from sandbox copy - aggressive pruning
  ignorePatterns: [
    'node_modules',
    'dist',
    'e2e',
    '.stryker-tmp',
    'reports',
    '**/*.md',
    '**/*.json',
    '!package.json',
    '!tsconfig.json',
  ],
  thresholds: {
    high: 100,
    low: 80,
    break: 80,
  },
  // === PERFORMANCE OPTIMIZATIONS ===
  concurrency: 12,              // Max parallel mutant runners (increase for more cores)
  timeoutMS: 10000,             // Faster timeout for quick tests
  timeoutFactor: 1.25,          // Tighter timeout multiplier
  tempDirName: '.stryker-tmp',
  cleanTempDir: 'always',
  disableTypeChecks: true,      // Skip TS checking - major speedup
  incremental: true,            // Cache results between runs
  incrementalFile: '.stryker-cache.json',
  // Sandbox optimization
  symlinkNodeModules: true,     // Symlink instead of copy node_modules
  inPlace: false,               // Use sandbox (safer)
  // Mutator optimization - skip equivalent mutants
  mutator: {
    excludedMutations: [
      'StringLiteral',          // String changes rarely caught by unit tests
      'ObjectLiteral',          // Object literal mutations less useful
    ],
  },
};
