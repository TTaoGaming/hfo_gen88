import { describe, it, expect } from "vitest";
import { validateStep } from "./hive_workflow";

/**
 * Hive Exposure Test
 * Designed to detect "Theater" vs "Kinetic" implementations.
 */

describe("Hive Strategic Exposure", () => {
    it("should fail validation if fewer than 3 platforms are found (REAL LOGIC)", async () => {
        // We test the validation step directly to bypass Mastra telemetry issues
        
        // 1. Scenario: Fail (2 platforms)
        const failResult = await (validateStep as any).execute({
            inputData: { 
                platforms: ["Platform A", "Platform B"],
                response: "Found 2 platforms"
            }
        });
        expect(failResult.isValid).toBe(false);
        expect(failResult.reasoning).toContain("Insufficient depth");

        // 2. Scenario: Pass (3 platforms)
        const passResult = await (validateStep as any).execute({
            inputData: { 
                platforms: ["Platform A", "Platform B", "Platform C"],
                response: "Found 3 platforms"
            }
        });
        expect(passResult.isValid).toBe(true);
        expect(passResult.reasoning).toContain("Sufficient depth");
    });
});
