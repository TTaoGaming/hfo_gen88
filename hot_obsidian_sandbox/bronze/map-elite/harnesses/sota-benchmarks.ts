/**
 * SOTA Benchmark Harness - Exemplar questions from established hard benchmarks
 * 
 * Sources:
 * - SimpleQA: https://github.com/openai/simple-evals (factuality, ~40% SOTA)
 * - GSM8K: https://huggingface.co/datasets/openai/gsm8k (math reasoning, ~80% SOTA)
 * - MMLU: https://huggingface.co/datasets/cais/mmlu (knowledge, ~90% SOTA)
 * - GPQA: https://huggingface.co/datasets/Idavidrein/gpqa (PhD-level, ~50% SOTA)
 * - HumanEval: https://github.com/openai/human-eval (coding, ~90% SOTA)
 * - BBH: https://github.com/suzgunmirac/BIG-Bench-Hard (reasoning, ~70% SOTA)
 * 
 * Goal: Test orchestration patterns vs baselines with questions that differentiate models
 */

import { Harness } from './harness.interface';

// ═══════════════════════════════════════════════════════════════════
// SimpleQA-style: Factual questions with single correct answers
// SOTA: ~40-50% (GPT-4o gets ~42%, o1 gets ~47%)
// Source: https://openai.com/index/introducing-simpleqa/
// ═══════════════════════════════════════════════════════════════════
export const simpleQAPrompts = [
  // Hard factual questions that models often hallucinate on
  { 
    system: 'Answer with just the fact, no explanation.',
    user: 'What was the exact date when the Treaty of Tordesillas was signed?',
    expected: 'june 7, 1494',
  },
  {
    system: 'Answer with just the fact, no explanation.',
    user: 'What is the atomic mass of Einsteinium to 3 decimal places?',
    expected: '252.083',
  },
  {
    system: 'Answer with just the fact, no explanation.',
    user: 'Who was the 23rd Prime Minister of Canada?',
    expected: 'justin trudeau',
  },
  {
    system: 'Answer with just the fact, no explanation.',
    user: 'What is the IATA code for Narita International Airport?',
    expected: 'nrt',
  },
  {
    system: 'Answer with just the fact, no explanation.',
    user: 'In what year did Estonia adopt the Euro as its currency?',
    expected: '2011',
  },
];

// ═══════════════════════════════════════════════════════════════════
// GSM8K-style: Grade school math requiring multi-step reasoning
// SOTA: ~80-95% (but cheap models often fail)
// Source: https://huggingface.co/datasets/openai/gsm8k
// ═══════════════════════════════════════════════════════════════════
export const gsm8kPrompts = [
  {
    system: 'Solve step by step, then give the final numerical answer.',
    user: 'Betty is saving money for a new wallet which costs $100. Betty has only half of the money she needs. Her parents decided to give her $15 for that purpose, and her grandparents twice as much as her parents. How much more money does Betty need to buy the wallet?',
    expected: '5', // 100/2=50, 50+15+30=95, 100-95=5
  },
  {
    system: 'Solve step by step, then give the final numerical answer.',
    user: 'Natalia sold clips to 48 of her friends in April, and then she sold half as many clips in May. How many clips did Natalia sell altogether in April and May?',
    expected: '72', // 48 + 24 = 72
  },
  {
    system: 'Solve step by step, then give the final numerical answer.',
    user: 'Weng earns $12 an hour for babysitting. Yesterday, she just did 50 minutes of babysitting. How much did she earn?',
    expected: '10', // 12/60 * 50 = 10
  },
  {
    system: 'Solve step by step, then give the final numerical answer.',
    user: 'James decides to run 3 sprints 3 times a week. He runs 60 meters each sprint. How many total meters does he run a week?',
    expected: '540', // 3 * 3 * 60 = 540
  },
  {
    system: 'Solve step by step, then give the final numerical answer.',
    user: 'A family of 4 is planning a 5-day trip. Train tickets cost €200 per person round trip. Hotel costs €120 per night. Food is €60 per day and activities €40 per day. What is the total trip cost?',
    expected: '1900', // 4*200 + 5*120 + 5*60 + 5*40 = 800+600+300+200 = 1900
  },
];

// ═══════════════════════════════════════════════════════════════════
// GPQA-style: PhD-level science questions
// SOTA: ~50-65% (even experts struggle)
// Source: https://huggingface.co/datasets/Idavidrein/gpqa
// ═══════════════════════════════════════════════════════════════════
export const gpqaPrompts = [
  {
    system: 'Answer the multiple choice question. Reply with just the letter (A, B, C, or D).',
    user: `A particle of mass m is in a one-dimensional harmonic oscillator potential V(x) = (1/2)mω²x². If the particle is in the ground state, what is the probability of finding it in the classically forbidden region?
A) 0
B) 0.16
C) 0.32
D) 0.50`,
    expected: 'b', // ~16% in classically forbidden region
  },
  {
    system: 'Answer the multiple choice question. Reply with just the letter (A, B, C, or D).',
    user: `In organic chemistry, which of the following reactions proceeds with retention of stereochemistry at the carbon center?
A) SN1 reaction
B) SN2 reaction  
C) E1 reaction
D) Neighboring group participation with a sulfur nucleophile`,
    expected: 'd', // NGP gives retention
  },
  {
    system: 'Answer the multiple choice question. Reply with just the letter (A, B, C, or D).',
    user: `A buffer solution is prepared by mixing 0.1 M acetic acid (pKa = 4.76) with 0.1 M sodium acetate. What is the pH of this buffer?
A) 4.26
B) 4.76
C) 5.26
D) 7.00`,
    expected: 'b', // Henderson-Hasselbalch: pH = pKa when [A-] = [HA]
  },
  {
    system: 'Answer the multiple choice question. Reply with just the letter (A, B, C, or D).',
    user: `In quantum mechanics, the commutator [x, p] equals:
A) 0
B) iℏ
C) -iℏ
D) ℏ²`,
    expected: 'b', // [x,p] = iℏ
  },
  {
    system: 'Answer the multiple choice question. Reply with just the letter (A, B, C, or D).',
    user: `Which enzyme catalyzes the rate-limiting step of glycolysis?
A) Hexokinase
B) Phosphofructokinase-1
C) Pyruvate kinase
D) Aldolase`,
    expected: 'b', // PFK-1 is rate-limiting
  },
];

// ═══════════════════════════════════════════════════════════════════
// HumanEval-style: Code completion problems
// SOTA: ~85-95% (but execution required for true eval)
// Source: https://github.com/openai/human-eval
// ═══════════════════════════════════════════════════════════════════
export const humanEvalPrompts = [
  {
    system: 'Complete the Python function. Return only the function body code.',
    user: `def has_close_elements(numbers: list[float], threshold: float) -> bool:
    """Check if any two numbers in the list are closer than threshold."""`,
    expected: 'for i in range', // Check for loop-based solution
  },
  {
    system: 'Complete the Python function. Return only the function body code.',
    user: `def below_zero(operations: list[int]) -> bool:
    """Given list of deposits/withdrawals starting at 0, return True if balance goes below zero."""`,
    expected: 'balance', // Should track running balance
  },
  {
    system: 'Complete the Python function. Return only the function body code.',
    user: `def intersperse(numbers: list[int], delimiter: int) -> list[int]:
    """Insert delimiter between every two consecutive elements of numbers."""`,
    expected: 'result', // Should build result list
  },
  {
    system: 'Complete the Python function. Return only the function body code.',
    user: `def is_palindrome(text: str) -> bool:
    """Check if given string is a palindrome."""`,
    expected: '[::-1]', // Common palindrome check
  },
  {
    system: 'Complete the Python function. Return only the function body code.',
    user: `def fizz_buzz(n: int) -> int:
    """Return count of numbers from 1 to n that are divisible by 11 or 13."""`,
    expected: 'count', // Should count matches
  },
];

// ═══════════════════════════════════════════════════════════════════
// BBH-style: BIG-Bench Hard reasoning tasks
// SOTA: ~60-80%
// Source: https://github.com/suzgunmirac/BIG-Bench-Hard
// ═══════════════════════════════════════════════════════════════════
export const bbhPrompts = [
  // Logical deduction
  {
    system: 'Answer the logical puzzle. Give only the final answer.',
    user: 'The following paragraphs each describe a set of three objects arranged in a fixed order. The statements are logically consistent within each paragraph. In a golf tournament, there were three golfers: Amy, Eli, and Eve. Eve finished above Amy. Eli finished below Amy. Who finished first?',
    expected: 'eve',
  },
  // Tracking shuffled objects
  {
    system: 'Answer the puzzle. Give only the final answer.',
    user: 'Alice, Bob, and Claire are playing a game. At the start, Alice has a white ball, Bob has a purple ball, and Claire has a yellow ball. As the game progresses, pairs of players trade balls. First, Alice and Bob swap balls. Then, Bob and Claire swap balls. Finally, Alice and Bob swap balls. At the end, what ball does Alice have?',
    expected: 'yellow',
  },
  // Causal judgment
  {
    system: 'Answer yes or no.',
    user: 'A machine is set up in such a way that it will short circuit if both the black wire and the red wire touch the battery at the same time. The machine will not short circuit if just one of these wires touches the battery. The black wire is designated as the one that is supposed to touch the battery, while the red wire is not supposed to touch the battery. One day, both wires accidentally touch the battery at the same time. There is a short circuit. Did the red wire cause the short circuit?',
    expected: 'yes',
  },
  // Temporal sequences
  {
    system: 'Answer the question about the sequence of events.',
    user: 'Today, Emily went to the museum. Between what times could they have gone? We know that: Emily woke up at 5am. Elizabeth saw Emily reading at the library from 5am to 8am. David saw Emily walking towards the Statue of Liberty from 8am to 9am. Jennifer saw Emily sitting on a rooftop from 9am to 1pm. The museum was closed after 4pm.',
    expected: '1pm to 4pm',
  },
  // Word problems with negation
  {
    system: 'Answer true or false.',
    user: 'Statement: "No mammals can fly." Is this statement true or false given that bats are mammals and bats can fly?',
    expected: 'false',
  },
];

// ═══════════════════════════════════════════════════════════════════
// Scoring functions
// ═══════════════════════════════════════════════════════════════════

function scoreExact(response: string, expected: string): number {
  const norm = response.toLowerCase().replace(/[^a-z0-9]/g, '');
  const exp = expected.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (norm.includes(exp)) return 10;
  return 0;
}

function scoreContains(response: string, expected: string): number {
  const norm = response.toLowerCase();
  if (norm.includes(expected.toLowerCase())) return 10;
  // Partial credit for close answers
  const words = expected.toLowerCase().split(' ');
  const matches = words.filter(w => norm.includes(w)).length;
  return Math.round((matches / words.length) * 5);
}

function scoreMCQ(response: string, expected: string): number {
  const norm = response.toLowerCase().trim();
  const exp = expected.toLowerCase();
  // Check if response starts with or contains the expected letter
  if (norm.startsWith(exp) || norm.includes(`(${exp})`) || norm.includes(`${exp})`)) return 10;
  if (norm.includes(exp)) return 8;
  return 0;
}

// ═══════════════════════════════════════════════════════════════════
// Harness definitions
// ═══════════════════════════════════════════════════════════════════

export const sotaSimpleQA: Harness = {
  id: 0,
  name: 'SIMPLEQA',
  prompts: simpleQAPrompts,
  score: scoreExact,
};

export const sotaGSM8K: Harness = {
  id: 1,
  name: 'GSM8K',
  prompts: gsm8kPrompts,
  score: scoreExact,
};

export const sotaGPQA: Harness = {
  id: 2,
  name: 'GPQA',
  prompts: gpqaPrompts,
  score: scoreMCQ,
};

export const sotaHumanEval: Harness = {
  id: 3,
  name: 'HUMANEVAL',
  prompts: humanEvalPrompts,
  score: scoreContains,
};

export const sotaBBH: Harness = {
  id: 4,
  name: 'BBH',
  prompts: bbhPrompts,
  score: scoreExact,
};

// Combined SOTA harness for quick testing
export const ALL_SOTA_HARNESSES = [
  sotaSimpleQA,
  sotaGSM8K,
  sotaGPQA,
  sotaHumanEval,
  sotaBBH,
];

export default ALL_SOTA_HARNESSES;
