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
