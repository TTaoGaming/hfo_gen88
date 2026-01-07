import { Harness } from './harness.interface';

// H0 SENSE: Basic factual QA and observation
export const h0Sense: Harness = {
  id: 0,
  name: 'SENSE',
  prompts: [
    { system: 'Answer briefly.', user: 'What is the capital of France?', expected: 'paris' },
    { system: 'Answer briefly.', user: 'What is the atomic number of gold?', expected: '79' },
    { system: 'Answer briefly.', user: 'What year was the Treaty of Westphalia signed?', expected: '1648' },
    { system: 'Answer briefly.', user: 'How many seconds are in a non-leap year?', expected: '31536000' },
    { system: 'Answer briefly.', user: 'If a train travels at 60 mph for 2.5 hours, how many miles?', expected: '150' },
  ],
  score(response: string, expected?: string): number {
    if (!expected) return 5;
    const norm = response.toLowerCase().replace(/[,\s]/g, '');
    if (norm.includes(expected.toLowerCase())) return 10;
    return 2;
  },
};
