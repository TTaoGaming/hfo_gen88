import { describe, it, expect } from 'vitest';
import { FileWatcher } from './file-watcher';

describe('P0_LIDLESS_LEGION Sub 2: File Watcher', () => {
  const watcher = new FileWatcher();

  it('should detect violations in forbidden paths', () => {
    watcher.notify({ path: 'root/illegal.txt', type: 'CREATE' });
    watcher.notify({ path: 'hot_obsidian_sandbox/safe.ts', type: 'CREATE' });

    const violations = watcher.getViolations(['root/']);
    expect(violations).toHaveLength(1);
    expect(violations[0].path).toBe('root/illegal.txt');
  });
});
