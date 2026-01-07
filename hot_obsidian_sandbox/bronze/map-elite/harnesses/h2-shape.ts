import { Harness } from './harness.interface';

// H2 SHAPE: Transformation and formatting
export const h2Shape: Harness = {
  id: 2,
  name: 'SHAPE',
  prompts: [
    { system: 'Transform as requested.', user: 'Convert "hello" to uppercase.', expected: 'HELLO' },
    { system: 'Format the output.', user: 'Reverse the string "abcde".', expected: 'edcba' },
    { system: 'Transform.', user: 'What is 255 in hexadecimal?', expected: 'ff' },
    { system: 'Reshape.', user: 'Sort these letters alphabetically: d, a, c, b', expected: 'a,b,c,d' },
    { system: 'Convert.', user: 'Convert 100 Celsius to Fahrenheit.', expected: '212' },
  ],
  score(response: string, expected?: string): number {
    if (!expected) return 5;
    const norm = response.toLowerCase().replace(/[\s,]/g, '');
    const exp = expected.toLowerCase().replace(/[\s,]/g, '');
    if (norm.includes(exp)) return 10;
    if (expected === 'a,b,c,d' && norm.includes('abcd')) return 10;
    return 2;
  },
};
