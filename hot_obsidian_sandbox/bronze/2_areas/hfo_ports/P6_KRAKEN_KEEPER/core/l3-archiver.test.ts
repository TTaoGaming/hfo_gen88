import { describe, it, expect } from 'vitest';
import { L3Archiver } from './l3-archiver';

describe('P6_KRAKEN_KEEPER Sub 2: L3 Archiver', () => {
  const archiver = new L3Archiver();

  it('should generate metadata for an archive task', () => {
    const meta = archiver.archive('bronze/1_projects/slop');
    expect(meta.id).toContain('arch-');
    expect(meta.sourcePath).toBe('bronze/1_projects/slop');
  });

  it('should detect archived paths', () => {
    expect(archiver.isArchived('bronze/4_archive/slop')).toBe(true);
    expect(archiver.isArchived('bronze/1_projects/active')).toBe(false);
  });
});
