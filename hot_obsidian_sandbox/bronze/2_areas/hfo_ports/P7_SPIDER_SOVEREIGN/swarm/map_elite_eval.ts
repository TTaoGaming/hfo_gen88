import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
import { chat } from "../runner/model-client";
import { hleMath } from "../harnesses/hle-hard";
import { PRICING_REGISTRY, calculateValueScore } from "../PRICING_REGISTRY";
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '../../../../../../.env') });

/**
 * MAP-ELITES Baseline Evaluation Workflow
 * Consolidated under Port 7 (Spider Sovereign)
 */

const evalModels = [
    'openai/gpt-oss-20b',
    'meta-llama/llama-3.1-8b-instruct',
    'mistralai/mistral-nemo',
    'openai/gpt-5-nano',
    'qwen/qwen3-32b',
    'meta-llama/llama-4-scout',
    'meta-llama/llama-3.3-70b-instruct',
    'deepseek/deepseek-chat',
    'google/gemma-3-27b-it',
    'openai/gpt-4.1-nano'
];
const harness = hleMath;
const ITERATIONS = 4;

// Step: Parallel Evaluation
const evalStep = createStep({
    id: "parallel_eval",
    execute: async () => {
        console.log(`\n🕸️ [P7 SHIFT] Starting Parallel Evaluation (${evalModels.length} models)...`);
        
        const results = await Promise.all(evalModels.map(async (model) => {
            console.log(`   [MAP-ELITE] Testing ${model} (4x weight)...`);
            let successCount = 0;
            let totalAttempts = 0;
            let totalLatency = 0;
            const testPrompts = harness.prompts.slice(0, 5);

            for (let i = 0; i < ITERATIONS; i++) {
                for (const p of testPrompts) {
                    const msgs = [
                        { role: 'system' as const, content: p.system },
                        { role: 'user' as const, content: p.user },
                    ];
                    const start = Date.now();
                    totalAttempts++;
                    try {
                        const { response } = await chat(model, msgs);
                        const latency = Date.now() - start;
                        if (harness.score(response, p.expected) > 0) successCount++;
                        totalLatency += latency;
                    } catch (err) {
                        console.error(`      [ERR] ${model}: ${err}`);
                    }
                }
            }

            const fitness = (successCount / totalAttempts) * 100;
            const pricing = PRICING_REGISTRY[model];
            const valueScore = calculateValueScore(fitness, model);

            return {
                model,
                fitness,
                successCount,
                totalAttempts,
                tier: pricing?.tier || 'UNKNOWN',
                inputCost: pricing?.inputCostPerM || 0,
                valueScore
            };
        }));

        return { results };
    }
});

const reportingStep = createStep({
    id: "generate_report",
    inputSchema: z.any(),
    execute: async ({ inputData }) => {
        const results = (inputData as any).results || [];
        results.sort((a: any, b: any) => b.fitness - a.fitness);

        console.log("\n📊 MAP-ELITE CONSOLIDATED REPORT (Port 7)");
        console.log("".padEnd(95, "-"));
        console.log("Model".padEnd(35) + " | Iter | Success | Fitness | Cost/M | Value (F/$)");
        console.log("".padEnd(95, "-"));
        
        results.forEach((r: any) => {
            console.log(
                `${r.model.padEnd(35)} | ` +
                `4x   | ` +
                `${String(r.successCount).padStart(2)}/${r.totalAttempts} | ` +
                `${r.fitness.toFixed(1)}%   | ` +
                `$${r.inputCost.toFixed(3)} | ` +
                `${r.valueScore.toFixed(0).padStart(5)} pts/$`
            );
        });

        console.log("\n✅ PORT 7 CONSOLIDATION COMPLETE.");
        return { results };
    }
});

export const mapEliteWorkflow = createWorkflow({
    id: "map-elite-p7",
})
.then(evalStep)
.then(reportingStep)
.commit();

// Self-execute if run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    console.log("🚀 Running Consolidated MAP-ELITE Workflow...");
    mapEliteWorkflow.execute({ triggerData: {} }).then(() => {
        process.exit(0);
    });
}
