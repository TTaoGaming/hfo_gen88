# 🕷️ SPIDER SOVEREIGN (PORT 0x07: THE NAVIGATOR)

> Validates: AGENTS.md Port 7 Definition
> @provenance: AGENTS.md, ORCHESTRATION_PATTERNS.md

**"In the web of possibilities, I choose the path."**

## Identity

| Attribute | Value |
|-----------|-------|
| Port | 0x07 (7) |
| Commander | Spider Sovereign |
| Verb | DECIDE / NAVIGATE |
| Artifact | OBSIDIAN H-POMDP HOURGLASS (OHH) |
| HIVE Phase | H (Hunt) |
| C2 Role | Strategic Command & Control |

## Mission

The Spider Sovereign is the **strategic brain** of the HFO swarm. While the Red Regnant (Port 4) enforces code quality through testing and mutation analysis, the Spider Sovereign orchestrates **multi-model evaluation and consensus** through:

1. **HIVE/8 Patterns** - Scatter-gather orchestration for BFT consensus
2. **Eval Harnesses** - Benchmark suites for model capability assessment
3. **MAP-ELITE** - Quality-diversity optimization across model families
4. **Swarm Navigation** - Strategic routing of tasks to optimal model configurations

## Core Hypothesis

> **Multi-model BFT consensus with critique-weighted voting > single agent**
> at 8× cheap cost. The Spider weaves many threads into one truth.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    SPIDER SOVEREIGN (Port 7)                     │
│                     C2 / DECIDE / NAVIGATE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   HARNESSES  │  │    SWARM     │  │   PATTERNS   │           │
│  │  (Eval Suites)│  │ (HIVE/8:XX) │  │ (Orchestration)│          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘           │
│         │                 │                 │                    │
│         └────────────┬────┴────────────────┘                    │
│                      ▼                                           │
│              ┌──────────────┐                                    │
│              │   RUNNER     │                                    │
│              │ (Model Client)│                                   │
│              └──────┬───────┘                                    │
│                     │                                            │
│         ┌───────────┼───────────┐                               │
│         ▼           ▼           ▼                               │
│    ┌─────────┐ ┌─────────┐ ┌─────────┐                         │
│    │OpenRouter│ │ Ollama  │ │ Direct  │                         │
│    └─────────┘ └─────────┘ └─────────┘                         │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  LEDGER: eval-ledger.jsonl, obsidianblackboard.jsonl            │
│  AUDIT: calibration-analysis.md, hive-results.md                │
└─────────────────────────────────────────────────────────────────┘
```

## HIVE/8 Notation

| Pattern | Expansion | Calls | Purpose |
|---------|-----------|-------|---------|
| :01 | 1→8 scatter | 8 | Fan out to 8 models |
| :10 | 8→1 gather | 8 | Aggregate via consensus |
| :1010 | (8→1)→(8→1) | 16 | Double consensus |
| :0110 | 1→8→8→1 | 16 | Scatter-process-gather |

## Consensus Strategy: Critique-Weighted Voting

The Spider Sovereign uses a **hybrid consensus** approach:

1. **Scatter**: Fan out to 8 diverse model families
2. **Collect**: Gather responses with self-reported confidence
3. **Critique**: Aggregator model critiques all proposals
4. **Weight**: Combine critique judgment with confidence voting
5. **Decide**: Final answer = critique pick OR weighted majority (fallback)

```typescript
// Hybrid consensus: critique + weighted voting
const consensus = critiqueAnswer ?? weightedMajority(responses);
```

## Model Pool (Budget Tier)

```typescript
const HIVE_8_MODELS = [
  // Google family (2×)
  'google/gemma-3n-e4b-it',           // $0.02/M
  'google/gemma-2-9b-it',             // $0.06/M
  // Meta family (2×)
  'meta-llama/llama-3.2-3b-instruct', // $0.02/M
  'meta-llama/llama-3.1-8b-instruct', // $0.06/M
  // Qwen/Alibaba family (2×)
  'qwen/qwen-2.5-7b-instruct',        // $0.03/M
  'qwen/qwen-2.5-32b-instruct',       // $0.08/M
  // DeepSeek + Mistral family (2×)
  'deepseek/deepseek-chat',           // $0.07/M
  'mistralai/mistral-7b-instruct',    // $0.03/M
];
```

## Folder Structure

```
P7_SPIDER_SOVEREIGN/
├── P7_SPIDER_SOVEREIGN_LEDGER.md   # This file
├── SPIDER_SOVEREIGN.ts              # Main orchestrator
├── harnesses/                       # Eval benchmark suites
│   ├── harness.interface.ts
│   ├── hle-hard.ts                  # HLE hard benchmarks
│   └── sota-benchmarks.ts           # SOTA comparison
├── swarm/                           # HIVE/8 patterns
│   ├── hive-10.ts                   # Atomic scatter-gather
│   ├── hive-1010.ts                 # Double consensus
│   └── handoff-test.ts              # Serial handoff
├── runner/                          # Model clients
│   ├── model-client.ts
│   ├── openrouter-client.ts
│   └── ollama-client.ts
├── patterns/                        # Orchestration patterns
│   └── index.ts
├── schemas/                         # Zod contracts
│   ├── harness-result.ts
│   └── fitness-config.ts
├── fitness/                         # MAP-ELITE fitness
│   └── compute-fitness.ts
├── ledger/                          # Eval results
│   └── eval-ledger.ts
└── audit/                           # Analysis & reports
    ├── calibration-analysis.md
    └── hive-results.md
```

## Integration with Port 4 (Red Regnant)

| Port 4 (Red Regnant) | Port 7 (Spider Sovereign) |
|---------------------|---------------------------|
| Code quality enforcement | Model quality assessment |
| Mutation testing | Benchmark evaluation |
| SCREAM on violations | DECIDE on consensus |
| Blood Book of Grudges | Eval Ledger |
| TDD/BDD compliance | BFT consensus compliance |

## CLI Commands

```bash
# Run HIVE/8:10 on prompt index 4
npx tsx P7_SPIDER_SOVEREIGN/swarm/hive-10.ts 4

# Compare single vs HIVE consensus
npx tsx P7_SPIDER_SOVEREIGN/swarm/hive-10.ts --compare 0

# Run full harness evaluation
npx tsx P7_SPIDER_SOVEREIGN/cli/index.ts --harness hle-math
```

## Status

- **HIVE/8:10**: ✅ Implemented (critique-weighted consensus)
- **Harnesses**: ✅ HLE_MATH, HLE_PHYSICS, HLE_CS
- **Model Client**: ✅ OpenRouter integration
- **Ledger**: ✅ JSONL logging to stigmergy
- **MAP-ELITE**: 🟡 In progress

---

*"The Spider sees all threads. The Spider chooses the strongest."*
