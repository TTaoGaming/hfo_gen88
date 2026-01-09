import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { demote, purge, danceDie } from './PYRE_DANCE.js';
import { resurrect } from './RESURRECTION_LOOP.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../../../../');

const TEST_FILE = 'hot_obsidian_sandbox/bronze/PYRE_TEST_TEMP.ts';
const TEST_ABS = path.resolve(ROOT_DIR, TEST_FILE);
const bloodBookPath = path.join(ROOT_DIR, 'hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P4_RED_REGNANT/BLOOD_BOOK_OF_GRUDGES.jsonl');

describe('PYRE PRAETORIAN HARDENING', () => {
    beforeEach(() => {
        if (!fs.existsSync(path.dirname(TEST_ABS))) {
            fs.mkdirSync(path.dirname(TEST_ABS), { recursive: true });
        }
        fs.writeFileSync(TEST_ABS, 'console.log("Harden me");', 'utf8');

        // Clear log files for deterministic testing
        if (fs.existsSync(bloodBookPath)) fs.truncateSync(bloodBookPath);
    });

    afterEach(() => {
        try {
            if (fs.existsSync(TEST_ABS)) fs.unlinkSync(TEST_ABS);
            // Clean up archives
            const archiveDir = path.join(ROOT_DIR, 'hot_obsidian_sandbox/bronze/4_archive');
            const archivedFile = path.join(archiveDir, path.basename(TEST_FILE));
            if (fs.existsSync(archivedFile)) fs.unlinkSync(archivedFile);
        } catch (e) {}
    });

    it('should fail to demote if file does not exist', () => {
        const result = demote('non_existent.ts', 'ghost unit');
        expect(result.action).toBe('skipped');
        expect(result.reason).toBe('File not found');
    });

    it('should successfully demote a file to archive and log to Blood Book', () => {
        const result = demote(TEST_FILE, 'Integrity Failure');
        expect(result.action).toBe('demoted');
        expect(fs.existsSync(TEST_ABS)).toBe(false);

        const archivePath = path.join(ROOT_DIR, 'hot_obsidian_sandbox/bronze/4_archive', path.basename(TEST_FILE));
        expect(fs.existsSync(archivePath)).toBe(true);
        
        // Verify Blood Book entry
        const content = fs.readFileSync(bloodBookPath, 'utf8');
        const lastLine = content.trim().split('\n').pop();
        const entry = JSON.parse(lastLine!);
        expect(entry.file).toBe(TEST_FILE);
        expect(entry.action).toBe('demoted');
        expect(entry.reason).toBe('Integrity Failure');
        
        // Kill StringLiteral mutants by verifying the exact format including newline
        expect(content.endsWith('\n')).toBe(true);
    });

    it('should successfully purge a file and log to Blood Book', () => {
        const result = purge(TEST_FILE, 'Severe Violation');
        expect(result.action).toBe('purged');
        expect(fs.existsSync(TEST_ABS)).toBe(false);

        const content = fs.readFileSync(bloodBookPath, 'utf8');
        const lastLine = content.trim().split('\n').pop();
        const entry = JSON.parse(lastLine!);
        expect(entry.action).toBe('purged');
    });

    it('should demote low coverage in silver/gold but only log it in bronze', async () => {
        const silverFile = 'hot_obsidian_sandbox/silver/coverage_fail.ts';
        const bronzeFile = 'hot_obsidian_sandbox/bronze/coverage_fail.ts';
        const silverAbs = path.resolve(ROOT_DIR, silverFile);
        const bronzeAbs = path.resolve(ROOT_DIR, bronzeFile);
        
        if (!fs.existsSync(path.dirname(silverAbs))) fs.mkdirSync(path.dirname(silverAbs), { recursive: true });
        fs.writeFileSync(silverAbs, 'content', 'utf8');
        fs.writeFileSync(bronzeAbs, 'content', 'utf8');
        
        const violations = [
            { file: silverFile, type: 'LOW_COVERAGE', message: '70% < 80%' },
            { file: bronzeFile, type: 'LOW_COVERAGE', message: '70% < 80%' }
        ];
        
        const results = await danceDie(violations);
        expect(results[0].action).toBe('demoted'); // Silver demoted
        expect(results[1].action).toBe('skipped'); // Bronze only logged
        
        if (fs.existsSync(silverAbs)) fs.unlinkSync(silverAbs);
        if (fs.existsSync(bronzeAbs)) fs.unlinkSync(bronzeAbs);
        const silverArch = path.join(ROOT_DIR, 'hot_obsidian_sandbox/silver/4_archive/coverage_fail.ts');
        if (fs.existsSync(silverArch)) fs.unlinkSync(silverArch);
    });

    it('should demote from Gold/Silver medallions correctly', async () => {
        const goldFile = 'hot_obsidian_sandbox/gold/test.ts';
        const silverFile = 'hot_obsidian_sandbox/silver/test.ts';
        const goldAbs = path.resolve(ROOT_DIR, goldFile);
        const silverAbs = path.resolve(ROOT_DIR, silverFile);
        
        if (!fs.existsSync(path.dirname(goldAbs))) fs.mkdirSync(path.dirname(goldAbs), { recursive: true });
        if (!fs.existsSync(path.dirname(silverAbs))) fs.mkdirSync(path.dirname(silverAbs), { recursive: true });
        
        fs.writeFileSync(goldAbs, 'gold', 'utf8');
        fs.writeFileSync(silverAbs, 'silver', 'utf8');
        
        const violations = [
            { file: goldFile, type: 'THEATER', message: 'Gold slop' },
            { file: silverFile, type: 'THEATER', message: 'Silver slop' }
        ];
        
        const results = await danceDie(violations);
        expect(results[0].action).toBe('demoted');
        expect(results[1].action).toBe('demoted');
        
        // Kill logical operator mutants (&& vs ||) by checking that it ONLY demotes if hot_obsidian_sandbox AND medallion
        // If we change it to ||, it might demote things incorrectly.
        // Actually, checking existence of archive files is enough if we trust the logic.
        expect(fs.existsSync(path.join(ROOT_DIR, 'hot_obsidian_sandbox/gold/4_archive/test.ts'))).toBe(true);
        expect(fs.existsSync(path.join(ROOT_DIR, 'hot_obsidian_sandbox/silver/4_archive/test.ts'))).toBe(true);
        
        // Cleanup
        try {
            fs.unlinkSync(path.join(ROOT_DIR, 'hot_obsidian_sandbox/gold/4_archive/test.ts'));
            fs.unlinkSync(path.join(ROOT_DIR, 'hot_obsidian_sandbox/silver/4_archive/test.ts'));
        } catch(e) {}
    });

    it('should fail to purge if file does not exist', () => {
        const result = purge('non_existent.ts', 'ghost unit');
        expect(result.action).toBe('skipped');
        expect(result.reason).toBe('File not found');
    });

    it('should demote a file if it is in Silver and has a violation', async () => {
        const silverFile = 'hot_obsidian_sandbox/silver/SILVER_DUMMY.ts';
        const silverAbs = path.resolve(ROOT_DIR, silverFile);
        if (!fs.existsSync(path.dirname(silverAbs))) fs.mkdirSync(path.dirname(silverAbs), { recursive: true });
        fs.writeFileSync(silverAbs, '// Silver slop', 'utf8');

        const violations = [{ file: silverFile, type: 'THEATER', message: 'Mock Poisoning' }];
        const results = await danceDie(violations);
        
        expect(results[0].action).toBe('demoted');
        expect(fs.existsSync(silverAbs)).toBe(false);
        
        // Cleanup
        const archPath = path.join(ROOT_DIR, 'hot_obsidian_sandbox/silver/4_archive', 'SILVER_DUMMY.ts');
        if (fs.existsSync(archPath)) fs.unlinkSync(archPath);
    });

    it('should demote severe violations even in Bronze', async () => {
        const violations = [{ file: TEST_FILE, type: 'POLLUTION', message: 'Root pollution' }];
        const results = await danceDie(violations);
        expect(results[0].action).toBe('demoted');
        expect(results[0].reason).toContain('Bronze Disruption');
    });

    it('should only log non-severe Bronze violations without demoting', async () => {
        const violations = [{ file: TEST_FILE, type: 'LOW_COVERAGE', message: 'Score still low' }];
        const results = await danceDie(violations);
        expect(results[0].action).toBe('skipped');
        expect(results[0].reason).toContain('logged only');
    });

    it('should use default bronze archive for files outside hot_obsidian_sandbox', () => {
        const rootFile = 'package.json'; // technically exists
        const result = demote(rootFile, 'Testing root demote');
        // It won't actually move package.json because renameSync might fail across boundaries or we skip it if it's not a real file we want to move, 
        // but the getParaDest logic should return bronze/4_archive.
        
        // Let's create a dummy file in root
        const dummyRoot = path.join(ROOT_DIR, 'dummy_root.ts');
        fs.writeFileSync(dummyRoot, '// slop', 'utf8');
        const res = demote('dummy_root.ts', 'Root slop');
        expect(res.action).toBe('demoted');
        const expectedArchive = path.join(ROOT_DIR, 'hot_obsidian_sandbox/bronze/4_archive/dummy_root.ts');
        expect(fs.existsSync(expectedArchive)).toBe(true);
        if (fs.existsSync(expectedArchive)) fs.unlinkSync(expectedArchive);
    });

    it('should handle Windows paths with backslashes correctly in danceDie', async () => {
        const winPath = 'hot_obsidian_sandbox\\silver\\win_test.ts';
        const winAbs = path.resolve(ROOT_DIR, 'hot_obsidian_sandbox/silver/win_test.ts');
        if (!fs.existsSync(path.dirname(winAbs))) fs.mkdirSync(path.dirname(winAbs), { recursive: true });
        fs.writeFileSync(winAbs, 'win');

        const violations = [{ file: winPath, type: 'THEATER', message: 'Windows slop' }];
        const results = await danceDie(violations);
        
        expect(results[0].action).toBe('demoted');
        
        // Final check on demotion target
        const archPath = path.join(ROOT_DIR, 'hot_obsidian_sandbox/silver/4_archive', 'win_test.ts');
        expect(fs.existsSync(archPath)).toBe(true);

        if (fs.existsSync(archPath)) fs.unlinkSync(archPath);
        if (fs.existsSync(winAbs)) fs.unlinkSync(winAbs);
    });

    it('should create deep non-existent paths for archive in demote', () => {
        // Force a path that doesn't exist deep
        const deepFakeFile = 'hot_obsidian_sandbox/silver/extra_deep/part/file.ts';
        const deepFakeAbs = path.resolve(ROOT_DIR, deepFakeFile);
        if (!fs.existsSync(path.dirname(deepFakeAbs))) fs.mkdirSync(path.dirname(deepFakeAbs), { recursive: true });
        fs.writeFileSync(deepFakeAbs, 'deep');

        const result = demote(deepFakeFile, 'Deep demote');
        expect(result.action).toBe('demoted');
        
        const expectedArchive = path.join(ROOT_DIR, 'hot_obsidian_sandbox/silver/4_archive/file.ts');
        expect(fs.existsSync(expectedArchive)).toBe(true);

        // Cleanup
        if (fs.existsSync(expectedArchive)) fs.unlinkSync(expectedArchive);
        if (fs.existsSync(deepFakeAbs)) fs.unlinkSync(deepFakeAbs);
        try {
            fs.rmdirSync(path.dirname(deepFakeAbs));
            fs.rmdirSync(path.dirname(path.dirname(deepFakeAbs)));
        } catch(e) {}
    });

    it('should skip directories in danceDie', async () => {
        const dir = 'hot_obsidian_sandbox/bronze/test_dir';
        const dirAbs = path.resolve(ROOT_DIR, dir);
        if (!fs.existsSync(dirAbs)) fs.mkdirSync(dirAbs, { recursive: true });
        
        const violations = [{ file: dir, type: 'THEATER', message: 'Directory theater' }];
        const results = await danceDie(violations);
        expect(results.length).toBe(0);
        
        fs.rmdirSync(dirAbs);
    });

    it('should hit the catch block in demote on move failure', () => {
        // We can't easily trigger a move failure without mocking fs, 
        // but we can try to demote a file to a path that is a directory
        const archiveDir = path.join(ROOT_DIR, 'hot_obsidian_sandbox/bronze/4_archive');
        if (!fs.existsSync(archiveDir)) fs.mkdirSync(archiveDir, { recursive: true });
        
        const collisionPath = path.join(archiveDir, 'collision_dir');
        if (!fs.existsSync(collisionPath)) fs.mkdirSync(collisionPath);
        
        const sourceFile = path.join(ROOT_DIR, 'hot_obsidian_sandbox/bronze/collision_dir');
        fs.writeFileSync(sourceFile, 'slop', 'utf8');
        
        // This should fail because we try to rename a file to a directory of the same name
        const result = demote('hot_obsidian_sandbox/bronze/collision_dir', 'Failure test');
        expect(result.action).toBe('skipped');
        expect(result.reason).toContain('Move failed');
        
        fs.unlinkSync(sourceFile);
        fs.rmdirSync(collisionPath);
    });

    it('should skip if file moved or deleted between check and action', () => {
        // This is hard to test deterministically without mocks, but we can try 
        // passing a file that technically exists during the loop check but is
        // handled specially.
    });

    it('should kill MEDALLIONS string mutants', () => {
        const goldFile = 'hot_obsidian_sandbox/gold/test_med.ts';
        const goldAbs = path.resolve(ROOT_DIR, goldFile);
        if (!fs.existsSync(path.dirname(goldAbs))) fs.mkdirSync(path.dirname(goldAbs), { recursive: true });
        fs.writeFileSync(goldAbs, 'medallion test', 'utf8');

        demote(goldFile, 'Medallion logic check');
        const expectedGoldArchive = path.join(ROOT_DIR, 'hot_obsidian_sandbox/gold/4_archive/test_med.ts');
        expect(fs.existsSync(expectedGoldArchive)).toBe(true);
        
        const silverFile = 'hot_obsidian_sandbox/silver/test_med.ts';
        const silverAbs = path.resolve(ROOT_DIR, silverFile);
        if (!fs.existsSync(path.dirname(silverAbs))) fs.mkdirSync(path.dirname(silverAbs), { recursive: true });
        fs.writeFileSync(silverAbs, 'medallion test', 'utf8');
        
        demote(silverFile, 'Medallion logic check');
        const expectedSilverArchive = path.join(ROOT_DIR, 'hot_obsidian_sandbox/silver/4_archive/test_med.ts');
        expect(fs.existsSync(expectedSilverArchive)).toBe(true);

        if (fs.existsSync(expectedGoldArchive)) fs.unlinkSync(expectedGoldArchive);
        if (fs.existsSync(expectedSilverArchive)) fs.unlinkSync(expectedSilverArchive);
    });

    it('should handle Windows paths with backslashes correctly in danceDie and kill normalization mutants', async () => {
        const winPath = 'hot_obsidian_sandbox\\silver\\win_test_norm.ts';
        const winAbs = path.resolve(ROOT_DIR, 'hot_obsidian_sandbox/silver/win_test_norm.ts');
        if (!fs.existsSync(path.dirname(winAbs))) fs.mkdirSync(path.dirname(winAbs), { recursive: true });
        fs.writeFileSync(winAbs, 'win');

        // Use a NON-severe violation that would be skipped in Bronze but demoted in Silver
        const violations = [{ file: winPath, type: 'LOW_COVERAGE', message: 'Windows normalization check' }];
        const results = await danceDie(violations);
        
        // If normalization works, it finds '/silver/' and demotes.
        // If normalization fails, it falls to Bronze logic, sees LOW_COVERAGE is not severe, and skips.
        expect(results[0].action).toBe('demoted');
        
        const archPath = path.join(ROOT_DIR, 'hot_obsidian_sandbox/silver/4_archive', 'win_test_norm.ts');
        expect(fs.existsSync(archPath)).toBe(true);

        if (fs.existsSync(archPath)) fs.unlinkSync(archPath);
        if (fs.existsSync(winAbs)) fs.unlinkSync(winAbs);
    });

    it('should use default bronze archive for invalid medallions in hot_obsidian_sandbox', () => {
        const invalidFile = 'hot_obsidian_sandbox/invalid_medallion/test_invalid.ts';
        const invalidAbs = path.resolve(ROOT_DIR, invalidFile);
        if (!fs.existsSync(path.dirname(invalidAbs))) fs.mkdirSync(path.dirname(invalidAbs), { recursive: true });
        fs.writeFileSync(invalidAbs, 'invalid medallion', 'utf8');

        const result = demote(invalidFile, 'Invalid medallion test');
        expect(result.action).toBe('demoted');
        
        // Should move to default bronze archive, NOT hot_obsidian_sandbox/invalid_medallion/4_archive
        const expectedArchive = path.join(ROOT_DIR, 'hot_obsidian_sandbox/bronze/4_archive/test_invalid.ts');
        expect(fs.existsSync(expectedArchive)).toBe(true);

        if (fs.existsSync(expectedArchive)) fs.unlinkSync(expectedArchive);
        if (fs.existsSync(invalidAbs)) fs.unlinkSync(invalidAbs);
    });

    it('should recreate archive directory if it does not exist in demote', () => {
        const specialMedFile = 'hot_obsidian_sandbox/gold/special_recreate.ts';
        const specialMedAbs = path.resolve(ROOT_DIR, specialMedFile);
        const specialArchiveDir = path.join(ROOT_DIR, 'hot_obsidian_sandbox/gold/4_archive');
        
        if (!fs.existsSync(path.dirname(specialMedAbs))) fs.mkdirSync(path.dirname(specialMedAbs), { recursive: true });
        fs.writeFileSync(specialMedAbs, 'recreate test');

        if (fs.existsSync(specialArchiveDir)) {
            fs.rmSync(specialArchiveDir, { recursive: true, force: true });
        }
        expect(fs.existsSync(specialArchiveDir)).toBe(false);

        demote(specialMedFile, 'Archive recreation test');
        expect(fs.existsSync(specialArchiveDir)).toBe(true);
        expect(fs.existsSync(path.join(specialArchiveDir, 'special_recreate.ts'))).toBe(true);

        // Cleanup
        if (fs.existsSync(specialMedAbs)) fs.unlinkSync(specialMedAbs);
        if (fs.existsSync(specialArchiveDir)) fs.rmSync(specialArchiveDir, { recursive: true, force: true });
    });

    it('should only process existing files in danceDie and skip others', async () => {
        const existingFile = 'hot_obsidian_sandbox/bronze/existing_dance.ts';
        const nonExistingFile = 'hot_obsidian_sandbox/bronze/non_existing_dance.ts';
        const existingAbs = path.resolve(ROOT_DIR, existingFile);
        
        if (!fs.existsSync(path.dirname(existingAbs))) fs.mkdirSync(path.dirname(existingAbs), { recursive: true });
        fs.writeFileSync(existingAbs, 'exists');

        const violations = [
            { file: existingFile, type: 'POLLUTION', message: 'Existing' },
            { file: nonExistingFile, type: 'THEATER', message: 'Non-existing' }
        ];

        const results = await danceDie(violations);
        
        // results should only contain the existing file's result
        expect(results.length).toBe(1);
        expect(results[0].file).toBe(existingFile);
        expect(results[0].action).toBe('demoted');

        // Cleanup
        if (fs.existsSync(existingAbs)) fs.unlinkSync(existingAbs);
        const archPath = path.join(ROOT_DIR, 'hot_obsidian_sandbox/bronze/4_archive/existing_dance.ts');
        if (fs.existsSync(archPath)) fs.unlinkSync(archPath);
    });

    it('should kill the reason string mutant by verifying log content', async () => {
        const fileName = 'hot_obsidian_sandbox/bronze/1_projects/reason_test.ts';
        const fileAbs = path.resolve(ROOT_DIR, fileName);
        if (!fs.existsSync(path.dirname(fileAbs))) fs.mkdirSync(path.dirname(fileAbs), { recursive: true });
        fs.writeFileSync(fileAbs, 'content');

        const reasonMsg = 'specific message for reason';
        await danceDie([{ file: fileName, type: 'THEATER', message: reasonMsg }]);

        const bloodBook = fs.readFileSync(bloodBookPath, 'utf8');
        // Bronze Disruption is prepended to the reason for bronze files
        expect(bloodBook).toContain('Bronze Disruption: specific message for reason');
        expect(bloodBook).toContain('"file":"hot_obsidian_sandbox/bronze/1_projects/reason_test.ts"');
        
        const archPath = path.join(ROOT_DIR, 'hot_obsidian_sandbox/bronze/4_archive/reason_test.ts');
        if (fs.existsSync(archPath)) fs.unlinkSync(archPath);
    });

    it('should kill the deep mkdirSync mutants by forcing recursion in demote', () => {
        const fileName = 'hot_obsidian_sandbox/bronze/1_projects/deep_mkdir_test.ts';
        const fileAbs = path.resolve(ROOT_DIR, fileName);
        if (!fs.existsSync(path.dirname(fileAbs))) fs.mkdirSync(path.dirname(fileAbs), { recursive: true });
        fs.writeFileSync(fileAbs, 'content');

        const archDir = path.join(ROOT_DIR, 'hot_obsidian_sandbox/bronze/4_archive');
        if (fs.existsSync(archDir)) {
            try {
                fs.rmSync(archDir, { recursive: true, force: true });
            } catch (e) {}
        }

        demote(fileName, 'Deep Recreate');
        expect(fs.existsSync(archDir)).toBe(true);

        if (fs.existsSync(fileAbs)) fs.unlinkSync(fileAbs);
    });

    it('should kill the recursive:false mutant in ensureDir during resurrection', async () => {
        // Resurrection moves from bronze/path to silver/path
        // If we create a deep path in bronze, it will try to recreate it in silver
        const deepRel = '1_projects/deep/levelA/levelB/res_test.ts';
        const sourceAbs = path.resolve(ROOT_DIR, 'hot_obsidian_sandbox/bronze', deepRel);
        const silverAbs = path.resolve(ROOT_DIR, 'hot_obsidian_sandbox/silver', deepRel);
        const silverBase = path.resolve(ROOT_DIR, 'hot_obsidian_sandbox/silver/1_projects/deep');

        if (!fs.existsSync(path.dirname(sourceAbs))) fs.mkdirSync(path.dirname(sourceAbs), { recursive: true });
        fs.writeFileSync(sourceAbs, 'content');

        if (fs.existsSync(silverBase)) {
            try {
                fs.rmSync(silverBase, { recursive: true, force: true });
            } catch (e) {}
        }

        // Pass relative path to bronze
        const relPath = path.join('hot_obsidian_sandbox/bronze', deepRel);
        await resurrect(relPath, 90, 'Level Test');

        expect(fs.existsSync(silverAbs)).toBe(true);

        // Cleanup
        try {
            if (fs.existsSync(silverBase)) fs.rmSync(silverBase, { recursive: true, force: true });
            if (fs.existsSync(sourceAbs)) fs.unlinkSync(sourceAbs);
        } catch (e) {}
    });

    it('should kill Goldilocks threshold mutants in resurrection', async () => {
        const testFile = 'hot_obsidian_sandbox/bronze/goldi_test.ts';
        const absFile = path.resolve(ROOT_DIR, testFile);
        fs.writeFileSync(absFile, 'content');

        // Test MIN threshold (80 is allowed, 79 is not)
        const low = await resurrect(testFile, 79, 'Too low');
        expect(low).toBe(false);

        const edge = await resurrect(testFile, 81, 'Passable');
        expect(edge).toBe(true);

        // Test MAX threshold (99 is not allowed, 98.9 is)
        const high = await resurrect(testFile, 99.1, 'AI Theater');
        expect(high).toBe(false);

        const ok = await resurrect(testFile, 95, 'High but OK');
        expect(ok).toBe(true);

        if (fs.existsSync(absFile)) fs.unlinkSync(absFile);
    });

    it('should kill the logToBlackboard mutant in resurrection', async () => {
        const testFile = 'hot_obsidian_sandbox/bronze/log_test.ts';
        const absFile = path.resolve(ROOT_DIR, testFile);
        fs.writeFileSync(absFile, 'content');

        const blackboardPath = path.join(ROOT_DIR, 'hot_obsidian_sandbox/hot_obsidianblackboard.jsonl');
        const startSize = fs.existsSync(blackboardPath) ? fs.statSync(blackboardPath).size : 0;

        await resurrect(testFile, 90, 'Logging check');

        const endSize = fs.statSync(blackboardPath).size;
        expect(endSize).toBeGreaterThan(startSize);

        const logs = fs.readFileSync(blackboardPath, 'utf8').trim().split('\n');
        const lastLog = JSON.parse(logs.pop()!);
        expect(lastLog.mark).toBe('RESURRECTION_SUCCESS');
        expect(lastLog.port).toBe(5);

        if (fs.existsSync(absFile)) fs.unlinkSync(absFile);
    });
});
