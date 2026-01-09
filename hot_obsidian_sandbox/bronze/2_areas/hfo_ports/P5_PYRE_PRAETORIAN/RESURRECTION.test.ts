import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { resurrect } from './RESURRECTION_LOOP.js';
import { GOLDILOCKS } from './PHOENIX_CONTRACTS.js';

/**
 * @provenance hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P5_PYRE_PRAETORIAN/RESURRECTION.test.ts
 * Validates: Port 5 Resurrection Logic
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../../../../');

const getTestFile = (suffix: string) => `hot_obsidian_sandbox/bronze/1_projects/P5_TEST_${suffix}.ts`;
const bbPath = path.join(ROOT_DIR, 'hot_obsidian_sandbox/hot_obsidianblackboard.jsonl');

describe('PYRE PRAETORIAN RESURRECTION', () => {
    beforeEach(() => {
        vi.spyOn(console, 'log').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});
        if (fs.existsSync(bbPath)) fs.truncateSync(bbPath);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should successfully resurrect an artifact in the Goldilocks zone and log to blackboard', async () => {
        const file = getTestFile('success');
        const abs = path.resolve(ROOT_DIR, file);
        const dir = path.dirname(abs);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(abs, 'console.log("Success");');

        const result = await resurrect(file, 88.5, 'Pareto Perfect');
        expect(result).toBe(true);
        
        const silverFile = path.resolve(ROOT_DIR, 'hot_obsidian_sandbox/silver/1_projects', path.basename(file));
        expect(fs.existsSync(silverFile)).toBe(true);
        
        // Check blackboard
        const content = fs.readFileSync(bbPath, 'utf8');
        expect(content.endsWith('\n')).toBe(true); 
        const lines = content.trim().split('\n');
        const entry = JSON.parse(lines[lines.length - 1]);
        expect(entry.mark).toBe('RESURRECTION_SUCCESS'); // Kills 133
        expect(entry.msg).toBe(`Artifact resurrected to Silver. Reason: Pareto Perfect.`); // Kills 135/136
        expect(entry.port).toBe(5);
        expect(entry.gen).toBe(88);
        
        // Final verification of the log file name used
        // We can't easily kill the filename mutant without checking the filesystem path itself,
        // but if the blackboard log exists, it means the join/ROOT_DIR logic was correct.
        
        // Verify console logs to kill print mutants
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining('PHOENIX FLAME: Resurrecting'));
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining('RESURRECTION COMPLETE'));
        
        fs.unlinkSync(abs);
        fs.unlinkSync(silverFile);
    });

    it('should fail resurrection if target is missing and log error', async () => {
        const result = await resurrect('non_existent.ts', 88, 'Reason');
        expect(result).toBe(false);
        expect(console.error).toHaveBeenCalledWith(expect.stringContaining('ABYSSAL FAILURE: Artifact non_existent.ts not found'));
    });

    it('should block abyssal failure scores (< 80%) and log error', async () => {
        const file = getTestFile('abyssal');
        const abs = path.resolve(ROOT_DIR, file);
        if (!fs.existsSync(path.dirname(abs))) fs.mkdirSync(path.dirname(abs), { recursive: true });
        fs.writeFileSync(abs, 'slop');
        const result = await resurrect(file, 75, 'Sub-optimal');
        expect(result).toBe(false);
        expect(console.error).toHaveBeenCalledWith(expect.stringContaining('is below threshold'));
        fs.unlinkSync(abs);
    });

    it('should block exactly 80.0% if its <= MIN and log error', async () => {
        const file = getTestFile('exact_min');
        const abs = path.resolve(ROOT_DIR, file);
        if (!fs.existsSync(path.dirname(abs))) fs.mkdirSync(path.dirname(abs), { recursive: true });
        fs.writeFileSync(abs, 'slop');
        const result = await resurrect(file, 80.0, 'Strict gate');
        expect(result).toBe(false);
        expect(console.error).toHaveBeenCalledWith(expect.stringContaining('is below threshold'));
        fs.unlinkSync(abs);
    });

    it('should allow scores just above 80%', async () => {
        const file = getTestFile('passing_low');
        const abs = path.resolve(ROOT_DIR, file);
        if (!fs.existsSync(path.dirname(abs))) fs.mkdirSync(path.dirname(abs), { recursive: true });
        fs.writeFileSync(abs, 'pass');
        const result = await resurrect(file, 80.1, 'Passing gate');
        expect(result).toBe(true);
        fs.unlinkSync(abs);
    });

    it('should block AI Theater scores (> 99%) and log error', async () => {
        const file = getTestFile('theater');
        const abs = path.resolve(ROOT_DIR, file);
        if (!fs.existsSync(path.dirname(abs))) fs.mkdirSync(path.dirname(abs), { recursive: true });
        fs.writeFileSync(abs, 'perfect');
        const result = await resurrect(file, 99.9, 'Mock Poisoning');
        expect(result).toBe(false);
        expect(console.error).toHaveBeenCalledWith(expect.stringContaining('AI THEATER DETECTED'));
        fs.unlinkSync(abs);
    });

    it('should block exactly 99.0% if its >= MAX and log error', async () => {
        const file = getTestFile('exact_max');
        const abs = path.resolve(ROOT_DIR, file);
        if (!fs.existsSync(path.dirname(abs))) fs.mkdirSync(path.dirname(abs), { recursive: true });
        fs.writeFileSync(abs, 'perfect');
        const result = await resurrect(file, 99.0, 'Upper gate');
        expect(result).toBe(false);
        expect(console.error).toHaveBeenCalledWith(expect.stringContaining('AI THEATER DETECTED'));
        fs.unlinkSync(abs);
    });

    it('should allow scores just below 99%', async () => {
        const file = getTestFile('passing_high');
        const abs = path.resolve(ROOT_DIR, file);
        if (!fs.existsSync(path.dirname(abs))) fs.mkdirSync(path.dirname(abs), { recursive: true });
        fs.writeFileSync(abs, 'pass');
        const result = await resurrect(file, 98.9, 'High performance');
        expect(result).toBe(true);
        fs.unlinkSync(abs);
    });

    it('should create deep missing dest directories during resurrection', async () => {
        // Use a path that requires multiple mkdir calls
        const deepFile = 'hot_obsidian_sandbox/bronze/2_areas/deeply/nested/file.ts';
        const abs = path.resolve(ROOT_DIR, deepFile);
        if (!fs.existsSync(path.dirname(abs))) fs.mkdirSync(path.dirname(abs), { recursive: true });
        fs.writeFileSync(abs, 'content');

        const result = await resurrect(deepFile, 88, 'Deep test');
        expect(result).toBe(true);
        
        const silverFile = path.resolve(ROOT_DIR, 'hot_obsidian_sandbox/silver/2_areas/deeply/nested/file.ts');
        expect(fs.existsSync(silverFile)).toBe(true);
        
        fs.unlinkSync(abs);
        fs.unlinkSync(silverFile);
        try {
            fs.rmdirSync(path.dirname(silverFile));
            fs.rmdirSync(path.dirname(path.dirname(silverFile)));
        } catch(e) {}
    });

    it('should hit the catch block on copy error and log error', async () => {
        const file = getTestFile('err_trigger');
        const abs = path.resolve(ROOT_DIR, file);
        if (!fs.existsSync(path.dirname(abs))) fs.mkdirSync(path.dirname(abs), { recursive: true });
        fs.writeFileSync(abs, 'trigger');

        const silverFile = path.resolve(ROOT_DIR, 'hot_obsidian_sandbox/silver/1_projects', path.basename(file));
        const silverDir = path.dirname(silverFile);
        if (!fs.existsSync(silverDir)) fs.mkdirSync(silverDir, { recursive: true });
        
        if (fs.existsSync(silverFile)) {
             try { fs.rmSync(silverFile, { recursive: true }); } catch(e) {}
        }
        // Make destination a directory to cause copy failure
        fs.mkdirSync(silverFile);
        
        const result = await resurrect(file, 85, 'Fail test');
        expect(result).toBe(false);
        expect(console.error).toHaveBeenCalledWith(expect.stringContaining('RESURRECTION ERROR'));
        
        fs.unlinkSync(abs);
        fs.rmdirSync(silverFile);
    });
});
