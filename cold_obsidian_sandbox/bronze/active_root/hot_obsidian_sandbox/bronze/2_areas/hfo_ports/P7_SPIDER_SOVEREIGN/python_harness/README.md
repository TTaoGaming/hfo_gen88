# LLM Evaluation Harness (Gen 88)

HFO-specific evaluation framework for testing local (Ollama) and cloud (OpenRouter) models.
Includes swarm orchestration with powers of 8 (1, 8, 64 agents).

## Quick Start

```bash
# Test connectivity first
python quick_test.py

# Run single-model evaluations
python simple_eval.py --provider ollama --model gemma3:4b --task basic
python simple_eval.py --provider ollama --model qwen3:4b --task hfo_stigmergy

# Run swarm evaluations (powers of 8)
python swarm_eval.py --size 1 --models qwen3:0.6b --task hive_consensus
python swarm_eval.py --size 8 --models qwen3:0.6b gemma3:1b llama3.2:1b smollm2:135m --task stigmergy_consensus
python swarm_eval.py --size 64 --models qwen3:0.6b gemma3:1b --task coordination

# List available tasks
python simple_eval.py --list-tasks
python swarm_eval.py --list-tasks
```

## Installed Models (5 Families)

| Family | Model | Size | Notes |
|--------|-------|------|-------|
| **Google Gemma** | gemma3:1b | 815 MB | Fast, efficient |
| **Google Gemma** | gemma3:4b | 3.3 GB | Best quality |
| **Alibaba Qwen** | qwen3:0.6b | 522 MB | Tiny, swarm-friendly |
| **Alibaba Qwen** | qwen3:4b | 2.5 GB | Good balance |
| **Meta Llama** | llama3.2:1b | 1.3 GB | Solid performer |
| **Microsoft Phi** | phi3:mini | 2.2 GB | Reasoning focused |
| **HuggingFace SmolLM** | smollm2:135m | 270 MB | Ultra-tiny |

## Evaluation Tasks

### Single Model (`simple_eval.py`)
| Task | Samples | Description |
|------|---------|-------------|
| `basic` | 5 | Simple instruction following |
| `hfo_stigmergy` | 4 | OBSIDIAN event format adherence |
| `hfo_hive` | 5 | HIVE workflow phase compliance |

### Swarm (`swarm_eval.py`)
| Task | Samples | Description |
|------|---------|-------------|
| `hive_consensus` | 3 | HIVE phase consensus across agents |
| `stigmergy_consensus` | 3 | OBSIDIAN port/verb consensus |
| `coordination` | 2 | Basic coordination tasks |

## Swarm Architecture

Powers of 8 scaling:
- **1 agent**: Baseline single-model performance
- **8 agents**: Small swarm, diverse model mix
- **64 agents**: Large swarm, consensus testing

Features:
- Async parallel execution (httpx + asyncio)
- Round-robin model assignment
- Consensus calculation with agreement rate
- HIVE phase tracking per task

## Initial Benchmark Results (2026-01-07)

| Model | Task | Accuracy | Avg Latency |
|-------|------|----------|-------------|
| gemma3:4b | hfo_stigmergy | 100% | 2877ms |
| gemma3:4b | hfo_hive | 100% | 2807ms |
| qwen3:4b | hfo_stigmergy | 100% | 9530ms |
| qwen3:4b | basic | 100% | 6507ms |

**Observation**: gemma3:4b is ~3x faster than qwen3:4b on RTX 3070.

## Providers

| Provider | Config | Example Models |
|----------|--------|----------------|
| Ollama | `OLLAMA_BASE_URL` | All local models above |
| OpenRouter | `OPENROUTER_API_KEY` | anthropic/claude-3-haiku, meta-llama/llama-3.1-8b-instruct |

## Results

- Single eval: `results/eval_log.jsonl`
- Swarm eval: `results/swarm_log.jsonl`

Both use OBSIDIAN stigmergy format (Port 4: DISRUPT).
