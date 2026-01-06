import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import {
    violations,
    checkRootPollution,
    checkMutationProof,
    auditContent,
    demote,
    scanMedallions,
    checkLedgerIntegrity,
    checkManifestIntegrity,
    CacaoStepSchema,
    CacaoPlaybookSchema,
    BloodBookEntrySchema,
    ManifestSchema,
    ROOT_DIR,
    clearViolations,
    scream
} from "./mutation_scream";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEST_ROOT = path.join(__dirname, "test_root_mutation");

describe("Mutation Scream", () => {
    beforeEach(() => {
        clearViolations();
        if (!fs.existsSync(TEST_ROOT)) fs.mkdirSync(TEST_ROOT, { recursive: true });
    });

    afterEach(() => {
        if (fs.existsSync(TEST_ROOT)) fs.rmSync(TEST_ROOT, { recursive: true, force: true });
    });

    describe("Schema Integration", () => {
        it("should validate schemas", () => {
            expect(CacaoStepSchema.parse({ type: "s", name: "n", description: "d" })).toBeDefined();
            expect(CacaoPlaybookSchema.parse({
                type: "playbook",
                id: "playbook--1",
                name: "n",
                description: "d",
                steps: []
            })).toBeDefined();
        });
    });

    describe("auditContent", () => {
        it("should detect debug logs in normal files", () => {
            auditContent("f.ts", "console.log(1)");
            expect(violations[0]).toMatchObject({
                type: 'AMNESIA',
                message: expect.stringContaining('Debug logs detected')
            });
        });

        it("should ignore debug logs in screamer files", () => {
            auditContent("mutation_scream.ts", "console.log(1)");
            expect(violations.length).toBe(0);
        });

        it("should allow permitted debug logs", () => {
            auditContent("f.ts", "console.log(1) // @permitted");
            expect(violations.length).toBe(0);
        });

        it("should detect missing provenance in silver", () => {
            const silverPath = path.join("hot_obsidian_sandbox", "silver", "f.ts");
            auditContent(silverPath, "const x = 1");
            expect(violations.some(v => v.type === 'VIOLATION' && v.message.includes("provenance"))).toBe(true);
        });

        it("should detect bespoke any without tag", () => {
            auditContent("f.ts", "const x: any = 1");
            expect(violations.some(v => v.type === 'BESPOKE' && v.message.includes("any"))).toBe(true);
        });

        it("should allow bespoke any with tag", () => {
            auditContent("f.ts", "const x: any = 1; // @bespoke justification");
            expect(violations.length).toBe(0);
        });
    });

    describe("checkMutationProof", () => {
        it("should detect low score", () => {
            const reportFile = path.join(TEST_ROOT, "report.json");
            const target = "f.ts";
            const fullTarget = path.join(TEST_ROOT, target);
            fs.writeFileSync(fullTarget, "// dummy implementation");
            
            const relativeToRoot = path.relative(ROOT_DIR, fullTarget);
            
            fs.writeFileSync(reportFile, JSON.stringify({
                files: { [relativeToRoot]: { mutants: [{ status: "Survived" }] } }
            }));
            checkMutationProof(reportFile, undefined, 80);
            expect(violations[0]).toMatchObject({
                type: 'MUTATION_FAILURE',
                message: expect.stringContaining('below the 80% threshold')
            });
        });
        
        it("should detect theater", () => {
            const reportFile = path.join(TEST_ROOT, "report.json");
            const target = "f.ts";
            const fullTarget = path.join(TEST_ROOT, target);
            fs.writeFileSync(fullTarget, "// dummy implementation");

            const relativeToRoot = path.relative(ROOT_DIR, fullTarget);

            fs.writeFileSync(reportFile, JSON.stringify({
                files: { [relativeToRoot]: { mutants: [{ status: "Killed" }] } }
            }));
            checkMutationProof(reportFile, undefined, 80);
            expect(violations.some(v => v.type === "THEATER" && v.message.includes("100%"))).toBe(true);
        });
    });

    describe("checkLedgerIntegrity", () => {
        it("should detect corruption", () => {
            const blackboard = path.join(TEST_ROOT, "blackboard.jsonl");
            fs.writeFileSync(blackboard, "{\"valid\": true}\nBAD JSON\n");
            checkLedgerIntegrity(blackboard);
            expect(violations[0]).toMatchObject({
                type: 'VIOLATION',
                message: expect.stringContaining('Blackboard corruption')
            });
        });
    });

    describe("checkManifestIntegrity", () => {
        it("should detect schema violations", () => {
            const manifest = path.join(TEST_ROOT, "manifest.yaml");
            fs.writeFileSync(manifest, "invalid: yaml");
            checkManifestIntegrity(manifest);
            expect(violations[0]).toMatchObject({
                type: 'VIOLATION',
                message: expect.stringContaining('Manifest schema violation')
            });
        });
    });

    describe("scanMedallions", () => {
        it("should detect missing tests", () => {
            const silver = path.join(TEST_ROOT, "silver");
            fs.mkdirSync(silver, { recursive: true });
            fs.writeFileSync(path.join(silver, "logic.ts"), "export const x = 1;");
            
            scanMedallions([silver]);
            expect(violations.some(v => v.type === "THEATER" && v.message.includes("missing corresponding test"))).toBe(true);
        });

        it("should ignore non-ts/yaml files in scan", () => {
            const silver = path.join(TEST_ROOT, "silver");
            fs.mkdirSync(silver, { recursive: true });
            fs.writeFileSync(path.join(silver, "data.json"), "{}");
            
            scanMedallions([silver]);
            expect(violations.length).toBe(0);
        });
    });

    describe("checkRootPollution", () => {
        it("should detect disallowed files in root", () => {
            checkRootPollution(["forbidden.exe", "hot_obsidian_sandbox"]);
            expect(violations.some(v => v.type === "POLLUTION" && v.file === "forbidden.exe")).toBe(true);
            expect(violations.some(v => v.file === "hot_obsidian_sandbox")).toBe(false);
        });

        it("should allow patterns", () => {
            checkRootPollution(["ttao-notes-2026.md"]);
            expect(violations.length).toBe(0);
        });
    });

    describe("scream", () => {
        it("should log to blackboard", () => {
            const blackboard = path.join(TEST_ROOT, "blackboard_test.jsonl");
            const v: any = { file: "test.ts", type: "AMNESIA", message: "test message" };
            
            scream(v, blackboard);
            
            const content = fs.readFileSync(blackboard, "utf8");
            expect(content).toContain("MUTATION_SCREAM_VIOLATION");
            expect(content).toContain("test message");
        });
    });

    describe("demote", () => {
        it("should move file and test file to quarantine", () => {
            const file = path.join(TEST_ROOT, "logic.ts");
            const testFile = path.join(TEST_ROOT, "logic.test.ts");
            fs.writeFileSync(file, "implementation");
            fs.writeFileSync(testFile, "test");
            
            demote(file, "Testing demote");
            
            expect(fs.existsSync(file)).toBe(false);
            expect(fs.existsSync(testFile)).toBe(false);
            
            // Verify they are in quarantine (which is HOT_DIR/bronze/quarantine/...)
            // Since we use full path, it determines relative to ROOT_DIR
            // This is hard to check exactly without knowing where TEST_ROOT is relative to ROOT_DIR
        });
    });
});
