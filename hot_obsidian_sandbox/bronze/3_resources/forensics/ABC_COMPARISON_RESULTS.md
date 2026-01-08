# A/B/C Comparison: Single vs Sequential vs Scatter-Gather

> Gen 88 | Port 4 (DISRUPT) | 2026-01-07

## Hypothesis

**Does multi-family scatter-gather beat single models or sequential chains?**

## Methods Tested

| Method | Description | Models |
|--------|-------------|--------|
| A) Single | Best single model | gemma3:4b |
| B) Sequential | 4 models in series, each refining | gemma3:1b → qwen3:0.6b → llama3.2:1b → phi3:mini |
| C) Scatter-Gather | 8 models parallel + consensus | 4 families × 2 |

## Results (8 questions, context-aware)

### Per-Question Breakdown

| Question | Expected | A) Single | B) Sequential | C) Scatter |
|----------|----------|-----------|---------------|------------|
| 2+2 | 4 | ✅ | ✅ | ✅ |
| Capital of France | Paris | ✅ | ✅ | ✅ |
| Is 17 prime? | yes | ❌ | ✅ | ❌ |
| OBSIDIAN Port 4 | 4 | ✅ | ✅ | ✅ |
| Port 7 verb | NAVIGATE | ✅ | ✅ | ✅ |
| HIVE failing tests | I | ✅ | ✅ | ✅ |
| Port 6 (memory) | 6 | ✅ | ✅ | ✅ |
| HIVE order | HIVE | ✅ | ✅ | ✅ |

### Summary

| Method | Accuracy | Avg Latency | Notes |
|--------|----------|-------------|-------|
| **A) Single** | 87.5% (7/8) | 5004ms | Fast, missed prime check |
| **B) Sequential** | **100% (8/8)** | 10381ms | Best accuracy, 2x slower |
| **C) Scatter-Gather** | 87.5% (7/8) | 7885ms | Same as single, 1.5x slower |

## Key Findings

### 1. Sequential Chain Wins on Accuracy
The sequential chain achieved **100% accuracy** by allowing each model to refine the previous answer. This "wisdom of the crowd" effect works because:
- Later models can correct earlier mistakes
- Different model families catch different errors
- The chain acts as a verification pipeline

### 2. Scatter-Gather Doesn't Beat Single Model
Surprisingly, scatter-gather (87.5%) matched single model (87.5%) but was slower. This is because:
- Consensus voting can amplify common errors
- Small models (smollm2:135m) add noise
- BFT quorum doesn't help when majority is wrong

### 3. The Prime Number Problem
Both A and C failed on "Is 17 prime?" - gemma3:4b said "No" and the swarm consensus was "no". Only the sequential chain caught this because:
- gemma3:1b said "yes" (correct)
- Later models confirmed it
- The chain preserved the correct answer

### 4. Latency Trade-offs

```
Single:     ████████████████████ 5004ms (baseline)
Scatter:    ██████████████████████████████ 7885ms (+58%)
Sequential: ████████████████████████████████████████ 10381ms (+107%)
```

## Recommendations

### For Accuracy-Critical Tasks
Use **Sequential Chain** (Method B):
- 100% accuracy on test set
- Each model acts as a reviewer
- Worth the 2x latency cost

### For Speed-Critical Tasks
Use **Single Model** (Method A):
- 87.5% accuracy
- Fastest option
- Good enough for most tasks

### For Fault Tolerance
Use **Scatter-Gather** (Method C) with modifications:
- Remove weakest models (smollm2:135m)
- Use weighted voting by model capability
- Add smart aggregator for tie-breaking

## Architecture Implications

### Sequential Chain Pattern
```
User Query → Model 1 → Model 2 → Model 3 → Model 4 → Final Answer
                ↓          ↓          ↓          ↓
             Answer 1   Refine 1   Refine 2   Refine 3
```

### Improved Scatter-Gather
```
                    ┌─────────────┐
                    │ Coordinator │ (gemma3:4b)
                    └──────┬──────┘
                           │ prepare
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
      ┌─────────┐    ┌─────────┐    ┌─────────┐
      │ Strong  │    │ Strong  │    │ Strong  │  (remove weak models)
      │ Models  │    │ Models  │    │ Models  │
      └────┬────┘    └────┬────┘    └────┬────┘
           │              │              │
           └──────────────┼──────────────┘
                          ▼
                    ┌─────────────┐
                    │ Aggregator  │ (weighted vote)
                    └─────────────┘
```

## Files

| File | Purpose |
|------|---------|
| `abc_comparison.py` | A/B/C test runner |
| `results/abc_comparison_log.jsonl` | Raw results |

## Conclusion

**Sequential chain beats scatter-gather for accuracy.** The hypothesis that multi-family parallel execution would outperform single models was **not supported** by this experiment. However, sequential refinement across families **does** improve accuracy.

Next steps:
1. Test with harder questions (MMLU, HellaSwag)
2. Try hybrid: scatter-gather → sequential refinement
3. Implement weighted voting based on model capability
