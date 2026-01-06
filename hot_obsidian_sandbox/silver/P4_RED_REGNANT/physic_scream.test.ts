/**
 *  THE RED REGNANT'S PHYSIC SCREAM TEST (PORT 4)
 */

import { describe, it, expect, beforeEach, vi } from "vitest"; // @permitted 
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

import * as auditor from "./physic_scream";
const { 
    scream, 
    demote, 
    checkRootPollution, 
    checkMutationProof, 
    auditContent, 
    scanMedallions,
    violations, 
    clearViolations,
    ROOT_DIR
} = auditor;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Physic Scream (Port 4 Gatekeeper)", () => {

    beforeEach(() => {
        clearViolations();
        vi.restoreAllMocks();
    });

    describe("scream", () => {
        it("should log to blackboard", () => {
            const blackboard = path.join(__dirname, "test_blackboard.jsonl");
            if (fs.existsSync(blackboard)) fs.unlinkSync(blackboard);
            scream({ file: "test.ts", type: "VIOLATION", message: "Boom" }, blackboard);
            expect(violations).toHaveLength(1);
            expect(fs.readFileSync(blackboard, "utf8")).toContain("Boom");
            if (fs.existsSync(blackboard)) fs.unlinkSync(blackboard);
        });

        it("should trigger circuit breaker", () => {
            for (let i = 0; i < 60; i++) {
                scream({ file: `f${i}.ts`, type: "VIOLATION", message: "Error" });
            }
            expect(violations.length).toBe(51);
            expect(violations[50].file).toBe("SYSTEM");
        });
    });

    describe("checkRootPollution", () => {
        it("should detect disallowed files", () => {
            checkRootPollution(["LEGIT.ts", "ILLEGAL.slop"]);
            expect(violations.some(v => v.file === "ILLEGAL.slop")).toBe(true);
        });

        it("should allow patterns", () => {
            checkRootPollution(["ttao-notes-2026.md"]);
            expect(violations).toHaveLength(0);
        });
    });

    describe("checkMutationProof", () => {
        it("should fail for low score", () => {
            const reportFile = path.join(__dirname, "test_report.json");
            fs.writeFileSync(reportFile, JSON.stringify({
                files: { "src/low.ts": { mutants: [{ status: "Survived" }, { status: "Killed" }] } }
            }));
            checkMutationProof(reportFile);
            expect(violations.some(v => v.type === "MUTATION_FAILURE")).toBe(true);
            fs.unlinkSync(reportFile);
        });

        it("should fail for theater (100%)", () => {
            const reportFile = path.join(__dirname, "test_report_100.json");
            fs.writeFileSync(reportFile, JSON.stringify({
                files: { "src/perfect.ts": { mutants: [{ status: "Killed" }] } }
            }));
            checkMutationProof(reportFile);
            expect(violations.some(v => v.type === "THEATER")).toBe(true);
            fs.unlinkSync(reportFile);
        });
    });

    describe("auditContent", () => {
        it("should detect debug logs", () => {
            auditContent("silver/file.ts", "console.log('hi')");
            expect(violations.some(v => v.type === "AMNESIA")).toBe(true);
        });

        it("should allow debug logs with @permitted", () => {
            auditContent("silver/file.ts", "Provenance: mock\nconsole.log('hi') // @permitted");
            expect(violations).toHaveLength(0);
        });

        it("should ignore debug logs in screamer itself", () => {
            auditContent("silver/physic_scream.ts", "Provenance: mock\nconsole.log('hi')");
            expect(violations).toHaveLength(0);
        });

        it("should detect missing provenance", () => {
            auditContent("silver/no_prov.ts", "const x = 1;");
            expect(violations.some(v => v.type === "VIOLATION" && v.message.includes("provenance"))).toBe(true);
        });
    });
});
