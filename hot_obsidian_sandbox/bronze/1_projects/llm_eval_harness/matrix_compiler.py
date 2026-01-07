#!/usr/bin/env python3
"""
Model-Harness Matrix Compiler

Reads results from all harnesses and compiles into a unified matrix.
Auto-generates markdown table for documentation.

Gen 88 - Port 4 (DISRUPT)
"""
import json
from pathlib import Path
from datetime import datetime
from collections import defaultdict

RESULTS_DIR = Path(__file__).parent / "results"

# Models we're tracking
MODELS = [
    "gemma3:1b",
    "gemma3:4b", 
    "qwen3:0.6b",
    "qwen3:4b",
    "llama3.2:1b",
    "phi3:mini",
    "smollm2:135m",
]

# Harnesses we're tracking
HARNESSES = [
    "simple_eval",      # Our custom basic eval
    "promptfoo",        # DevOps A/B testing
    "deepeval",         # LLM-as-judge
    "llm_benchmark",    # Speed testing
]

def load_simple_eval_results() -> dict:
    """Load results from simple_eval.py (eval_log.jsonl)."""
    results = {}
    log_file = RESULTS_DIR / "eval_log.jsonl"
    
    if not log_file.exists():
        return results
    
    with open(log_file) as f:
        for line in f:
            if not line.strip():
                continue
            entry = json.loads(line)
            if entry.get("type") == "EVAL_RESULT":
                model = entry.get("model", "")
                task = entry.get("task", "")
                accuracy = entry.get("accuracy", 0)
                key = f"{model}:{task}"
                results[key] = {
                    "accuracy": accuracy,
                    "latency_ms": entry.get("avg_latency_ms", 0),
                    "task": task,
                }
    
    return results

def load_promptfoo_results() -> dict:
    """Load results from promptfoo (promptfoo_results.json)."""
    results = {}
    json_file = RESULTS_DIR / "promptfoo_results.json"
    
    if not json_file.exists():
        return results
    
    with open(json_file) as f:
        data = json.load(f)
    
    # Parse promptfoo format - results are nested under results.results
    results_data = data.get("results", {})
    if isinstance(results_data, dict):
        result_list = results_data.get("results", [])
    else:
        result_list = results_data
    
    for result in result_list:
        if not isinstance(result, dict):
            continue
            
        provider = result.get("provider", {})
        if isinstance(provider, dict):
            model_id = provider.get("id", "")
        else:
            model_id = str(provider)
        
        # Extract model name from ollama:chat:model format
        if "ollama:" in model_id:
            model = model_id.split(":")[-1]
        else:
            model = model_id
        
        # Count pass/fail
        if model not in results:
            results[model] = {"pass": 0, "fail": 0, "total": 0}
        
        success = result.get("success", False)
        results[model]["total"] += 1
        if success:
            results[model]["pass"] += 1
        else:
            results[model]["fail"] += 1
    
    # Convert to accuracy
    for model in results:
        total = results[model]["total"]
        if total > 0:
            results[model]["accuracy"] = results[model]["pass"] / total * 100
        else:
            results[model]["accuracy"] = 0
    
    return results

def load_deepeval_results() -> dict:
    """Load results from deepeval (if available)."""
    results = {}
    log_file = RESULTS_DIR / "deepeval_log.jsonl"
    
    if not log_file.exists():
        return results
    
    with open(log_file) as f:
        for line in f:
            if not line.strip():
                continue
            entry = json.loads(line)
            if entry.get("type") == "DEEPEVAL_RESULT":
                model = entry.get("model", "")
                results[model] = {
                    "accuracy": entry.get("accuracy", 0),
                    "passed": entry.get("passed", 0),
                    "total": entry.get("total", 0),
                }
    
    return results

def load_llm_benchmark_results() -> dict:
    """Load results from llm-benchmark (speed focused)."""
    results = {}
    log_file = RESULTS_DIR / "benchmark_log.jsonl"
    
    if not log_file.exists():
        return results
    
    with open(log_file) as f:
        for line in f:
            if not line.strip():
                continue
            entry = json.loads(line)
            if entry.get("type") == "BENCHMARK_RESULT":
                model = entry.get("model", "")
                results[model] = {
                    "tokens_per_sec": entry.get("tokens_per_sec", 0),
                    "avg_latency_ms": entry.get("avg_latency_ms", 0),
                }
    
    return results

def compile_matrix() -> dict:
    """Compile all results into a unified matrix."""
    matrix = defaultdict(lambda: defaultdict(dict))
    
    # Load from each harness
    simple_results = load_simple_eval_results()
    promptfoo_results = load_promptfoo_results()
    deepeval_results = load_deepeval_results()
    benchmark_results = load_llm_benchmark_results()
    
    # Populate matrix from simple_eval
    for key, data in simple_results.items():
        model = key.split(":")[0] + ":" + key.split(":")[1]  # model:size
        task = data.get("task", "basic")
        matrix[model]["simple_eval"] = {
            "accuracy": data["accuracy"],
            "latency_ms": data["latency_ms"],
            "task": task,
        }
    
    # Populate matrix from promptfoo
    for model, data in promptfoo_results.items():
        # Normalize model name
        for m in MODELS:
            if m.replace(":", "") in model.replace(":", "") or model in m:
                matrix[m]["promptfoo"] = {
                    "accuracy": data["accuracy"],
                    "pass": data["pass"],
                    "total": data["total"],
                }
                break
    
    # Populate matrix from deepeval
    for model, data in deepeval_results.items():
        for m in MODELS:
            if m.replace(":", "") in model.replace(":", "") or model in m:
                matrix[m]["deepeval"] = {
                    "accuracy": data["accuracy"],
                    "passed": data["passed"],
                    "total": data["total"],
                }
                break
    
    # Populate matrix from benchmark
    for model, data in benchmark_results.items():
        for m in MODELS:
            if m.replace(":", "") in model.replace(":", "") or model in m:
                matrix[m]["llm_benchmark"] = {
                    "tokens_per_sec": data["tokens_per_sec"],
                    "avg_latency_ms": data["avg_latency_ms"],
                }
                break
    
    return dict(matrix)

def generate_markdown_table(matrix: dict) -> str:
    """Generate markdown table from matrix."""
    lines = []
    lines.append("# Model-Harness Evaluation Matrix")
    lines.append("")
    lines.append(f"> Auto-generated: {datetime.now().isoformat()}")
    lines.append("> Gen 88 | Port 4 (DISRUPT)")
    lines.append("")
    
    # Header
    lines.append("| Model | simple_eval | promptfoo | deepeval | llm_benchmark |")
    lines.append("|-------|-------------|-----------|----------|---------------|")
    
    # Rows
    for model in MODELS:
        row = [model]
        
        for harness in HARNESSES:
            if model in matrix and harness in matrix[model]:
                data = matrix[model][harness]
                if "accuracy" in data:
                    row.append(f"{data['accuracy']:.1f}%")
                elif "tokens_per_sec" in data:
                    row.append(f"{data['tokens_per_sec']:.0f} t/s")
                else:
                    row.append("✓")
            else:
                row.append("-")
        
        lines.append("| " + " | ".join(row) + " |")
    
    lines.append("")
    lines.append("## Legend")
    lines.append("- `-` = Not yet tested")
    lines.append("- `X%` = Accuracy percentage")
    lines.append("- `X t/s` = Tokens per second (speed)")
    lines.append("")
    
    return "\n".join(lines)

def generate_detailed_report(matrix: dict) -> str:
    """Generate detailed report with all metrics."""
    lines = []
    lines.append("## Detailed Results")
    lines.append("")
    
    for model in MODELS:
        if model not in matrix:
            continue
            
        lines.append(f"### {model}")
        lines.append("")
        
        for harness in HARNESSES:
            if harness not in matrix[model]:
                continue
                
            data = matrix[model][harness]
            lines.append(f"**{harness}:**")
            for key, value in data.items():
                if isinstance(value, float):
                    lines.append(f"  - {key}: {value:.2f}")
                else:
                    lines.append(f"  - {key}: {value}")
            lines.append("")
    
    return "\n".join(lines)

def main():
    print("Compiling Model-Harness Matrix...")
    
    matrix = compile_matrix()
    
    # Generate markdown
    md_table = generate_markdown_table(matrix)
    md_detail = generate_detailed_report(matrix)
    
    full_md = md_table + "\n" + md_detail
    
    # Write to file
    output_file = RESULTS_DIR / "MATRIX.md"
    with open(output_file, "w") as f:
        f.write(full_md)
    
    print(f"Matrix written to {output_file}")
    print()
    print(md_table)
    
    # Also output as JSON for programmatic access
    json_file = RESULTS_DIR / "matrix.json"
    with open(json_file, "w") as f:
        json.dump(matrix, f, indent=2)
    
    print(f"\nJSON written to {json_file}")

if __name__ == "__main__":
    main()
