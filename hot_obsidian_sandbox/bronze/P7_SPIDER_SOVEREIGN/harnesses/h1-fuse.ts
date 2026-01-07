import { Harness } from './harness.interface';

// H1 FUSE: Synthesis and combination of information
export const h1Fuse: Harness = {
  id: 1,
  name: 'FUSE',
  prompts: [
    { system: 'Combine the concepts.', user: 'Combine "fast" and "food" into a compound word.', expected: 'fastfood' },
    { system: 'Merge the ideas.', user: 'What do you get when you cross a library with a computer? Answer in one word.', expected: 'database' },
    { system: 'Synthesize.', user: 'Add 15 + 27 + 8.', expected: '50' },
    { system: 'Combine.', user: 'What is the sum of the first 5 prime numbers (2,3,5,7,11)?', expected: '28' },
    { system: 'Merge.', user: 'Concatenate "Hello" and "World" with a space.', expected: 'hello world' },
  ],
  score(response: string, expected?: string): number {
    if (!expected) return 5;
    const norm = response.toLowerCase().replace(/[\s-]/g, '');
    const exp = expected.toLowerCase().replace(/[\s-]/g, '');
    if (norm.includes(exp)) return 10;
    return 2;
  },
};
