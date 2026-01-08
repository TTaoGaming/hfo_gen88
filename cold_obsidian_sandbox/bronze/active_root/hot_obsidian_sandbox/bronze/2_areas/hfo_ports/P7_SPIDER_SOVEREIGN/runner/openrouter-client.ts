/**
 * OpenRouter API Client - Optimized for high concurrency
 */

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function openrouterChat(
  model: string,
  messages: ChatMessage[],
  maxRetries = 2
): Promise<{ response: string; duration_ms: number }> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY not set');
  }
  
  const start = Date.now();
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://github.com/hfo-gen88',
          'X-Title': 'MAP-ELITE',
        },
        body: JSON.stringify({ model, messages, max_tokens: 1024 }),
      });

      if (res.status === 429 && attempt < maxRetries) {
        const waitMs = (attempt + 1) * 2000;
        await sleep(waitMs);
        continue;
      }

      if (!res.ok) {
        throw new Error(`OpenRouter ${res.status}`);
      }

      const data = await res.json();
      return {
        response: data.choices?.[0]?.message?.content || '',
        duration_ms: Date.now() - start,
      };
    } catch (err) {
      if (attempt === maxRetries) throw err;
      await sleep(1000);
    }
  }
  
  throw new Error('OpenRouter failed');
}

export async function listOpenRouterModels(): Promise<string[]> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return [];
  
  const res = await fetch(`${OPENROUTER_BASE_URL}/models`, {
    headers: { 'Authorization': `Bearer ${apiKey}` },
  });
  
  if (!res.ok) return [];
  const data = await res.json();
  return data.data?.map((m: any) => m.id) || [];
}
