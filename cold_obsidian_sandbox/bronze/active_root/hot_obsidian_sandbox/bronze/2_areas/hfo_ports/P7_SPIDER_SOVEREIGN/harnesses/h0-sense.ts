import { Harness } from './harness.interface';

// H0 SENSE: Basic factual QA and observation - HARD MODE
export const h0Sense: Harness = {
  id: 0,
  name: 'SENSE',
  prompts: [
    // Easy baseline
    { system: 'Answer briefly and accurately.', user: 'What is the capital of France?', expected: 'paris' },
    // Medium - requires knowledge
    { system: 'Answer briefly and accurately.', user: 'What is the atomic number of gold?', expected: '79' },
    // Hard - obscure fact
    { system: 'Answer briefly and accurately.', user: 'What year was the Treaty of Westphalia signed?', expected: '1648' },
    // Hard - requires calculation
    { system: 'Answer briefly and accurately.', user: 'How many seconds are in a non-leap year?', expected: '31536000' },
    // Hard - multi-step reasoning
    { system: 'Answer briefly and accurately.', user: 'If a train travels at 60 mph for 2.5 hours, how many miles does it travel?', expected: '150' },
  ],
  score(response: string, expected?: string): number {
    if (!expected) return 5;
    const normalized = response.toLowerCase().replace(/[,\s]/g, '');
    const exp = expected.toLowerCase();
    if (normalized.includes(exp)) return 10;
    // Partial credit for close answers
    if (expected === '31536000' && normalized.includes('31')) return 4;
    if (expected === '150' && normalized.includes('150')) return 10;
    return 2;
  },
};
