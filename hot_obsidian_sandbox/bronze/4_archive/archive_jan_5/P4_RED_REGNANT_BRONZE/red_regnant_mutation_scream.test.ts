/**
 *  THE RED REGNANT'S MUTATION SCREAM TEST (PORT 4)
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

vi.mock("node:child_process", () => ({
    execSync: vi.fn(() => Buffer.from(""))
}));

import * as auditor from "./red_regnant_mutation_scream";
const { 
    scream, 
    demote,
    checkRootPollution, 
    checkMutationProof, 
    auditContent, 
    scanMedallions, 
    checkLedgerIntegrity,
    checkManifestIntegrity,
    violations, 
    clearViolations,
    ROOT_DIR,
    HOT_DIR,
    CacaoStepSchema,
    CacaoPlaybookSchema,
    BloodBookEntrySchema,
    ManifestSchema,
    main
} = auditor;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("Red Regnant Mutation Scream (Negative Trust Protocol)", () => {
    let exitSpy: any;

    beforeEach(() => {
        process.env.HFO_SKIP_VITEST = "true"; // Guard against recursive test execution
        process.env.HFO_TEST_MODE = "true";   // Use the new guard
        clearViolations();
        vi.restoreAllMocks();
        (execSync as any).mockClear();
        exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    });

    describe("scream", () => {
        it("should log exact messages", () => {
            const blackboard = path.join(__dirname, "scream_test.jsonl");
            if (fs.existsSync(blackboard)) fs.unlinkSync(blackboard);
            scream({ file: "test.ts", type: "VIOLATION", message: "Boom" }, blackboard);
            expect(violations).toHaveLength(1);
            expect(fs.readFileSync(blackboard, "utf8")).toContain("Boom");
            if (fs.existsSync(blackboard)) fs.unlinkSync(blackboard);
        });

        it("should trigger circuit breaker at MAX_VIOLATIONS", () => {
            for (let i = 0; i < 60; i++) {
                scream({ file: `f${i}.ts`, type: "VIOLATION", message: "Error" });
            }
            expect(violations.length).toBe(51); // 50 + 1 circuit breaker message
            expect(violations[50].file).toBe("SYSTEM");
        });
    });

    describe("checkRootPollution", () => {
        it("should detect pollution", () => {
            const pollFile = path.join(ROOT_DIR, "POLLUTION_STAIN.txt");
            fs.writeFileSync(pollFile, "slop");
            checkRootPollution();
            const v = violations.find(v => v.type === "POLLUTION" && v.file === "POLLUTION_STAIN.txt");
            expect(v).toBeDefined();
            expect(v?.message).toBe(`Root pollution detected: POLLUTION_STAIN.txt is not allowed in the cleanroom root.`);
            fs.unlinkSync(pollFile);
        });

        it("should allow multiple allowed patterns (killing 'every' mutant)", () => {
            const entries = ["ttao-notes-2025-01-01.md", "ttao-notes-something.md"];
            checkRootPollution(entries);
            expect(violations.filter(v => v.type === "POLLUTION")).toHaveLength(0);
        });
        
        it("should fail if a file is not in allowed list AND doesn't match patterns", () => {
            const entries = ["AGENTS.md", "STRANGER_DANGER.exe"];
            checkRootPollution(entries);
            expect(violations.some(v => v.file === "STRANGER_DANGER.exe")).toBe(true);
        });
    });

    describe("checkMutationProof", () => {
        it("should handle report and kill mutants", () => {
            const reportFile = path.join(__dirname, "report.json");
            const report = {
                files: {
                    "src/good.ts": { mutants: [{ status: "Killed" }, { status: "Killed" }, { status: "Killed" }, { status: "Killed" }] }, // 100% Forbidden
                    "src/bad.ts": { mutants: [{ status: "Survived" }, { status: "Killed" }] }, // 50% Fail
                    "src/ghost.ts": { mutants: [] } // 0% Skip
                }
            };
            fs.writeFileSync(reportFile, JSON.stringify(report));
            checkMutationProof(reportFile);
            expect(violations.some(v => v.file === "src/good.ts" && v.type === "THEATER")).toBe(true);            
            // Kill 80% boundary mutant
            const reportEighty = { files: { "src/eighty.ts": { mutants: [{ status: "Killed" }, { status: "Killed" }, { status: "Killed" }, { status: "Killed" }, { status: "Survived" }] } } };
            fs.writeFileSync(reportFile, JSON.stringify(reportEighty));
            checkMutationProof(reportFile);
            expect(violations.some(v => v.file === "src/eighty.ts")).toBe(false);
            
            // Kill Timeout mutant
            const reportTimeout = { files: { "src/timeout.ts": { mutants: [{ status: "Timeout" }, { status: "Survived" }] } } };
            fs.writeFileSync(reportFile, JSON.stringify(reportTimeout));
            checkMutationProof(reportFile);
            expect(violations.find(v => v.file === "src/timeout.ts")?.message).toContain("score 50.00%");
            expect(violations.some(v => v.file === "src/bad.ts" && v.type === "MUTATION_FAILURE")).toBe(true);
            expect(violations.some(v => v.file === "src/ghost.ts")).toBe(false);
            fs.unlinkSync(reportFile);
        });
    });

    describe("auditContent", () => {
        it("should detect a range of amnesia and bespoke", () => {
            auditContent("test.ts", "console.log('debug');\nconst x:any = 1;");
            expect(violations.some(v => v.type === "AMNESIA")).toBe(true);
            expect(violations.some(v => v.type === "BESPOKE")).toBe(true);
            
            clearViolations();
            auditContent("silver/file.ts", "const x = 1;"); // Missing provenance
            expect(violations.some(v => v.type === "VIOLATION" && v.message.includes("provenance"))).toBe(true);
        });
    });

    describe("demote", () => {
        it("should move file and its companion", () => {
            const logic = path.join(__dirname, "logic_demote.ts");
            const test = path.join(__dirname, "logic_demote.test.ts");
            fs.writeFileSync(logic, "l");
            fs.writeFileSync(test, "t");
            
            const qLogic = path.join(HOT_DIR, "bronze/quarantine", path.relative(ROOT_DIR, logic));
            const qTest = qLogic.replace(/\.ts$/, ".test.ts");
            
            if (fs.existsSync(qLogic)) fs.unlinkSync(qLogic);
            if (fs.existsSync(qTest)) fs.unlinkSync(qTest);

            demote(logic, "testing");
            
            expect(fs.existsSync(qLogic)).toBe(true, "Logic file should be in quarantine");
            expect(fs.existsSync(qTest)).toBe(true, "Test file should be in quarantine");
            expect(fs.existsSync(logic)).toBe(false, "Original logic file should be gone");
            expect(fs.existsSync(test)).toBe(false, "Original test file should be gone");
            
            fs.unlinkSync(qLogic);
            fs.unlinkSync(qTest);
        });
    });

    describe("checkLedgerIntegrity", () => {
        it("should verify hash chain", () => {
            const ledger = path.join(__dirname, "ledger.jsonl");
            const e1 = { index: 0, ts: "now", artifact_id: "a", resonance_signature: "s", prev_hash: "0".repeat(64) };
            const h1 = crypto.createHash("sha256").update(JSON.stringify(e1)).digest("hex");
            const d1 = { ...e1, hash: h1 };
            
            const e2 = { index: 1, ts: "now", artifact_id: "b", resonance_signature: "s", prev_hash: h1 };
            const h2 = crypto.createHash("sha256").update(JSON.stringify(e2)).digest("hex");
            const d2 = { ...e2, hash: h2 };
            
            fs.writeFileSync(ledger, JSON.stringify(d1) + "\n" + JSON.stringify(d2) + "\n");
            checkLedgerIntegrity(ledger);
            expect(violations.filter(v => v.file === ledger)).toHaveLength(0);
            fs.unlinkSync(ledger);
        });
    });

    describe("checkManifestIntegrity", () => {
        it("should detect port mismatch", () => {
            const manifest = path.join(__dirname, "manifest.yaml");
            const data = {
                identity: { port: 0, commander: "Lidless" },
                galois_lattice: { coordinate: [0, 0] },
                dna: { hfo_generation: 88 }
            };
            fs.writeFileSync(manifest, JSON.stringify(data)); // JSON is valid YAML
            checkManifestIntegrity(manifest);
            expect(violations).toContainEqual(expect.objectContaining({
                message: expect.stringContaining("port mismatch")
            }));
            fs.unlinkSync(manifest);
        });

        it("should detect missing identity", () => {
            const manifest = path.join(__dirname, "missing_id.yaml");
            fs.writeFileSync(manifest, JSON.stringify({ galois_lattice: { coordinate: [0, 0] } }));
            checkManifestIntegrity(manifest);
            expect(violations.some(v => v.message.includes("schema validation"))).toBe(true);
            fs.unlinkSync(manifest);
        });
    });

    describe("scanMedallions", () => {
        it("should scan provided paths", () => {
            const dir = path.join(__dirname, "scan_test");
            fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(path.join(dir, "no_test.ts"), "const x = 1;");
            scanMedallions([dir]);
            expect(violations.some(v => v.file.includes("no_test.ts"))).toBe(true);
            fs.rmSync(dir, { recursive: true });
        });

        it("should skip Forbidden Zone (Root)", () => {
            const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            scanMedallions([ROOT_DIR]);
            expect(spy).toHaveBeenCalledWith(expect.stringContaining("Forbidden Zone"));
            spy.mockRestore();
        });
    });

    describe("scanMedallions", () => {
        it("should call execSync when not skipping vitest", () => {
            const dir = path.join(__dirname, "silver_sim");
            const file = path.join(dir, "logic.ts");
            const test = path.join(dir, "logic.test.ts");
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(file, "// Provenance: P4\nconst x = 1;");
            fs.writeFileSync(test, "// Provenance: P4\nimport { test } from 'vitest'; test('x', () => {});");
            
            delete process.env.HFO_SKIP_VITEST;
            process.env.HFO_TEST_MODE = "false";
            
            scanMedallions([dir]);
            
            expect(execSync).toHaveBeenCalled();
            
            fs.unlinkSync(file);
            fs.unlinkSync(test);
            fs.rmdirSync(dir);
        });
    });

    describe("Schemas", () => {
        it("CacaoStepSchema should reject empty object", () => {
            const result = CacaoStepSchema.safeParse({});
            expect(result.success).toBe(false);
        });

        it("ManifestSchema should reject missing dna", () => {
            const result = ManifestSchema.safeParse({
                identity: { port: 4, commander: "Red" },
                galois_lattice: { coordinate: [0, 0] }
            });
            expect(result.success).toBe(false);
        });

        it("ManifestSchema should reject empty dna (killing mutant 9)", () => {
            const result = ManifestSchema.safeParse({
                identity: { port: 4, commander: "Red" },
                galois_lattice: { coordinate: [0, 0] },
                dna: {}
            });
            expect(result.success).toBe(false);
        });

        it("BloodBookEntrySchema should reject missing hash", () => {
            const result = BloodBookEntrySchema.safeParse({ index: 0 });
            expect(result.success).toBe(false);
        });
    });

    describe("main", () => {
        it("should exit 1 on violations", () => {
            scream({ file: "fail.ts", type: "VIOLATION", message: "Error" });
            main();
            expect(exitSpy).toHaveBeenCalledWith(1);
        });
    });
    
    describe("Zod Schemas and Advanced Logic", () => {
        it("should fail validation for empty objects to kill ObjectLiteral mutants", () => {
            expect(CacaoStepSchema.safeParse({}).success).toBe(false);
            expect(CacaoPlaybookSchema.safeParse({}).success).toBe(false);
            expect(BloodBookEntrySchema.safeParse({}).success).toBe(false);
            expect(ManifestSchema.safeParse({}).success).toBe(false);
        });

        it("should kill scanMedallions exclusion mutants", () => {
            const dir = path.join(__dirname, "exclusion_test");
            fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(path.join(dir, "type.d.ts"), "// Provenance: P4\nexport type X = 1;");
            fs.writeFileSync(path.join(dir, "logic.test.ts"), "// Provenance: P4\ntest");
            
            scanMedallions([dir]);
            // Neither should trigger THEATER for missing test file
            expect(violations.filter(v => v.file.includes("exclusion_test"))).toHaveLength(0);
            fs.rmSync(dir, { recursive: true });
        });

        it("should kill any/unknown regex mutants in auditContent", () => {
             clearViolations();
             auditContent("test.ts", "const x:  any = 1;");
             expect(violations.some(v => v.type === "BESPOKE")).toBe(true);
             
             clearViolations();
             auditContent("test.ts", "const x: any = 1; // @bespoke");
             expect(violations.some(v => v.type === "BESPOKE")).toBe(false);
        });
    });
});
