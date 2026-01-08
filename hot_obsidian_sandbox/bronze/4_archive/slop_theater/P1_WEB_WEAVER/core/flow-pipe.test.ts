import { describe, it, expect } from 'vitest';
import { FlowPipe } from './flow-pipe';

describe('P1_WEB_WEAVER Sub 6: Flow Pipe', () => {
  it('should chain operations in sequence', () => {
    const result = FlowPipe.start(10)
      .pipe(n => n * 2)
      .pipe(n => n + 5)
      .pipe(n => `Result: ${n}`)
      .execute();

    expect(result).toBe('Result: 25');
  });
});
