import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Set test mode before importing the module
process.env.HFO_TEST_MODE = 'true';

import { 
    checkRootPollution, 
    checkMutationProof, 
    auditContent,
    scanMedallions,
    executePyreAudit,
    violations,
    clearViolations,
    scream,
    ALLOWED_ROOT_FILES,
    ALLOWED_ROOT_PATTERNS,
    ROOT_DIR,
    BRONZE_DIR,
    HOT_DIR,
    IS_TEST_MODE,
    CacaoPlaybookSchema,
    BloodBookEntrySchema,
    ManifestSchema
} from './PYRE_PRAETORIAN.js';

vi.mock('node:fs');

describe('Pyre Praetorian: Immunological Defense (Lockdown Suite)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        clearViolations();
        vi.mocked(fs.existsSync).mockReturnValue(true);
    });

    describe('Environment & Scream Protocol (Killing Core mutants)', () => {
        it('should have non-negotiable environments', () => {
            expect(IS_TEST_MODE).toBe(true);
            expect(typeof ROOT_DIR).toBe('string');
        });

        it('should handle non-string files in scream (Killing Ternary mutants)', () => {
            scream({ file: { name: 'object-file' } as any, type: 'THEATER', message: 'test' });
            expect(violations[0].file).toBe('object-file');
            
            clearViolations();
            scream({ file: 123 as any, type: 'THEATER', message: 'test' });
            expect(violations[0].file).toBe('123');
            
            clearViolations();
            scream({ file: null as any, type: 'THEATER', message: 'test' });
            expect(violations[0].file).toBe('UNKNOWN');
        });
    });

    describe('Additional Coverage (Pushing score to 80%+)', () => {
        it('should allow debug logs with @permitted', () => {
            const strict = path.join(HOT_DIR, 'silver', 'logic.ts');
            auditContent(strict, 'console.log("test"); // @permitted\nProvenance: test');
            expect(violations.find(v => v.type === 'AMNESIA')).toBeUndefined();
        });

        it('should allow any with @bespoke', () => {
            const strict = path.join(HOT_DIR, 'silver', 'logic.ts');
            auditContent(strict, 'const x: any = 1; // @bespoke\nProvenance: test');
            expect(violations.find(v => v.type === 'BESPOKE')).toBeUndefined();
        });

        it('should handle mutation report parse failures', () => {
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readFileSync).mockReturnValue('invalid json');
            checkMutationProof(80);
            expect(violations.some(v => v.type === 'MUTATION_GAP')).toBe(true);
        });

        it('should handle missing mutation report', () => {
            const reportPath = path.join(BRONZE_DIR, 'infra/reports/mutation/mutation.json');
            vi.mocked(fs.existsSync).mockImplementation((p) => p !== reportPath);
            checkMutationProof(80);
            expect(violations.some(v => v.type === 'MUTATION_GAP')).toBe(true);
        });
        
        it('should detect TODO and FIXME', () => {
            auditContent('file.ts', '// TODO items');
            expect(violations.some(v => v.type === 'DEBT' && v.message.includes('TODO/FIXME'))).toBe(true);
            clearViolations();
            auditContent('file.ts', '// FIXME items');
            expect(violations.some(v => v.type === 'DEBT' && v.message.includes('TODO/FIXME'))).toBe(true);
        });

        it('should detect console.debug in strict zones', () => {
            const strict = path.join(HOT_DIR, 'gold', 'logic.ts');
            auditContent(strict, 'console.debug("test");\nProvenance: test');
            expect(violations.some(v => v.type === 'AMNESIA')).toBe(true);
        });

        it('should detect PHANTOM dependencies in index.html', () => {
            auditContent('index.html', '<script src="https://cdn.com/lib.js"></script>');
            expect(violations.find(v => v.type === 'PHANTOM')?.message).toBe('External CDN dependency detected.');
            clearViolations();
            auditContent('script.ts', 'fetch("http://cdn.com/api")');
            expect(violations.find(v => v.type === 'PHANTOM')).toBeDefined();
        });

        it('should detect BDD_MISALIGNMENT in strict zones', () => {
            const strict = path.join(HOT_DIR, 'silver', 'logic.ts');
            // Missing Validates or @provenance
            auditContent(strict, 'Provenance: test\nconst x = 1;');
            expect(violations.find(v => v.type === 'BDD_MISALIGNMENT')?.message).toBe('Implementation file missing requirement traceability (Validates: or @provenance).');
            
            clearViolations();
            // Has Validates
            auditContent(strict, 'Provenance: test\n// Validates: Req1');
            expect(violations.some(v => v.type === 'BDD_MISALIGNMENT')).toBe(false);
        });
    });

    describe('Strict Coverage (Killing Exact String Mutants)', () => {
        it('should match violation messages exactly', () => {
            auditContent('file.ts', '// TODO');
            expect(violations[0].message).toBe('TODO/FIXME detected.');
            clearViolations();
            
            vi.mocked(fs.readdirSync).mockReturnValue([{ name: 'POISON.exe', isDirectory: () => false }] as any);
            checkRootPollution();
            const badFile = violations.find(v => v.type === 'POLLUTION');
            if (badFile) {
                expect(badFile.message).toBe('Unauthorized root file detected.');
            }
        });

        it('should verify mutation score boundary conditions', () => {
             vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
                 metrics: { mutationScore: 80 }
             }));
             checkMutationProof(80);
             expect(violations.some(v => v.type === 'MUTATION_FAILURE')).toBe(false);

             clearViolations();
             vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
                 metrics: { mutationScore: 79.9 }
             }));
             checkMutationProof(80);
             expect(violations.some(v => v.type === 'MUTATION_FAILURE')).toBe(true);
             
             clearViolations();
             vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
                 metrics: { mutationScore: 99 }
             }));
             checkMutationProof(80);
             expect(violations.some(v => v.type === 'THEATER')).toBe(true);
        });

        it('should handle non-number mutation score', () => {
             vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
                 metrics: { mutationScore: "100" }
             }));
             checkMutationProof(80);
             expect(violations.find(v => v.message === 'Invalid score format in metrics.')).toBeDefined();
        });
        
        it('should detect unauthorized debug logs correctly', () => {
             const strict = path.join(HOT_DIR, 'silver', 'logic.ts');
             auditContent(strict, 'console.log("test");\nProvenance: test');
             expect(violations.find(v => v.type === 'AMNESIA')?.message).toBe('Unauthorized debug logs.');
        });

        it('should detect bespoke any correctly', () => {
             const strict = path.join(HOT_DIR, 'silver', 'logic.ts');
             auditContent(strict, 'let x: any;\nProvenance: test');
             expect(violations.find(v => v.type === 'BESPOKE')?.message).toBe('Bespoke "any" type without justification.');
        });
        it('should detect violations in special zones', () => {
             const areaPath = path.join(HOT_DIR, '2_areas', 'logic.ts');
             auditContent(areaPath, 'console.log("test");\nProvenance: test');
             expect(violations.some(v => v.type === 'AMNESIA')).toBe(true);

             clearViolations();
             const goldPath = path.join(HOT_DIR, 'gold', 'logic.ts');
             auditContent(goldPath, 'console.log("test");\nProvenance: test');
             expect(violations.some(v => v.type === 'AMNESIA')).toBe(true);
        });        
        it('should kill mutants in ALLOWED_ROOT_FILES list by process of exclusion', () => {
            // We can't easily mutate the constant in the test, 
            // but we can ensure every entry in ALLOWED_ROOT_FILES is actually used 
            // if we were to mock readdir results for each.
            // But checking ALL of them is tedious. Let's do a few key ones.
            const important = ['package.json', 'stryker.root.config.mjs', 'vitest.root.config.ts', '.gitignore'];
            important.forEach(file => {
                vi.mocked(fs.readdirSync).mockReturnValue([{ name: file, isDirectory: () => false }] as any);
                checkRootPollution();
                expect(violations).toHaveLength(0);
                clearViolations();
            });
        });
    });

    describe('Schemas & Data Integrity (Killing Zod mutants)', () => {
        it('should validate Manifest and block invalid DNA', () => {
            const valid = {
                identity: { port: 4, commander: 'Red' },
                galois_lattice: { coordinate: [1, 1] },
                dna: { hfo_generation: 88 }
            };
            expect(ManifestSchema.parse(valid)).toMatchObject(valid);
            expect(() => ManifestSchema.parse({ ...valid, identity: { port: '4' } as any })).toThrow();
            expect(() => ManifestSchema.parse({ ...valid, galois_lattice: { coordinate: [1] } })).toThrow();
        });

        it('should validate Playbook format (Killing literal mutants)', () => {
            const pb = { type: 'playbook', id: 'playbook--1', name: 'N', description: 'D', steps: [{ type: 'T', name: 'N', description: 'D' }] };
            expect(CacaoPlaybookSchema.parse(pb)).toMatchObject(pb);
            
            // Negative ID check
            expect(() => CacaoPlaybookSchema.parse({ ...pb, id: 'pb-1' })).toThrow();
            
            expect(() => CacaoPlaybookSchema.parse({ ...pb, steps: [{ name: 'N' }] as any })).toThrow();
        });

        it('should validate BloodBook entry', () => {
            const entry = {
                index: 1,
                ts: '2026-01-01',
                artifact_id: 'A',
                resonance_signature: 'S',
                prev_hash: '0',
                hash: 'H'
            };
            expect(BloodBookEntrySchema.parse(entry)).toMatchObject(entry);
            expect(() => BloodBookEntrySchema.parse({ ...entry, index: '1' } as any)).toThrow();
        });
    });

    describe('Root Pollution (Killing Regex & List mutants)', () => {
        const mockDirEnt = (name: string, isDir = false) => ({ name, isDirectory: () => isDir } as fs.Dirent);

        it('should detect unauthorized files', () => {
            vi.mocked(fs.readdirSync).mockReturnValue([mockDirEnt('POISON.exe')] as any);
            checkRootPollution();
            expect(violations.some(v => v.type === 'POLLUTION')).toBe(true);
        });

        it('should kill mutants that weaken regex patterns', () => {
            // Test that startsWith and endsWith are enforced (^ and $)
            vi.mocked(fs.readdirSync).mockReturnValue([mockDirEnt('OLD-ttao-notes-2026.md')] as any);
            checkRootPollution();
            expect(violations).toHaveLength(1);
            clearViolations();

            vi.mocked(fs.readdirSync).mockReturnValue([mockDirEnt('ttao-notes-2026.md.bak')] as any);
            checkRootPollution();
            expect(violations).toHaveLength(1);
            clearViolations();

            vi.mocked(fs.readdirSync).mockReturnValue([mockDirEnt('PREFIX.vitest.config.ts')] as any);
            checkRootPollution();
            expect(violations).toHaveLength(1);
            clearViolations();

            vi.mocked(fs.readdirSync).mockReturnValue([mockDirEnt('ttao-notes-2026.txt')] as any);
            checkRootPollution();
            expect(violations).toHaveLength(1);
            clearViolations();
            
            // Test vitest prefix
            vi.mocked(fs.readdirSync).mockReturnValue([mockDirEnt('vitest.logic.ts')] as any);
            checkRootPollution();
            expect(violations).toHaveLength(0); // Allowed by pattern /^vitest\..*$/
        });

        it('should handle the logical OR between list and patterns', () => {
            // Case 1: In list, not in patterns
            vi.mocked(fs.readdirSync).mockReturnValue([mockDirEnt('AGENTS.md')] as any);
            checkRootPollution();
            expect(violations).toHaveLength(0);
            clearViolations();

            // Case 2: Not in list, matches pattern
            vi.mocked(fs.readdirSync).mockReturnValue([mockDirEnt('ttao-notes-reboot.md')] as any);
            checkRootPollution();
            expect(violations).toHaveLength(0);
            clearViolations();
        });
    });

    describe('Content Auditing (Killing Audit mutants)', () => {
        it('should detect technical debt and strict zone violations', () => {
            auditContent('file.ts', '// TODO: fix');
            expect(violations[0].type).toBe('DEBT');

            clearViolations();
            const strict = path.join(HOT_DIR, 'silver', 'logic.ts');
            auditContent(strict, 'const x: any = 1;');
            expect(violations.some(v => v.type === 'BESPOKE')).toBe(true);
            expect(violations.some(v => v.type === 'VIOLATION')).toBe(true);
        });

        it('should detect assertionless tests', () => {
            auditContent('test.test.ts', 'it("runs", () => {})');
            expect(violations.some(v => v.type === 'THEATER')).toBe(true);
        });

        it('should allow tests with either expect or assert', () => {
             auditContent('test.test.ts', 'it("t", () => { expect(1).toBe(1); })');
             expect(violations.some(v => v.type === 'THEATER')).toBe(false);
             
             clearViolations();
             auditContent('test.test.ts', 'it("t", () => { assert.equal(1, 1); })');
             expect(violations.some(v => v.type === 'THEATER')).toBe(false);
        });
    });

    describe('Mutation Proof Auditing (Killing Mutation Logic mutants)', () => {
        it('should detect WEAK_EVOLUTION (Killing NoCoverage & boundaries)', () => {
            // Test boundary 80.00
            const report80 = { metrics: { mutationScore: 80.00 } };
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(report80));
            checkMutationProof(80);
            expect(violations).toHaveLength(0);

            // Test boundary 79.99
            const report79 = { metrics: { mutationScore: 79.99 } };
            vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(report79));
            checkMutationProof(80);
            expect(violations.some(v => v.type === 'MUTATION_FAILURE')).toBe(true);
            
            clearViolations();
            const reportFiles = {
                files: { 'bad.ts': { mutants: [{ status: 'Killed' }, { status: 'Survived' }] } }
            };
            vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(reportFiles));
            checkMutationProof(80);
            expect(violations[0].type).toBe('MUTATION_FAILURE');
            expect(violations[0].message).toContain('50.00%');
        });

        it('should detect THEATER (Killing String/Math/Boundary mutants)', () => {
            // Test non-number score
            const reportNan = { metrics: { mutationScore: '100' } };
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(reportNan));
            checkMutationProof(80);
            expect(violations.some(v => v.type === 'MUTATION_GAP')).toBe(true);
            clearViolations();

            // Exact 99.00 should trigger THEATER
            const report99 = { metrics: { mutationScore: 99.00 } };
            vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(report99));
            checkMutationProof(80);
            expect(violations.some(v => v.type === 'THEATER')).toBe(true);

            clearViolations();
            // 98.99 should NOT trigger THEATER
            const report98 = { metrics: { mutationScore: 98.99 } };
            vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(report98));
            checkMutationProof(80);
            expect(violations).toHaveLength(0);
        });

        it('should handle Timeout as Killed', () => {
            const report = {
                files: { 'ok.ts': { mutants: [{ status: 'Timeout' }] } }
            };
            vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(report));
            checkMutationProof(80);
            expect(violations).toHaveLength(1); // Score 100% -> THEATER
            expect(violations[0].type).toBe('THEATER');
        });
    });

    describe('Medallion Scanning (Killing Loop & skip mutants)', () => {
        const mockDirEnt = (name: string, isDir = false) => ({ name, isDirectory: () => isDir } as fs.Dirent);

        it('should recurse subdirectories and detect missing tests', () => {
            const mockSilver = path.join(HOT_DIR, 'silver');
            const mockSub = path.join(mockSilver, 'feature');
            const mockLogic = path.join(mockSub, 'logic.ts');
            const mockTest = path.join(mockSub, 'logic.test.ts');

            vi.mocked(fs.existsSync).mockImplementation((p) => {
                const sp = String(p);
                if (sp === mockSilver || sp === mockSub || sp === mockLogic) return true;
                if (sp === mockTest) return false; // MISSING TEST
                return false;
            });

            vi.mocked(fs.readdirSync).mockImplementation((p) => {
                if (String(p) === mockSilver) return [mockDirEnt('feature', true)] as any;
                if (String(p) === mockSub) return [mockDirEnt('logic.ts', false)] as any;
                return [];
            });

            scanMedallions();
            expect(violations.some(v => v.type === 'THEATER' && v.message.includes('missing test'))).toBe(true);
        });
    });

    describe('Lockdown Execution', () => {
        it('should return violations for enforcement (H-I behavior)', async () => {
            vi.mocked(fs.readdirSync).mockImplementation((p) => {
                if (p === ROOT_DIR) return [
                    { name: 'SYSTEM', isDirectory: () => false },
                    { name: 'RED_REGNANT.ts', isDirectory: () => false },
                    { name: 'TARGET.ts', isDirectory: () => false }
                ] as any;
                return [];
            });
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readFileSync).mockReturnValue('{}');

            const result = await executePyreAudit();
            expect(result.success).toBe(false);
            expect(result.violations.length).toBeGreaterThan(0);
        });

        it('should return success if no violations exist', async () => {
             // Mock success
             vi.mocked(fs.readdirSync).mockReturnValue([]);
             vi.mocked(fs.existsSync).mockImplementation(p => String(p).includes('mutation.json'));
             vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ metrics: { mutationScore: 85 } }));
             
             const result = await executePyreAudit();
             expect(result.success).toBe(true);
             expect(result.violations).toHaveLength(0);
        });
    });

    describe('Quine Commander: Surgical Mutant Kills (P5 Expansion)', () => {
        it('should strictly enforce regex boundaries in root patterns', () => {
            // /^vitest\..*$/ mutant kill: Should not match "my-vitest.config.ts"
            vi.mocked(fs.readdirSync).mockReturnValue([{ name: 'my-vitest.config.ts', isDirectory: () => false }] as any);
            checkRootPollution();
            expect(violations.find(v => v.file === 'my-vitest.config.ts')).toBeDefined();
            clearViolations();

            // /\.root\.config\.(ts|mjs)$/ mutant kill: Should not match "config.ts.bak"
            vi.mocked(fs.readdirSync).mockReturnValue([{ name: 'vitest.root.config.ts.bak', isDirectory: () => false }] as any);
            checkRootPollution();
            expect(violations.find(v => v.file === 'vitest.root.config.ts.bak')).toBeDefined();
            clearViolations();

            // /^ttao-notes-.*\.md$/ mutant kill: Should not match "ttao-notes.md"
            vi.mocked(fs.readdirSync).mockReturnValue([{ name: 'ttao-notes.md', isDirectory: () => false }] as any);
            checkRootPollution();
            expect(violations.find(v => v.file === 'ttao-notes.md')).toBeDefined();
            clearViolations();
        });

        it('should identify strict zones with surgical precision (Killing isStrictZone mutants)', () => {
            const hotSilver = path.join(HOT_DIR, 'silver', 'logic.ts');
            const coldSilver = path.join(path.normalize('c:/Dev/active/hfo_gen88/cold_obsidian_sandbox'), 'silver', 'logic.ts');
            const hotGold = path.join(HOT_DIR, 'gold', 'logic.ts');
            const hotBronze = path.join(HOT_DIR, 'bronze', 'experimental.ts');

            // Both silver and gold are strict
            auditContent(hotSilver, 'console.log("no");\nProvenance: test');
            expect(violations.some(v => v.type === 'AMNESIA')).toBe(true);
            clearViolations();

            auditContent(coldSilver, 'console.log("no");\nProvenance: test');
            expect(violations.some(v => v.type === 'AMNESIA')).toBe(true);
            clearViolations();

            auditContent(hotGold, 'console.log("no");\nProvenance: test');
            expect(violations.some(v => v.type === 'AMNESIA')).toBe(true);
            clearViolations();

            // Bronze IS NOT strict in P5 logic (only check Root pollution and basic debt)
            auditContent(hotBronze, 'console.log("yes");');
            expect(violations.some(v => v.type === 'AMNESIA')).toBe(false);
        });

        it('should kill negation mutants in isPermitted/isBespoke', () => {
            const strict = path.join(HOT_DIR, 'silver', 'logic.ts');
            
            // "console.log" without specific permitted tag
            auditContent(strict, 'console.log("test"); // permitted\nProvenance: test');
            expect(violations.some(v => v.type === 'AMNESIA')).toBe(true);
            clearViolations();

            // "console.log" with exact permitted tag
            auditContent(strict, 'console.log("test"); // @permitted\nProvenance: test');
            expect(violations.some(v => v.type === 'AMNESIA')).toBe(false);
            clearViolations();

            // "any" with exact bespoke tag
            auditContent(strict, 'const x: any = 1; // @bespoke\nProvenance: test');
            expect(violations.some(v => v.type === 'BESPOKE')).toBe(false);
        });

        it('should handle malformed mutation report metrics correctly', () => {
            // Missing metrics property
            vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ other: {} }));
            checkMutationProof(80);
            expect(violations.some(v => v.message === 'Mutation report is missing metrics.')).toBe(true);
            clearViolations();

            // Metrics exists but mutationScore is missing
            vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ metrics: { totalKilled: 10 } }));
            checkMutationProof(80);
            expect(violations.some(v => v.message === 'Invalid score format in metrics.')).toBe(true);
        });

        it('should kill survivors in scream and console formatting', () => {
             const originalLog = console.log;
             const originalError = console.error;
             const logSpy = vi.fn();
             const errorSpy = vi.fn();
             console.log = logSpy;
             console.error = errorSpy;
             
             try {
                // We can't delete IS_TEST_MODE because it's a const in the module, 
                // but we can test the 'else' branch by mocking it if we refactor,
                // however we can at least test that scream pushes correctly.
                scream({ file: 'test.ts', type: 'DEBT', message: 'test logic' });
                expect(violations[violations.length - 1].file).toBe('test.ts');
             } finally {
                 console.log = originalLog;
                 console.error = originalError;
             }
        });

        it('should kill mutants in ALLOWED_ROOT_FILES by exhaustive check', () => {
             ALLOWED_ROOT_FILES.forEach(file => {
                 vi.mocked(fs.readdirSync).mockReturnValue([{ name: file, isDirectory: () => false }] as any);
                 checkRootPollution();
                 expect(violations).toHaveLength(0);
                 clearViolations();
             });
        });

        it('should kill mutants in checkMutationProof score comparisons', () => {
             // Score >= 99 should trigger THEATER
             vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ metrics: { mutationScore: 99.00 } }));
             checkMutationProof(80);
             expect(violations.some(v => v.type === 'THEATER')).toBe(true);
             clearViolations();

             // Score 98.99 should NOT trigger THEATER
             vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ metrics: { mutationScore: 98.99 } }));
             checkMutationProof(80);
             expect(violations.some(v => v.type === 'THEATER')).toBe(false);
             clearViolations();

             // Score 80.00 should NOT trigger FAILURE
             vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ metrics: { mutationScore: 80.00 } }));
             checkMutationProof(80);
             expect(violations.some(v => v.type === 'MUTATION_FAILURE')).toBe(false);
             clearViolations();

             // Score 79.99 should trigger FAILURE
             vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ metrics: { mutationScore: 79.99 } }));
             checkMutationProof(80);
             expect(violations.some(v => v.type === 'MUTATION_FAILURE')).toBe(true);
        });
    });
});
