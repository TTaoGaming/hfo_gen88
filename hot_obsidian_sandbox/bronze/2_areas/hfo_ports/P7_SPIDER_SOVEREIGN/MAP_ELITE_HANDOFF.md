# MAP-ELITE Phase 2 Handoff Document

> **Generation**: 88 (Canalization)
> **Date**: 2026-01-07
> **Status**: Phase 1 Complete - Ready for Orchestration Testing

---

## Executive Summary

39 OpenRouter models evaluated across 8 HFO harnesses. Key findings:
- **Best Cheap**: `google/gemma-3n-e4b-it` @ 95.8% for $0.02/M
- **Best Value**: `openai/gpt-oss-20b` @ 92.5% for $0.016/M (57.8 pts/$)
- **Best Overall**: `anthropic/claude-3.5-haiku` @ 98.0% for $0.80/M
- **Handoff Pattern**: weak→strong improves scores, strong→weak degrades

---

## Model Evaluation Matrix (Top 20)

| Rank | Model | Fitness | Price | Value |
|------|-------|---------|-------|-------|
| 1 | anthropic/claude-3.5-haiku | 98.0% | $0.80/M | 1.2 |
| 2 | x-ai/grok-4.1-fast | 96.5% | $0.20/M | 4.8 |
| 3 | openai/gpt-4o-mini | 96.3% | $0.15/M | 6.4 |
| 4 | google/gemma-3n-e4b-it | 95.8% | $0.02/M | 47.9 ⭐ |
| 5 | google/gemma-3-27b-it | 95.8% | $0.036/M | 26.6 |
| 6 | google/gemini-2.5-flash | 95.8% | $0.30/M | 3.2 |
| 7 | meta-llama/llama-4-maverick | 95.8% | $0.15/M | 6.4 |
| 8 | anthropic/claude-haiku-4.5 | 94.3% | $1.00/M | 0.9 |
| 9 | x-ai/grok-4-fast | 94.0% | $0.20/M | 4.7 |
| 10 | deepseek/deepseek-chat-v3.1 | 93.8% | $0.15/M | 6.3 |
| 11 | qwen/qwen3-coder-30b-a3b-instruct | 93.8% | $0.07/M | 13.4 |
| 12 | qwen/qwen3-30b-a3b-thinking-2507 | 93.5% | $0.051/M | 18.3 |
| 13 | openai/gpt-oss-20b | 92.5% | $0.016/M | 57.8 ⭐ |
| 14 | meta-llama/llama-3.3-70b-instruct | 92.0% | $0.10/M | 9.2 |
| 15 | openai/gpt-5-mini | 91.8% | $0.25/M | 3.7 |

---

## MAP-ELITE Archive Recommendations

### By Role (Best Model for Each Task)

| Role | Best Model | Score | Why |
|------|------------|-------|-----|
| **SENSE** (Port 0) | All top models | 100% | Too easy - needs harder tests |
| **FUSE** (Port 1) | grok-4.1-fast, gemma-3n | 100% | Pattern synthesis |
| **SHAPE** (Port 2) | Most models | 100% | Too easy |
| **DELIVER** (Port 3) | Most models | 100% | Too easy |
| **DISRUPT** (Port 4) | claude-3.5-haiku | 100% | Adversarial robustness |
| **IMMUNIZE** (Port 5) | gpt-oss-20b, qwen3-thinking | 100% | Verification |
| **STORE** (Port 6) | Most models | 100% | Too easy |
| **DECIDE** (Port 7) | claude-3.5-haiku, grok-4.1 | 100% | Decision quality |

### By Cost Tier

| Tier | Models | Avg Fitness | Use Case |
|------|--------|-------------|----------|
| **TIER1** ($0.01-0.05/M) | gpt-oss-20b, gemma-3n, gemma-3-27b | 91.2% | Bulk testing, 512+ runs |
| **TIER2** ($0.06-0.15/M) | gpt-4o-mini, llama-4-maverick | 93.5% | Production workloads |
| **TIER3** ($0.20-0.50/M) | grok-4.1-fast, gemini-2.5-flash | 94.8% | Quality-critical |

### Recommended 8 for Archives

```typescript
export const MAP_ELITE_BEST_8 = [
  'google/gemma-3n-e4b-it',           // $0.020/M - 95.8% ⭐ BEST CHEAP
  'openai/gpt-oss-20b',               // $0.016/M - 92.5% ⭐ BEST VALUE
  'google/gemma-3-27b-it',            // $0.036/M - 95.8%
  'qwen/qwen3-30b-a3b-thinking-2507', // $0.051/M - 93.5%
  'qwen/qwen3-coder-30b-a3b-instruct', // $0.070/M - 93.8%
  'openai/gpt-4o-mini',               // $0.150/M - 96.3% ⭐ TOP PERFORMER
  'x-ai/grok-4.1-fast',               // $0.200/M - 96.5% ⭐ BEST MID
  'google/gemini-2.5-flash',          // $0.300/M - 95.8%
];
```

---

## Handoff Test Results

### Pattern Definitions

| Code | Pattern | Description |
|------|---------|-------------|
| HFO:0 | 8^0 = 1 | Single agent baseline |
| HFO/8:00 | 1→1 | Sequential handoff (A generates, B verifies) |
| HFO/8:10 | 8→1 | Scatter-gather (8 parallel, 1 aggregator) |
| HFO/8:01 | 1→8 | Broadcast (1 source, 8 consumers) |
| HFO/8:1010 | 8→1→8→1 | Double diamond |

### GPQA (PhD-level Science) - HARD BENCHMARK

| Pattern | Model A | Model B | Score | Δ |
|---------|---------|---------|-------|---|
| HFO:0 | gemma-3n-e4b-it | - | 0/10 | - |
| HFO/8:00 | gemma-3n-e4b-it | gpt-oss-20b | 10/10 | **+10** |
| HFO:0 | gpt-oss-20b | - | 10/10 | - |
| HFO/8:00 | gpt-oss-20b | gemma-3n-e4b-it | 8/10 | -2 |

**Key Finding**: Weak model + strong verifier = massive improvement. Strong→weak degrades.

### SimpleQA (Factuality)

| Pattern | Avg Improvement | Never Degrades |
|---------|-----------------|----------------|
| HFO/8:00 | +3.33 | ✅ Yes |

**Key Finding**: Handoff always helps or stays same for factuality tasks.

### DISRUPT (Adversarial)

| Metric | Value |
|--------|-------|
| Improved | 25% |
| Same | 61% |
| Worse | 14% |
| Avg Δ | +1.78 |

**Best Pair**: gemma-3-4b-it → gpt-oss-20b (+3.33)
**Worst Pair**: gpt-oss-20b → gemma-3-4b-it (-4.00)

---

## Orchestration Patterns to Test Next

### Priority 1: Scatter-Gather (HFO/8:10)
```
8 cheap models in parallel → 1 aggregator
Expected: Diversity + consensus = better than single expensive
Cost: 8 × $0.02/M + 1 × $0.15/M = $0.31/M (vs $3/M for Claude)
```

### Priority 2: Broadcast (HFO/8:01)
```
1 generator → 8 verifiers in parallel
Expected: Multiple perspectives catch more errors
Use case: Code review, fact-checking
```

### Priority 3: Double Diamond (HFO/8:1010)
```
8 generators → 1 synthesizer → 8 critics → 1 final
Expected: Maximum quality for critical decisions
Cost: ~$0.80/M total
```

### Priority 4: Specialist Routing
```
Router → [SENSE specialist, DISRUPT specialist, DECIDE specialist]
Expected: Best model for each subtask
Use case: Complex multi-step problems
```

---

## SOTA Benchmarks Available

| Harness | Source | SOTA | Tests |
|---------|--------|------|-------|
| SIMPLEQA | OpenAI | ~40-50% | Factuality |
| GSM8K | HuggingFace | ~80-95% | Math reasoning |
| GPQA | HuggingFace | ~50-65% | PhD science |
| HUMANEVAL | GitHub | ~85-95% | Code completion |
| BBH | GitHub | ~60-80% | Logical reasoning |

These are HARD - models score 40-80%, not 100%. Use for differentiation.

---

## CLI Commands

```bash
# Run handoff test
npx tsx cli/index.ts handoff gpqa
npx tsx cli/index.ts handoff simpleqa

# Batch evaluate tier
npx tsx cli/index.ts tier1
npx tsx cli/index.ts tier2
npx tsx cli/index.ts best8

# Analyze results
npx tsx analyze-ledger.ts
```

---

## Cost Estimates (512 runs)

| Tier | Avg Price | Est. Cost |
|------|-----------|-----------|
| TIER1 | $0.03/M | ~$0.015 |
| TIER2 | $0.10/M | ~$0.050 |
| BEST_8 | $0.10/M | ~$0.050 |
| Expensive | $3.00/M | ~$1.500 |

**Recommendation**: Use TIER1/TIER2 for bulk testing, BEST_8 for archives.

---

## Files Reference

| File | Purpose |
|------|---------|
| `runner/model-client.ts` | Model tier definitions |
| `harnesses/sota-benchmarks.ts` | SOTA benchmark harnesses |
| `swarm/handoff-test.ts` | Handoff test implementation |
| `cli/index.ts` | CLI commands |
| `ledger/eval-ledger.ts` | Results storage |
| `audit/handoff-test.jsonl` | Handoff test logs |

---

## Next Session Checklist

1. [ ] Test HFO/8:10 scatter-gather pattern
2. [ ] Test HFO/8:01 broadcast pattern
3. [ ] Run SOTA benchmarks on BEST_8 models
4. [ ] Create specialist routing based on harness scores
5. [ ] Build MAP-ELITE archive with model→role mappings
