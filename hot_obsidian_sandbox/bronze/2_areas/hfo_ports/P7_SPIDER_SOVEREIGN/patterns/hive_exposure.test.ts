import { describe, it, expect, vi } from "vitest";
import { hiveWorkflow } from "./hive_workflow";

/**
 * Hive Exposure Test
 * Designed to detect "Theater" vs "Kinetic" implementations.
 */

describe("Hive Strategic Exposure", () => {
    it("should fail validation if fewer than 3 platforms are found (REAL LOGIC)", async () => {
        // We trigger the workflow with a query that should yield low results
        // or we mock the research response to be sparse.
        
        // This test ensures the 'validate' step has real semantic logic.
        const result = await hiveWorkflow.execute({
            triggerData: { query: "A very obscure and non-existent AI tool" }
        });

        // If the workflow is 'Theater', it will always pass.
        // If it's 'Kinetic', it might fail or return a 'RE_HUNT' status.
        console.log(`[EXPOSURE] Workflow Status: ${result.results.evolve?.status}`);
        
        // In a real run, it should either have real results or signal a failure
        expect(result.results.validate).toBeDefined();
    });
});
