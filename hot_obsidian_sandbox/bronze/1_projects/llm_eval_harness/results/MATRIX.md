# Model-Harness Evaluation Matrix

> Auto-generated: 2026-01-07T00:02:00.812164
> Gen 88 | Port 4 (DISRUPT)

| Model | simple_eval | promptfoo | deepeval | llm_benchmark |
|-------|-------------|-----------|----------|---------------|
| gemma3:1b | 100.0% | 75.0% | 66.7% | 65 t/s |
| gemma3:4b | 60.0% | 83.3% | - | - |
| qwen3:0.6b | - | 100.0% | - | - |
| qwen3:4b | 100.0% | - | - | - |
| llama3.2:1b | - | - | - | - |
| phi3:mini | - | 100.0% | - | - |
| smollm2:135m | - | - | - | - |

## Legend
- `-` = Not yet tested
- `X%` = Accuracy percentage
- `X t/s` = Tokens per second (speed)

## Detailed Results

### gemma3:1b

**simple_eval:**
  - accuracy: 100.00
  - latency_ms: 3098.74
  - task: basic

**promptfoo:**
  - accuracy: 75.00
  - pass: 9
  - total: 12

**deepeval:**
  - accuracy: 66.67
  - passed: 4
  - total: 6

**llm_benchmark:**
  - tokens_per_sec: 65.20
  - avg_latency_ms: 4527.27

### gemma3:4b

**simple_eval:**
  - accuracy: 60.00
  - latency_ms: 3827.19
  - task: basic

**promptfoo:**
  - accuracy: 83.33
  - pass: 5
  - total: 6

### qwen3:0.6b

**promptfoo:**
  - accuracy: 100.00
  - pass: 6
  - total: 6

### qwen3:4b

**simple_eval:**
  - accuracy: 100.00
  - latency_ms: 6506.97
  - task: basic

### phi3:mini

**promptfoo:**
  - accuracy: 100.00
  - pass: 6
  - total: 6
