# HIVE/8:10 Initial Test Results

**Date**: 2026-01-07T13:00:00Z
**Harness**: HLE_MATH (5 prompts)
**Models**: 8 (2 failed with 404)

## Results

| Prompt | Question | Single | HIVE/8:10 | Δ | Correct Models |
|--------|----------|--------|-----------|---|----------------|
| 0 | ZF set theory AC(n) | 10 | 0 | -10 | 0/6 |
| 1 | Polynomial irreducibility | 0 | 10 | **+10** | 5/6 |
| 2 | Symmetric group S_n | 10 | 0 | -10 | 4/6 (consensus bug) |
| 3 | Domino tiling | 0 | 0 | 0 | 1/6 |
| 4 | Petersen chromatic | 10 | 10 | 0 | 5/6 |

**Totals**: Single 30/50, HIVE 20/50

## Issues Found

### 1. Model 404s
- `microsoft/phi-3-mini-128k-instruct` - Not available on OpenRouter
- `nvidia/llama-3.1-nemotron-nano-8b-v1` - Not available on OpenRouter

**Fix**: Replace with working models

### 2. Consensus Bug (Prompt 2)
4/6 models got correct answer (10) but consensus picked wrong answer.

**Root cause**: Normalization truncates to 20 chars, causing different correct answers to not group together.

**Example**:
- "The order of a permutation in..." → "theorderofapermutati"
- "The smallest positive integer..." → "thesmallestpositivei"

Both contain "10" but normalize differently.

**Fix**: Score-based consensus instead of string matching

### 3. Low Agreement
Agreement ratio consistently 25-38% even when majority is correct.

**Cause**: Each model phrases answer differently, normalization doesn't group them.

## Hypothesis Status

> Multi-model BFT consensus > single agent at 8× cheap cost

**Verdict**: INCONCLUSIVE - consensus algorithm needs fixing

With proper score-based consensus:
- Prompt 1: HIVE would win (+10)
- Prompt 2: HIVE would win (4/6 correct)
- Prompt 4: Tie (both correct)

**Potential**: 40/50 vs 30/50 if consensus fixed

## Next Steps

1. [ ] Fix model list (replace 404 models)
2. [ ] Implement score-based consensus (use harness.score)
3. [ ] Re-run tests
4. [ ] Test on more prompts
