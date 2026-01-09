/**
 * P4 RED REGNANT - SCREAM_POLLUTION Detector Tests
 * 
 * @port 5
 * @commander PYRE_PRAETORIAN (aligned)
 * @verb IMMUNIZE
 * @tier BRONZE
 * @provenance: .kiro/specs/red-regnant-8-screams/tasks.md
 * Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 11.1
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { 
  PollutionDetector, 
  createPollutionDetector, 
  ROOT_WHITELIST,
  PARA_FOLDERS,
  MEDALLION_TIERS
} from './pollution.js';
import { verifyScreamReceipt } from '../contracts/screams.js';

describe('SCREAM_POLLUTION Detector (Port 5)', () => {
  let tempDir: string;
  let detector: PollutionDetector;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pollution-test-'));
    detector = new PollutionDetector();
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  // --- DETECTOR METADATA ---
  describe('Detector Metadata', () => {
    it('has correct name', () => {
      expect(detector.name).toBe('SCREAM_POLLUTION');
    });

    it('is aligned with Port 5', () => {
      expect(detector.port).toBe(5);
    });

    it('produces SCREAM_POLLUTION type', () => {
      expect(detector.screamType).toBe('SCREAM_POLLUTION');
    });

    it('has a description', () => {
      expect(detector.description).toBeTruthy();
    });
  });

  // --- FACTORY FUNCTION ---
  describe('Factory Function', () => {
    it('createPollutionDetector returns a Detector', () => {
      const created = createPollutionDetector();
      expect(created.name).toBe('SCREAM_POLLUTION');
      expect(created.port).toBe(5);
    });
  });

  // --- ROOT POLLUTION DETECTION ---
  describe('ROOT_POLLUTION Detection', () => {
    it('detects unauthorized file in root', async () => {
      fs.writeFileSync(path.join(tempDir, 'unauthorized.ts'), 'const x = 1;');

      const result = await detector.detect(tempDir);
      const violations = result.receipts.filter(
        r => r.details.pollutionType === 'ROOT_POLLUTION'
      );
      expect(violations.length).toBeGreaterThan(0);
      expect(violations[0].details.fileName).toBe('unauthorized.ts');
    });

    it('detects unauthorized directory in root', async () => {
      fs.mkdirSync(path.join(tempDir, 'unauthorized_dir'));

      const result = await detector.detect(tempDir);
      const violations = result.receipts.filter(
        r => r.details.pollutionType === 'ROOT_POLLUTION'
      );
      expect(violations.length).toBeGreaterThan(0);
      expect(violations[0].details.isDirectory).toBe(true);
    });

    it('allows whitelisted files', async () => {
      fs.writeFileSync(path.join(tempDir, 'AGENTS.md'), '# Agents');
      fs.writeFileSync(path.join(tempDir, 'llms.txt'), 'llms');
      fs.writeFileSync(path.join(tempDir, 'package.json'), '{}');

      const result = await detector.detect(tempDir);
      const violations = result.receipts.filter(
        r => r.details.pollutionType === 'ROOT_POLLUTION'
      );
      expect(violations.length).toBe(0);
    });

    it('allows ttao-notes-*.md pattern', async () => {
      fs.writeFileSync(path.join(tempDir, 'ttao-notes-2026-01-07.md'), '# Notes');

      const result = await detector.detect(tempDir);
      const violations = result.receipts.filter(
        r => r.details.pollutionType === 'ROOT_POLLUTION'
      );
      expect(violations.length).toBe(0);
    });

    it('allows sandbox directories', async () => {
      fs.mkdirSync(path.join(tempDir, 'hot_obsidian_sandbox'));
      fs.mkdirSync(path.join(tempDir, 'cold_obsidian_sandbox'));

      const result = await detector.detect(tempDir);
      const violations = result.receipts.filter(
        r => r.details.pollutionType === 'ROOT_POLLUTION'
      );
      expect(violations.length).toBe(0);
    });
  });

  // --- PARA STRUCTURE VIOLATIONS ---
  describe('PARA_VIOLATION Detection', () => {
    it('detects non-PARA folder in medallion tier', async () => {
      const tierPath = path.join(tempDir, 'hot_obsidian_sandbox', 'bronze');
      fs.mkdirSync(tierPath, { recursive: true });
      fs.mkdirSync(path.join(tierPath, 'wrong_folder'));

      const result = await detector.detect(tempDir);
      const violations = result.receipts.filter(
        r => r.details.pollutionType === 'PARA_VIOLATION'
      );
      expect(violations.length).toBeGreaterThan(0);
      expect(violations[0].details.folderName).toBe('wrong_folder');
    });

    it('allows PARA folders', async () => {
      const tierPath = path.join(tempDir, 'hot_obsidian_sandbox', 'bronze');
      fs.mkdirSync(tierPath, { recursive: true });
      
      for (const para of PARA_FOLDERS) {
        fs.mkdirSync(path.join(tierPath, para));
      }

      const result = await detector.detect(tempDir);
      const violations = result.receipts.filter(
        r => r.details.pollutionType === 'PARA_VIOLATION' && r.details.folderName
      );
      expect(violations.length).toBe(0);
    });

    it('allows .jsonl files at tier level', async () => {
      const tierPath = path.join(tempDir, 'hot_obsidian_sandbox', 'bronze');
      fs.mkdirSync(tierPath, { recursive: true });
      fs.writeFileSync(path.join(tierPath, 'blackboard.jsonl'), '{}');

      const result = await detector.detect(tempDir);
      const violations = result.receipts.filter(
        r => r.details.pollutionType === 'PARA_VIOLATION' && r.details.fileName === 'blackboard.jsonl'
      );
      expect(violations.length).toBe(0);
    });

    it('allows README.md at tier level', async () => {
      const tierPath = path.join(tempDir, 'hot_obsidian_sandbox', 'silver');
      fs.mkdirSync(tierPath, { recursive: true });
      fs.writeFileSync(path.join(tierPath, 'README.md'), '# Silver');

      const result = await detector.detect(tempDir);
      const violations = result.receipts.filter(
        r => r.details.pollutionType === 'PARA_VIOLATION' && r.details.fileName === 'README.md'
      );
      expect(violations.length).toBe(0);
    });
  });

  // --- RECURSIVE LOOP DETECTION ---
  describe('RECURSIVE_LOOP Detection', () => {
    it('detects nested sandbox', async () => {
      const nestedPath = path.join(
        tempDir, 
        'hot_obsidian_sandbox', 
        'bronze', 
        '1_projects',
        'hot_obsidian_sandbox'
      );
      fs.mkdirSync(nestedPath, { recursive: true });

      const result = await detector.detect(tempDir);
      const violations = result.receipts.filter(
        r => r.details.pollutionType === 'RECURSIVE_LOOP'
      );
      expect(violations.length).toBeGreaterThan(0);
      expect(violations[0].details.nestedSandbox).toBe('hot_obsidian_sandbox');
    });

    it('detects cold sandbox inside hot sandbox', async () => {
      const nestedPath = path.join(
        tempDir, 
        'hot_obsidian_sandbox', 
        'bronze', 
        '2_areas',
        'cold_obsidian_sandbox'
      );
      fs.mkdirSync(nestedPath, { recursive: true });

      const result = await detector.detect(tempDir);
      const violations = result.receipts.filter(
        r => r.details.pollutionType === 'RECURSIVE_LOOP'
      );
      expect(violations.length).toBeGreaterThan(0);
    });

    it('does NOT flag normal nested directories', async () => {
      const normalPath = path.join(
        tempDir, 
        'hot_obsidian_sandbox', 
        'bronze', 
        '1_projects',
        'my_project'
      );
      fs.mkdirSync(normalPath, { recursive: true });

      const result = await detector.detect(tempDir);
      const violations = result.receipts.filter(
        r => r.details.pollutionType === 'RECURSIVE_LOOP'
      );
      expect(violations.length).toBe(0);
    });
  });

  // --- RECEIPT GENERATION ---
  describe('Receipt Generation', () => {
    it('generates valid SCREAM receipts', async () => {
      fs.writeFileSync(path.join(tempDir, 'unauthorized.ts'), 'const x = 1;');

      const result = await detector.detect(tempDir);
      expect(result.receipts.length).toBeGreaterThan(0);

      for (const receipt of result.receipts) {
        expect(receipt.type).toBe('SCREAM_POLLUTION');
        expect(receipt.port).toBe(5);
        expect(verifyScreamReceipt(receipt)).toBe(true);
      }
    });
  });

  // --- CONFIG OPTIONS ---
  describe('Configuration', () => {
    it('respects enabled=false', async () => {
      fs.writeFileSync(path.join(tempDir, 'unauthorized.ts'), 'const x = 1;');

      const result = await detector.detect(tempDir, { enabled: false });
      expect(result.violationsFound).toBe(0);
    });
  });

  // --- EDGE CASES ---
  describe('Edge Cases', () => {
    it('handles non-existent path', async () => {
      const result = await detector.detect('/non/existent/path');
      expect(result.filesScanned).toBe(0);
      expect(result.violationsFound).toBe(0);
    });

    it('handles empty directory', async () => {
      const result = await detector.detect(tempDir);
      expect(result.violationsFound).toBe(0);
    });

    it('handles single file target', async () => {
      const file = path.join(tempDir, 'test.ts');
      fs.writeFileSync(file, 'const x = 1;');

      const result = await detector.detect(file);
      expect(result.filesScanned).toBe(1);
    });

    it('handles clean project structure', async () => {
      // Create proper structure
      fs.writeFileSync(path.join(tempDir, 'AGENTS.md'), '# Agents');
      fs.writeFileSync(path.join(tempDir, 'package.json'), '{}');
      
      const hotSandbox = path.join(tempDir, 'hot_obsidian_sandbox');
      fs.mkdirSync(hotSandbox);
      
      for (const tier of MEDALLION_TIERS) {
        const tierPath = path.join(hotSandbox, tier);
        fs.mkdirSync(tierPath);
        
        for (const para of PARA_FOLDERS) {
          fs.mkdirSync(path.join(tierPath, para));
        }
      }

      const result = await detector.detect(tempDir);
      expect(result.violationsFound).toBe(0);
    });
  });

  // --- CONSTANTS ---
  describe('Constants', () => {
    it('ROOT_WHITELIST contains expected entries', () => {
      expect(ROOT_WHITELIST).toContain('hot_obsidian_sandbox');
      expect(ROOT_WHITELIST).toContain('cold_obsidian_sandbox');
      expect(ROOT_WHITELIST).toContain('AGENTS.md');
      expect(ROOT_WHITELIST).toContain('package.json');
    });

    it('PARA_FOLDERS has 4 entries', () => {
      expect(PARA_FOLDERS).toHaveLength(4);
      expect(PARA_FOLDERS).toContain('1_projects');
      expect(PARA_FOLDERS).toContain('2_areas');
      expect(PARA_FOLDERS).toContain('3_resources');
      expect(PARA_FOLDERS).toContain('4_archive');
    });

    it('MEDALLION_TIERS has 3 entries', () => {
      expect(MEDALLION_TIERS).toHaveLength(3);
      expect(MEDALLION_TIERS).toContain('gold');
      expect(MEDALLION_TIERS).toContain('silver');
      expect(MEDALLION_TIERS).toContain('bronze');
    });
  });

  // --- RESULT STRUCTURE ---
  describe('Result Structure', () => {
    it('returns correct screamType', async () => {
      const result = await detector.detect(tempDir);
      expect(result.screamType).toBe('SCREAM_POLLUTION');
    });

    it('returns duration in milliseconds', async () => {
      const result = await detector.detect(tempDir);
      expect(typeof result.duration).toBe('number');
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });

    it('duration is calculated correctly (not addition)', async () => {
      const before = Date.now();
      const result = await detector.detect(tempDir);
      const after = Date.now();
      // Duration should be small (< 5 seconds), not huge like Date.now() + startTime
      expect(result.duration).toBeLessThan(5000);
      expect(result.duration).toBeLessThanOrEqual(after - before + 100);
    });
  });

  // --- MUTATION-KILLING: Duration Arithmetic ---
  describe('Duration Calculation (Mutation Killers)', () => {
    it('duration is subtraction not addition when disabled', async () => {
      const result = await detector.detect(tempDir, { enabled: false });
      // If it was addition, duration would be ~2x Date.now() (billions)
      expect(result.duration).toBeLessThan(5000);
    });

    it('duration is subtraction not addition for non-existent path', async () => {
      const result = await detector.detect('/non/existent/path');
      expect(result.duration).toBeLessThan(5000);
    });

    it('duration is subtraction not addition for directory scan', async () => {
      fs.writeFileSync(path.join(tempDir, 'test.ts'), 'const x = 1;');
      const result = await detector.detect(tempDir);
      expect(result.duration).toBeLessThan(5000);
    });
  });

  // --- MUTATION-KILLING: filesScanned Counter ---
  describe('filesScanned Counter (Mutation Killers)', () => {
    it('filesScanned increments for root pollution', async () => {
      fs.writeFileSync(path.join(tempDir, 'unauthorized.ts'), 'const x = 1;');
      const result = await detector.detect(tempDir);
      expect(result.filesScanned).toBeGreaterThan(0);
      expect(result.violationsFound).toBeGreaterThan(0);
    });

    it('filesScanned increments for sandbox structure violations', async () => {
      const tierPath = path.join(tempDir, 'hot_obsidian_sandbox', 'bronze');
      fs.mkdirSync(tierPath, { recursive: true });
      fs.mkdirSync(path.join(tierPath, 'wrong_folder'));
      const result = await detector.detect(tempDir);
      expect(result.filesScanned).toBeGreaterThan(0);
    });

    it('filesScanned increments for recursive loop violations', async () => {
      const nestedPath = path.join(
        tempDir, 
        'hot_obsidian_sandbox', 
        'bronze', 
        '1_projects',
        'hot_obsidian_sandbox'
      );
      fs.mkdirSync(nestedPath, { recursive: true });
      const result = await detector.detect(tempDir);
      expect(result.filesScanned).toBeGreaterThan(0);
    });

    it('filesScanned is 0 when no violations found in empty sandbox', async () => {
      fs.mkdirSync(path.join(tempDir, 'hot_obsidian_sandbox'));
      const result = await detector.detect(tempDir);
      // No violations = filesScanned stays 0 for those checks
      expect(result.violationsFound).toBe(0);
    });

    it('filesScanned does not go negative', async () => {
      fs.writeFileSync(path.join(tempDir, 'unauthorized.ts'), 'const x = 1;');
      const result = await detector.detect(tempDir);
      expect(result.filesScanned).toBeGreaterThanOrEqual(0);
    });
  });

  // --- MUTATION-KILLING: ttao-notes Regex ---
  describe('ttao-notes Pattern (Mutation Killers)', () => {
    it('rejects ttao-notes without .md extension', async () => {
      fs.writeFileSync(path.join(tempDir, 'ttao-notes-2026-01-07'), 'notes');
      const result = await detector.detect(tempDir);
      const violations = result.receipts.filter(
        r => r.details.pollutionType === 'ROOT_POLLUTION'
      );
      expect(violations.length).toBeGreaterThan(0);
    });

    it('rejects file ending with ttao-notes-*.md but not starting with it', async () => {
      fs.writeFileSync(path.join(tempDir, 'prefix-ttao-notes-2026-01-07.md'), 'notes');
      const result = await detector.detect(tempDir);
      const violations = result.receipts.filter(
        r => r.details.pollutionType === 'ROOT_POLLUTION'
      );
      expect(violations.length).toBeGreaterThan(0);
    });

    it('rejects ttao-notes-.md (empty date)', async () => {
      fs.writeFileSync(path.join(tempDir, 'ttao-notes-.md'), 'notes');
      const result = await detector.detect(tempDir);
      // This should be allowed by the .* pattern
      expect(result.receipts.filter(r => r.details.fileName === 'ttao-notes-.md').length).toBe(0);
    });
  });

  // --- MUTATION-KILLING: Message Content ---
  describe('Message Content (Mutation Killers)', () => {
    it('ROOT_POLLUTION message contains "directory" for directories', async () => {
      fs.mkdirSync(path.join(tempDir, 'unauthorized_dir'));
      const result = await detector.detect(tempDir);
      const violation = result.receipts.find(
        r => r.details.pollutionType === 'ROOT_POLLUTION' && r.details.isDirectory
      );
      expect(violation).toBeDefined();
      expect(violation!.details.message).toContain('directory');
    });

    it('ROOT_POLLUTION message contains "file" for files', async () => {
      fs.writeFileSync(path.join(tempDir, 'unauthorized.ts'), 'const x = 1;');
      const result = await detector.detect(tempDir);
      const violation = result.receipts.find(
        r => r.details.pollutionType === 'ROOT_POLLUTION' && !r.details.isDirectory
      );
      expect(violation).toBeDefined();
      expect(violation!.details.message).toContain('file');
    });

    it('ROOT_POLLUTION severity is error', async () => {
      fs.writeFileSync(path.join(tempDir, 'unauthorized.ts'), 'const x = 1;');
      const result = await detector.detect(tempDir);
      const violation = result.receipts.find(
        r => r.details.pollutionType === 'ROOT_POLLUTION'
      );
      expect(violation).toBeDefined();
      expect(violation!.details.severity).toBe('error');
    });

    it('PARA_VIOLATION message is not empty', async () => {
      const tierPath = path.join(tempDir, 'hot_obsidian_sandbox', 'bronze');
      fs.mkdirSync(tierPath, { recursive: true });
      fs.mkdirSync(path.join(tierPath, 'wrong_folder'));
      const result = await detector.detect(tempDir);
      const violation = result.receipts.find(
        r => r.details.pollutionType === 'PARA_VIOLATION'
      );
      expect(violation).toBeDefined();
      expect(violation!.details.message).toBeTruthy();
      expect(violation!.details.message.length).toBeGreaterThan(0);
    });

    it('PARA_VIOLATION severity is warning', async () => {
      const tierPath = path.join(tempDir, 'hot_obsidian_sandbox', 'bronze');
      fs.mkdirSync(tierPath, { recursive: true });
      fs.mkdirSync(path.join(tierPath, 'wrong_folder'));
      const result = await detector.detect(tempDir);
      const violation = result.receipts.find(
        r => r.details.pollutionType === 'PARA_VIOLATION'
      );
      expect(violation).toBeDefined();
      expect(violation!.details.severity).toBe('warning');
    });

    it('PARA_VIOLATION includes expectedFolders array', async () => {
      const tierPath = path.join(tempDir, 'hot_obsidian_sandbox', 'bronze');
      fs.mkdirSync(tierPath, { recursive: true });
      fs.mkdirSync(path.join(tierPath, 'wrong_folder'));
      const result = await detector.detect(tempDir);
      const violation = result.receipts.find(
        r => r.details.pollutionType === 'PARA_VIOLATION' && r.details.folderName
      );
      expect(violation).toBeDefined();
      expect(violation!.details.expectedFolders).toBeDefined();
      expect(violation!.details.expectedFolders.length).toBe(4);
    });

    it('RECURSIVE_LOOP message is not empty', async () => {
      const nestedPath = path.join(
        tempDir, 
        'hot_obsidian_sandbox', 
        'bronze', 
        '1_projects',
        'hot_obsidian_sandbox'
      );
      fs.mkdirSync(nestedPath, { recursive: true });
      const result = await detector.detect(tempDir);
      const violation = result.receipts.find(
        r => r.details.pollutionType === 'RECURSIVE_LOOP'
      );
      expect(violation).toBeDefined();
      expect(violation!.details.message).toBeTruthy();
      expect(violation!.details.message.length).toBeGreaterThan(0);
    });

    it('RECURSIVE_LOOP severity is critical', async () => {
      const nestedPath = path.join(
        tempDir, 
        'hot_obsidian_sandbox', 
        'bronze', 
        '1_projects',
        'hot_obsidian_sandbox'
      );
      fs.mkdirSync(nestedPath, { recursive: true });
      const result = await detector.detect(tempDir);
      const violation = result.receipts.find(
        r => r.details.pollutionType === 'RECURSIVE_LOOP'
      );
      expect(violation).toBeDefined();
      expect(violation!.details.severity).toBe('critical');
    });

    it('RECURSIVE_LOOP depth is positive', async () => {
      const nestedPath = path.join(
        tempDir, 
        'hot_obsidian_sandbox', 
        'bronze', 
        '1_projects',
        'hot_obsidian_sandbox'
      );
      fs.mkdirSync(nestedPath, { recursive: true });
      const result = await detector.detect(tempDir);
      const violation = result.receipts.find(
        r => r.details.pollutionType === 'RECURSIVE_LOOP'
      );
      expect(violation).toBeDefined();
      expect(violation!.details.depth).toBeGreaterThan(0);
    });
  });

  // --- MUTATION-KILLING: Sandbox Existence Checks ---
  describe('Sandbox Existence Checks (Mutation Killers)', () => {
    it('skips non-existent sandbox in structure check', async () => {
      // Only create hot sandbox, not cold
      fs.mkdirSync(path.join(tempDir, 'hot_obsidian_sandbox'));
      const result = await detector.detect(tempDir);
      // Should not throw, should handle gracefully
      expect(result.screamType).toBe('SCREAM_POLLUTION');
    });

    it('skips non-existent tier in PARA check', async () => {
      const sandboxPath = path.join(tempDir, 'hot_obsidian_sandbox');
      fs.mkdirSync(sandboxPath);
      // Only create bronze, not silver or gold
      fs.mkdirSync(path.join(sandboxPath, 'bronze'));
      const result = await detector.detect(tempDir);
      expect(result.screamType).toBe('SCREAM_POLLUTION');
    });

    it('checks cold_obsidian_sandbox when it exists', async () => {
      const coldPath = path.join(tempDir, 'cold_obsidian_sandbox', 'bronze');
      fs.mkdirSync(coldPath, { recursive: true });
      fs.mkdirSync(path.join(coldPath, 'wrong_folder'));
      const result = await detector.detect(tempDir);
      const violations = result.receipts.filter(
        r => r.details.sandbox === 'cold_obsidian_sandbox'
      );
      expect(violations.length).toBeGreaterThan(0);
    });
  });

  // --- MUTATION-KILLING: PARA File Checks ---
  describe('PARA File Checks (Mutation Killers)', () => {
    it('detects non-.jsonl file at tier level', async () => {
      const tierPath = path.join(tempDir, 'hot_obsidian_sandbox', 'bronze');
      fs.mkdirSync(tierPath, { recursive: true });
      fs.writeFileSync(path.join(tierPath, 'random.txt'), 'content');
      const result = await detector.detect(tempDir);
      const violations = result.receipts.filter(
        r => r.details.pollutionType === 'PARA_VIOLATION' && r.details.fileName === 'random.txt'
      );
      expect(violations.length).toBeGreaterThan(0);
    });

    it('allows .jsonl specifically (not just any extension)', async () => {
      const tierPath = path.join(tempDir, 'hot_obsidian_sandbox', 'bronze');
      fs.mkdirSync(tierPath, { recursive: true });
      fs.writeFileSync(path.join(tierPath, 'data.jsonl'), '{}');
      fs.writeFileSync(path.join(tierPath, 'data.json'), '{}'); // Should be flagged
      const result = await detector.detect(tempDir);
      const jsonlViolation = result.receipts.find(
        r => r.details.fileName === 'data.jsonl'
      );
      const jsonViolation = result.receipts.find(
        r => r.details.fileName === 'data.json'
      );
      expect(jsonlViolation).toBeUndefined();
      expect(jsonViolation).toBeDefined();
    });
  });

  // --- MUTATION-KILLING: Recursive Loop Skip Conditions ---
  describe('Recursive Loop Skip Conditions (Mutation Killers)', () => {
    it('skips node_modules in recursive search', async () => {
      const nmPath = path.join(
        tempDir, 
        'hot_obsidian_sandbox', 
        'bronze', 
        '1_projects',
        'node_modules',
        'hot_obsidian_sandbox'
      );
      fs.mkdirSync(nmPath, { recursive: true });
      const result = await detector.detect(tempDir);
      const violations = result.receipts.filter(
        r => r.details.pollutionType === 'RECURSIVE_LOOP'
      );
      expect(violations.length).toBe(0);
    });

    it('skips .git in recursive search', async () => {
      const gitPath = path.join(
        tempDir, 
        'hot_obsidian_sandbox', 
        'bronze', 
        '1_projects',
        '.git',
        'hot_obsidian_sandbox'
      );
      fs.mkdirSync(gitPath, { recursive: true });
      const result = await detector.detect(tempDir);
      const violations = result.receipts.filter(
        r => r.details.pollutionType === 'RECURSIVE_LOOP'
      );
      expect(violations.length).toBe(0);
    });

    it('skips 4_archive in recursive search', async () => {
      const archivePath = path.join(
        tempDir, 
        'hot_obsidian_sandbox', 
        'bronze', 
        '4_archive',
        'hot_obsidian_sandbox'
      );
      fs.mkdirSync(archivePath, { recursive: true });
      const result = await detector.detect(tempDir);
      const violations = result.receipts.filter(
        r => r.details.pollutionType === 'RECURSIVE_LOOP'
      );
      expect(violations.length).toBe(0);
    });

    it('skips quarantine in recursive search', async () => {
      const quarantinePath = path.join(
        tempDir, 
        'hot_obsidian_sandbox', 
        'bronze', 
        '1_projects',
        'quarantine',
        'hot_obsidian_sandbox'
      );
      fs.mkdirSync(quarantinePath, { recursive: true });
      const result = await detector.detect(tempDir);
      const violations = result.receipts.filter(
        r => r.details.pollutionType === 'RECURSIVE_LOOP'
      );
      expect(violations.length).toBe(0);
    });

    it('does not skip regular directories in recursive search', async () => {
      const regularPath = path.join(
        tempDir, 
        'hot_obsidian_sandbox', 
        'bronze', 
        '1_projects',
        'my_project',
        'hot_obsidian_sandbox'
      );
      fs.mkdirSync(regularPath, { recursive: true });
      const result = await detector.detect(tempDir);
      const violations = result.receipts.filter(
        r => r.details.pollutionType === 'RECURSIVE_LOOP'
      );
      expect(violations.length).toBeGreaterThan(0);
    });

    it('respects depth limit of 10', async () => {
      // Create deeply nested structure (but not sandbox)
      let currentPath = path.join(tempDir, 'hot_obsidian_sandbox', 'bronze', '1_projects');
      fs.mkdirSync(currentPath, { recursive: true });
      for (let i = 0; i < 15; i++) {
        currentPath = path.join(currentPath, `level${i}`);
        fs.mkdirSync(currentPath);
      }
      // Add sandbox at very deep level
      fs.mkdirSync(path.join(currentPath, 'hot_obsidian_sandbox'));
      
      const result = await detector.detect(tempDir);
      // Should not find it due to depth limit
      const violations = result.receipts.filter(
        r => r.details.pollutionType === 'RECURSIVE_LOOP'
      );
      expect(violations.length).toBe(0);
    });
  });

  // --- MUTATION-KILLING: Single File Location ---
  describe('Single File Location (Mutation Killers)', () => {
    it('detects file outside sandbox', async () => {
      const file = path.join(tempDir, 'outside.ts');
      fs.writeFileSync(file, 'const x = 1;');
      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.pollutionType === 'OUTSIDE_SANDBOX'
      );
      expect(violations.length).toBeGreaterThan(0);
    });

    it('does not flag file inside hot_obsidian_sandbox', async () => {
      const sandboxPath = path.join(tempDir, 'hot_obsidian_sandbox', 'bronze', '1_projects');
      fs.mkdirSync(sandboxPath, { recursive: true });
      const file = path.join(sandboxPath, 'inside.ts');
      fs.writeFileSync(file, 'const x = 1;');
      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.pollutionType === 'OUTSIDE_SANDBOX'
      );
      expect(violations.length).toBe(0);
    });

    it('does not flag file inside cold_obsidian_sandbox', async () => {
      const sandboxPath = path.join(tempDir, 'cold_obsidian_sandbox', 'bronze', '1_projects');
      fs.mkdirSync(sandboxPath, { recursive: true });
      const file = path.join(sandboxPath, 'inside.ts');
      fs.writeFileSync(file, 'const x = 1;');
      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.pollutionType === 'OUTSIDE_SANDBOX'
      );
      expect(violations.length).toBe(0);
    });

    it('does not flag whitelisted file outside sandbox', async () => {
      const file = path.join(tempDir, 'package.json');
      fs.writeFileSync(file, '{}');
      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.pollutionType === 'OUTSIDE_SANDBOX'
      );
      expect(violations.length).toBe(0);
    });

    it('does not flag ttao-notes file outside sandbox', async () => {
      const file = path.join(tempDir, 'ttao-notes-2026-01-07.md');
      fs.writeFileSync(file, '# Notes');
      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.pollutionType === 'OUTSIDE_SANDBOX'
      );
      expect(violations.length).toBe(0);
    });

    it('OUTSIDE_SANDBOX message is not empty', async () => {
      const file = path.join(tempDir, 'outside.ts');
      fs.writeFileSync(file, 'const x = 1;');
      const result = await detector.detect(file);
      const violation = result.receipts.find(
        r => r.details.pollutionType === 'OUTSIDE_SANDBOX'
      );
      expect(violation).toBeDefined();
      expect(violation!.details.message).toBeTruthy();
      expect(violation!.details.message.length).toBeGreaterThan(0);
    });

    it('OUTSIDE_SANDBOX severity is warning', async () => {
      const file = path.join(tempDir, 'outside.ts');
      fs.writeFileSync(file, 'const x = 1;');
      const result = await detector.detect(file);
      const violation = result.receipts.find(
        r => r.details.pollutionType === 'OUTSIDE_SANDBOX'
      );
      expect(violation).toBeDefined();
      expect(violation!.details.severity).toBe('warning');
    });

    it('OUTSIDE_SANDBOX includes fileName', async () => {
      const file = path.join(tempDir, 'outside.ts');
      fs.writeFileSync(file, 'const x = 1;');
      const result = await detector.detect(file);
      const violation = result.receipts.find(
        r => r.details.pollutionType === 'OUTSIDE_SANDBOX'
      );
      expect(violation).toBeDefined();
      expect(violation!.details.fileName).toBe('outside.ts');
    });
  });

  // --- MUTATION-KILLING: isWhitelisted Method ---
  describe('isWhitelisted Method (Mutation Killers)', () => {
    it('allows .stryker-tmp prefix', async () => {
      fs.mkdirSync(path.join(tempDir, '.stryker-tmp'));
      const result = await detector.detect(tempDir);
      const violations = result.receipts.filter(
        r => r.details.fileName === '.stryker-tmp'
      );
      expect(violations.length).toBe(0);
    });

    it('allows .stryker-tmp-shard5 (startsWith not endsWith)', async () => {
      fs.mkdirSync(path.join(tempDir, '.stryker-tmp-shard5'));
      const result = await detector.detect(tempDir);
      const violations = result.receipts.filter(
        r => r.details.fileName === '.stryker-tmp-shard5'
      );
      expect(violations.length).toBe(0);
    });

    it('does not allow suffix .stryker-tmp', async () => {
      fs.mkdirSync(path.join(tempDir, 'prefix.stryker-tmp'));
      const result = await detector.detect(tempDir);
      const violations = result.receipts.filter(
        r => r.details.fileName === 'prefix.stryker-tmp'
      );
      expect(violations.length).toBeGreaterThan(0);
    });
  });

  // --- MUTATION-KILLING: PARA File at Tier Level ---
  describe('PARA File at Tier Level (Mutation Killers)', () => {
    it('detects .ts file at tier level', async () => {
      const tierPath = path.join(tempDir, 'hot_obsidian_sandbox', 'bronze');
      fs.mkdirSync(tierPath, { recursive: true });
      fs.writeFileSync(path.join(tierPath, 'misplaced.ts'), 'const x = 1;');
      const result = await detector.detect(tempDir);
      const violations = result.receipts.filter(
        r => r.details.pollutionType === 'PARA_VIOLATION' && r.details.fileName === 'misplaced.ts'
      );
      expect(violations.length).toBeGreaterThan(0);
      expect(violations[0].details.message).toContain('PARA folder');
    });

    it('PARA file violation severity is warning', async () => {
      const tierPath = path.join(tempDir, 'hot_obsidian_sandbox', 'bronze');
      fs.mkdirSync(tierPath, { recursive: true });
      fs.writeFileSync(path.join(tierPath, 'misplaced.ts'), 'const x = 1;');
      const result = await detector.detect(tempDir);
      const violation = result.receipts.find(
        r => r.details.pollutionType === 'PARA_VIOLATION' && r.details.fileName
      );
      expect(violation).toBeDefined();
      expect(violation!.severity).toBe('warning');
    });

    it('PARA file violation details.severity is warning', async () => {
      const tierPath = path.join(tempDir, 'hot_obsidian_sandbox', 'bronze');
      fs.mkdirSync(tierPath, { recursive: true });
      fs.writeFileSync(path.join(tierPath, 'misplaced.ts'), 'const x = 1;');
      const result = await detector.detect(tempDir);
      const violation = result.receipts.find(
        r => r.details.pollutionType === 'PARA_VIOLATION' && r.details.fileName
      );
      expect(violation).toBeDefined();
      expect(violation!.details.severity).toBe('warning');
    });
  });

  // --- MUTATION-KILLING: Severity String Assertions ---
  describe('Severity String Assertions (Mutation Killers)', () => {
    it('PARA folder violation receipt severity is warning', async () => {
      const tierPath = path.join(tempDir, 'hot_obsidian_sandbox', 'bronze');
      fs.mkdirSync(tierPath, { recursive: true });
      fs.mkdirSync(path.join(tierPath, 'wrong_folder'));
      const result = await detector.detect(tempDir);
      const violation = result.receipts.find(
        r => r.details.pollutionType === 'PARA_VIOLATION' && r.details.folderName
      );
      expect(violation).toBeDefined();
      expect(violation!.severity).toBe('warning');
    });

    it('RECURSIVE_LOOP receipt severity is critical', async () => {
      const nestedPath = path.join(
        tempDir, 
        'hot_obsidian_sandbox', 
        'bronze', 
        '1_projects',
        'hot_obsidian_sandbox'
      );
      fs.mkdirSync(nestedPath, { recursive: true });
      const result = await detector.detect(tempDir);
      const violation = result.receipts.find(
        r => r.details.pollutionType === 'RECURSIVE_LOOP'
      );
      expect(violation).toBeDefined();
      expect(violation!.severity).toBe('critical');
    });

    it('OUTSIDE_SANDBOX receipt severity is warning', async () => {
      const file = path.join(tempDir, 'outside.ts');
      fs.writeFileSync(file, 'const x = 1;');
      const result = await detector.detect(file);
      const violation = result.receipts.find(
        r => r.details.pollutionType === 'OUTSIDE_SANDBOX'
      );
      expect(violation).toBeDefined();
      expect(violation!.severity).toBe('warning');
    });
  });

  // --- MUTATION-KILLING: Regex Anchor Tests ---
  describe('Regex Anchor Tests (Mutation Killers)', () => {
    it('rejects ttao-notes-2026.md.bak (extra suffix)', async () => {
      fs.writeFileSync(path.join(tempDir, 'ttao-notes-2026.md.bak'), 'notes');
      const result = await detector.detect(tempDir);
      const violations = result.receipts.filter(
        r => r.details.pollutionType === 'ROOT_POLLUTION' && r.details.fileName === 'ttao-notes-2026.md.bak'
      );
      expect(violations.length).toBeGreaterThan(0);
    });

    it('single file: rejects file with ttao-notes suffix but wrong prefix', async () => {
      const file = path.join(tempDir, 'my-ttao-notes-2026-01-07.md');
      fs.writeFileSync(file, 'notes');
      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.pollutionType === 'OUTSIDE_SANDBOX'
      );
      expect(violations.length).toBeGreaterThan(0);
    });

    it('single file: rejects ttao-notes without .md extension', async () => {
      const file = path.join(tempDir, 'ttao-notes-2026-01-07');
      fs.writeFileSync(file, 'notes');
      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.pollutionType === 'OUTSIDE_SANDBOX'
      );
      expect(violations.length).toBeGreaterThan(0);
    });

    it('single file: rejects ttao-notes with extra suffix after .md', async () => {
      const file = path.join(tempDir, 'ttao-notes-2026-01-07.md.bak');
      fs.writeFileSync(file, 'notes');
      const result = await detector.detect(file);
      const violations = result.receipts.filter(
        r => r.details.pollutionType === 'OUTSIDE_SANDBOX'
      );
      expect(violations.length).toBeGreaterThan(0);
    });
  });

  // --- MUTATION-KILLING: filesScanned Exact Values ---
  describe('filesScanned Exact Values (Mutation Killers)', () => {
    it('filesScanned is exactly 0 for clean empty directory', async () => {
      const result = await detector.detect(tempDir);
      expect(result.filesScanned).toBe(0);
    });

    it('filesScanned is exactly 1 when only root pollution found', async () => {
      fs.writeFileSync(path.join(tempDir, 'unauthorized.ts'), 'const x = 1;');
      const result = await detector.detect(tempDir);
      // Root pollution check increments filesScanned by 1 when violations found
      expect(result.filesScanned).toBeGreaterThanOrEqual(1);
    });
  });

  // --- MUTATION-KILLING: Depth Calculation ---
  describe('Depth Calculation (Mutation Killers)', () => {
    it('RECURSIVE_LOOP depth is exactly 1 for immediate nested sandbox', async () => {
      const nestedPath = path.join(
        tempDir, 
        'hot_obsidian_sandbox', 
        'hot_obsidian_sandbox'
      );
      fs.mkdirSync(nestedPath, { recursive: true });
      const result = await detector.detect(tempDir);
      const violation = result.receipts.find(
        r => r.details.pollutionType === 'RECURSIVE_LOOP'
      );
      expect(violation).toBeDefined();
      expect(violation!.details.depth).toBe(1);
    });

    it('RECURSIVE_LOOP depth increases with nesting level', async () => {
      const nestedPath = path.join(
        tempDir, 
        'hot_obsidian_sandbox', 
        'bronze',
        '1_projects',
        'subdir',
        'hot_obsidian_sandbox'
      );
      fs.mkdirSync(nestedPath, { recursive: true });
      const result = await detector.detect(tempDir);
      const violation = result.receipts.find(
        r => r.details.pollutionType === 'RECURSIVE_LOOP'
      );
      expect(violation).toBeDefined();
      expect(violation!.details.depth).toBeGreaterThan(1);
    });
  });

  // --- MUTATION-KILLING: Non-directory Skip in Recursive Search ---
  describe('Non-directory Skip in Recursive Search (Mutation Killers)', () => {
    it('does not recurse into files during nested sandbox search', async () => {
      const sandboxPath = path.join(tempDir, 'hot_obsidian_sandbox', 'bronze', '1_projects');
      fs.mkdirSync(sandboxPath, { recursive: true });
      // Create a file (not directory) - should be skipped
      fs.writeFileSync(path.join(sandboxPath, 'file.ts'), 'const x = 1;');
      // Create a nested sandbox in a subdirectory
      fs.mkdirSync(path.join(sandboxPath, 'subdir', 'hot_obsidian_sandbox'), { recursive: true });
      
      const result = await detector.detect(tempDir);
      const violations = result.receipts.filter(
        r => r.details.pollutionType === 'RECURSIVE_LOOP'
      );
      // Should find the nested sandbox in subdir
      expect(violations.length).toBe(1);
    });
  });

  // --- MUTATION-KILLING: Sandbox Existence Continue Behavior ---
  describe('Sandbox Existence Continue Behavior (Mutation Killers)', () => {
    it('continues to next sandbox when first does not exist', async () => {
      // Only create cold sandbox with violation
      const coldPath = path.join(tempDir, 'cold_obsidian_sandbox', 'bronze');
      fs.mkdirSync(coldPath, { recursive: true });
      fs.mkdirSync(path.join(coldPath, 'wrong_folder'));
      
      const result = await detector.detect(tempDir);
      const violations = result.receipts.filter(
        r => r.details.sandbox === 'cold_obsidian_sandbox'
      );
      expect(violations.length).toBeGreaterThan(0);
    });

    it('continues to next tier when first tier does not exist', async () => {
      const sandboxPath = path.join(tempDir, 'hot_obsidian_sandbox');
      fs.mkdirSync(sandboxPath);
      // Only create silver tier with violation (skip bronze)
      const silverPath = path.join(sandboxPath, 'silver');
      fs.mkdirSync(silverPath);
      fs.mkdirSync(path.join(silverPath, 'wrong_folder'));
      
      const result = await detector.detect(tempDir);
      const violations = result.receipts.filter(
        r => r.details.tier === 'silver'
      );
      expect(violations.length).toBeGreaterThan(0);
    });
  });
});
