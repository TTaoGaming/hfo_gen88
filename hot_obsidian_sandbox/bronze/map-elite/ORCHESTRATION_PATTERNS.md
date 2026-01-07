# Orchestration Patterns - MAP-ELITE Phase 2

**Created**: 2026-01-07T12:45:00Z
**Purpose**: Catalog of orchestration patterns to test against HLE hard benchmarks

---

## Pattern Taxonomy

| ID | Pattern | Concurrency | Models | Expected Effect |
|----|---------|-------------|--------|-----------------|
| P0 | Single Agent | None | 1 | Baseline (0-10% on HLE) |
| P1 | Serial Handoff | Sequential | 2-4 | Direction-sensitive (+/-10) |
| P2 | Debate | Sequential | 2 | Convergence on truth |
| P3 | Scatter-Gather | Parallel | 8 | BFT consensus |
| P4 | Double Diamond | Parallel+Serial | 8 | Diverge→Converge×2 |
| P5 | Quad Diamond | Parallel+Serial | 16 | Strange loop emergence |

---

## P0: Single Agent (Baseline)

```
┌─────────┐
│ Model A │ ──→ Answer
└─────────┘
```

**Config**: 1 model, 1 call
**Cost**: $0.01-0.05 per prompt
**Expected**: 0-10% on HLE (cheap models fail)

---

## P1: Serial Handoff

```
┌─────────┐    ┌─────────┐    ┌─────────┐
│ Model A │ ──→│ Model B │ ──→│ Model C │ ──→ Answer
└─────────┘    └─────────┘    └─────────┘
   Draft         Refine         Verify
```

**Config**: 2-4 models, sequential
**Cost**: $0.03-0.15 per prompt
**Expected**: Direction-sensitive (-10 to +10 depending on order)
**Status**: ✅ Implemented in `handoff-test.ts`

### Variants:
- **P1a**: Weak → Strong (cheap drafter, expensive verifier)
- **P1b**: Strong → Weak (expensive drafter, cheap verifier)
- **P1c**: Specialist chain (math→physics→chemistry)

---

## P2: Debate Pattern

```
┌─────────┐         ┌─────────┐
│ Model A │ ◄─────► │ Model B │
└─────────┘         └─────────┘
   Propose           Critique
      │                 │
      └────────┬────────┘
               ▼
           Consensus
```

**Config**: 2 models, N rounds until convergence
**Cost**: $0.05-0.20 per prompt (depends on rounds)
**Expected**: Higher accuracy through adversarial refinement

### Protocol:
1. Model A proposes answer with reasoning
2. Model B critiques, identifies flaws
3. Model A revises based on critique
4. Repeat until agreement or max rounds
5. Final answer = consensus or majority

---

## P3: Scatter-Gather (BFT Consensus)

```
         ┌─────────┐
         │ Model A │───┐
         └─────────┘   │
         ┌─────────┐   │
         │ Model B │───┤
         └─────────┘   │    ┌───────────┐
         ┌─────────┐   ├───►│ Aggregator│──→ Answer
         │ Model C │───┤    └───────────┘
         └─────────┘   │
         ┌─────────┐   │
         │ Model D │───┘
         └─────────┘
```

**Config**: 8 models in parallel, majority vote
**Cost**: $0.08-0.40 per prompt (8× single)
**Expected**: BFT tolerance (survives 2/8 Byzantine failures)

### Aggregation Strategies:
- **Majority Vote**: Most common answer wins
- **Weighted Vote**: Weight by model confidence/cost
- **Unanimous**: All must agree (high precision, low recall)
- **Quorum**: 5/8 agreement required

---

## P4: Double Diamond (Diverge-Converge×2)

```
Phase 1: DIVERGE              Phase 2: CONVERGE
┌─────────┐                   
│ Model A │───┐               
└─────────┘   │   ┌───────┐   ┌─────────┐
┌─────────┐   ├──►│ Merge │──►│ Model E │───┐
│ Model B │───┤   └───────┘   └─────────┘   │
└─────────┘   │                             │
┌─────────┐   │                             │   ┌───────┐
│ Model C │───┤               ┌─────────┐   ├──►│ Final │──→ Answer
└─────────┘   │               │ Model F │───┤   └───────┘
┌─────────┐   │   ┌───────┐   └─────────┘   │
│ Model D │───┴──►│ Merge │──►┌─────────┐   │
└─────────┘       └───────┘   │ Model G │───┤
                              └─────────┘   │
                              ┌─────────┐   │
                              │ Model H │───┘
                              └─────────┘
```

**Config**: 8 models, 2 phases (4 parallel → merge → 4 parallel → final)
**Cost**: $0.16-0.80 per prompt
**Expected**: Explore diverse solutions, then refine best candidates

### Diamond Phases:
1. **Diverge 1**: 4 models generate independent solutions
2. **Converge 1**: Merge/select top 2 approaches
3. **Diverge 2**: 4 models refine each approach
4. **Converge 2**: Final selection/synthesis

---

## P5: Quad Diamond Strange Loop

```
Diamond 1          Diamond 2          Diamond 3          Diamond 4
┌───┐              ┌───┐              ┌───┐              ┌───┐
│ A │─┐            │ E │─┐            │ I │─┐            │ M │─┐
└───┘ │  ┌───┐     └───┘ │  ┌───┐     └───┘ │  ┌───┐     └───┘ │  ┌───┐
│ B │─┼─►│ M1│────►│ F │─┼─►│ M2│────►│ J │─┼─►│ M3│────►│ N │─┼─►│ M4│──→ Answer
└───┘ │  └───┘     └───┘ │  └───┘     └───┘ │  └───┘     └───┘ │  └───┘
│ C │─┤            │ G │─┤            │ K │─┤            │ O │─┤
└───┘ │            └───┘ │            └───┘ │            └───┘ │
│ D │─┘            │ H │─┘            │ L │─┘            │ P │─┘
└───┘              └───┘              └───┘              └───┘
   │                                                        │
   └────────────────── STRANGE LOOP ────────────────────────┘
                    (feedback if wrong)
```

**Config**: 16 models, 4 diamonds, optional feedback loop
**Cost**: $0.32-1.60 per prompt
**Expected**: Emergent intelligence through iterative refinement

### Strange Loop Mechanics:
1. Run 4 sequential diamonds
2. If final answer fails verification → feed back to Diamond 1
3. Each iteration refines based on previous failure
4. Max 3 loops before giving up

### Model Allocation (16 cheap models):
- **Diamond 1**: Tier 1 ultra-cheap (exploration)
- **Diamond 2**: Tier 2 budget (refinement)
- **Diamond 3**: Tier 2 budget (validation)
- **Diamond 4**: Tier 3 value (final synthesis)

---

## Implementation Priority

| Priority | Pattern | Complexity | Value |
|----------|---------|------------|-------|
| 1 | P0 Single | Trivial | Baseline |
| 2 | P1 Serial | Low | Already done |
| 3 | P2 Debate | Medium | High signal |
| 4 | P3 Scatter | Medium | BFT proof |
| 5 | P4 Double Diamond | High | Novel |
| 6 | P5 Quad Strange | Very High | Emergence? |

---

## Test Matrix

Each pattern tested against:
- **HLE_MATH** (5 questions) - Graduate math
- **HLE_PHYSICS** (5 questions) - PhD physics
- **HLE_CS** (5 questions) - Theoretical CS

### Success Metrics:
- **Accuracy**: % correct answers
- **Cost**: $ per correct answer
- **Latency**: Seconds per prompt
- **Efficiency**: Accuracy / Cost ratio

---

## Model Pool (Cheap Tier)

```typescript
const TIER1_ULTRA_CHEAP = [
  'google/gemma-3n-e4b-it',      // $0.02/M
  'meta-llama/llama-3.2-3b',     // $0.02/M
  'qwen/qwen-2.5-7b-instruct',   // $0.03/M
  'mistralai/mistral-7b',        // $0.03/M
];

const TIER2_BUDGET = [
  'google/gemma-2-9b-it',        // $0.06/M
  'meta-llama/llama-3.1-8b',     // $0.06/M
  'deepseek/deepseek-chat-v3',   // $0.07/M
  'qwen/qwen-2.5-32b-instruct',  // $0.08/M
];

const TIER3_VALUE = [
  'anthropic/claude-3-haiku',    // $0.25/M
  'openai/gpt-4o-mini',          // $0.15/M
  'google/gemini-2.0-flash',     // $0.10/M
  'x-ai/grok-2-mini',            // $0.20/M
];
```

---

---

## HIVE/8 Architecture Goal

### Fractal Compression Principle

The system is designed to scale fractally. Two atomic units:
- **:01** = Scatter (1→8) - fan out to 8 parallel workers
- **:10** = Gather (8→1) - aggregate 8 responses into 1

Same orchestration code works at any scale - just stack the layers.

### Core Hypothesis

> **Multi-model family with BFT consensus is more robust than single agent,
> at the cost of 8× compute per layer. But 8× ultra-cheap is still ultra-cheap.**

#### Cost Reality Check

| Config | Cost/M tokens | 8× Cost | vs GPT-4o-mini |
|--------|---------------|---------|----------------|
| Single ultra-cheap | $0.02 | $0.16 | 10× cheaper |
| Single budget | $0.06 | $0.48 | 3× cheaper |
| Single value | $0.15 | $1.20 | ~same |
| GPT-4o-mini | $1.50 | $12.00 | baseline |

**Key insight**: 8 ultra-cheap models ($0.16/M) costs less than 1 GPT-4o-mini ($1.50/M).
If BFT consensus improves accuracy, it's strictly better.

#### BFT Tolerance

With 8 diverse model families:
- Tolerates 2 Byzantine failures (2/8 = 25%)
- Different training data = uncorrelated errors
- Majority vote filters hallucinations

**Test hypothesis**: Does HIVE/8:10 on HLE beat single GPT-4o-mini at lower cost?

```
HIVE/8:10    =  8 scatter → 1 gather  (8 calls)
HIVE/8:1010  = (8→1) → (8→1)          (16 calls, same pattern twice)
HIVE/8:8787  = 8^8→8^7→8^8→8^7        (16M+ calls, same pattern at scale)
```

### Notation: HIVE/8:XXXX

Each digit represents a phase:
- **8** = Scatter to 8 parallel workers
- **7** = Gather from 8→1 (reduce)
- **1** = Single agent pass
- **0** = No-op / passthrough

| Pattern | Expansion | Total Calls | Cost @ $0.02/M |
|---------|-----------|-------------|----------------|
| :01 | 1→8 scatter | 8 | $0.16 |
| :10 | 8→1 gather | 8 | $0.16 |
| :0110 | 1→8→8→1 | 16 | $0.32 |
| :1010 | 8→1→8→1 | 16 | $0.32 |
| :010110 | 1→8→8→1→8→1 | 24 | $0.48 |
| :8787 | 8^8→8^7→8^8→8^7 | 16M+ | $134K+ |

### Key Insight: Scale-Invariant Core

```typescript
// The SAME function works at any scale
async function hiveGather(inputs: Response[]): Promise<Response> {
  // Always 8→1, whether inputs came from 8 models or 8^7 models
  return aggregate(inputs);
}

// Fractal recursion
async function hiveLayer(depth: number, input: Prompt): Promise<Response> {
  if (depth === 0) return singleAgent(input);
  
  // Scatter to 8
  const scattered = await Promise.all(
    Array(8).fill(null).map(() => hiveLayer(depth - 1, input))
  );
  
  // Gather 8→1
  return hiveGather(scattered);
}
```

### Current Testable Patterns

| Pattern | Calls | Feasible | Purpose |
|---------|-------|----------|---------|
| HIVE/8:10 | 8 | ✅ Now | Prove 8→1 works |
| HIVE/8:1010 | 16 | ✅ Now | Prove stacking works |
| HIVE/8:101010 | 24 | ✅ Now | Triple stack |
| HIVE/8:20 | 64 | ✅ Now | 8^2 scatter |
| HIVE/8:2010 | 72 | ✅ Now | 64→8→1 |
| HIVE/8:30 | 512 | ⚠️ Rate limits | 8^3 scatter |

### Future Scale (Architecture Ready, Infra Not)

The code pattern is identical - only infra changes needed:
- **Rate limit handling**: Backpressure, queuing
- **Cost controls**: Budget caps, circuit breakers
- **Distributed execution**: Multi-region, multi-provider
- **Result caching**: Memoization for repeated subproblems

---

## Next Steps

1. [ ] Implement P2 Debate in `swarm/debate-test.ts`
2. [ ] Implement P3 Scatter-Gather in `swarm/scatter-gather.ts`
3. [ ] Implement HIVE/8:10 (atomic 8→1 gather)
4. [ ] Implement HIVE/8:1010 (prove fractal stacking)
5. [ ] Run baseline P0 on all HLE domains
6. [ ] Compare P0 vs P1 vs HIVE/8:10 on HLE_MATH
7. [ ] Document cost/accuracy tradeoffs
