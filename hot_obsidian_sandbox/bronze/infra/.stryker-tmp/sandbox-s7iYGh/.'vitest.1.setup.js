
    import path from 'path';

    import { beforeEach, afterAll, beforeAll, afterEach } from 'vitest';

    const ns = globalThis.__stryker__ || (globalThis.__stryker__ = {});
    
      ns.activeMutant = undefined;
      function collectTestName({ name, suite }) {
    const nameParts = [name];
    let currentSuite = suite;
    while (currentSuite) {
        nameParts.unshift(currentSuite.name);
        currentSuite = currentSuite.suite;
    }
    return nameParts.join(' ').trim();
}
      function toRawTestId(test) {
    return `${test.file?.filepath ?? 'unknown.js'}#${collectTestName(test)}`;
}
  
      beforeEach((a) => {
        ns.currentTestId = toRawTestId(a.meta ?? a.task);
      });

      afterEach(() => {
        ns.currentTestId = undefined;
      });
  
      afterAll(async (suite) => {
        suite.meta.mutantCoverage = ns.mutantCoverage;
      });