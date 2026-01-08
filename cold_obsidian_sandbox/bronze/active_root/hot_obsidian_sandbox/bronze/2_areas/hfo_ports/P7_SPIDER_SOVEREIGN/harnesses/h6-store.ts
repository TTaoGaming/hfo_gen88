import { Harness } from './harness.interface';

// H6 STORE: Context retention and multi-turn coherence - HARD MODE
export const h6Store: Harness = {
  id: 6,
  name: 'STORE',
  prompts: [
    // Direct recall
    { system: 'Remember: The secret code is "ALPHA-7". You are a helpful assistant.', user: 'What is the secret code I mentioned?', expected: 'alpha-7' },
    // Numeric recall
    { system: 'Context: The meeting is at 3:45 PM in Room 204.', user: 'What room is the meeting in?', expected: '204' },
    // Multi-fact recall
    { system: 'Facts: John is 25. Mary is 30. Bob is 22.', user: 'Who is the oldest?', expected: 'mary' },
    // Instruction recall
    { system: 'Rule: Always end responses with "END".', user: 'What is 2+2?', expected: 'end' },
    // Complex context
    { system: 'You are helping plan a trip. Budget: $500. Destination: Paris. Duration: 5 days.', user: 'What is the budget for the trip?', expected: '500' },
  ],
  score(response: string, expected?: string): number {
    if (!expected) return 5;
    const normalized = response.toLowerCase();
    if (normalized.includes(expected.toLowerCase())) return 10;
    return 2;
  },
};
