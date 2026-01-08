import { Harness } from './harness.interface';

// H2 SHAPE: Code generation and transformation - HARD MODE
export const h2Shape: Harness = {
  id: 2,
  name: 'SHAPE',
  prompts: [
    // Basic function
    { system: 'Write only code, no explanations.', user: 'Write a JavaScript function called "add" that returns the sum of two numbers.', expected: 'function add' },
    // Algorithm implementation
    { system: 'Write only code, no explanations.', user: 'Write a Python function called "fibonacci" that returns the nth Fibonacci number using recursion.', expected: 'def fibonacci' },
    // Data structure manipulation
    { system: 'Write only code, no explanations.', user: 'Write a TypeScript function called "removeDuplicates" that removes duplicate values from an array.', expected: 'function removeDuplicates' },
    // Error handling
    { system: 'Write only code, no explanations.', user: 'Write a Python function called "safe_divide" that divides two numbers and returns None if division by zero.', expected: 'def safe_divide' },
    // Complex algorithm
    { system: 'Write only code, no explanations.', user: 'Write a JavaScript function called "binarySearch" that finds an element in a sorted array and returns its index or -1.', expected: 'function binarySearch' },
  ],
  score(response: string, expected?: string): number {
    if (!expected) return 5;
    const hasSignature = response.includes(expected);
    const hasReturn = response.includes('return');
    const hasLogic = response.includes('if') || response.includes('while') || response.includes('for');
    
    if (hasSignature && hasReturn && hasLogic) return 10;
    if (hasSignature && hasReturn) return 7;
    if (hasSignature) return 4;
    return 2;
  },
};
