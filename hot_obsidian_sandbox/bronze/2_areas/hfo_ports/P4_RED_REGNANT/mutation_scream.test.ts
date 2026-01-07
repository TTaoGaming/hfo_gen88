// @provenance bronze/2_areas/hfo_ports/P4_RED_REGNANT/mutation_scream.test.ts
// @bespoke
import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { execSync } from "node:child_process";

beforeAll(() => {
    process.env.HFO_TEST_MODE = 'true';
});

import { 
    checkRootPollution, 
    checkSentinelGrounding, 
    checkMutationProof, 
    auditContent,
    checkTraceProof,
    demote,
    scanMedallions,
    main,
    violations,
    clearViolations,
    ManifestSchema,
    CacaoPlaybookSchema,
    BloodBookEntrySchema,
    ALLOWED_ROOT_FILES,
    ALLOWED_BRONZE_FILES,
    ALLOWED_ROOT_PATTERNS,
    BRONZE_DIR,
    IS_TEST_MODE
} from "./mutation_scream.js";

vi.mock("node:fs");
vi.mock("node:child_process");

describe("Red Regnant: Aggressive Mutation Killing", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        clearViolations();
    });

    describe("Root Pollution (Port 4 Enforcement)", () => {
        it("should have substantial whitelists", () => {
            expect(ALLOWED_ROOT_FILES.length).toBeGreaterThan(20);
            expect(ALLOWED_BRONZE_FILES.length).toBeGreaterThan(10);
            expect(IS_TEST_MODE).toBe(true);
        });

        it("should specifically allow critical root files to kill string mutants", () => {
            const criticalFiles = [
                'AGENTS.md', 'package.json', 'vitest.root.config.ts', '.gitignore', 'llms.txt'
            ];
            vi.mocked(fs.existsSync).mockReturnValue(true);
            criticalFiles.forEach(file => {
                violations.length = 0;
                vi.mocked(fs.readdirSync).mockReturnValue([file as any]);
                checkRootPollution();
                expect(violations, `${file} should be allowed`).toHaveLength(0);
            });
        });
        it("should allow every single whitelisted root file", () => {
            vi.mocked(fs.existsSync).mockReturnValue(true);
            
            // Testing each file individually to kill string mutants
            ALLOWED_ROOT_FILES.forEach((file: string) => {
                violations.length = 0;
                vi.mocked(fs.readdirSync).mockReturnValue([file as any]);
                checkRootPollution();
                expect(violations, `File ${file} should be allowed`).toHaveLength(0);
            });
        });

        it("should allow every single whitelisted bronze file", () => {
            vi.mocked(fs.existsSync).mockReturnValue(true);
            
            ALLOWED_BRONZE_FILES.forEach((file: string) => {
                violations.length = 0;
                vi.mocked(fs.readdirSync).mockReturnValue([file as any]);
                checkRootPollution(BRONZE_DIR, 'mock.jsonl', ALLOWED_BRONZE_FILES);
                expect(violations, `Bronze item ${file} should be allowed`).toHaveLength(0);
            });
        });

        it("should verify all allowed root patterns specifically", () => {
            vi.mocked(fs.existsSync).mockReturnValue(true);

            const testCases = [
                "ttao-notes-2026-01-07.md",
                ".vitest-reside-abc-123",
                "vitest.root.config.ts"
            ];

            testCases.forEach((file, index) => {
                violations.length = 0;
                vi.mocked(fs.readdirSync).mockReturnValue([file as any]);
                checkRootPollution();
                expect(violations, `Pattern match for ${file} failed`).toHaveLength(0);
                expect(ALLOWED_ROOT_PATTERNS[index].test(file)).toBe(true);
            });
        });

        it("should allow whitelisted patterns (notes)", () => {
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readdirSync).mockReturnValue([
                "ttao-notes-2026-01-07.md" as any
            ]);
            checkRootPollution();
            expect(violations).toHaveLength(0);
        });

        it("should allow whitelisted patterns (vitest)", () => {
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readdirSync).mockReturnValue([
                "vitest.root.config.ts" as any,
                ".vitest-reside-123" as any
            ]);
            checkRootPollution();
            expect(violations).toHaveLength(0);
        });

        it("should scream when unauthorized files appear", () => {
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readdirSync).mockReturnValue([ "MALWARE.exe" ]);
            checkRootPollution();
            const v = violations.find(v => v.type === "POLLUTION");
            expect(v).toBeDefined();
            expect(v?.file).toBe("MALWARE.exe");
        });

        it("should protect Bronze folder with specific whitelist", () => {
            const BRONZE_DIR = "/mock/bronze";
            const ALLOWED_BRONZE = ["1_projects"];
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readdirSync).mockReturnValue(['1_projects', 'unauthorized.txt'] as any);
            
            checkRootPollution(BRONZE_DIR, 'mock.jsonl', ALLOWED_BRONZE);
            const v = violations.find(v => v.message.includes("Root pollution detected"));
            expect(v).toBeDefined();
            expect(v?.file).toBe("unauthorized.txt");
            expect(v?.message).toContain(BRONZE_DIR);
        });
    });

    describe("Schema Integrity", () => {
        it("should reject invalid BloodBook entries", () => {
            expect(BloodBookEntrySchema.safeParse({ index: "not a number" }).success).toBe(false);
        });

        it("should validate Manifest contents strictly", () => {
            const valid = {
                identity: { port: 0, commander: 'test' },
                galois_lattice: { coordinate: [0, 0] },
                dna: { hfo_generation: 88 }
            };
            expect(ManifestSchema.safeParse(valid).success).toBe(true);
            
            expect(ManifestSchema.safeParse({ ...valid, identity: { port: "zero" } }).success).toBe(false);
            expect(ManifestSchema.safeParse({ ...valid, galois_lattice: { coordinate: [0] } }).success).toBe(false);
        });

        it("should validate Cacao Playbooks strictly", () => {
            const valid = {
                type: 'playbook',
                id: 'playbook--123',
                name: 'test',
                description: 'test',
                steps: [{ type: 'task', name: 'step1', description: 'desc' }]
            };
            expect(CacaoPlaybookSchema.safeParse(valid).success).toBe(true);
            
            // Kill startsWith mutant
            const invalidId = CacaoPlaybookSchema.safeParse({ ...valid, id: 'wrong-prefix' });
            expect(invalidId.success).toBe(false);
            if (!invalidId.success) {
                expect(invalidId.error.errors[0].message).toContain('playbook--');
            }

            // Kill literal mutant
            const invalidType = CacaoPlaybookSchema.safeParse({ ...valid, type: 'not-playbook' });
            expect(invalidType.success).toBe(false);
            if (!invalidType.success) {
                expect(invalidType.error.errors[0].message).toContain('playbook');
            }
        });
    });

    describe("Sentinel Grounding", () => {
        const mockLog = (entries: any[] /* @bespoke */) => {
            vi.mocked(fs.readFileSync).mockReturnValue(entries.map(e => JSON.stringify(e)).join("\n"));
            vi.mocked(fs.existsSync).mockReturnValue(true);
        };

        it("should kill SEARCH_GROUNDING mutants", () => {
            const now = new Date().toISOString();
            // Test with type
            mockLog([{ ts: now, type: "SEARCH_GROUNDING" }, { ts: now, type: "THINKING" }]);
            checkSentinelGrounding("mock.jsonl", 60000);
            expect(violations.filter(v => v.type === "REWARD_HACK")).toHaveLength(0);

            violations.length = 0;
            // Test with mark
            mockLog([{ ts: now, mark: "SEARCH_GROUNDING" }, { ts: now, type: "THINKING" }]);
            checkSentinelGrounding("mock.jsonl", 60000);
            expect(violations.filter(v => v.type === "REWARD_HACK")).toHaveLength(0);
        });

        it("should kill THINKING_GROUNDING mutants", () => {
            const now = new Date().toISOString();
            // Test with type THINKING_GROUNDING
            mockLog([{ ts: now, type: "SEARCH_GROUNDING" }, { ts: now, type: "THINKING_GROUNDING" }]);
            checkSentinelGrounding("mock.jsonl", 60000);
            expect(violations.filter(v => v.type === "REWARD_HACK")).toHaveLength(0);

            violations.length = 0;
            // Test with mark THINKING_GROUNDING
            mockLog([{ ts: now, type: "SEARCH_GROUNDING" }, { mark: "THINKING_GROUNDING", ts: now }]);
            checkSentinelGrounding("mock.jsonl", 60000);
            expect(violations.filter(v => v.type === "REWARD_HACK")).toHaveLength(0);

            violations.length = 0;
            // Test with type THINKING
            mockLog([{ ts: now, type: "SEARCH_GROUNDING" }, { type: "THINKING", ts: now }]);
            checkSentinelGrounding("mock.jsonl", 60000);
            expect(violations.filter(v => v.type === "REWARD_HACK")).toHaveLength(0);
        });

        it("should fail when grounding is too old", () => {
            const timeframe = 60000;
            const wayWayOld = Date.now() - 1000000;
            const marginalOld = Date.now() - 60001;
            mockLog([
                { ts: new Date(wayWayOld).toISOString(), type: "SEARCH_GROUNDING" },
                { ts: new Date(marginalOld).toISOString(), type: "THINKING_GROUNDING" }
            ]);
            checkSentinelGrounding("mock.jsonl", timeframe);
            expect(violations.some(v => v.type === "REWARD_HACK")).toBe(true);
        });

        it("should handle boundary conditions for timeframe", () => {
            const timeframe = 60000;
            const exactlyOnTime = Date.now() - 59999;
            const exactlyTooOld = Date.now() - 60001;

            // Kill boundary mutant (now - entryTs < timeframeMs)
            mockLog([
                { ts: new Date(exactlyOnTime).toISOString(), type: "SEARCH_GROUNDING" },
                { ts: new Date(exactlyOnTime).toISOString(), type: "THINKING_GROUNDING" }
            ]);
            checkSentinelGrounding("mock.jsonl", timeframe);
            expect(violations.filter(v => v.type === "REWARD_HACK"), "Should pass just before boundary").toHaveLength(0);

            violations.length = 0;
            mockLog([
                { ts: new Date(exactlyTooOld).toISOString(), type: "SEARCH_GROUNDING" },
                { ts: new Date(exactlyTooOld).toISOString(), type: "THINKING_GROUNDING" }
            ]);
            checkSentinelGrounding("mock.jsonl", timeframe);
            expect(violations.filter(v => v.type === "REWARD_HACK"), "Should fail just after boundary").toHaveLength(2);
        });

        it("should kill timeframe comparison mutants (828, 829, 830)", () => {
             const timeframe = 1000;
             // Test with different values to force mutation failure
             mockLog([{ ts: new Date().toISOString(), type: "SEARCH_GROUNDING" }, { ts: new Date().toISOString(), type: "THINKING" }]);
             
             // If timeframe mutant makes it always true, it might pass incorrectly on old logs
             // If timeframe mutant makes it always false, it will fail on fresh logs
             checkSentinelGrounding("mock.jsonl", 1000);
             expect(violations.filter(v => v.type === "REWARD_HACK")).toHaveLength(0);
        });

        it("should ignore invalid JSON lines in blackboard", () => {
            vi.mocked(fs.readFileSync).mockReturnValue("{ invalid\n" + JSON.stringify({ ts: new Date().toISOString(), type: 'SEARCH_GROUNDING' }));
            vi.mocked(fs.existsSync).mockReturnValue(true);
            checkSentinelGrounding("mock.jsonl", 60000);
            expect(violations.find(v => v.message.includes("Sequential Thinking"))).toBeDefined();
        });

        it("should scream with specific REWARD_HACK messages", () => {
            mockLog([]);
            checkSentinelGrounding("mock.jsonl", 60000);
            expect(violations.find(v => v.message.includes("Tavily Web Search"))?.type).toBe("REWARD_HACK");
            expect(violations.find(v => v.message.includes("Sequential Thinking"))?.type).toBe("REWARD_HACK");
        });

        it("should fail when search is missing", () => {
            const now = new Date().toISOString();
            mockLog([{ ts: now, type: "THINKING_GROUNDING" }]);
            checkSentinelGrounding("mock.jsonl", 60000);
            expect(violations.find(v => v.message.includes("Tavily Web Search"))).toBeDefined();
        });

        it("should fail when thinking is missing", () => {
            const now = new Date().toISOString();
            mockLog([{ ts: now, type: "SEARCH_GROUNDING" }]);
            checkSentinelGrounding("mock.jsonl", 60000);
            expect(violations.find(v => v.message.includes("Sequential Thinking"))).toBeDefined();
        });

        it("should pass with fresh grounding", () => {
            const now = new Date().toISOString();
            mockLog([
                { ts: now, mark: "SEARCH_GROUNDING" },
                { ts: now, type: "THINKING" }
            ]);
            checkSentinelGrounding("mock.jsonl", 60000);
            expect(violations.filter(v => v.type === "REWARD_HACK")).toHaveLength(0);
        });
    });

    describe("Audit Content", () => {
        it("should scream on Task Markers (T.O.D.O) in any file", () => {
            const task = "TO" + "DO";
            auditContent("test.ts", "// " + task + ": fix");
            const v = violations.find(v => v.type === "DEBT");
            expect(v).toBeDefined();
            expect(v?.message).toContain(task);
            expect(v?.file).toContain("test.ts");
        });

        it("should scream on console.log in Strict Zone", () => {
            const fullPath = "c:\\Dev\\active\\hfo_gen88\\hot_obsidian_sandbox\\silver\\artifact.ts";
            auditContent(fullPath, "console.log(1)");
            const v = violations.find(v => v.type === "AMNESIA");
            expect(v).toBeDefined();
            expect(v?.file).toContain("artifact.ts");
        });

        it("should allow console.log with @permitted", () => {
            auditContent("c:\\Dev\\active\\hfo_gen88\\hot_obsidian_sandbox\\silver\\artifact.ts", "console.log(1) // @permitted");
            expect(violations.filter(v => v.type === "AMNESIA")).toHaveLength(0);
        });

        it("should scream on external CDNs in index.html", () => {
            const url = "https" + "://cdn.com";
            auditContent("index.html", `<script src="${url}"></script>`);
            expect(violations.some(v => v.type === "PHANTOM")).toBe(true);
        });

        it("should scream on missing provenance in Strict Zone", () => {
            const path = "c:\\Dev\\active\\hfo_gen88\\hot_obsidian_sandbox\\silver\\new_file.ts";
            auditContent(path, "export const x = 1;");
            const v = violations.find(v => v.message.includes("missing provenance"));
            expect(v).toBeDefined();
            expect(v?.type).toBe("VIOLATION");
        });
    });

    describe("Trace Proof", () => {
        it("should pass if trace is fresh", () => {
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ ts: new Date().toISOString() }));
            checkTraceProof("trace.json", undefined, 60000);
            expect(violations).toHaveLength(0);
        });
    });

    describe("Mutation Proof", () => {
        it("should detect THEATER (>= 99% score)", () => {
           vi.mocked(fs.existsSync).mockReturnValue(true);
           vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
               files: { "test.ts": { mutants: [ { status: "Killed" } ] } }
           }));
           checkMutationProof("mock-report.json", "mock.jsonl", 80);
           expect(violations.some(v => v.type === "THEATER")).toBe(true);
        });
    });

    describe("Demotion Pipeline", () => {
        it("should move file to quarantine and log to blackboard", () => {
            const target = "hot_obsidian_sandbox/bronze/bad_file.ts";
            // Check cross-platform path handling implicit in path.resolve
            demote(path.resolve(process.cwd(), target), "Test Reason");

            expect(fs.renameSync).toHaveBeenCalled();
            expect(fs.appendFileSync).toHaveBeenCalled();
            
            const logCall = vi.mocked(fs.appendFileSync).mock.calls[0];
            const logEntry = JSON.parse(logCall[1] as string);
            expect(logEntry.reason).toBe("Test Reason");
            expect(logEntry.type).toBe("DEMOTION");
        });

        it("should handle demotion errors gracefully", () => {
            vi.mocked(fs.renameSync).mockImplementation(() => { throw new Error("Lock"); });
            const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
            
            demote("any-file", "reason");
            
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Failed to demote"));
            consoleSpy.mockRestore();
        });
    });

    describe("Medallion Scanning", () => {
        it("should recursively scan and audit valid medallions", () => {
            const mockDirEnt = (name: string, isDir: boolean) => ({
                name,
                isDirectory: () => isDir
            } as fs.Dirent);

            vi.mocked(fs.readdirSync)
                .mockReturnValueOnce([mockDirEnt("file1.ts", false), mockDirEnt("subdir", true)] as any)
                .mockReturnValueOnce([mockDirEnt("file2.ts", false)] as any);
            
            vi.mocked(fs.readFileSync).mockReturnValue("// Provenance: Test\nconsole.log('test') // @permitted");
            vi.mocked(fs.existsSync).mockReturnValue(true);

            scanMedallions(["/mock/area"]);

            expect(fs.readFileSync).toHaveBeenCalledTimes(2);
        });

        it("should refuse to scan Forbidden Zones", () => {
            const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
            scanMedallions([process.cwd()]);
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Refusing to scan Forbidden Zone"));
            consoleSpy.mockRestore();
        });

        it("should skip internal folders like .git and node_modules", () => {
            const mockDirEnt = (name: string, isDir: boolean) => ({
                name,
                isDirectory: () => isDir
            } as fs.Dirent);

            vi.mocked(fs.readdirSync).mockReturnValue([
                mockDirEnt(".git", true),
                mockDirEnt("node_modules", true),
                mockDirEnt("legit_file.ts", false)
            ] as any);
            
            vi.mocked(fs.readFileSync).mockReturnValue("// Provenance: Test");
            vi.mocked(fs.existsSync).mockReturnValue(true);

            scanMedallions(["/mock/area"]);

            // Should only read legit_file.ts
            expect(fs.readFileSync).toHaveBeenCalledTimes(1);
        });
    });

    describe("Trace Verification", () => {
        it("should warn if no trace events are found", () => {
            vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ type: "NOT_TRACE" }));
            const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
            checkTraceProof("mock.jsonl");
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("No TRACE events found"));
            consoleSpy.mockRestore();
        });
    });
});
