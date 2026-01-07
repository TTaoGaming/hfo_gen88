/**
 * Ollama Local Client
 */

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function ollamaChat(
  model: string,
  messages: ChatMessage[]
): Promise<{ response: string; duration_ms: number }> {
  const start = Date.now();
  
  const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, stream: false }),
  });

  if (!res.ok) {
    throw new Error(`Ollama error: ${res.status}`);
  }

  const data = await res.json();
  return {
    response: data.message?.content || '',
    duration_ms: Date.now() - start,
  };
}

export async function listModels(): Promise<string[]> {
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.models?.map((m: any) => m.name) || [];
  } catch {
    return [];
  }
}
