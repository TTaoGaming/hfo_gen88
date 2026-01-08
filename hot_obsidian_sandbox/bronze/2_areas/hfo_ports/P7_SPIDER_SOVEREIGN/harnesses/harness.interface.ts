import { HarnessResult } from '../schemas';

export interface HarnessPrompt {
  system: string;
  user: string;
  expected?: string; // For scoring
}

export interface Harness {
  id: number;
  name: string;
  prompts: HarnessPrompt[];
  score(response: string, expected?: string): number; // 0-10 raw score
}

export interface OllamaResponse {
  model: string;
  response: string;
  done: boolean;
  total_duration?: number;
  eval_count?: number;
}
