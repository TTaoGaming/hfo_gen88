import { Harness } from './harness.interface';

// H1 FUSE: Multi-source integration and reasoning - HARD MODE
export const h1Fuse: Harness = {
  id: 1,
  name: 'FUSE',
  prompts: [
    // Transitive reasoning
    { system: 'Synthesize information. Be concise.', user: 'Given: A is taller than B. B is taller than C. C is taller than D. Who is the shortest?', expected: 'd' },
    // Logical fallacy detection
    { system: 'Synthesize information. Be concise.', user: 'If all roses are flowers and some flowers fade quickly, can we conclude all roses fade quickly? Answer yes or no and explain briefly.', expected: 'no' },
    // Multi-constraint satisfaction
    { system: 'Synthesize information. Be concise.', user: 'Alice is older than Bob. Carol is younger than Bob. Dave is older than Alice. Who is the youngest?', expected: 'carol' },
    // Contradiction detection
    { system: 'Synthesize information. Be concise.', user: 'Statement 1: All birds can fly. Statement 2: Penguins are birds. Statement 3: Penguins cannot fly. Is there a contradiction? Answer yes or no.', expected: 'yes' },
    // Complex inference
    { system: 'Synthesize information. Be concise.', user: 'In a room: 3 people wear hats, 4 wear glasses, 2 wear both. How many wear at least one accessory?', expected: '5' },
  ],
  score(response: string, expected?: string): number {
    if (!expected) return 5;
    const normalized = response.toLowerCase().trim();
    if (normalized.includes(expected)) return 10;
    // Partial credit for reasoning attempts
    if (normalized.includes('because') || normalized.includes('therefore')) return 4;
    return 2;
  },
};
