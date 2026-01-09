import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { resurrect } from './RESURRECTION_LOOP.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../../../../');

describe('RESURRECTION_LOOP', () => {
    it('should kill the recursive:false mutant in ensureDir during resurrection', async () => {
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

        const relPath = path.join('hot_obsidian_sandbox/bronze', deepRel);
        await resurrect(relPath, 90, 'Level Test');

        expect(fs.existsSync(silverAbs)).toBe(true);

        try {
            if (fs.existsSync(silverBase)) fs.rmSync(silverBase, { recursive: true, force: true });
            if (fs.existsSync(sourceAbs)) fs.unlinkSync(sourceAbs);
        } catch (e) {}
    });

    it('should kill Goldilocks threshold mutants in resurrection', async () => {
        const testFile = 'hot_obsidian_sandbox/bronze/goldi_test.ts';
        const absFile = path.resolve(ROOT_DIR, testFile);
        if (!fs.existsSync(path.dirname(absFile))) fs.mkdirSync(path.dirname(absFile), { recursive: true });
        fs.writeFileSync(absFile, 'content');

        const low = await resurrect(testFile, 79, 'Too low');
        expect(low).toBe(false);

        const edge = await resurrect(testFile, 81, 'Passable');
        expect(edge).toBe(true);

        const high = await resurrect(testFile, 99.1, 'AI Theater');
        expect(high).toBe(false);

        if (fs.existsSync(absFile)) fs.unlinkSync(absFile);
    });
});
