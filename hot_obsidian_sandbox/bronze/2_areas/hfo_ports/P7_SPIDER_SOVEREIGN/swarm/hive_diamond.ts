import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
import { chat } from "../runner/model-client";
import { PRICING_REGISTRY } from "../PRICING_REGISTRY";
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '../../../../../../.env') });

/**
 * HIVE/8:1010 "Double Diamond" Mastra Workflow
 * 
 * Pattern:
 * 1. Scatter (8 Workers) -> Parallel thought generation.
 * 2. Gather (1 Synthesizer) -> Combine into draft consensus.
 * 3. Scatter (8 Workers) -> Parallel critique of draft.
 * 4. Gather (1 Arbiter) -> Final BFT-consistent response.
 */

// Workers: TIER 1 models (<$0.10/M)
const WORKERS = [
    'openai/gpt-oss-20b',
    'meta-llama/llama-3.1-8b-instruct',
    'mistralai/mistral-nemo',
    'deepseek/deepseek-chat',
    'meta-llama/llama-4-scout',
    'qwen/qwen3-32b',
    'google/gemma-3-27b-it',
    'meta-llama/llama-3.2-3b-instruct'
];

// Synthesizer/Arbiter: TIER 2 model (~$0.10 - $1.00/M)
const ARBITER = 'meta-llama/llama-3.3-70b-instruct';

// Step 1: Broad Scatter
const scatterStep = createStep({
    id: "scatter_initial",
    inputSchema: z.object({
        task: z.string()
    }),
    execute: async ({ context }) => {
        const task = context?.getStepResult<{ task: string }>("trigger")?.task || "";
        console.log(`\n🕸️ [P7 SHIFT] Initial Scatter (8 Workers)...`);
        
        const results = await Promise.all(WORKERS.map(async (model) => {
            try {
                const { response } = await chat(model, [
                    { role: 'system', content: "Solve this task concisely." },
                    { role: 'user', content: task }
                ]);
                return { model, response };
            } catch (err) {
                return { model, response: "FAILURE" };
            }
        }));

        return { thoughts: results };
    }
});

// Step 2: Synthesis
const synthesisStep = createStep({
    id: "synthesis",
    inputSchema: z.any(),
    execute: async ({ inputData }) => {
        const thoughts = inputData?.thoughts || [];
        console.log(`💎 [P7 SHIFT] Synthesizing 8 outputs via ${ARBITER}...`);
        
        const prompt = `Here are 8 proposed solutions to a task. Synthesize them into a single best draft, highlighting points of consensus and disagreement.
        
        PROPOSALS:
        ${thoughts.map((t: any) => `[${t.model}]: ${t.response}`).join('\n\n')}`;

        const { response } = await chat(ARBITER, [
            { role: 'system', content: "You are an expert synthesizer. Produce a single high-quality draft." },
            { role: 'user', content: prompt }
        ]);

        return { draft: response };
    }
});

// Step 3: Critique Scatter
const critiqueStep = createStep({
    id: "critique_scatter",
    inputSchema: z.any(),
    execute: async ({ inputData }) => {
        const draft = inputData?.draft || "";
        console.log(`🕸️ [P7 SHIFT] Critique Scatter (8 Workers)...`);

        const results = await Promise.all(WORKERS.map(async (model) => {
            try {
                const { response } = await chat(model, [
                    { role: 'system', content: "Critique the following draft. Point out errors or logical gaps." },
                    { role: 'user', content: draft }
                ]);
                return { model, critique: response };
            } catch (err) {
                return { model, critique: "PASS" };
            }
        }));

        return { critiques: results };
    }
});

// Step 4: Final Arbitration
const arbitrationStep = createStep({
    id: "arbitration",
    inputSchema: z.any(),
    execute: async ({ inputData, context }) => {
        const draft = context?.getStepResult<{ draft: string }>("synthesis")?.draft || "";
        const critiques = inputData?.critiques || [];
        console.log(`💎 [P7 SHIFT] Final Arbitration via ${ARBITER}...`);

        const prompt = `Original Draft: ${draft}
        
        Critiques from 8 experts:
        ${critiques.map((c: any) => `[${c.model}]: ${c.critique}`).join('\n\n')}
        
        Finalize the answer based on these critiques. Be precise.`;

        const { response } = await chat(ARBITER, [
            { role: 'system', content: "You are the final arbiter. Produce the definitive answer." },
            { role: 'user', content: prompt }
        ]);

        return { final_answer: response };
    }
});

const hiveWorkflow = createWorkflow({
    name: "hive-1010-diamond",
});

hiveWorkflow
    .step(scatterStep)
    .then(synthesisStep)
    .then(critiqueStep)
    .then(arbitrationStep);

export const hiveDiamond = hiveWorkflow.commit();
