import { describe, it, expect } from 'vitest';
import { CodeAnalyzer } from './code-analyzer';

describe('P0_LIDLESS_LEGION Sub 4: Code Analyzer', () => {
  const analyzer = new CodeAnalyzer();

  it('should detect AI Theater patterns', () => {
    const code = `
      function test() {
        // ...existing code...
      }
    `;
    const metrics = analyzer.analyze(code);
    expect(metrics.hasTheater).toBe(true);
  });

  it('should calculate code density', () => {
    const code = "line 1\n\nline 2";
    const metrics = analyzer.analyze(code);
    expect(metrics.density).toBeCloseTo(0.66, 1);
  });
});
