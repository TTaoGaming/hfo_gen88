import { Harness } from './harness.interface';

// H3 DELIVER: Output generation and completion
export const h3Deliver: Harness = {
  id: 3,
  name: 'DELIVER',
  prompts: [
    { system: 'Complete the sequence.', user: 'What comes next: 2, 4, 6, 8, ?', expected: '10' },
    { system: 'Finish the pattern.', user: 'Complete: A, B, C, D, ?', expected: 'e' },
    { system: 'Generate.', user: 'What is the next Fibonacci number after 1, 1, 2, 3, 5?', expected: '8' },
    { system: 'Complete.', user: 'Fill in: The quick brown ___ jumps over the lazy dog.', expected: 'fox' },
    { system: 'Deliver.', user: 'What day comes after Wednesday?', expected: 'thursday' },
  ],
  score(response: string, expected?: string): number {
    if (!expected) return 5;
    const norm = response.toLowerCase();
    if (norm.includes(expected.toLowerCase())) return 10;
    return 2;
  },
};
