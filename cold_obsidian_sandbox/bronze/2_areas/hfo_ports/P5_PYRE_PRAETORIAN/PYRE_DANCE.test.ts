import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { demote, purge, danceDie } from './PYRE_DANCE.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../../../../');

const BRONZE_TEST_FILE = 'hot_obsidian_sandbox/bronze/1_projects/TEST_BRONZE.ts';
const SILVER_TEST_FILE = 'hot_obsidian_sandbox/silver/1_projects/TEST_SILVER.ts';
const GOLD_TEST_FILE = 'hot_obsidian_sandbox/gold/1_projects/TEST_GOLD.ts';

describe('PYRE_DANCE CORE', () => {
  beforeEach(() => {
    [BRONZE_TEST_FILE, SILVER_TEST_FILE, GOLD_TEST_FILE].forEach(f => {
      const abs = path.resolve(ROOT_DIR, f);
      if (!fs.existsSync(path.dirname(abs))) {
        fs.mkdirSync(path.dirname(abs), { recursive: true });
      }
      fs.writeFileSync(abs, '// test content', 'utf8');
    });
  });

  afterEach(() => {
    [BRONZE_TEST_FILE, SILVER_TEST_FILE, GOLD_TEST_FILE].forEach(f => {
      const abs = path.resolve(ROOT_DIR, f);
      try {
        if (fs.existsSync(abs)) fs.unlinkSync(abs);
      } catch (e) {}
    });

    // Cleanup archives
    ['gold', 'silver', 'bronze'].forEach(m => {
      const arch = path.join(ROOT_DIR, 'hot_obsidian_sandbox', m, '4_archive');
      ['TEST_BRONZE.ts', 'TEST_SILVER.ts', 'TEST_GOLD.ts'].forEach(f => {
        const p = path.join(arch, f);
        if (fs.existsSync(p)) fs.unlinkSync(p);
      });
    });
  });

  it('should correctly demote a file to its medallion archive', () => {
    const res = demote(SILVER_TEST_FILE, 'Violation');
    expect(res.action).toBe('demoted');
    const archPath = path.join(ROOT_DIR, 'hot_obsidian_sandbox/silver/4_archive/TEST_SILVER.ts');
    expect(fs.existsSync(archPath)).toBe(true);
  });

  it('should purge a file completely', () => {
    const res = purge(BRONZE_TEST_FILE, 'Extreme Prejudice');
    expect(res.action).toBe('purged');
    expect(fs.existsSync(path.resolve(ROOT_DIR, BRONZE_TEST_FILE))).toBe(false);
  });

  it('should skip if file not found', () => {
    const res = demote('non_existent.ts', 'Reason');
    expect(res.action).toBe('skipped');
  });

  it('should properly handle medalliion detection in getParaDest', () => {
      const resGold = demote(GOLD_TEST_FILE, 'Gold Violation');
      expect(resGold.action).toBe('demoted');
      const goldArch = path.join(ROOT_DIR, 'hot_obsidian_sandbox/gold/4_archive/TEST_GOLD.ts');
      expect(fs.existsSync(goldArch)).toBe(true);
  });

  it('should danceDie for silver violations', () => {
      const violations = [
          { file: SILVER_TEST_FILE, type: 'THEATER', message: 'Fake tests' }
      ];
      const results = danceDie(violations);
      expect(results[0].action).toBe('demoted');
      expect(results[0].file).toBe(SILVER_TEST_FILE);
  });

  it('should danceDie for bronze theater violations', () => {
    const violations = [
        { file: BRONZE_TEST_FILE, type: 'THEATER', message: 'Fake tests in bronze' }
    ];
    const results = danceDie(violations);
    expect(results[0].action).toBe('demoted');
  });

  it('should skip bronze non-severe violations', () => {
    const violations = [
        { file: BRONZE_TEST_FILE, type: 'KINETIC', message: 'Just a warning' }
    ];
    const results = danceDie(violations);
    expect(results[0].action).toBe('skipped');
  });
});
