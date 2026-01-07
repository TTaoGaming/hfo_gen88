# LLM Evaluation Harness Catalog

> Gen 88 | Port 4 (DISRUPT) | 2026-01-07

## Installed Harnesses (4)

| # | Harness | Level | Ollama Support | Best For |
|---|---------|-------|----------------|----------|
| 1 | **lm-eval** (EleutherAI) | SOTA | Via API adapter | Academic benchmarks (MMLU, HellaSwag) |
| 2 | **deepeval** | Production | Native Ollama | LLM-as-judge, unit testing |
| 3 | **promptfoo** | DevOps | Native Ollama | A/B testing, prompt engineering |
| 4 | **llm-benchmark** | Simple | Native Ollama | Speed/throughput testing |

---

## 1. lm-eval (EleutherAI) - SOTA

**Version:** 0.4.9.2
**GitHub:** https://github.com/EleutherAI/lm-evaluation-harness

The gold standard for academic LLM evaluation. Used by Hugging Face leaderboards.

### Benchmarks Available
- MMLU (57 subjects)
- HellaSwag (commonsense)
- ARC (science reasoning)
- TruthfulQA
- GSM8K (math)
- HumanEval (code)

### Usage with Ollama
```bash
# Requires OpenAI-compatible API wrapper
# Use ollama serve + openai adapter
lm_eval --model local-completions \
  --model_args model=gemma3:4b,base_url=http://localhost:11434/v1 \
  --tasks mmlu \
  --num_fewshot 5
```

### Pros/Cons
✅ Industry standard, reproducible results
✅ Huge task library (300+ tasks)
❌ Complex setup for Ollama
❌ Slow (downloads datasets)

---

## 2. deepeval - Production

**Version:** 3.7.9
**Docs:** https://www.deepeval.com

LLM-as-judge framework for production testing. Native Ollama support.

### Metrics Available
- Faithfulness
- Answer Relevancy
- Contextual Precision/Recall
- Hallucination detection
- Bias detection
- Toxicity

### Usage with Ollama
```python
from deepeval import evaluate
from deepeval.metrics import AnswerRelevancyMetric
from deepeval.test_case import LLMTestCase

# Configure Ollama as judge
import os
os.environ["OLLAMA_BASE_URL"] = "http://localhost:11434"

metric = AnswerRelevancyMetric(
    model="ollama/gemma3:4b",
    threshold=0.7
)

test_case = LLMTestCase(
    input="What is HIVE?",
    actual_output="HIVE is a workflow: Hunt, Interlock, Validate, Evolve",
    expected_output="HIVE workflow phases"
)

evaluate([test_case], [metric])
```

### Pros/Cons
✅ Native Ollama support
✅ LLM-as-judge (no ground truth needed)
✅ Production-ready metrics
❌ Requires judge model (slow)
❌ Less standardized than lm-eval

---

## 3. promptfoo - DevOps

**Version:** 0.120.10
**Docs:** https://www.promptfoo.dev

CLI tool for prompt engineering and A/B testing. Excellent Ollama integration.

### Features
- Side-by-side model comparison
- Prompt versioning
- Red teaming
- Custom assertions
- Web UI

### Usage with Ollama
```yaml
# promptfooconfig.yaml
providers:
  - ollama:chat:gemma3:4b
  - ollama:chat:qwen3:4b
  - ollama:chat:llama3.2:1b

prompts:
  - "Answer concisely: {{question}}"

tests:
  - vars:
      question: "What is 2+2?"
    assert:
      - type: contains
        value: "4"
  - vars:
      question: "Which OBSIDIAN port handles testing?"
    assert:
      - type: contains
        value: "4"
```

```bash
promptfoo eval
promptfoo view  # Opens web UI
```

### Pros/Cons
✅ Best Ollama integration
✅ YAML config (easy)
✅ Web UI for results
✅ Great for A/B testing
❌ Not academic benchmarks
❌ Custom assertions only

---

## 4. llm-benchmark - Simple

**Version:** (latest)
**PyPI:** https://pypi.org/project/llm-benchmark/

Simple CLI for speed/throughput testing.

### Usage
```bash
# Test tokens per second
python -m llm_benchmark --provider ollama --model gemma3:4b

# Compare models
python -m llm_benchmark --provider ollama --model gemma3:1b qwen3:0.6b
```

### Pros/Cons
✅ Dead simple
✅ Speed-focused
❌ No accuracy testing
❌ Limited features

---

## Recommendation Matrix

| Use Case | Recommended Harness |
|----------|---------------------|
| Academic benchmarks (MMLU, etc.) | lm-eval |
| Production quality testing | deepeval |
| Prompt A/B testing | promptfoo |
| Speed benchmarking | llm-benchmark |
| **Swarm orchestration testing** | **Custom (abc_comparison.py)** |

---

## Custom HFO Harness

For your specific swarm orchestration hypothesis testing, the custom harness we built is best:

| File | Purpose |
|------|---------|
| `simple_eval.py` | Single model baseline |
| `swarm_eval.py` | Parallel swarm (no coordinator) |
| `scatter_gather.py` | 1-8-1 BFT pattern |
| `abc_comparison.py` | A/B/C method comparison |

These are tailored for:
- Multi-family model comparison
- BFT consensus testing
- Sequential vs parallel patterns
- HFO-specific domain knowledge

---

## Quick Start Commands

```bash
# 1. lm-eval (academic)
python -m lm_eval --tasks list

# 2. deepeval (production)
python -c "from deepeval.benchmarks import MMLU; print(MMLU)"

# 3. promptfoo (devops)
promptfoo init
promptfoo eval

# 4. llm-benchmark (speed)
python -m llm_benchmark --help

# 5. Custom HFO (swarm)
cd hot_obsidian_sandbox/bronze/1_projects/llm_eval_harness
python abc_comparison.py
```
