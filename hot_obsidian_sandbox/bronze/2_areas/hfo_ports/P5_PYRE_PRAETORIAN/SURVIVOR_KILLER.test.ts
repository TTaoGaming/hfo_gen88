import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { demote, danceDie } from './PYRE_DANCE';
import { resurrect } from './RESURRECTION_LOOP';

const ROOT_DIR = path.resolve(__dirname, '../../../../../');
const BB_PATH = path.resolve(ROOT_DIR, 'hot_obsidian_sandbox/hot_obsidianblackboard.jsonl');

describe('Survivor Killer (Port 5 Hardening)', () => {
    const testDir = 'hot_obsidian_sandbox/bronze/1_projects/survivor_test_kill';
    const sandboxDir = path.resolve(ROOT_DIR, testDir);
    
    beforeEach(() => {
        if (!fs.existsSync(sandboxDir)) fs.mkdirSync(sandboxDir, { recursive: true });
        if (fs.existsSync(BB_PATH)) fs.truncateSync(BB_PATH, 0);
        vi.spyOn(console, 'log').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
        if (fs.existsSync(sandboxDir)) fs.rmSync(sandboxDir, { recursive: true, force: true });
        // Clean up global artifacts
        const externalPath = 'ROOT_GOVERNANCE_MANIFEST.md.tmp';
        const externalAbs = path.resolve(ROOT_DIR, externalPath);
        if (fs.existsSync(externalAbs)) fs.rmSync(externalAbs);
        const archiveFile = path.resolve(ROOT_DIR, '4_archive', externalPath);
        if (fs.existsSync(archiveFile)) fs.rmSync(archiveFile);
    });

    it('should kill Mutant 11: handle paths outside hot_obsidian_sandbox', async () => {
        const externalPath = 'ROOT_GOVERNANCE_MANIFEST.md.tmp';
        const absPath = path.resolve(ROOT_DIR, externalPath);
        fs.writeFileSync(absPath, 'test content');

        const result = await demote(externalPath, [{ type: 'POLLUTION', msg: 'Outside' }]);
        expect(result.action).toBe('demoted');
        expect(fs.existsSync(absPath)).toBe(false);
    });

    it('should kill Mutant 27: handle existing archive directory', async () => {
        const file = testDir + '/mutant27.ts';
        const abs = path.resolve(ROOT_DIR, file);
        if (!fs.existsSync(path.dirname(abs))) fs.mkdirSync(path.dirname(abs), { recursive: true });
        fs.writeFileSync(abs, 'content');
        
        const archiveDir = path.resolve(ROOT_DIR, 'hot_obsidian_sandbox/bronze/4_archive/1_projects/survivor_test_kill');
        if (!fs.existsSync(archiveDir)) fs.mkdirSync(archiveDir, { recursive: true });

        const result = await demote(file, [{ type: 'POLLUTION', msg: 'test' }]);
        expect(result.action).toBe('demoted');
        expect(fs.existsSync(abs)).toBe(false);
    });

    it('should kill Mutants 30, 31: recursive mkdir failure', async () => {
        const file = testDir + '/fail_mkdir_30.ts';
        const abs = path.resolve(ROOT_DIR, file);
        fs.writeFileSync(abs, 'content');

        // Block with a file where a directory should be
        const blockerDir = path.resolve(ROOT_DIR, 'hot_obsidian_sandbox/bronze/4_archive/1_projects');
        if (fs.existsSync(blockerDir)) fs.rmSync(blockerDir, { recursive: true, force: true });
        fs.writeFileSync(blockerDir, 'I am a blocker file');

        const result = await demote(file, [{ type: 'POLLUTION', msg: 'mkdir fail' }]);
        expect(result.action).toBe('skipped');
        expect(console.error).toHaveBeenCalled();
        
        fs.rmSync(blockerDir);
    });

    it('should kill Mutants 81, 83: verify specific violation types trigger demote', async () => {
        const file = testDir + '/dance_trigger.ts';
        const abs = path.resolve(ROOT_DIR, file);

        const runTest = async (type: string) => {
            if (!fs.existsSync(path.dirname(abs))) fs.mkdirSync(path.dirname(abs), { recursive: true });
            fs.writeFileSync(abs, 'code');
            return await danceDie([{ file, type, message: 'msg' }]);
        };

        // BDD_MISALIGNMENT should trigger demote (Kills 81)
        let res = await runTest('BDD_MISALIGNMENT');
        expect(res[0].action).toBe('demoted');

        // POLLUTION should trigger demote (Kills 83)
        res = await runTest('POLLUTION');
        expect(res[0].action).toBe('demoted');

        // UNKNOWN should NOT trigger demote for Bronze
        res = await runTest('UNKNOWN');
        expect(res[0].action).toBe('skipped');
    });

    it('should kill RESURRECTION mutants 133, 135, 136, 144 by full field check', async () => {
        const file = testDir + '/res_test_final.ts';
        const abs = path.resolve(ROOT_DIR, file);
        fs.writeFileSync(abs, 'perfect code');

        await resurrect(file, 88.0, 'Golden');
        
        const content = fs.readFileSync(BB_PATH, 'utf8').trim();
        const entry = JSON.parse(content.split('\n').pop()!);
        
        expect(entry.mark).toBe('RESURRECTION_SUCCESS');
        expect(entry.msg).toBe('Artifact resurrected to Silver. Reason: Golden.');
        expect(entry.gen).toBe(88);
        expect(entry.hive).toBe('HFO_GEN88');
        expect(entry.type).toBe('PROGRESS');
        expect(entry.port).toBe(5);
    });
});
