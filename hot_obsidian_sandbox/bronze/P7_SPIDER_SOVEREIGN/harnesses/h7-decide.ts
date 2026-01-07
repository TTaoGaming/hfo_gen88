import { Harness } from './harness.interface';

// H7 DECIDE: Decision making and reasoning
export const h7Decide: Harness = {
  id: 7,
  name: 'DECIDE',
  prompts: [
    { system: 'Make a decision.', user: 'Should I bring an umbrella if there is 90% chance of rain?', expected: 'yes' },
    { system: 'Choose wisely.', user: 'Is 17 a prime number? Answer yes or no.', expected: 'yes' },
    { system: 'Decide.', user: 'Which is larger: 0.9 or 0.89?', expected: '0.9' },
    { system: 'Reason.', user: 'If all cats are animals, and Fluffy is a cat, is Fluffy an animal?', expected: 'yes' },
    { system: 'Judge.', user: 'Is it ethical to return a lost wallet? Answer yes or no.', expected: 'yes' },
  ],
  score(response: string, expected?: string): number {
    if (!expected) return 5;
    const norm = response.toLowerCase();
    if (norm.includes(expected.toLowerCase())) return 10;
    if (expected === 'yes' && (norm.includes('should') || norm.includes('correct') || norm.includes('true'))) return 8;
    return 2;
  },
};
