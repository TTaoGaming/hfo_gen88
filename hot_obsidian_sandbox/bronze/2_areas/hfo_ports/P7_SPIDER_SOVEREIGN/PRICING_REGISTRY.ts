/**
 * HFO Gen 88 MAP-ELITE Pricing Registry
 * Categorized by cost-efficiency and reasoning capability.
 * 
 * TIERS:
 *  - TIER 1 (BULK): $0.00 - $0.10/M input. High-concurrency swarm workers.
 *  - TIER 2 (MID): $0.11 - $1.00/M input. High reasoning synthesizers.
 *  - TIER 3 (SOTA): > $1.00/M input. Use only for ground truth or verification.
 */

export interface ModelPricing {
    id: string;
    inputCostPerM: number;
    outputCostPerM: number;
    tier: 'TIER1' | 'TIER2' | 'TIER3';
    reasoning: 'LOW' | 'MEDIUM' | 'HIGH' | 'ELITE';
}

export const PRICING_REGISTRY: Record<string, ModelPricing> = {
    // --- TIER 1: BULK SWARM (Budget < $0.10/M) ---
    'openai/gpt-oss-20b': {
        id: 'openai/gpt-oss-20b',
        inputCostPerM: 0.016,
        outputCostPerM: 0.048,
        tier: 'TIER1',
        reasoning: 'MEDIUM'
    },
    'meta-llama/llama-3.1-8b-instruct': {
        id: 'meta-llama/llama-3.1-8b-instruct',
        inputCostPerM: 0.02,
        outputCostPerM: 0.06,
        tier: 'TIER1',
        reasoning: 'LOW'
    },
    'mistralai/mistral-nemo': {
        id: 'mistralai/mistral-nemo',
        inputCostPerM: 0.02,
        outputCostPerM: 0.06,
        tier: 'TIER1',
        reasoning: 'MEDIUM'
    },
    'qwen/qwen3-8b': {
        id: 'qwen/qwen3-8b',
        inputCostPerM: 0.035,
        outputCostPerM: 0.10,
        tier: 'TIER1',
        reasoning: 'MEDIUM'
    },
    'openai/gpt-5-nano': {
        id: 'openai/gpt-5-nano',
        inputCostPerM: 0.05,
        outputCostPerM: 0.15,
        tier: 'TIER1',
        reasoning: 'HIGH'
    },
    'qwen/qwen3-14b': {
        id: 'qwen/qwen3-14b',
        inputCostPerM: 0.05,
        outputCostPerM: 0.22,
        tier: 'TIER1',
        reasoning: 'MEDIUM'
    },
    'qwen/qwen3-32b': {
        id: 'qwen/qwen3-32b',
        inputCostPerM: 0.08,
        outputCostPerM: 0.30,
        tier: 'TIER1',
        reasoning: 'HIGH'
    },
    'meta-llama/llama-4-scout': {
        id: 'meta-llama/llama-4-scout',
        inputCostPerM: 0.08,
        outputCostPerM: 0.24,
        tier: 'TIER1',
        reasoning: 'HIGH'
    },
    'openai/gpt-4.1-nano': {
        id: 'openai/gpt-4.1-nano',
        inputCostPerM: 0.10,
        outputCostPerM: 0.30,
        tier: 'TIER1',
        reasoning: 'MEDIUM'
    },
    'meta-llama/llama-3.3-70b-instruct': {
        id: 'meta-llama/llama-3.3-70b-instruct',
        inputCostPerM: 0.10,
        outputCostPerM: 0.32,
        tier: 'TIER1',
        reasoning: 'HIGH'
    },
    'google/gemma-3n-e4b-it': {
        id: 'google/gemma-3n-e4b-it',
        inputCostPerM: 0.02,
        outputCostPerM: 0.06,
        tier: 'TIER1',
        reasoning: 'MEDIUM'
    },
    'google/gemma-3-27b-it': {
        id: 'google/gemma-3-27b-it',
        inputCostPerM: 0.036,
        outputCostPerM: 0.10,
        tier: 'TIER1',
        reasoning: 'HIGH'
    },
    'qwen/qwen-2.5-7b-instruct': {
        id: 'qwen/qwen-2.5-7b-instruct',
        inputCostPerM: 0.03,
        outputCostPerM: 0.09,
        tier: 'TIER1',
        reasoning: 'MEDIUM'
    },
    'meta-llama/llama-3.2-3b-instruct': {
        id: 'meta-llama/llama-3.2-3b-instruct',
        inputCostPerM: 0.02,
        outputCostPerM: 0.06,
        tier: 'TIER1',
        reasoning: 'LOW'
    },
    'deepseek/deepseek-chat': {
        id: 'deepseek/deepseek-chat',
        inputCostPerM: 0.07,
        outputCostPerM: 0.21,
        tier: 'TIER1',
        reasoning: 'MEDIUM'
    },

    // --- TIER 2: HIGH REASONING MID-COST ($0.11 - $1.00/M) ---
    'openai/gpt-4o-mini': {
        id: 'openai/gpt-4o-mini',
        inputCostPerM: 0.15,
        outputCostPerM: 0.60,
        tier: 'TIER2',
        reasoning: 'HIGH'
    },
    'anthropic/claude-3.5-haiku': {
        id: 'anthropic/claude-3.5-haiku',
        inputCostPerM: 0.80,
        outputCostPerM: 4.00,
        tier: 'TIER2',
        reasoning: 'HIGH'
    },
    'x-ai/grok-4.1-fast': {
        id: 'x-ai/grok-4.1-fast',
        inputCostPerM: 0.20,
        outputCostPerM: 0.50,
        tier: 'TIER2',
        reasoning: 'HIGH'
    },
    'google/gemini-2.5-flash': {
        id: 'google/gemini-2.5-flash',
        inputCostPerM: 0.30,
        outputCostPerM: 1.20,
        tier: 'TIER2',
        reasoning: 'HIGH'
    },
    'meta-llama/llama-3.3-70b-instruct': {
        id: 'meta-llama/llama-3.3-70b-instruct',
        inputCostPerM: 0.10, // Borderline T1 but high capacity
        outputCostPerM: 0.32,
        tier: 'TIER2',
        reasoning: 'HIGH'
    },

    // --- TIER 3: SOTA / EXPENSIVE (Avoid at scale) ---
    'anthropic/claude-3-opus': {
        id: 'anthropic/claude-3-opus',
        inputCostPerM: 15.00,
        outputCostPerM: 75.00,
        tier: 'TIER3',
        reasoning: 'ELITE'
    },
    'anthropic/claude-3.5-sonnet': {
        id: 'anthropic/claude-3.5-sonnet',
        inputCostPerM: 3.00,
        outputCostPerM: 15.00,
        tier: 'TIER3',
        reasoning: 'ELITE'
    },
    'openai/gpt-4o': {
        id: 'openai/gpt-4o',
        inputCostPerM: 5.00,
        outputCostPerM: 15.00,
        tier: 'TIER3',
        reasoning: 'ELITE'
    },
    'openai/o1-preview': {
        id: 'openai/o1-preview',
        inputCostPerM: 15.00,
        outputCostPerM: 60.00,
        tier: 'TIER3',
        reasoning: 'ELITE'
    }
};

/**
 * Calculates a "Value Score" for MAP-ELITE.
 * Formula: (Fitness Score / Input Cost per M) * 100
 */
export function calculateValueScore(fitness: number, modelId: string): number {
    const pricing = PRICING_REGISTRY[modelId];
    if (!pricing) return 0;
    return (fitness / pricing.inputCostPerM);
}
