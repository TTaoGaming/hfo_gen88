/**
 * Provider Detection Unit Tests
 * @provenance hfo-testing-promotion/10.2
 * Validates: Requirements 4.1, 4.2
 */

import { describe, it, expect } from 'vitest';
import {
  detectProvider,
  isValidModelName,
  extractOrganization,
  extractModelName,
  normalizeModelName,
} from './provider-detection';

describe('Provider Detection', () => {
  describe('detectProvider', () => {
    it('should return ollama for model without slash', () => {
      expect(detectProvider('llama3')).toBe('ollama');
      expect(detectProvider('mistral')).toBe('ollama');
      expect(detectProvider('codellama')).toBe('ollama');
    });

    it('should return openrouter for model with slash', () => {
      expect(detectProvider('openai/gpt-4o-mini')).toBe('openrouter');
      expect(detectProvider('anthropic/claude-3.5-haiku')).toBe('openrouter');
      expect(detectProvider('meta-llama/llama-3.3-70b-instruct')).toBe('openrouter');
    });

    it('should handle empty string as ollama', () => {
      expect(detectProvider('')).toBe('ollama');
    });

    it('should handle multiple slashes', () => {
      expect(detectProvider('org/model/variant')).toBe('openrouter');
    });

    it('should handle slash at start', () => {
      expect(detectProvider('/model')).toBe('openrouter');
    });

    it('should handle slash at end', () => {
      expect(detectProvider('model/')).toBe('openrouter');
    });
  });

  describe('isValidModelName', () => {
    it('should return true for non-empty string', () => {
      expect(isValidModelName('llama3')).toBe(true);
      expect(isValidModelName('openai/gpt-4')).toBe(true);
    });

    it('should return false for empty string', () => {
      expect(isValidModelName('')).toBe(false);
    });
  });

  describe('extractOrganization', () => {
    it('should return organization for OpenRouter model', () => {
      expect(extractOrganization('openai/gpt-4o-mini')).toBe('openai');
      expect(extractOrganization('anthropic/claude-3.5-haiku')).toBe('anthropic');
    });

    it('should return undefined for Ollama model', () => {
      expect(extractOrganization('llama3')).toBeUndefined();
      expect(extractOrganization('mistral')).toBeUndefined();
    });

    it('should handle multiple slashes', () => {
      expect(extractOrganization('org/model/variant')).toBe('org');
    });

    it('should return undefined for empty org', () => {
      expect(extractOrganization('/model')).toBeUndefined();
    });
  });

  describe('extractModelName', () => {
    it('should extract model name from OpenRouter format', () => {
      expect(extractModelName('openai/gpt-4o-mini')).toBe('gpt-4o-mini');
      expect(extractModelName('anthropic/claude-3.5-haiku')).toBe('claude-3.5-haiku');
    });

    it('should return full name for Ollama model', () => {
      expect(extractModelName('llama3')).toBe('llama3');
      expect(extractModelName('mistral')).toBe('mistral');
    });

    it('should handle multiple slashes', () => {
      expect(extractModelName('org/model/variant')).toBe('model/variant');
    });
  });

  describe('normalizeModelName', () => {
    it('should lowercase', () => {
      expect(normalizeModelName('GPT-4')).toBe('gpt-4');
      expect(normalizeModelName('LLAMA3')).toBe('llama3');
    });

    it('should trim whitespace', () => {
      expect(normalizeModelName('  llama3  ')).toBe('llama3');
    });

    it('should handle mixed case with slash', () => {
      expect(normalizeModelName('OpenAI/GPT-4o-Mini')).toBe('openai/gpt-4o-mini');
    });
  });
});
