#!/usr/bin/env python3
"""
Simple LLM Evaluation Runner
Direct API calls to Ollama and OpenRouter without framework overhead.
"""
import argparse
import os
import sys
import json
import httpx
from pathlib import Path
from datetime import datetime, timezone
from dataclasses import dataclass
from typing import Optional

from dotenv import load_dotenv

# Load env from project root
env_path = Path(__file__).parent.parent.parent.parent.parent / ".env"
load_dotenv(env_path)

@dataclass
class EvalSample:
    input: str
    target: str
    
@dataclass
class EvalResult:
    sample: EvalSample
    response: str
    correct: bool
    latency_ms: float

# ============ EVALUATION TASKS ============

BASIC_SAMPLES = [
    EvalSample("What is 2 + 2? Answer with just the number.", "4"),
    EvalSample("Reverse the word 'hello'. Answer with just the reversed word.", "olleh"),
    EvalSample("What is the capital of France? Answer with just the city name.", "Paris"),
    EvalSample("Is 17 a prime number? Answer with just 'yes' or 'no'.", "yes"),
    EvalSample("How many letters are in the word 'evaluation'? Answer with just the number.", "10"),
]

OBSIDIAN_MAPPING = """Port 0: OBSERVE (Sensing)
Port 1: BRIDGE (Protocol translation)
Port 2: SHAPE (Data transformation)
Port 3: INJECT (Payload delivery)
Port 4: DISRUPT (Testing, chaos)
Port 5: IMMUNIZE (Validation, defense)
Port 6: ASSIMILATE (Storage, memory)
Port 7: NAVIGATE (Decision, orchestration)"""

HFO_STIGMERGY_SAMPLES = [
    EvalSample(f"Given the OBSIDIAN port mapping:\n{OBSIDIAN_MAPPING}\n\nWhat verb corresponds to Port 4? Answer with just the verb in UPPERCASE.", "DISRUPT"),
    EvalSample(f"Given the OBSIDIAN port mapping:\n{OBSIDIAN_MAPPING}\n\nIf I want to store data to memory, which port should I use? Answer with just the port number.", "6"),
    EvalSample(f"Given the OBSIDIAN port mapping:\n{OBSIDIAN_MAPPING}\n\nWhat is the correct event type format for a Port 0 sensing action in the 'gesture' domain with action 'detected'?\nFormat: obsidian.{{verb_lowercase}}.{{domain}}.{{action}}\nAnswer with just the event type string.", "obsidian.observe.gesture.detected"),
    EvalSample(f"Given the OBSIDIAN port mapping:\n{OBSIDIAN_MAPPING}\n\nGenerate a valid CloudEvents source URI for Gen 88, bronze layer, Port 2.\nFormat: hfo://gen{{N}}/{{layer}}/port/{{port}}\nAnswer with just the URI.", "hfo://gen88/bronze/port/2"),
]

HIVE_CONTEXT = """HIVE/8 Workflow Phases:
- H (Hunt): Research, plan, explore → Ports 0 (OBSERVE) + 7 (NAVIGATE)
- I (Interlock): TDD RED, write failing tests → Ports 1 (BRIDGE) + 6 (ASSIMILATE)
- V (Validate): TDD GREEN, make tests pass → Ports 2 (SHAPE) + 5 (IMMUNIZE)
- E (Evolve): TDD REFACTOR, prepare N+1 → Ports 3 (INJECT) + 4 (DISRUPT)

Medallion Flow:
- Bronze: Experiments, kinetic energy, slop
- Silver: Verified implementations (TDD/CDD)
- Gold: Canonical manifests, truth sources"""

HFO_HIVE_SAMPLES = [
    EvalSample(f"{HIVE_CONTEXT}\n\nI just finished writing failing tests for a new feature. What HIVE phase am I in? Answer with just the letter.", "I"),
    EvalSample(f"{HIVE_CONTEXT}\n\nI'm researching different approaches before implementing. What HIVE phase should I be in? Answer with just the letter.", "H"),
    EvalSample(f"{HIVE_CONTEXT}\n\nMy tests are passing and I'm now refactoring for the next generation. What HIVE phase am I in? Answer with just the letter.", "E"),
    EvalSample(f"{HIVE_CONTEXT}\n\nCode should start in which medallion layer? Answer with just the layer name in lowercase.", "bronze"),
    EvalSample(f"{HIVE_CONTEXT}\n\nWhat is the correct order of HIVE phases? Answer with just the four letters in order, no spaces.", "HIVE"),
]

TASKS = {
    "basic": BASIC_SAMPLES,
    "hfo_stigmergy": HFO_STIGMERGY_SAMPLES,
    "hfo_hive": HFO_HIVE_SAMPLES,
}

# ============ PROVIDERS ============

def call_ollama(model: str, prompt: str) -> tuple[str, float]:
    """Call Ollama API and return (response, latency_ms)."""
    base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    start = datetime.now()
    
    r = httpx.post(
        f"{base_url}/api/generate",
        json={
            "model": model,
            "prompt": prompt,
            "stream": False,
        },
        timeout=120,
    )
    
    latency = (datetime.now() - start).total_seconds() * 1000
    
    if r.status_code != 200:
        raise Exception(f"Ollama error: {r.status_code} - {r.text}")
    
    return r.json().get("response", "").strip(), latency

def call_openrouter(model: str, prompt: str) -> tuple[str, float]:
    """Call OpenRouter API and return (response, latency_ms)."""
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise Exception("OPENROUTER_API_KEY not set in .env")
    
    start = datetime.now()
    
    r = httpx.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json={
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
        },
        timeout=120,
    )
    
    latency = (datetime.now() - start).total_seconds() * 1000
    
    if r.status_code != 200:
        raise Exception(f"OpenRouter error: {r.status_code} - {r.text}")
    
    return r.json()["choices"][0]["message"]["content"].strip(), latency

PROVIDERS = {
    "ollama": call_ollama,
    "openrouter": call_openrouter,
}

# ============ EVALUATION ============

def normalize_response(response: str) -> str:
    """Normalize response for comparison."""
    # Take first line, strip whitespace, lowercase
    first_line = response.split('\n')[0].strip()
    # Remove common prefixes
    for prefix in ["the answer is", "answer:", "result:"]:
        if first_line.lower().startswith(prefix):
            first_line = first_line[len(prefix):].strip()
    return first_line

def check_correct(response: str, target: str) -> bool:
    """Check if response matches target (flexible matching)."""
    norm_response = normalize_response(response).lower()
    norm_target = target.lower()
    
    # Exact match
    if norm_response == norm_target:
        return True
    
    # Target contained in response
    if norm_target in norm_response:
        return True
    
    # Response contained in target (for longer targets)
    if len(norm_target) > 10 and norm_response in norm_target:
        return True
    
    return False

def run_evaluation(provider: str, model: str, task_name: str):
    """Run evaluation and return results."""
    if task_name not in TASKS:
        print(f"ERROR: Unknown task '{task_name}'")
        print(f"Available: {', '.join(TASKS.keys())}")
        sys.exit(1)
    
    if provider not in PROVIDERS:
        print(f"ERROR: Unknown provider '{provider}'")
        print(f"Available: {', '.join(PROVIDERS.keys())}")
        sys.exit(1)
    
    samples = TASKS[task_name]
    call_fn = PROVIDERS[provider]
    
    print(f"\n{'='*60}")
    print(f"HFO Simple LLM Evaluation")
    print(f"{'='*60}")
    print(f"Provider: {provider}")
    print(f"Model: {model}")
    print(f"Task: {task_name} ({len(samples)} samples)")
    print(f"{'='*60}\n")
    
    results = []
    correct_count = 0
    total_latency = 0
    
    for i, sample in enumerate(samples):
        print(f"[{i+1}/{len(samples)}] Running...")
        try:
            response, latency = call_fn(model, sample.input)
            correct = check_correct(response, sample.target)
            
            result = EvalResult(
                sample=sample,
                response=response,
                correct=correct,
                latency_ms=latency,
            )
            results.append(result)
            
            if correct:
                correct_count += 1
                status = "✅"
            else:
                status = "❌"
            
            total_latency += latency
            print(f"  {status} Expected: {sample.target[:30]}")
            print(f"     Got: {response[:50]}...")
            print(f"     Latency: {latency:.0f}ms")
            
        except Exception as e:
            print(f"  ❌ Error: {e}")
            results.append(EvalResult(
                sample=sample,
                response=f"ERROR: {e}",
                correct=False,
                latency_ms=0,
            ))
    
    # Summary
    accuracy = correct_count / len(samples) * 100
    avg_latency = total_latency / len(samples) if samples else 0
    
    print(f"\n{'='*60}")
    print(f"Results Summary")
    print(f"{'='*60}")
    print(f"Accuracy: {correct_count}/{len(samples)} ({accuracy:.1f}%)")
    print(f"Avg Latency: {avg_latency:.0f}ms")
    print(f"{'='*60}")
    
    # Log results
    log_results(provider, model, task_name, results, accuracy, avg_latency)
    
    return results

def log_results(provider: str, model: str, task_name: str, results: list, accuracy: float, avg_latency: float):
    """Log results to JSONL file."""
    results_dir = Path(__file__).parent / "results"
    results_dir.mkdir(exist_ok=True)
    
    entry = {
        "ts": datetime.now(timezone.utc).isoformat(),
        "type": "EVAL_RESULT",
        "mark": "LLM_BENCHMARK",
        "provider": provider,
        "model": model,
        "task": task_name,
        "accuracy": accuracy,
        "avg_latency_ms": avg_latency,
        "samples": len(results),
        "correct": sum(1 for r in results if r.correct),
        "hive": "HFO_GEN88",
        "gen": 88,
        "port": 4,
    }
    
    with open(results_dir / "eval_log.jsonl", "a") as f:
        f.write(json.dumps(entry) + "\n")
    
    print(f"\nResults logged to {results_dir / 'eval_log.jsonl'}")

def list_tasks():
    """List available tasks."""
    print("\nAvailable Evaluation Tasks:")
    print("-" * 40)
    for name, samples in TASKS.items():
        print(f"  {name:15} - {len(samples)} samples")
    print("-" * 40)

def main():
    parser = argparse.ArgumentParser(description="HFO Simple LLM Evaluation")
    parser.add_argument("--provider", choices=list(PROVIDERS.keys()), default="ollama")
    parser.add_argument("--model", default="gemma3:4b")
    parser.add_argument("--task", default="basic")
    parser.add_argument("--list-tasks", action="store_true")
    
    args = parser.parse_args()
    
    if args.list_tasks:
        list_tasks()
        return
    
    run_evaluation(args.provider, args.model, args.task)

if __name__ == "__main__":
    main()
