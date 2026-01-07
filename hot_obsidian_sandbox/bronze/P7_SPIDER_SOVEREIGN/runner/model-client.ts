/**
 * Unified Model Client - auto-detects Ollama vs OpenRouter
 */

import { ollamaChat, listModels as listOllamaModels } from './ollama-client';
import { openrouterChat, listOpenRouterModels } from './openrouter-client';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export type ModelProvider = 'ollama' | 'openrouter';

export function detectProvider(model: string): ModelProvider {
  return model.includes('/') ? 'openrouter' : 'ollama';
}

export async function chat(
  model: string,
  messages: ChatMessage[]
): Promise<{ response: string; duration_ms: number; provider: ModelProvider }> {
  const provider = detectProvider(model);
  
  if (provider === 'openrouter') {
    const result = await openrouterChat(model, messages);
    return { ...result, provider };
  } else {
    const result = await ollamaChat(model, messages);
    return { ...result, provider };
  }
}

export async function listAllModels(): Promise<{ ollama: string[]; openrouter: string[] }> {
  const [ollama, openrouter] = await Promise.all([
    listOllamaModels().catch(() => []),
    listOpenRouterModels().catch(() => []),
  ]);
  return { ollama, openrouter };
}

// ═══════════════════════════════════════════════════════════════════
// CHEAP PAID MODELS - Best value per family (Jan 2026)
// All under $1/M input tokens, fast, no rate limit issues
// VERIFIED via OpenRouter API query 2026-01-07
// ═══════════════════════════════════════════════════════════════════
export const CHEAP_PAID_MODELS = {
  // GOOGLE - Gemini 3 Flash Preview: $0.50/$3.00 (LATEST Dec 2025)
  GEMINI_3_FLASH: 'google/gemini-3-flash-preview',
  
  // OPENAI - GPT-4o-mini: $0.15/$0.60 (proven fast)
  GPT4O_MINI: 'openai/gpt-4o-mini',
  
  // ANTHROPIC - Claude 3.5 Haiku: $0.80/$4.00
  CLAUDE_35_HAIKU: 'anthropic/claude-3.5-haiku',
  
  // DEEPSEEK - V3.1 Chat: $0.15/$0.75 (fast, not reasoning)
  DEEPSEEK_V31: 'deepseek/deepseek-chat-v3.1',
  
  // QWEN - Qwen3 14B: $0.05/$0.22 (great value)
  QWEN3_14B: 'qwen/qwen3-14b',
  
  // META - Llama 3.3 70B: $0.10/$0.32
  LLAMA33_70B: 'meta-llama/llama-3.3-70b-instruct',
  
  // XAI - Grok 4.1 Fast: $0.20/$0.50 (LATEST Nov 2025)
  GROK41_FAST: 'x-ai/grok-4.1-fast',
  
  // MISTRAL - Mistral Medium 3.1: $0.40/$1.20
  MISTRAL_MEDIUM: 'mistralai/mistral-medium-3.1',
} as const;

// Array of all cheap paid models for batch testing
export const ALL_CHEAP_MODELS = Object.values(CHEAP_PAID_MODELS);

// Core 4 families - cheap tier (LATEST MODELS)
export const CHEAP_MODELS = [
  'google/gemini-3-flash-preview',   // LATEST: Dec 2025
  'openai/gpt-4o-mini', 
  'anthropic/claude-3.5-haiku',
  'deepseek/deepseek-chat-v3.1',
] as const;

// Extended 8 families - cheap tier (LATEST MODELS)
export const CHEAP_8_MODELS = [
  'google/gemini-3-flash-preview',   // LATEST: Dec 2025
  'openai/gpt-4o-mini',
  'anthropic/claude-3.5-haiku', 
  'deepseek/deepseek-chat-v3.1',
  'qwen/qwen3-14b',
  'meta-llama/llama-3.3-70b-instruct',
  'x-ai/grok-4.1-fast',              // LATEST: Nov 2025
  'mistralai/mistral-medium-3.1',
] as const;


// ═══════════════════════════════════════════════════════════════════
// EXPANDED CHEAP MODELS - 16 models for comprehensive testing
// All under $0.50/M input, verified via OpenRouter API 2026-01-07
// ═══════════════════════════════════════════════════════════════════
export const CHEAP_16_MODELS = [
  // TIER 1: Ultra-cheap ($0.02-0.05/M)
  'openai/gpt-oss-20b',              // $0.016/M - OpenAI open source
  'meta-llama/llama-3.1-8b-instruct', // $0.02/M
  'mistralai/mistral-nemo',          // $0.02/M
  'qwen/qwen3-8b',                   // $0.035/M
  'openai/gpt-5-nano',               // $0.05/M - GPT-5 family!
  'qwen/qwen3-14b',                  // $0.05/M
  
  // TIER 2: Budget ($0.08-0.15/M)
  'qwen/qwen3-32b',                  // $0.08/M
  'meta-llama/llama-4-scout',        // $0.08/M - Llama 4!
  'openai/gpt-4.1-nano',             // $0.10/M - GPT-4.1 family
  'meta-llama/llama-3.3-70b-instruct', // $0.10/M
  'openai/gpt-4o-mini',              // $0.15/M
  'deepseek/deepseek-chat-v3.1',     // $0.15/M
  'meta-llama/llama-4-maverick',     // $0.15/M - Llama 4 400B!
  
  // TIER 3: Value ($0.20-0.50/M)
  'x-ai/grok-4.1-fast',              // $0.20/M - LATEST Grok
  'openai/gpt-5-mini',               // $0.25/M - GPT-5 family
  'deepseek/deepseek-v3.2',          // $0.25/M - LATEST DeepSeek
  'google/gemini-2.5-flash',         // $0.30/M
  'mistralai/mistral-medium-3.1',    // $0.40/M
  'google/gemini-3-flash-preview',   // $0.50/M - LATEST Gemini
] as const;

// Premium cheap models (best quality under $1/M)
export const PREMIUM_CHEAP = [
  'anthropic/claude-3.5-haiku',      // $0.80/M - Best overall
  'anthropic/claude-3-haiku',        // $0.25/M - Older but good
] as const;

// ═══════════════════════════════════════════════════════════════════
// UNTESTED LATEST CHEAP MODELS - Priority for Testing (Jan 2026)
// All under $0.50/M, newest releases per family
// ═══════════════════════════════════════════════════════════════════
export const UNTESTED_LATEST_CHEAP = [
  // GOOGLE - Gemma 3 series (ultra cheap, untested)
  'google/gemma-3-4b-it',              // $0.017/M
  'google/gemma-3n-e4b-it',            // $0.020/M
  'google/gemma-3-12b-it',             // $0.030/M
  'google/gemma-3-27b-it',             // $0.036/M
  
  // DEEPSEEK - R1 distills (cheap reasoning)
  'deepseek/deepseek-r1-distill-llama-70b',  // $0.030/M
  'deepseek/deepseek-r1-0528-qwen3-8b',      // $0.060/M
  
  // MISTRAL - 3.1/3.2 series (latest)
  'mistralai/mistral-small-3.1-24b-instruct', // $0.030/M
  'mistralai/mistral-small-3.2-24b-instruct', // $0.060/M
  'mistralai/devstral-2512',                  // $0.050/M
  
  // QWEN - 2507 releases (July 2025)
  'qwen/qwen3-30b-a3b-thinking-2507',   // $0.051/M
  'qwen/qwen3-next-80b-a3b-instruct',   // $0.060/M
  'qwen/qwen3-coder-30b-a3b-instruct',  // $0.070/M
] as const;

// ═══════════════════════════════════════════════════════════════════
// MAP-ELITE ARCHIVE MODELS - Optimized for bulk testing (powers of 8)
// Avoiding expensive models (>$0.50/M) to preserve funds
// 512 runs @ $0.50/M = $0.25 vs 512 runs @ $3/M = $1.50
// ═══════════════════════════════════════════════════════════════════

// TIER 1: Ultra-cheap ($0.01-0.05/M) - Best for bulk testing
export const MAP_ELITE_TIER1 = [
  'openai/gpt-oss-20b',              // $0.016/M - 92.5% - BEST VALUE
  'google/gemma-3-4b-it',            // $0.017/M - 88.0%
  'google/gemma-3n-e4b-it',          // $0.020/M - 95.8% - BEST CHEAP!
  'mistralai/mistral-nemo',          // $0.020/M - 89.5%
  'google/gemma-3-12b-it',           // $0.030/M - 90.0%
  'mistralai/mistral-small-3.1-24b-instruct', // $0.030/M - 90.0%
  'google/gemma-3-27b-it',           // $0.036/M - 95.8%
  'openai/gpt-5-nano',               // $0.050/M - 85.8%
  'qwen/qwen3-30b-a3b-thinking-2507', // $0.051/M - 93.5%
] as const;

// TIER 2: Budget ($0.06-0.15/M) - Good balance
export const MAP_ELITE_TIER2 = [
  'qwen/qwen3-next-80b-a3b-instruct', // $0.060/M - 91.5%
  'qwen/qwen3-coder-30b-a3b-instruct', // $0.070/M - 93.8%
  'meta-llama/llama-4-scout',         // $0.080/M - 89.8%
  'meta-llama/llama-3.3-70b-instruct', // $0.100/M - 92.0%
  'openai/gpt-4o-mini',               // $0.150/M - 96.3% - TOP PERFORMER
  'meta-llama/llama-4-maverick',      // $0.150/M - 95.8%
  'deepseek/deepseek-chat-v3.1',      // $0.150/M - 93.8%
] as const;

// TIER 3: Value ($0.20-0.50/M) - Mid-range, use sparingly
export const MAP_ELITE_TIER3 = [
  'x-ai/grok-4.1-fast',               // $0.200/M - 96.5% - BEST MID
  'openai/gpt-5-mini',                // $0.250/M - 91.8%
  'deepseek/deepseek-v3.2',           // $0.250/M - 91.8%
  'google/gemini-2.5-flash',          // $0.300/M - 95.8%
  'google/gemini-3-flash-preview',    // $0.500/M - 90.0%
] as const;

// RECOMMENDED: Best 8 models for MAP-ELITE archives (balanced cost/quality)
export const MAP_ELITE_BEST_8 = [
  'google/gemma-3n-e4b-it',           // $0.020/M - 95.8% ⭐ BEST CHEAP
  'openai/gpt-oss-20b',               // $0.016/M - 92.5% ⭐ BEST VALUE
  'google/gemma-3-27b-it',            // $0.036/M - 95.8%
  'qwen/qwen3-30b-a3b-thinking-2507', // $0.051/M - 93.5%
  'qwen/qwen3-coder-30b-a3b-instruct', // $0.070/M - 93.8%
  'openai/gpt-4o-mini',               // $0.150/M - 96.3% ⭐ TOP PERFORMER
  'x-ai/grok-4.1-fast',               // $0.200/M - 96.5% ⭐ BEST MID
  'google/gemini-2.5-flash',          // $0.300/M - 95.8%
] as const;

// Cost estimate for 512 runs (powers of 8):
// TIER1 avg: $0.03/M × 512 × ~1K tokens = ~$0.015
// TIER2 avg: $0.10/M × 512 × ~1K tokens = ~$0.05
// TIER3 avg: $0.30/M × 512 × ~1K tokens = ~$0.15
// BEST_8 avg: $0.10/M × 512 × ~1K tokens = ~$0.05
