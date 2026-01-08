/**
 * Provider Detection - Pure Routing Logic
 * @provenance hfo-testing-promotion/10.1
 * Validates: Requirements 4.1, 4.2, 4.5
 */

/** Supported model providers */
export type ModelProvider = 'ollama' | 'openrouter';

/**
 * Detect provider from model name.
 * Models with '/' are OpenRouter (e.g., "openai/gpt-4o-mini").
 * Models without '/' are Ollama (e.g., "llama3").
 * Validates: Requirements 4.1, 4.2, 4.5
 */
export function detectProvider(model: string): ModelProvider {
  return model.includes('/') ? 'openrouter' : 'ollama';
}

/**
 * Check if model name is valid (non-empty string).
 */
export function isValidModelName(model: string): boolean {
  return typeof model === 'string' && model.length > 0;
}

/**
 * Extract organization from OpenRouter model name.
 * Returns undefined for Ollama models.
 */
export function extractOrganization(model: string): string | undefined {
  if (!model.includes('/')) return undefined;
  const parts = model.split('/');
  return parts[0] || undefined;
}

/**
 * Extract model name without organization.
 * For OpenRouter: "openai/gpt-4o-mini" → "gpt-4o-mini"
 * For Ollama: "llama3" → "llama3"
 */
export function extractModelName(model: string): string {
  if (!model.includes('/')) return model;
  const parts = model.split('/');
  return parts.slice(1).join('/') || model;
}

/**
 * Normalize model name for comparison.
 * Lowercases and trims whitespace.
 */
export function normalizeModelName(model: string): string {
  return model.toLowerCase().trim();
}
