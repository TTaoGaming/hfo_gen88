import { Harness } from './harness.interface';

// H3 DELIVER: Instruction following and output formatting - HARD MODE
export const h3Deliver: Harness = {
  id: 3,
  name: 'DELIVER',
  prompts: [
    // Exact count constraint
    { system: 'Follow instructions exactly.', user: 'List exactly 5 programming languages, one per line, no numbering.', expected: '5lines' },
    // Format constraint
    { system: 'Follow instructions exactly.', user: 'Output only a valid JSON object with keys "name" and "age" for a person named Alice who is 30.', expected: 'json' },
    // Word limit
    { system: 'Follow instructions exactly.', user: 'Describe the sun in exactly 10 words.', expected: '10words' },
    // Specific format
    { system: 'Follow instructions exactly.', user: 'Write a haiku (5-7-5 syllables) about coding.', expected: 'haiku' },
    // Boolean response
    { system: 'Follow instructions exactly.', user: 'Is 17 a prime number? Respond with only "true" or "false".', expected: 'true' },
  ],
  score(response: string, expected?: string): number {
    if (!expected) return 5;
    const lines = response.trim().split('\n').filter(l => l.trim());
    const words = response.trim().split(/\s+/).filter(w => w);
    const normalized = response.toLowerCase().trim();
    
    switch (expected) {
      case '5lines':
        if (lines.length === 5) return 10;
        if (lines.length >= 4 && lines.length <= 6) return 6;
        return 2;
      case 'json':
        try {
          const obj = JSON.parse(response.trim());
          if (obj.name && obj.age) return 10;
          return 5;
        } catch { return 2; }
      case '10words':
        if (words.length === 10) return 10;
        if (words.length >= 8 && words.length <= 12) return 6;
        return 2;
      case 'haiku':
        if (lines.length === 3) return 8; // Approximate haiku check
        return 3;
      case 'true':
        if (normalized === 'true') return 10;
        if (normalized.includes('true') || normalized.includes('yes') || normalized.includes('prime')) return 5;
        return 0;
      default:
        return normalized.includes(expected) ? 10 : 2;
    }
  },
};
