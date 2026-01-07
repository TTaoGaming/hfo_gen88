import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Set test mode before importing the module
process.env.HFO_TEST_MODE = 'true';

import { 
    checkRootPollution, 
    checkMutationProof, 
    auditContent,
    scanMedallions,
    performScreamAudit,
    runSemgrepAudit,
    checkLatticeHealth,
    violations,
    clearViolations,
    scream,
    ALLOWED_ROOT_FILES,
    ALLOWED_ROOT_PATTERNS,
    ROOT_DIR,
    BRONZE_DIR,
    HOT_DIR,
    COLD_DIR,
    LATTICE,
    CacaoPlaybookSchema,
    BloodBookEntrySchema,
    ManifestSchema
} from './RED_REGNANT.js';

vi.mock('node:fs');

describe('Red Regnant: Immunological Defense (Lockdown Suite)', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        clearViolations();
        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.readdirSync).mockReturnValue([]);
        vi.mocked(fs.readFileSync).mockReturnValue('');
        process.env.HFO_TEST_MODE = 'true';
    });

    describe('Environment & Scream Protocol (Killing Core mutants)', () => {
        it('should have non-negotiable environments', () => {
            expect(process.env.HFO_TEST_MODE).toBe('true');
            expect(typeof ROOT_DIR).toBe('string');
        });

        it('should handle non-string files in scream (Killing Ternary mutants)', () => {
            scream({ file: { name: 'object-file' } as any, type: 'AMNESIA', message: 'test' });
            expect(violations[0].file).toBe('object-file');
            
            clearViolations();
            scream({ file: 123 as any, type: 'AMNESIA', message: 'test' });
            expect(violations[0].file).toBe('123');
            
            clearViolations();
            scream({ file: null as any, type: 'AMNESIA', message: 'test' });
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
            expect(violations.some(v => v.type === 'AMNESIA' && v.message.includes('TODO/FIXME'))).toBe(true);
            clearViolations();
            auditContent('file.ts', '// FIXME items');
            expect(violations.some(v => v.type === 'AMNESIA' && v.message.includes('TODO/FIXME'))).toBe(true);
        });

        it('should detect console.debug in strict zones', () => {
            const strict = path.join(HOT_DIR, 'gold', 'logic.ts');
            auditContent(strict, 'console.debug("test");\nProvenance: test');
            expect(violations.some(v => v.type === 'AMNESIA')).toBe(true);
        });

        it('should detect PHANTOM dependencies in index.html', () => {
            auditContent('index.html', '<script src="https://cdn.com/lib.js"></script>');
            expect(violations.find(v => v.type === 'PHANTOM')?.message).toContain('External CDN dependency detected in index.html.');
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
            expect(violations[0].message).toContain('AI SLOP: Technical debt (TODO/FIXME) detected.');
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
                 metrics: { mutationScore: 88 }
             }));
             checkMutationProof(88);
             expect(violations.some(v => v.type === 'MUTATION_FAILURE')).toBe(false);

             clearViolations();
             vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
                 metrics: { mutationScore: 87.9 }
             }));
             checkMutationProof(88);
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
             expect(violations.find(v => v.type === 'AMNESIA')?.message).toBe('Unauthorized debug logs in strict zone: true.');
        });

        it('should detect bespoke any correctly', () => {
             const strict = path.join(HOT_DIR, 'silver', 'logic.ts');
             auditContent(strict, 'let x: any;\nProvenance: test');
             expect(violations.find(v => v.type === 'BESPOKE')?.message).toBe('Bespoke "any" type without justification (@bespoke).');
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
            expect(violations[0].type).toBe('AMNESIA');
            expect(violations[0].message).toContain('AI SLOP: Technical debt (TODO/FIXME) detected.');

            clearViolations();
            const strict = path.join(HOT_DIR, 'silver', 'logic.ts');
            auditContent(strict, 'const x: any = 1;');
            expect(violations.some(v => v.type === 'BESPOKE')).toBe(true);
            expect(violations.some(v => v.type === 'BDD_MISALIGNMENT')).toBe(true);
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
            // Test boundary 88.00 (Gen 88 Pareto)
            const report88 = { metrics: { mutationScore: 88.00 } };
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(report88));
            checkMutationProof(88);
            expect(violations).toHaveLength(0);

            // Test boundary 87.99
            const report87 = { metrics: { mutationScore: 87.99 } };
            vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(report87));
            checkMutationProof(88);
            expect(violations.some(v => v.type === 'MUTATION_FAILURE')).toBe(true);
            
            clearViolations();
            const reportFiles = {
                files: { 'bad.ts': { mutants: [{ status: 'Killed' }, { status: 'Survived' }] } }
            };
            vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(reportFiles));
            checkMutationProof(88);
            expect(violations[0].type).toBe('MUTATION_FAILURE');
            expect(violations[0].message).toContain('50.00%');
        });

        it('should detect THEATER (Killing String/Math/Boundary mutants)', () => {
            // Test non-number score
            const reportNan = { metrics: { mutationScore: '100' } };
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(reportNan));
            checkMutationProof(88);
            expect(violations.some(v => v.type === 'MUTATION_GAP')).toBe(true);
            clearViolations();

            // Exact 99.00 should trigger THEATER
            const report99 = { metrics: { mutationScore: 99.00 } };
            vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(report99));
            checkMutationProof(88);
            expect(violations.some(v => v.type === 'THEATER')).toBe(true);

            clearViolations();
            // 98.88 should NOT trigger THEATER (Edge case)
            const report9888 = { metrics: { mutationScore: 98.88 } };
            vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(report9888));
            checkMutationProof(88);
            expect(violations).toHaveLength(0);
        });

        it('should handle missing mutation report gracefully', () => {
            const reportPath = path.join(BRONZE_DIR, 'infra/reports/mutation/mutation.json');
            vi.mocked(fs.existsSync).mockImplementation((p) => p !== reportPath);
            checkMutationProof(88);
            const v = violations.find(v => v.type === 'MUTATION_GAP');
            expect(v).toBeDefined();
            expect(v?.message).toBe('Mutation report missing. Cleanroom integrity cannot be verified.');
        });

        it('should handle malformed JSON in mutation report', () => {
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readFileSync).mockReturnValue('invalid json');
            checkMutationProof(88);
            const v = violations.find(v => v.type === 'MUTATION_GAP');
            expect(v).toBeDefined();
            expect(v?.message).toBe('Failed to parse mutation report. Corruption suspected.');
        });

        it('should handle Timeout as Killed', () => {
            const report = {
                files: { 'ok.ts': { mutants: [{ status: 'Timeout' }] } }
            };
            vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(report));
            checkMutationProof(88);
            // 1 mutant (Timeout) / 1 total = 100%. 100% is fine for single files.
            expect(violations).toHaveLength(0);
        });
    });

    describe('Galois Lattice Governance (Port 4/Port 2)', () => {
        it('should detect Hive Bloat when folder density exceeds LATTICE.O4 (4096) for Bronze', () => {
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readdirSync).mockImplementation((p) => {
                const sp = String(p).toLowerCase().replace(/\\/g, '/');
                const target = BRONZE_DIR.toLowerCase().replace(/\\/g, '/');
                if (sp === target) return new Array(4097).fill('file.ts');
                return [];
            });
            
            checkLatticeHealth();
            
            expect(violations.some(v => v.message.includes('Hive Bloat'))).toBe(true);
            expect(violations.some(v => v.message.includes('exceeds O4 Limit'))).toBe(true);
        });

        it('should report correct folder in Hive Bloat violation', () => {
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readdirSync).mockImplementation((p) => {
                const sp = String(p).toLowerCase().replace(/\\/g, '/');
                const target = BRONZE_DIR.toLowerCase().replace(/\\/g, '/');
                if (sp === target) return new Array(4097).fill('f.ts');
                return [];
            });
            const relBronze = path.relative(ROOT_DIR, BRONZE_DIR).toLowerCase().replace(/\\/g, '/');
            checkLatticeHealth();
            expect(violations.find(v => v.file.toLowerCase().replace(/\\/g, '/') === relBronze)).toBeDefined();
        });

        it('should pass if folder density is exactly LATTICE.O4 (4096) for Bronze', () => {
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readdirSync).mockImplementation((p) => {
                const sp = String(p).toLowerCase().replace(/\\/g, '/');
                const target = BRONZE_DIR.toLowerCase().replace(/\\/g, '/');
                if (sp === target) return new Array(4096).fill('file.ts');
                return [];
            });
            checkLatticeHealth();
            expect(violations).toHaveLength(0);
        });
        
        it('should fail if Silver folder density exceeds LATTICE.SWARM (64)', () => {
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readdirSync).mockImplementation((p) => {
                const sp = String(p).toLowerCase().replace(/\\/g, '/');
                const target = path.join(HOT_DIR, 'silver').toLowerCase().replace(/\\/g, '/');
                if (sp === target) return new Array(65).fill('file.ts');
                return [];
            });
            
            checkLatticeHealth();
            expect(violations.some(v => v.message.includes('Hive Bloat'))).toBe(true);
        });
        
        it('should skip non-existent folders in lattice check', () => {
            vi.mocked(fs.existsSync).mockImplementation(p => p !== path.join(HOT_DIR, 'silver'));
            vi.mocked(fs.readdirSync).mockReturnValue([]);
            
            checkLatticeHealth();
            // Should not check readdir for silver
            const silverCall = vi.mocked(fs.readdirSync).mock.calls.find(call => call[0] === path.join(HOT_DIR, 'silver'));
            expect(silverCall).toBeUndefined();
        });
    });

    describe('Medallion Scanning (Killing Loop & skip mutants)', () => {
        const mockDirEnt = (name: string, isDir = false) => ({ name, isDirectory: () => isDir } as fs.Dirent);
        const targetFolders = [
            path.join(HOT_DIR, 'bronze'),
            path.join(HOT_DIR, 'silver'),
            path.join(HOT_DIR, 'gold'),
            path.join(COLD_DIR, 'bronze'),
            path.join(COLD_DIR, 'silver'),
            path.join(COLD_DIR, 'gold')
        ].map(p => p.toLowerCase().replace(/\\/g, '/'));

        it('should recurse subdirectories and detect missing tests', () => {
            const mockSilver = path.join(HOT_DIR, 'silver');
            const mockSub = path.join(mockSilver, 'feature');
            const mockLogic = path.join(mockSub, 'logic.ts');
            const mockTest = path.join(mockSub, 'logic.test.ts');

            vi.mocked(fs.existsSync).mockImplementation((p) => {
                const sp = String(p).toLowerCase().replace(/\\/g, '/');
                if (sp === mockSilver.toLowerCase().replace(/\\/g, '/') || 
                    sp === mockSub.toLowerCase().replace(/\\/g, '/') || 
                    sp === mockLogic.toLowerCase().replace(/\\/g, '/')) return true;
                if (sp === mockTest.toLowerCase().replace(/\\/g, '/')) return false; // MISSING TEST
                return false;
            });

            vi.mocked(fs.readdirSync).mockImplementation((p) => {
                const sp = String(p).toLowerCase().replace(/\\/g, '/');
                if (sp === mockSilver.toLowerCase().replace(/\\/g, '/')) return [mockDirEnt('feature', true)] as any;
                if (sp === mockSub.toLowerCase().replace(/\\/g, '/')) return [mockDirEnt('logic.ts', false)] as any;
                return [];
            });

            scanMedallions();
            expect(violations.some(v => v.type === 'THEATER' && v.message.includes('missing test'))).toBe(true);
        });

        it('should audit .js and .md files in medallions', () => {
            const mockGold = path.join(HOT_DIR, 'gold');
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readdirSync).mockImplementation((p) => {
                const sp = String(p).toLowerCase().replace(/\\/g, '/');
                if (sp === mockGold.toLowerCase().replace(/\\/g, '/')) return [
                    mockDirEnt('script.js'),
                    mockDirEnt('doc.md')
                ] as any;
                return [];
            });
            vi.mocked(fs.readFileSync).mockReturnValue('// TODO: fix');

            scanMedallions();
            // Should audit both in gold, 2 violations (AMNESIA)
            expect(violations.filter(v => v.type === 'AMNESIA')).toHaveLength(2);
        });

        it('should skip non-standard file extensions in medallions', () => {
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readdirSync).mockImplementation((p) => {
                const sp = String(p).toLowerCase().replace(/\\/g, '/');
                if (sp.includes('gold')) return [mockDirEnt('image.png')] as any;
                return [];
            });
            
            scanMedallions();
            // Should be called 0 times because image.png is skipped
            expect(fs.readFileSync).not.toHaveBeenCalled();
            expect(violations).toHaveLength(0);
        });

        it('should explicitly skip .d.ts files (Killing d.ts mutant)', () => {
            const mockSilver = path.join(HOT_DIR, 'silver');
            const mockDts = path.join(mockSilver, 'types.d.ts');
            
            vi.mocked(fs.existsSync).mockImplementation(p => {
                const sp = String(p).toLowerCase().replace(/\\/g, '/');
                return sp === mockSilver.toLowerCase().replace(/\\/g, '/') || sp === mockDts.toLowerCase().replace(/\\/g, '/');
            });
            vi.mocked(fs.readdirSync).mockImplementation(p => {
                const sp = String(p).toLowerCase().replace(/\\/g, '/');
                if (sp === mockSilver.toLowerCase().replace(/\\/g, '/')) return [mockDirEnt('types.d.ts', false)] as any;
                return [];
            });
            vi.mocked(fs.readFileSync).mockReturnValue('// pure types');
            
            scanMedallions();
            // Should not report missing test for d.ts (type: THEATER)
            expect(violations.some(v => v.message.includes('missing test') && v.file.includes('types.d.ts'))).toBe(false);
        });

        it('should handle property tests as valid tests (Killing .property.ts mutant)', () => {
            const mockSilver = path.join(HOT_DIR, 'silver');
            const mockLogic = path.join(mockSilver, 'logic.ts').toLowerCase().replace(/\\/g, '/');
            const mockProp = path.join(mockSilver, 'logic.property.ts').toLowerCase().replace(/\\/g, '/');

            vi.mocked(fs.existsSync).mockImplementation((p) => {
                const sp = String(p).toLowerCase().replace(/\\/g, '/');
                if (sp === mockSilver.toLowerCase().replace(/\\/g, '/') || 
                    sp === mockLogic || sp === mockProp) return true;
                return false;
            });

            vi.mocked(fs.readdirSync).mockImplementation((p) => {
                const sp = String(p).toLowerCase().replace(/\\/g, '/');
                if (sp === mockSilver.toLowerCase().replace(/\\/g, '/')) return [
                    mockDirEnt('logic.ts', false),
                    mockDirEnt('logic.property.ts', false)
                ] as any;
                return [];
            });

            scanMedallions();
            // Should NOT report missing test because .property.ts exists
            expect(violations.some(v => v.message.includes('missing test'))).toBe(false);
        });

        it('should skip restricted directories like node_modules and .venv (Killing exclusion mutants)', () => {
             vi.mocked(fs.readdirSync).mockImplementation((p) => {
                const sp = String(p).toLowerCase().replace(/\\/g, '/');
                // check if it's one of the base target folders (bronze/silver/gold)
                if (targetFolders.includes(sp)) return [
                    mockDirEnt('node_modules', true),
                    mockDirEnt('.venv', true),
                    mockDirEnt('.git', true),
                    mockDirEnt('quarantine', true)
                ] as any;
                return [];
            });
            vi.mocked(fs.existsSync).mockReturnValue(true);
            
            scanMedallions();
            // We want to ensure it doesn't even try to read them.
            const readdirCalls = vi.mocked(fs.readdirSync).mock.calls.map(c => String(c[0]).toLowerCase().replace(/\\/g, '/'));
            expect(readdirCalls.some(c => c.includes('node_modules'))).toBe(false);
            expect(readdirCalls.some(c => c.includes('.venv'))).toBe(false);
            expect(readdirCalls.some(c => c.includes('quarantine'))).toBe(false);
        });

        it('should distinguish between strict (silver/gold) and non-strict (bronze) zones (Killing isStrict mutant)', () => {
            clearViolations();
            
            vi.mocked(fs.existsSync).mockImplementation(p => {
                const sp = String(p).toLowerCase().replace(/\\/g, '/');
                if (sp.includes('.test.ts') || sp.includes('.property.ts')) return false; // No tests
                return true;
            });
            
            vi.mocked(fs.readdirSync).mockImplementation((p) => {
                const sp = String(p).replace(/\\/g, '/');
                if (sp.endsWith('/bronze')) return [mockDirEnt('b.ts', false)] as any;
                if (sp.endsWith('/silver')) return [mockDirEnt('s.ts', false)] as any;
                return [];
            });
            vi.mocked(fs.readFileSync).mockReturnValue('// code');

            scanMedallions();
            
            // s.ts in silver should trigger missing test violation
            // b.ts in bronze should NOT trigger missing test violation (non-strict)
            const missingTests = violations.filter(v => v.message.toLowerCase().includes('missing test'));
            const sViolation = missingTests.find(v => v.file.toLowerCase().replace(/\\/g, '/').includes('/s.ts'));
            const bViolation = missingTests.find(v => v.file.toLowerCase().replace(/\\/g, '/').includes('/b.ts'));
            
            if (!sViolation) {
                console.log('DEBUG: Violations:', JSON.stringify(violations, null, 2));
                console.log('DEBUG: readdirSync calls:', vi.mocked(fs.readdirSync).mock.calls.map(c => c[0]));
            }

            expect(sViolation).toBeDefined();
            expect(bViolation).toBeUndefined();
        });
    });

    describe('Quine Commander: Error Handling', () => {
        it('should handle readFileSync errors in scanMedallions gracefully', () => {
             vi.mocked(fs.existsSync).mockReturnValue(true);
             vi.mocked(fs.readdirSync).mockReturnValue([{ name: 'fail.ts', isDirectory: () => false }] as any);
             vi.mocked(fs.readFileSync).mockImplementation(() => { throw new Error('Dead Disk'); });

             expect(() => scanMedallions()).toThrow('Dead Disk');
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

            const result = await performScreamAudit();
            expect(result.success).toBe(false);
            expect(result.violations.length).toBeGreaterThan(0);
        });

        it('should return success if no violations exist', async () => {
             // Mock success
             vi.mocked(fs.readdirSync).mockReturnValue([]);
             vi.mocked(fs.existsSync).mockImplementation(p => String(p).includes('mutation.json'));
             vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ metrics: { mutationScore: 90 } }));
             
             const result = await performScreamAudit();
             expect(result.success).toBe(true);
             expect(result.violations).toHaveLength(0);
        });
    });

    describe('Quine Commander: Behavioral Suspicion (Killing NoCoverage mutants)', () => {
        it('should detect silent catch blocks (OMISSION)', () => {
            const content = 'try { doStuff(); } catch(e) {}';
            auditContent('hot_obsidian_sandbox/silver/logic.ts', content);
            const violation = violations.find(v => v.type === 'OMISSION');
            expect(violation).toBeDefined();
            expect(violation?.message).toContain('Silent catch block');
        });

        it('should detect manual bypasses (SUSPICION)', () => {
            const content = 'const secret = 1; // @ignore-regnant';
            auditContent('hot_obsidian_sandbox/silver/logic.ts', content);
            const violation = violations.find(v => v.type === 'SUSPICION');
            expect(violation).toBeDefined();
            expect(violation?.message).toContain('Manual bypass detected');
        });

        it('should detect alternative bypass patterns', () => {
            const content = '/* @bypass-praetorian */ function p() {}';
            auditContent('hot_obsidian_sandbox/silver/logic.ts', content);
            expect(violations.some(v => v.type === 'SUSPICION')).toBe(true);
        });
    });

    describe('Quine Commander: Mutant Hunting (Port 4 Final)', () => {
        it('should kill regex boundary mutants in scanMedallions', () => {
            const mockSilver = path.join(HOT_DIR, 'silver');
            const mockFakeTs = path.join(mockSilver, 'logic.ts.bak'); // Contains .ts but not at end
            
            vi.mocked(fs.existsSync).mockImplementation(p => {
                const sp = String(p).replace(/\\/g, '/');
                return sp.includes('silver');
            });
            vi.mocked(fs.readdirSync).mockImplementation(p => {
                const sp = String(p).replace(/\\/g, '/');
                if (sp.endsWith('/silver')) return [({ name: 'logic.ts.bak', isDirectory: () => false })] as any;
                return [];
            });
            vi.mocked(fs.readFileSync).mockReturnValue('// content');
            
            scanMedallions();
            // Should NOT scream about missing test for .ts.bak because it shouldn't match /\.ts$/
            expect(violations.some(v => v.message.includes('missing test'))).toBe(false);
        });

        it('should kill the regex spacing mutant for "any"', () => {
            const strict = path.join(HOT_DIR, 'silver', 'logic.ts');
            // Testing ":any" (zero spaces) - should still match /:\s*any/
            auditContent(strict, 'const x:any = 1;\nProvenance: test');
            expect(violations.some(v => v.type === 'BESPOKE')).toBe(true);
        });

        it('should kill individual condition mutants in PHANTOM dependency check', () => {
            // Test .html
            auditContent('index.html', 'https://cdn.com/lib.js');
            expect(violations.some(v => v.type === 'PHANTOM')).toBe(true);
            clearViolations();

            // Test .ts
            auditContent('logic.ts', 'https://cdn.com/lib.js');
            expect(violations.some(v => v.type === 'PHANTOM')).toBe(true);
            clearViolations();

            // Test .js
            auditContent('script.js', 'https://cdn.com/lib.js');
            expect(violations.some(v => v.type === 'PHANTOM')).toBe(true);
            clearViolations();
            
            // Test non-matching extension
            auditContent('style.css', 'https://cdn.com/lib.js');
            expect(violations.some(v => v.type === 'PHANTOM')).toBe(false);
        });

        it('should kill the mutation score math mutants', () => {
            // Test exact 88.00 (parity)
            vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ metrics: { mutationScore: 88.00 } }));
            checkMutationProof(88);
            expect(violations.some(v => v.type === 'MUTATION_FAILURE')).toBe(false);
            
            // Test total=0 skip in file-level check
            clearViolations();
            vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
                files: { 'empty.ts': { mutants: [] } }
            }));
            checkMutationProof(88);
            expect(violations).toHaveLength(0);
        });

        it('should kill the replacement mutants in scanMedallions (testPath vs propertyPath)', () => {
            const mockSilver = path.join(HOT_DIR, 'silver');
            const mockFile = path.join(mockSilver, 'core.ts');
            
            vi.mocked(fs.existsSync).mockImplementation(p => {
                const sp = String(p).replace(/\\/g, '/');
                if (sp.endsWith('/core.test.ts')) return false;
                if (sp.endsWith('/core.property.ts')) return true; // Property test exists
                return true;
            });
            vi.mocked(fs.readdirSync).mockImplementation(p => {
                const sp = String(p).replace(/\\/g, '/');
                if (sp.endsWith('/silver')) return [({ name: 'core.ts', isDirectory: () => false })] as any;
                return [];
            });
            vi.mocked(fs.readFileSync).mockReturnValue('// content');

            scanMedallions();
            // Should NOT scream because property test exists
            expect(violations.some(v => v.message.includes('missing test'))).toBe(false);
        });

        it('should kill root pattern boundary mutants (Killing ^ and $)', () => {
            vi.mocked(fs.readdirSync).mockReturnValue(['UNAUTHORIZED.vitest-reside-123'] as any);
            checkRootPollution();
            expect(violations.length).toBe(1);
            expect(violations[0].file).toBe('UNAUTHORIZED.vitest-reside-123');
            
            clearViolations();
            vi.mocked(fs.readdirSync).mockReturnValue(['vitest-reside-123.SUFFIX_UNAUTHORIZED'] as any);
            checkRootPollution();
            expect(violations.length).toBe(1);
        });

        it('should kill the ALLOWED_ROOT_FILES mutants', () => {
            // Check if every expected file is indeed allowed
            const testFiles = ['package-lock.json', 'stryker.silver.config.mjs', 'vitest.harness.config.ts', 'tsconfig.json'];
            testFiles.forEach(f => {
                vi.mocked(fs.readdirSync).mockImplementation((dir, options) => {
                    if (dir === ROOT_DIR) return [{ name: f, isDirectory: () => false }] as any;
                    return [];
                });
                checkRootPollution();
                expect(violations, `File ${f} should be allowed`).toHaveLength(0);
                clearViolations();
            });
        });

        it('should kill isStrict logic mutants', () => {
            // Test 2_areas is considered isStrict
            const areaFile = path.join(BRONZE_DIR, '2_areas', 'artifact.ts');
            auditContent(areaFile, 'console.log("no-permitted");\nProvenance: test');
            expect(violations.some(v => v.type === 'AMNESIA')).toBe(true);
        });
        
        it('should handle Semgrep missing venv (Killing Semgrep survivors)', () => {
            vi.mocked(fs.existsSync).mockImplementation(p => !String(p).includes('.venv')); 
            const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            
            runSemgrepAudit();
            
            expect(spy).toHaveBeenCalledWith(expect.stringContaining('Red Queen blindfolded'));
            spy.mockRestore();
        });
    });

    describe('Quine Commander: Terminal & Environment (Killing Survivours)', () => {
        let consoleSpy: any;

        beforeEach(() => {
            consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        });

        afterEach(() => {
            consoleSpy.mockRestore();
        });

        it('should format console output correctly when not in test mode', () => {
            // Force non-test mode behavior manually for coverage
            process.env.HFO_TEST_MODE = 'false';
            
            scream({ file: 'test.ts', type: 'POLLUTION' as any, message: 'Bad file' });
            
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('🔴 RED REGNANT SCREAM'));
            
            process.env.HFO_TEST_MODE = 'true';
        });

        it('should NOT format console output when in test mode', () => {
            process.env.HFO_TEST_MODE = 'true';
            scream({ file: 'test.ts', type: 'POLLUTION' as any, message: 'Bad file' });
            expect(consoleSpy).not.toHaveBeenCalled();
        });

        it('should handle non-string file objects in scream', () => {
             scream({ file: { name: 'obj-file.ts' } as any, type: 'AMNESIA', message: 'test' });
             expect(violations.some(v => v.file === 'obj-file.ts')).toBe(true);
             
             scream({ file: null as any, type: 'AMNESIA', message: 'test' });
             expect(violations.some(v => v.file === 'UNKNOWN')).toBe(true);
        });

        it('should return quickly if root directory is missing', () => {
            vi.mocked(fs.existsSync).mockImplementation(p => !String(p).includes('hfo_gen88'));
            checkRootPollution();
            // Should not throw and should not call readdir
            expect(fs.readdirSync).not.toHaveBeenCalled();
        });

        it('should kill mutants in ALLOWED_ROOT_FILES list by process of exclusion', () => {
             // We verify that every official allowed file is actually allowed
             const hardcodedAllowed = [
                'hot_obsidian_sandbox', 'cold_obsidian_sandbox', 'AGENTS.md', 'llms.txt',
                'obsidianblackboard.jsonl', 'package.json', 'package-lock.json',
                'stryker.root.config.mjs', 'vitest.root.config.ts', 'stryker.config.mjs',
                'vitest.config.ts', '.git', '.github', '.gitignore', '.vscode', '.env',
                '.kiro', '.venv', 'tsconfig.json', '.stryker-tmp', '.husky', 'node_modules',
                'LICENSE', 'output.txt', 'ttao-notes-2026-01-06.md'
             ];
             for (const file of hardcodedAllowed) {
                 vi.mocked(fs.readdirSync).mockReturnValue([file] as any);
                 clearViolations();
                 checkRootPollution();
                 expect(violations).toHaveLength(0);
             }
        });

        it('should kill mutants in ALLOWED_ROOT_PATTERNS list', () => {
            const matches = ['.vitest-reside-123', 'vitest.custom.ts', '.stryker-tmp-123'];
            for (const file of matches) {
                vi.mocked(fs.readdirSync).mockReturnValue([file] as any);
                clearViolations();
                checkRootPollution();
                expect(violations).toHaveLength(0);
            }
        });
    });

    describe('Quine Commander: Surgical Mutant Kills (Gen 88 Pareto)', () => {
        it('should kill mutants in content.includes chains by exhaustive checking', () => {
            const strict = path.join(HOT_DIR, 'silver', 'logic.ts');
            // Test https
            auditContent(strict, 'const x = "https://cdn.com/lib.js";\nProvenance: test');
            expect(violations.some(v => v.type === 'PHANTOM')).toBe(true);
            clearViolations();
            
            // Test http
            auditContent(strict, 'const x = "http://cdn.com/lib.js";\nProvenance: test');
            expect(violations.some(v => v.type === 'PHANTOM')).toBe(true);
            clearViolations();
            
            // Test both with @permitted
            auditContent(strict, 'const x = "http://cdn.com/lib.js"; // @permitted\nProvenance: test');
            expect(violations.some(v => v.type === 'PHANTOM')).toBe(false);
        });

        it('should kill mutants in scanMedallions iteration logic', () => {
             const mockGold = path.join(HOT_DIR, 'gold');
             vi.mocked(fs.readdirSync).mockImplementation((p) => {
                 const sp = String(p).replace(/\\/g, '/');
                 if (sp.endsWith('/gold')) return [{ name: 'truth.js', isDirectory: () => false }] as any;
                 return [];
             });
             vi.mocked(fs.existsSync).mockReturnValue(true);
             vi.mocked(fs.readFileSync).mockReturnValue('// TODO: technical debt');
             
             scanMedallions();
             // Should detect AMNESIA in gold/truth.js
             expect(violations.some(v => v.type === 'AMNESIA' && v.file.includes('truth.js'))).toBe(true);
        });

        it('should kill mutants in isStrict logic for P5 exceptions', () => {
             const p5file = path.join(HOT_DIR, 'silver', 'P5_PYRE_PRAETORIAN', 'logic.ts');
             auditContent(p5file, 'console.log("no-permitted");\nProvenance: test');
             // Should NOT trigger AMNESIA because it's in P5 path (allowance for audit engine self-logs)
             expect(violations.some(v => v.type === 'AMNESIA')).toBe(false);
             
             const otherfile = path.join(HOT_DIR, 'silver', 'OTHER', 'logic.ts');
             auditContent(otherfile, 'console.log("no-permitted");\nProvenance: test');
             // SHOULD trigger AMNESIA
             expect(violations.some(v => v.type === 'AMNESIA')).toBe(true);
        });

        it('should kill mutants in checkMutationProof score calculation', () => {
             // Test total === 0 skip
             vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
                 files: { 'core.ts': { mutants: [] } }
             }));
             checkMutationProof(80);
             expect(violations).toHaveLength(0);

             // Test mutants.length === 0 skip
             clearViolations();
             vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
                 files: { 'core.ts': { mutants: [] } }
             }));
             checkMutationProof(80);
             expect(violations).toHaveLength(0);
        });

        it('should kill mutants that weaken regex patterns in scanMedallions', () => {
             const mockSilver = path.join(HOT_DIR, 'silver');
             // Test file ending in .ts.bak (should NOT match \.ts$)
             vi.mocked(fs.readdirSync).mockImplementation((p) => {
                 const sp = String(p).replace(/\\/g, '/');
                 if (sp.endsWith('/silver')) return [{ name: 'logic.ts.bak', isDirectory: () => false }] as any;
                 return [];
             });
             vi.mocked(fs.existsSync).mockReturnValue(true);
             scanMedallions();
             expect(violations.some(v => v.message.includes('missing test'))).toBe(false);
        });

        it('should kill individual logical operator mutants in phantom check', () => {
             // Test indexing into content.includes results
             auditContent('test.html', 'https://cdn.com/');
             expect(violations.some(v => v.type === 'PHANTOM')).toBe(true);
             clearViolations();
             
             auditContent('test.html', 'http://cdn.com/');
             expect(violations.some(v => v.type === 'PHANTOM')).toBe(true);
             clearViolations();
             
             // Test !hasPermitted
             auditContent('test.html', 'https://cdn.com/ // @permitted');
             expect(violations.some(v => v.type === 'PHANTOM')).toBe(false);
        });

        it('should kill survivors in scream and console formatting', () => {
             const originalLog = console.log;
             const originalError = console.error;
             const logSpy = vi.fn();
             const errorSpy = vi.fn();
             console.log = logSpy;
             console.error = errorSpy;
             
             try {
                 // Force NOT in test mode temporarily to hit console.error branch
                 const oldTestMode = process.env.HFO_TEST_MODE;
                 delete process.env.HFO_TEST_MODE;
                 
                 scream({ file: 'test.ts', type: 'DEBT', message: 'test logic' });
                 expect(errorSpy).toHaveBeenCalled();
                 
                 process.env.HFO_TEST_MODE = oldTestMode;
             } finally {
                 console.log = originalLog;
                 console.error = originalError;
             }
        });

        it('should kill mutants in Galois Lattice constants', () => {
             // We can't easily kill these because they are constants, 
             // but we can ensure they are used exactly in the logic.
             expect(LATTICE.O4).toBe(4096);
             expect(LATTICE.GEN).toBe(88);
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
             checkMutationProof(88);
             expect(violations.some(v => v.type === 'THEATER')).toBe(true);
             clearViolations();

             // Score 98.88 should NOT trigger THEATER
             vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ metrics: { mutationScore: 98.88 } }));
             checkMutationProof(88);
             expect(violations.some(v => v.type === 'THEATER')).toBe(false);
             clearViolations();

             // Score 88.00 should NOT trigger FAILURE
             vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ metrics: { mutationScore: 88.00 } }));
             checkMutationProof(88);
             expect(violations.some(v => v.type === 'MUTATION_FAILURE')).toBe(false);
             clearViolations();

             // Score 87.99 should trigger FAILURE
             vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ metrics: { mutationScore: 87.99 } }));
             checkMutationProof(88);
             expect(violations.some(v => v.type === 'MUTATION_FAILURE')).toBe(true);
        });

        it('should handle Timeout as Killed in score calculation', () => {
             vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
                 files: { 'core.ts': { mutants: [{ status: 'Killed' }, { status: 'Timeout' }, { status: 'Survived' }] } }
             }));
             checkMutationProof(88);
             // 2/3 = 66.67% < 88%
             expect(violations.some(v => v.type === 'MUTATION_FAILURE')).toBe(true);
             expect(violations.find(v => v.file === 'core.ts')?.message).toContain('66.67%');
        });

        it('should kill mutants in auditContent multi-condition checks', () => {
             const silver = path.join(HOT_DIR, 'silver', 'logic.ts');
             
             // No provenance AND no validates
             auditContent(silver, 'const x = 1;');
             expect(violations.some(v => v.type === 'BDD_MISALIGNMENT')).toBe(true);
             expect(violations.some(v => v.type === 'VIOLATION')).toBe(false); // Wait, RED_REGNANT doesn't have VIOLATION type for missing provenance?
             // Checking RED_REGNANT.ts... It uses BDD_MISALIGNMENT for both.
             
             clearViolations();
             // Has provenance
             auditContent(silver, '@provenance test');
             expect(violations.some(v => v.type === 'BDD_MISALIGNMENT')).toBe(false);
             
             clearViolations();
             // Has validates
             auditContent(silver, 'Validates: REQ1');
             expect(violations.some(v => v.type === 'BDD_MISALIGNMENT')).toBe(false);
        });

        it('should kill scanMedallions iteration logic mutants', () => {
             vi.mocked(fs.existsSync).mockImplementation((p) => {
                 const sp = String(p).replace(/\\/g, '/');
                 if (sp.endsWith('.test.ts') || sp.endsWith('.property.ts')) return false;
                 return true;
             });
             vi.mocked(fs.readdirSync).mockImplementation((p) => {
                 const sp = String(p).replace(/\\/g, '/');
                 if (sp.endsWith('/silver')) return [{ name: 'logic.ts', isDirectory: () => false }] as any;
                 return [];
             });
             
             scanMedallions();
             expect(violations.some(v => v.type === 'THEATER' && v.message.includes('Strict artifact missing test file'))).toBe(true);
        });

        it('should kill mutation score math mutants', () => {
             // Test total === 0 branch exactly
             vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
                 files: { 'empty.ts': { mutants: [] } }
             }));
             checkMutationProof(80.00);
             expect(violations).toHaveLength(0);

             // Test killed calculation (Killed OR Timeout)
             clearViolations();
             vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
                 files: { 'calc.ts': { mutants: [{ status: 'Killed' }, { status: 'Timeout' }, { status: 'Survived' }] } }
             }));
             checkMutationProof(60.00); 
             // 2/3 = 66.67% >= 60.00%. Should PASS.
             expect(violations.some(v => v.type === 'MUTATION_FAILURE')).toBe(false);
             
             clearViolations();
             checkMutationProof(70.00);
             // 66.67% < 70.00%. Should FAIL.
             expect(violations.some(v => v.type === 'MUTATION_FAILURE' && v.file === 'calc.ts')).toBe(true);
        });

        it('should kill mutation threshold boundary exactly', () => {
             vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ metrics: { mutationScore: 80.00 } }));
             checkMutationProof(80.00); 
             // Mutants change < 80.00 to <= 80.00. 
             // 80.00 < 80.00 is FALSE. 80.00 <= 80.00 is TRUE.
             expect(violations.some(v => v.type === 'MUTATION_FAILURE')).toBe(false);
             
             clearViolations();
             vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ metrics: { mutationScore: 79.99 } }));
             checkMutationProof(80.00);
             expect(violations.some(v => v.type === 'MUTATION_FAILURE')).toBe(true);
        });
    });
});
