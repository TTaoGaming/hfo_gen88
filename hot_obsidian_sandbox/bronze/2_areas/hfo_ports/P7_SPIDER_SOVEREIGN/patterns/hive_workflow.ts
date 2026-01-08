/**
 * HIVE/8:1010 Strategic Workflow (Consolidated)
 * @port 7
 * @commander Spider Sovereign
 * @gen 88
 * @status CONSOLIDATED
 */

import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import { researchAgent } from "../runner/research_agent";

// H (Hunt) - Research & Plan
export const huntStep = createStep({
  id: "hunt",
  inputSchema: z.object({ query: z.string() }),
  outputSchema: z.object({ plan: z.string(), researchData: z.any() }),
  execute: async ({ inputData }) => {
    console.log(`[HIVE:HUNT] Kinetic execution for: ${inputData.query}`);
    const result = await researchAgent.generate(inputData.query);
    return {
      plan: `Research completed for ${inputData.query}`,
      researchData: result.text
    };
  },
});

// I (Interlock) - Platform Extraction
export const interlockStep = createStep({
  id: "interlock",
  inputSchema: z.object({ plan: z.string(), researchData: z.any() }),
  outputSchema: z.object({ platforms: z.array(z.string()), response: z.string() }),
  execute: async ({ inputData }) => {
    const extractionResult = await researchAgent.generate(
      `Extract a list of AI orchestration platforms from this research data. Return ONLY a comma-separated list of names. Data: ${inputData.researchData}`
    );
    
    const platforms = extractionResult.text.split(",").map(p => p.trim()).filter(p => p.length > 0);
    
    return {
      platforms,
      response: `Interlocked: Found ${platforms.length} platforms.`,
    };
  },
});

// V (Validate) - Qualitative Threshold
export const validateStep = createStep({
  id: "validate",
  inputSchema: z.object({ platforms: z.array(z.string()), response: z.string() }),
  outputSchema: z.object({ isValid: z.boolean(), reasoning: z.string() }),
  execute: async ({ inputData }) => {
    const minRequired = 3;
    const isValid = inputData.platforms.length >= minRequired;
    
    return {
      isValid,
      reasoning: isValid 
        ? `Sufficient depth: ${inputData.platforms.length} platforms found.`
        : `Insufficient depth: Only ${inputData.platforms.length} platforms found.`,
    };
  },
});

// E (Evolve) - Tactical Decision
export const evolveStep = createStep({
  id: "evolve",
  inputSchema: z.object({ isValid: z.boolean(), reasoning: z.string() }),
  outputSchema: z.object({ status: z.string(), plan: z.string() }),
  execute: async ({ inputData }) => ({
    status: inputData.isValid ? "EVOLUTION_COMPLETE" : "RE_HUNT",
    plan: inputData.isValid 
      ? "Proceeding to Gold promotion." 
      : `Research failure: ${inputData.reasoning}. Retrying Hunt.`,
  }),
});

export const hiveWorkflow = createWorkflow({
  id: "hive-workflow-1010",
  inputSchema: z.object({ query: z.string() }),
})
  .then(huntStep)
  .then(interlockStep)
  .then(validateStep)
  .then(evolveStep)
  .commit();
