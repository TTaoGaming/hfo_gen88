import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { BloodBookEntrySchema } from '../contracts/blood-book';

const JSONL_PATH = 'c:/Dev/active/hfo_gen88/hot_obsidian_sandbox/bronze/P4_RED_REGNANT/BLOOD_BOOK_OF_GRUDGES.jsonl';

describe('Resonant Blood Book of Grudges Validation', () => {
  it('should exist and be a valid JSONL file', () => {
    expect(fs.existsSync(JSONL_PATH)).toBe(true);
    const content = fs.readFileSync(JSONL_PATH, 'utf-8');
    expect(content.length).toBeGreaterThan(0);
  });

  it('should have exactly 65 entries (1 Heartbeat + 64 Grudges)', () => {
    const lines = fs.readFileSync(JSONL_PATH, 'utf-8').trim().split('\n').filter(l => !l.startsWith('#'));
    expect(lines.length).toBe(65);
  });

  it('should satisfy the Zod contract for every entry', () => {
    const lines = fs.readFileSync(JSONL_PATH, 'utf-8').trim().split('\n').filter(l => !l.startsWith('#'));
    lines.forEach((line, i) => {
      const entry = JSON.parse(line);
      const result = BloodBookEntrySchema.safeParse(entry);
      if (!result.success) {
        console.error(`Validation failed at line ${i}:`, result.error.format());
      }
      expect(result.success).toBe(true);
    });
  });

  it('should maintain a valid hash chain (Integrity)', () => {
    const lines = fs.readFileSync(JSONL_PATH, 'utf-8').trim().split('\n').filter(l => !l.startsWith('#'));
    let expectedPrevHash = '0000000000000000000000000000000000000000000000000000000000000000';
    
    lines.forEach((line, i) => {
      const entry = JSON.parse(line);
      const actualHash = entry.hash;
      
      // Verify prev_hash link
      expect(entry.prev_hash).toBe(expectedPrevHash);
      
      // Verify current hash
      const entryForHashing = { ...entry };
      delete entryForHashing.hash;
      const calculatedHash = crypto.createHash('sha256').update(JSON.stringify(entryForHashing)).digest('hex');
      expect(actualHash).toBe(calculatedHash);
      
      expectedPrevHash = actualHash;
    });
  });

  it('should contain CACAO v2.0 playbooks for all grudge entries', () => {
    const lines = fs.readFileSync(JSONL_PATH, 'utf-8').trim().split('\n').filter(l => !l.startsWith('#'));
    lines.slice(1).forEach((line) => {
      const entry = JSON.parse(line);
      expect(entry.cacao_playbook).toBeDefined();
      expect(entry.cacao_playbook.type).toBe('playbook');
      expect(entry.cacao_playbook.steps.length).toBeGreaterThan(0);
    });
  });
});
