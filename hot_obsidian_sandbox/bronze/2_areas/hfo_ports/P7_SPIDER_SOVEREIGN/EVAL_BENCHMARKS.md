# MAP-ELITE SOTA Benchmark Harnesses

## Overview

Standardized test harnesses adapted from established AI benchmarks. These are **hard** - models typically score 40-80%, not 100%.

## Benchmark Sources

| Harness | Source | SOTA Score | What it Tests |
|---------|--------|------------|---------------|
| SIMPLEQA | [OpenAI SimpleQA](https://openai.com/index/introducing-simpleqa/) | ~40-50% | Factual accuracy, hallucination detection |
| GSM8K | [HuggingFace GSM8K](https://huggingface.co/datasets/openai/gsm8k) | ~80-95% | Multi-step math reasoning |
| GPQA | [HuggingFace GPQA](https://huggingface.co/datasets/Idavidrein/gpqa) | ~50-65% | PhD-level science (physics, chemistry, biology) |
| HUMANEVAL | [GitHub HumanEval](https://github.com/openai/human-eval) | ~85-95% | Python code completion |
| BBH | [GitHub BIG-Bench Hard](https://github.com/suzgunmirac/BIG-Bench-Hard) | ~60-80% | Logical reasoning, causal judgment |

## Usage

```bash
# Run handoff test with SOTA benchmark
npx tsx cli/index.ts handoff gpqa
npx tsx cli/index.ts handoff simpleqa
npx tsx cli/index.ts handoff gsm8k
npx tsx cli/index.ts handoff bbh
npx tsx cli/index.ts handoff humaneval

# With specific models
npx tsx cli/index.ts handoff gpqa openai/gpt-oss-20b google/gemma-3n-e4b-it
```

## Handoff Test Results (2026-01-07)

### GPQA (PhD-level Science)
| Pattern | Model A | Model B | Score |
|---------|---------|---------|-------|
| HFO:0 | gemma-3n-e4b-it | - | 0/10 |
| HFO/8:00 | gemma-3n-e4b-it | gpt-oss-20b | 10/10 |
| HFO:0 | gpt-oss-20b | - | 10/10 |
| HFO/8:00 | gpt-oss-20b | gemma-3n-e4b-it | 8/10 |

**Key Finding**: Weak model + strong verifier = +10 point improvement

### SimpleQA (Factuality)
| Pattern | Model A | Model B | Avg Score |
|---------|---------|---------|-----------|
| HFO:0 | gpt-oss-20b | - | 0/10 |
| HFO/8:00 | gpt-oss-20b | gemma-3n-e4b-it | +3.33 |
| HFO:0 | gemma-3n-e4b-it | - | 3.3/10 |
| HFO/8:00 | gemma-3n-e4b-it | gpt-oss-20b | +3.33 |

**Key Finding**: Handoff never degrades, sometimes improves factuality

### DISRUPT (Adversarial)
| Pattern | Improvement Rate |
|---------|------------------|
| HFO:0 → HFO/8:00 | +25% improved, 14% worse |
| Best pair | gemma-3-4b-it → gpt-oss-20b (+3.33) |
| Worst pair | gpt-oss-20b → gemma-3-4b-it (-4.00) |

**Key Finding**: Direction matters - weak→strong helps, strong→weak hurts

## Orchestration Patterns

| Code | Pattern | Description |
|------|---------|-------------|
| HFO:0 | 8^0 = 1 | Single agent baseline |
| HFO/8:00 | 1→1 | Sequential handoff (A generates, B verifies) |
| HFO/8:10 | 8→1 | Scatter-gather (8 parallel, 1 aggregator) |
| HFO/8:01 | 1→8 | Broadcast (1 source, 8 consumers) |
| HFO/8:1010 | 8→1→8→1 | Double diamond |

## Cost Estimates (512 runs)

| Tier | Avg Price | Est. Cost |
|------|-----------|-----------|
| TIER1 | $0.03/M | ~$0.015 |
| TIER2 | $0.10/M | ~$0.050 |
| BEST_8 | $0.10/M | ~$0.050 |

## Files

- `harnesses/sota-benchmarks.ts` - SOTA benchmark harness definitions
- `swarm/handoff-test.ts` - HFO:0 vs HFO/8:00 comparison test
- `audit/handoff-test.jsonl` - Test results log
