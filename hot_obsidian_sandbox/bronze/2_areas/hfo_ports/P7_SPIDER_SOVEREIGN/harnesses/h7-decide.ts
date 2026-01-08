import { Harness } from './harness.interface';

// H7 DECIDE: Reasoning, planning, HFO domain knowledge - HARD MODE
export const h7Decide: Harness = {
  id: 7,
  name: 'DECIDE',
  prompts: [
    // Strategic planning
    { system: 'Think step by step.', user: 'I have $100. Item A costs $30, B costs $50, C costs $40. I want to maximize items. What should I buy?', expected: 'a' },
    // HIVE workflow
    { system: 'You understand HIVE: Hunt, Interlock, Validate, Evolve.', user: 'In HIVE, what phase involves writing failing tests (TDD RED)?', expected: 'interlock' },
    // OBSIDIAN ports
    { system: 'You understand OBSIDIAN 8-port architecture.', user: 'Which OBSIDIAN port handles code generation: SENSE, SHAPE, or STORE?', expected: 'shape' },
    // Multi-step reasoning
    { system: 'Reason carefully.', user: 'A bat and ball cost $1.10. The bat costs $1 more than the ball. How much does the ball cost?', expected: '0.05' },
    // Decision under uncertainty
    { system: 'Make optimal decisions.', user: 'Option A: 100% chance of $50. Option B: 50% chance of $120. Which has higher expected value?', expected: 'b' },
  ],
  score(response: string, expected?: string): number {
    if (!expected) return 5;
    const normalized = response.toLowerCase();
    if (normalized.includes(expected)) return 10;
    // Common wrong answers for bat/ball problem
    if (expected === '0.05' && normalized.includes('0.10')) return 2;
    if (expected === '0.05' && normalized.includes('5 cent')) return 10;
    // Partial credit for reasoning
    if (normalized.includes('step') || normalized.includes('therefore') || normalized.includes('because')) return 4;
    return 2;
  },
};
