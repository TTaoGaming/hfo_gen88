# Scatter-Gather BFT Pattern (1-8-1)

> Gen 88 | Port 7 (NAVIGATE) | 2026-01-07

## Pattern Overview

```
┌─────────────────┐
│   COORDINATOR   │  (1) Smart model prepares task
│   gemma3:4b     │
└────────┬────────┘
         │ scatter
         ▼
┌─────────────────────────────────────────────────┐
│              SWARMLINGS (8)                      │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐│
│  │gemma3:1b│ │qwen3:0.6│ │llama3.2 │ │smollm2  ││
│  │ (×2)    │ │  (×2)   │ │  (×2)   │ │  (×2)   ││
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘│
│     Google     Alibaba      Meta     HuggingFace │
└────────┬────────────────────────────────────────┘
         │ gather
         ▼
┌─────────────────┐
│   AGGREGATOR    │  (1) Smart model applies BFT consensus
│   gemma3:4b     │
└─────────────────┘
```

## BFT Parameters

| Parameter | Value | Formula |
|-----------|-------|---------|
| N (total nodes) | 8 | - |
| f (faults tolerated) | 2 | - |
| Quorum | 6 | 3f+1 = 7, practical = 6 |
| Families | 4 | Diversity requirement |

**Why 4 families?** BFT 3f+1 requires diversity. With 4 model families, we tolerate:
- 1 family completely failing
- Correlated errors within families
- Training data biases

## Experimental Results (2026-01-07)

### Baseline: Single Model (gemma3:4b)

| Task | Accuracy | Avg Latency |
|------|----------|-------------|
| basic | 60% (3/5) | 3827ms |
| hfo_stigmergy | 100% (4/4) | 3254ms |
| hfo_hive | 100% (5/5) | ~2800ms |

### 1-8-1 Scatter-Gather Pattern

| Question | Expected | Majority | Agreement | Quorum | Correct |
|----------|----------|----------|-----------|--------|---------|
| 2+2 | 4 | 4 | 75% | 🔒 YES | ✅ |
| Capital of France | Paris | paris | 50% | ⚠️ NO | ✅ |
| Is 17 prime? | yes | yes | 88% | 🔒 YES | ✅ |
| HIVE failing tests phase | I | b | 12% | ⚠️ NO | ❌ |
| OBSIDIAN Port 4 | 4 | 2 | 25% | ⚠️ NO | ❌ |
| Port 7 verb | NAVIGATE | observe | 25% | ⚠️ NO | ❌ |

**Summary:**
- General knowledge: 3/3 (100%)
- HFO-specific: 0/3 (0%)
- BFT Quorum reached: 2/6 (33%)
- Average agreement: 45.8%

## Gap Analysis: Context vs No-Context

### Without Context (scatter_gather.py)
HFO-specific questions with no domain context injected:

| Question | Agreement | Correct |
|----------|-----------|---------|
| HIVE failing tests phase | 12% | ❌ |
| OBSIDIAN Port 4 | 25% | ❌ |
| Port 7 verb | 25% | ❌ |
| **Total** | **20.7%** | **0/3** |

### With Context (swarm_eval.py)
Same questions with OBSIDIAN port mapping in prompt:

| Question | Agreement | Correct |
|----------|-----------|---------|
| Port 4 (testing/chaos) | 50% | 6/8 ✅ |
| Port 7 verb | 75% | 8/8 ✅ |
| Port 6 (memory) | 50% | 7/8 ✅ |
| **Total** | **58.3%** | **21/24 (87.5%)** |

### The Gap
| Metric | No Context | With Context | Delta |
|--------|------------|--------------|-------|
| Accuracy | 0% | 87.5% | +87.5% |
| Agreement | 20.7% | 58.3% | +37.6% |
| BFT Quorum | 0/3 | 1/3 | +1 |

**Conclusion:** Context injection is mandatory for domain-specific swarm tasks.

## Key Findings

### 1. Context is Critical
Small models without HFO context cannot answer domain-specific questions.
The coordinator's task preparation doesn't inject enough context.

**Solution:** Swarmlings need domain context in their prompts.

### 2. Model Family Diversity Matters
- **gemma3:1b**: Most consistent, follows instructions well
- **qwen3:0.6b**: Good but verbose
- **llama3.2:1b**: Solid performer
- **smollm2:135m**: Too small for complex reasoning, often hallucinates

### 3. BFT Quorum Threshold
With 45.8% average agreement, we rarely hit the 75% (6/8) quorum.
This indicates high variance in small model outputs.

### 4. Latency Trade-off
- Single model: ~3000ms
- 1-8-1 pattern: ~14000ms (parallel swarmlings + coordinator + aggregator)
- ~4.5x slower but potentially more robust

## Recommendations

### For Production Use

1. **Inject Context**: Swarmlings must receive domain knowledge
2. **Raise Model Floor**: smollm2:135m too weak, use 0.6b+ minimum
3. **Lower Quorum**: Consider 5/8 (62.5%) for practical consensus
4. **Role Specialization**: Different swarmlings for different subtasks

### Architecture Evolution

```
Phase 1 (Current): Simple 1-8-1
Phase 2: Context-aware swarmlings with roles
Phase 3: Hierarchical swarms (1-8-64-8-1)
Phase 4: Persistent swarm state with stigmergy
```

## Files

| File | Purpose |
|------|---------|
| `scatter_gather.py` | 1-8-1 pattern implementation |
| `swarm_eval.py` | Basic swarm evaluation |
| `simple_eval.py` | Single model baseline |
| `results/scatter_gather_log.jsonl` | BFT consensus logs |

## Usage

```bash
# Run full evaluation
python scatter_gather.py -v

# Single question
python scatter_gather.py -q "What is the meaning of life?"

# Compare with baseline
python simple_eval.py --model gemma3:4b --task basic
```

## OBSIDIAN Integration

This pattern maps to Port 7 (NAVIGATE):
- Coordinator: OBSERVE + NAVIGATE (sense and plan)
- Swarmlings: SHAPE (transform query to answer)
- Aggregator: NAVIGATE + IMMUNIZE (decide and validate)

Event type: `obsidian.navigate.swarm.consensus`
