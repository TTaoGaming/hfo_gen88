# HIVE/8:10 Calibration Analysis

**Date**: 2026-01-07T13:45:00Z
**Harness**: HLE_MATH (5 prompts)
**Goal**: Identify where AI is wrong but confident vs wrong and knows it

---

## Calibration Matrix

| | Low Confidence | High Confidence |
|---|---|---|
| **Correct** | Humble genius ✅ | Well-calibrated ✅ |
| **Wrong** | Calibrated uncertainty ⚠️ | **DANGEROUS** 🚨 |

---

## Results by Prompt

### Prompt 0: ZF Set Theory AC(n)
**Expected**: 4
**Difficulty**: EXTREME (set theory without axiom of choice)

| Model | Answer | Correct | Notes |
|-------|--------|---------|-------|
| gemma-3n | 4 | ✅ | Got it right |
| llama-3.2-3b | 14301 | ❌ | Wildly wrong |
| qwen-2.5-7b | 2 | ❌ | Wrong |
| mistral-7b | (long) | ❌ | Wrong |
| deepseek | (long) | ❌ | Wrong |
| command-r7b | 20 | ❌ | Wrong |

**Consensus**: Wrong (picked "2" or similar)
**Analysis**: 1/6 correct. Models confidently gave wrong answers. **DANGEROUS** - high confidence, wrong answer.

---

### Prompt 1: Polynomial Irreducibility
**Expected**: 1
**Difficulty**: HIGH (Artin-Schreier theory)

| Model | Answer | Correct | Notes |
|-------|--------|---------|-------|
| gemma-3n | 2 | ❌ | Wrong |
| llama-3.2-3b | 1 | ✅ | Correct |
| qwen-2.5-7b | 1 | ✅ | Correct |
| mistral-7b | 1 | ✅ | Correct |
| deepseek | 1 | ✅ | Correct |
| command-r7b | An | ❌ | Gibberish |

**Consensus**: Correct (1)
**Analysis**: 4/6 correct. **BFT SUCCESS** - majority converged on truth.

---

### Prompt 2: Symmetric Group S_n Order 30
**Expected**: 10
**Difficulty**: HIGH (group theory)

| Model | Answer | Correct | Notes |
|-------|--------|---------|-------|
| gemma-3n | (long) | ❌ | Wrong |
| llama-3.2-3b | 6 | ❌ | Wrong |
| qwen-2.5-7b | 4 | ❌ | Wrong |
| mistral-7b | 15 | ❌ | Wrong |
| deepseek | 10 | ✅ | Correct! |
| command-r7b | (long) | ❌ | Wrong |

**Consensus**: Wrong (ERROR due to tie)
**Analysis**: 1/6 correct. All wrong answers different - no convergence. **DANGEROUS** - confident but scattered.

---

### Prompt 3: Domino Tiling 3×10
**Expected**: 571
**Difficulty**: EXTREME (combinatorics)

| Model | Answer | Correct | Notes |
|-------|--------|---------|-------|
| gemma-3n | 511 | ❌ | Close but wrong |
| llama-3.2-3b | 10 | ❌ | Way off |
| qwen-2.5-7b | 89 | ❌ | Wrong |
| mistral-7b | 1051 | ❌ | Wrong |
| deepseek | (long) | ❌ | Wrong |
| command-r7b | (long) | ❌ | Wrong |

**Consensus**: Wrong
**Analysis**: 0/6 correct. All models failed. This is **calibrated failure** - the question is too hard.

---

### Prompt 4: Petersen Graph Chromatic Number
**Expected**: 3
**Difficulty**: MEDIUM (graph theory)

| Model | Answer | Correct | Notes |
|-------|--------|---------|-------|
| gemma-3n | 3 | ✅ | Correct |
| llama-3.2-3b | 3 | ✅ | Correct |
| qwen-2.5-7b | 3 | ✅ | Correct |
| mistral-7b | 3 | ✅ | Correct |
| deepseek | 3 | ✅ | Correct |
| command-r7b | 3 | ✅ | Correct |

**Consensus**: Correct (3)
**Analysis**: 6/6 correct. **PERFECT CONVERGENCE** - all models agree on truth.

---

## Summary Statistics

| Prompt | Correct Models | Consensus | Single | HIVE | Δ |
|--------|----------------|-----------|--------|------|---|
| 0 | 1/6 | ❌ Wrong | 0 | 0 | 0 |
| 1 | 4/6 | ✅ Correct | 10 | 10 | 0 |
| 2 | 1/6 | ❌ Wrong | 10 | 0 | -10 |
| 3 | 0/6 | ❌ Wrong | 0 | 0 | 0 |
| 4 | 6/6 | ✅ Correct | 10 | 10 | 0 |

**Totals**: Single 30/50, HIVE 20/50

---

## Key Insights

### 1. Convergence = Signal
- **Prompt 4**: 6/6 agree → HIGH confidence in answer
- **Prompt 1**: 4/6 agree → MEDIUM confidence, likely correct
- **Prompt 2**: 1/6 agree, all different → LOW confidence, likely wrong

### 2. Scatter Pattern Reveals Uncertainty
When models give wildly different answers (Prompt 2: 6, 4, 15, 10, etc.), this is a **signal of uncertainty**. The system should report "low confidence" not pick randomly.

### 3. The Dangerous Zone
**Prompt 0**: Models confidently gave wrong answers (2, 20, 14301). This is the **DANGEROUS** case - high confidence, wrong answer. BFT can't help here because the errors are correlated (all models lack the knowledge).

### 4. When BFT Works
**Prompt 1**: Single agent (gemma) got it wrong (2), but 4/6 models got it right (1). BFT consensus found the truth. This is the **value proposition** of scatter-gather.

---

## Recommendations

1. **Add confidence threshold**: If agreement < 50%, report "uncertain" instead of picking
2. **Track scatter pattern**: High variance in answers = low confidence
3. **Weight by model family**: If all Google models agree but Meta disagrees, that's 1 vote not 2
4. **Detect dangerous zone**: If all models agree on wrong answer, BFT can't help - need different approach (tool use, retrieval, etc.)

---

## Next Steps

1. [ ] Implement confidence threshold (don't answer if agreement < 50%)
2. [ ] Add scatter variance metric
3. [ ] Test on more prompts to find BFT sweet spot
4. [ ] Compare cost: 8× cheap vs 1× expensive on same questions
