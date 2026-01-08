#!/usr/bin/env python3
"""
LLM Benchmark speed test for gemma3:1b
Gen 88 | Port 4 (DISRUPT)

Measures tokens/second throughput
"""
import json
import time
import requests
from datetime import datetime, timezone
from pathlib import Path

RESULTS_DIR = Path(__file__).parent / "results"

def count_tokens_approx(text: str) -> int:
    """Approximate token count (words * 1.3)."""
    return int(len(text.split()) * 1.3)

def benchmark_model(model: str, prompts: list[str], num_runs: int = 3) -> dict:
    """Benchmark a model's speed."""
    print(f"\n=== Benchmarking {model} ===")
    
    total_tokens = 0
    total_time = 0
    latencies = []
    
    for i, prompt in enumerate(prompts):
        for run in range(num_runs):
            start = time.perf_counter()
            
            response = requests.post(
                "http://localhost:11434/api/generate",
                json={"model": model, "prompt": prompt, "stream": False},
                timeout=120
            )
            
            elapsed = time.perf_counter() - start
            output = response.json().get("response", "")
            tokens = count_tokens_approx(output)
            
            total_tokens += tokens
            total_time += elapsed
            latencies.append(elapsed * 1000)  # ms
            
            print(f"  Run {i*num_runs + run + 1}: {tokens} tokens in {elapsed:.2f}s ({tokens/elapsed:.1f} t/s)")
    
    avg_latency = sum(latencies) / len(latencies)
    tokens_per_sec = total_tokens / total_time if total_time > 0 else 0
    
    return {
        "model": model,
        "total_tokens": total_tokens,
        "total_time_sec": total_time,
        "tokens_per_sec": tokens_per_sec,
        "avg_latency_ms": avg_latency,
        "num_runs": len(latencies)
    }

def run_benchmark():
    """Run benchmark on gemma3:1b."""
    model = "gemma3:1b"
    
    # Test prompts of varying complexity
    prompts = [
        "What is 2+2?",
        "Explain the concept of recursion in programming.",
        "Write a haiku about coding.",
    ]
    
    results = benchmark_model(model, prompts, num_runs=2)
    
    print(f"\n=== Benchmark Results for {model} ===")
    print(f"Total tokens: {results['total_tokens']}")
    print(f"Total time: {results['total_time_sec']:.2f}s")
    print(f"Throughput: {results['tokens_per_sec']:.1f} tokens/sec")
    print(f"Avg latency: {results['avg_latency_ms']:.0f}ms")
    
    # Save results
    result_entry = {
        "ts": datetime.now(timezone.utc).isoformat(),
        "type": "BENCHMARK_RESULT",
        "harness": "llm_benchmark",
        **results
    }
    
    log_file = RESULTS_DIR / "benchmark_log.jsonl"
    with open(log_file, "a") as f:
        f.write(json.dumps(result_entry) + "\n")
    
    print(f"\nResults saved to {log_file}")
    return results

if __name__ == "__main__":
    run_benchmark()
