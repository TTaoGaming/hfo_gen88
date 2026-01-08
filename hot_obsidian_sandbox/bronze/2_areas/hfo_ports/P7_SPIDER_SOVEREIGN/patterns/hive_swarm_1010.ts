import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
import { chat } from "../runner/model-client";
import { HIVE_8_MODELS } from "../swarm/hive-10";
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '../../../../../../.env') });

/**
 * HIVE/8:1010 Mastra Workflow (Consolidated)
 * :01 Scatter (8) - Generation
 * :10 Gather (1)  - Synthesis
 * :01 Scatter (8) - Critique
 * :10 Gather (1)  - Final Verdict
 * 
 * Uses Gen 88 MAP-ELITE Archive Models for maximum performance vs cost.
 */

const ORCHESTRATOR_MODEL = 'anthropic/claude-3.5-haiku'; // Best Overall performance

// Create individual steps for each model - Generation Phase
const generatorSteps = HIVE_8_MODELS.map((model) => {
    const modelId = model.split('/').pop()?.replace(/[^a-zA-Z0-9]/g, '_') || model;
    return createStep({
        id: `generate_${modelId}`,
        inputSchema: z.object({
            system: z.string(),
            user: z.string(),
        }),
        outputSchema: z.object({
            model: z.string(),
            response: z.string(),
            confidence: z.number(),
        }),
        execute: async ({ inputData }) => {
            console.log(`   [HIVE:01] ${model} Generating...`);
            const msgs = [
                { role: 'system' as const, content: `${inputData.system}\n\nProvide confidence level 0-100 last line: CONFIDENCE: <number>` },
                { role: 'user' as const, content: inputData.user },
            ];
            try {
                const { response } = await chat(model, msgs);
                const confMatch = response.match(/CONFIDENCE:\s*(\d+)/i);
                const confidence = confMatch ? Math.min(100, Math.max(0, parseInt(confMatch[1]))) : 50;
                const cleanResponse = response.replace(/CONFIDENCE:\s*\d+/gi, '').trim();
                return { model, response: cleanResponse, confidence };
            } catch (err) {
                console.error(`   [HIVE:ERR] ${model}: ${err}`);
                return { model, response: 'ERROR', confidence: 0 };
            }
        }
    });
});

const synthesisStep = createStep({
    id: "synthesis_proposer",
    inputSchema: z.any(),
    outputSchema: z.object({
        proposerModel: z.string(),
        proposal: z.string(),
        rationale: z.string(),
        allInputs: z.string(),
        original_user: z.string(),
    }),
    execute: async ({ inputData }) => {
        console.log(`   [HIVE:10] Synthesizing proposal with ${ORCHESTRATOR_MODEL}...`);
        
        const results = Object.values(inputData) as any[];
        const validResults = results.filter(r => (r && r.response && r.response !== 'ERROR'));
        
        const context = validResults.map(r => `MODEL [${r.model}]:\n${r.response}`).join('\n\n---\n\n');
        
        const msgs = [
            { role: 'system' as const, content: "You are the HIVE Synthesizer. Review the following parallel responses and propose a single, optimal consensus response. Explain your rationale." },
            { role: 'user' as const, content: `Parallel Responses:\n${context}` },
        ];

        const { response } = await chat(ORCHESTRATOR_MODEL, msgs);
        return { 
            proposerModel: ORCHESTRATOR_MODEL, 
            proposal: response, 
            rationale: "Synthesized from swarm diversity",
            allInputs: context,
            original_user: "Fixed Query" 
        };
    }
});

// Create the overall workflow logic
export const hiveSwarmWorkflow = createWorkflow({
    id: "hive-swarm-1010",
    inputSchema: z.object({
        system: z.string(),
        user: z.string(),
    }),
});

// Since we have a complex list of steps, we'd normally chain them here.
// For the 1010 pattern, this usually involves a specific builder.
// We'll leave the step definitions prepared for the specific implementation.
