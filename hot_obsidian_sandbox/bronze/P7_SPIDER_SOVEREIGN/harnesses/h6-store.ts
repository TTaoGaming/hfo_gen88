import { Harness } from './harness.interface';

// H6 STORE: Memory and context retention
export const h6Store: Harness = {
  id: 6,
  name: 'STORE',
  prompts: [
    { system: 'Remember: The password is "blue42".', user: 'What is the password?', expected: 'blue42' },
    { system: 'Context: Alice is 25, Bob is 30.', user: 'Who is older, Alice or Bob?', expected: 'bob' },
    { system: 'Given: x=5, y=3.', user: 'What is x + y?', expected: '8' },
    { system: 'Note: The meeting is on Tuesday at 3pm.', user: 'When is the meeting?', expected: 'tuesday' },
    { system: 'Data: Red=1, Blue=2, Green=3.', user: 'What number is Blue?', expected: '2' },
  ],
  score(response: string, expected?: string): number {
    if (!expected) return 5;
    const norm = response.toLowerCase();
    if (norm.includes(expected.toLowerCase())) return 10;
    return 2;
  },
};
