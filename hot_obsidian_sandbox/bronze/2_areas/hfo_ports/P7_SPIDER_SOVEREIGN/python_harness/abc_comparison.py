#!/usr/bin/env python3
"""
A/B/C Comparison: Single vs Sequential vs Scatter-Gather

Tests the hypothesis: Does multi-family scatter-gather beat single models?

A) Single best model (gemma3:4b)
B) Sequential chain (4 models in series, each refining)
C) Scatter-gather (1-8-1 BFT pattern)

Gen 88 - Port 4 (DISRUPT) - Testing
"""
import asyncio
import json
import os
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import httpx
from dotenv import load_dotenv

env_path = Path(__file__).parent.parent.parent.parent.parent / ".env"
load_dotenv(env_path)

# === Test Questions (with context baked in) ===
OBSIDIAN_CONTEXT = """OBSIDIAN 8-Port System:
Port 0: OBSERVE (Sensing)
Port 1: BRIDGE (Protocol translation)
Port 2: SHAPE (Data transformation)
Port 3: INJECT (Payload delivery)
Port 4: DISRUPT (Testing, chaos)
Port 5: IMMUNIZE (Validation, defense)
Port 6: ASSIMILATE (Storage, memory)
Port 7: NAVIGATE (Decision, orchestration)

HIVE Workflow: H (Hunt) → I (Interlock) → V (Validate) → E (Evolve)
- H: Research, plan (Ports 0+7)
- I: TDD RED, failing tests (Ports 1+6)
- V: TDD GREEN, make tests pass (Ports 2+5)
- E: TDD REFACTOR (Ports 3+4)"""

TEST_QUESTIONS = [
    # General knowledge
    ("What is 2 + 2? Answer with just the number.", "4"),
    ("What is the capital of France? Answer with just the city name.", "Paris"),
    ("Is 17 a prime number? Answer yes or no.", "yes"),
    # HFO-specific (with context)
    (f"{OBSIDIAN_CONTEXT}\n\nWhich port handles testing and chaos? Answer with just the number.", "4"),
    (f"{OBSIDIAN_CONTEXT}\n\nWhat verb corresponds to Port 7? Answer in UPPERCASE.", "NAVIGATE"),
    (f"{OBSIDIAN_CONTEXT}\n\nWhich HIVE phase involves writing failing tests? Answer with just the letter.", "I"),
    (f"{OBSIDIAN_CONTEXT}\n\nWhich port stores data to memory? Answer with just the number.", "6"),
    (f"{OBSIDIAN_CONTEXT}\n\nWhat is the correct order of HIVE phases? Answer with just the four letters.", "HIVE"),
]

# === Models ===
SINGLE_MODEL = "gemma3:4b"
SEQUENTIAL_MODELS = ["gemma3:1b", "qwen3:0.6b", "llama3.2:1b", "phi3:mini"]
SCATTER_MODELS = ["gemma3:1b", "qwen3:0.6b", "llama3.2:1b", "phi3:mini"] * 2  # 8 total

@dataclass
class TestResult:
    method: str
    question: str
    expected: str
    answer: str
    correct: bool
    latency_ms: float
    details: dict

class OllamaClient:
    def __init__(self):
        self.base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        self.client = httpx.AsyncClient(timeout=120)
    
    async def close(self):
        await self.client.aclose()
    
    async def generate(self, model: str, prompt: str) -> tuple[str, float]:
        start = datetime.now()
        r = await self.client.post(
            f"{self.base_url}/api/generate",
            json={"model": model, "prompt": prompt, "stream": False},
        )
        latency = (datetime.now() - start).total_seconds() * 1000
        if r.status_code != 200:
            return f"ERROR: {r.status_code}", latency
        return r.json().get("response", "").strip(), latency

def normalize(s: str) -> str:
    return s.split('\n')[0].strip().lower()

def check_answer(response: str, expected: str) -> bool:
    norm_r = normalize(response)
    norm_e = expected.lower()
    return norm_e in norm_r or norm_r == norm_e

# === Method A: Single Model ===
async def method_a_single(client: OllamaClient, question: str, expected: str) -> TestResult:
    prompt = f"Answer concisely with just the answer:\n\n{question}"
    answer, latency = await client.generate(SINGLE_MODEL, prompt)
    return TestResult(
        method="A_SINGLE",
        question=question[:50],
        expected=expected,
        answer=answer[:50],
        correct=check_answer(answer, expected),
        latency_ms=latency,
        details={"model": SINGLE_MODEL}
    )

# === Method B: Sequential Chain ===
async def method_b_sequential(client: OllamaClient, question: str, expected: str) -> TestResult:
    start = datetime.now()
    current_answer = ""
    chain = []
    
    for i, model in enumerate(SEQUENTIAL_MODELS):
        if i == 0:
            prompt = f"Answer concisely with just the answer:\n\n{question}"
        else:
            prompt = f"""Previous model answered: "{current_answer}"

Original question: {question}

If the previous answer is correct, confirm it. If wrong, provide the correct answer.
Answer concisely with just the answer."""
        
        answer, _ = await client.generate(model, prompt)
        current_answer = answer
        chain.append({"model": model, "answer": answer[:30]})
    
    latency = (datetime.now() - start).total_seconds() * 1000
    return TestResult(
        method="B_SEQUENTIAL",
        question=question[:50],
        expected=expected,
        answer=current_answer[:50],
        correct=check_answer(current_answer, expected),
        latency_ms=latency,
        details={"chain": chain}
    )

# === Method C: Scatter-Gather ===
async def method_c_scatter_gather(client: OllamaClient, question: str, expected: str) -> TestResult:
    start = datetime.now()
    
    # Scatter: All 8 models answer in parallel
    prompt = f"Answer concisely with just the answer:\n\n{question}"
    tasks = [client.generate(model, prompt) for model in SCATTER_MODELS]
    responses = await asyncio.gather(*tasks)
    
    # Gather: Calculate consensus
    answers = [normalize(r[0]) for r in responses]
    answer_counts = {}
    for a in answers:
        answer_counts[a] = answer_counts.get(a, 0) + 1
    
    majority_answer, majority_count = max(answer_counts.items(), key=lambda x: x[1])
    agreement = majority_count / len(answers)
    
    # Aggregator decides
    if agreement >= 0.5:  # Simple majority
        final_answer = majority_answer
    else:
        # Use smart model to break tie
        agg_prompt = f"""8 models answered this question: {question}

Answers: {json.dumps(answer_counts)}

Pick the best answer. Output ONLY the answer."""
        final_answer, _ = await client.generate("gemma3:4b", agg_prompt)
    
    latency = (datetime.now() - start).total_seconds() * 1000
    return TestResult(
        method="C_SCATTER_GATHER",
        question=question[:50],
        expected=expected,
        answer=final_answer[:50],
        correct=check_answer(final_answer, expected),
        latency_ms=latency,
        details={
            "responses": [{"model": m, "answer": r[0][:20]} for m, r in zip(SCATTER_MODELS, responses)],
            "agreement": agreement,
            "majority": majority_answer,
        }
    )

# === Main Runner ===
async def run_comparison():
    print("\n" + "="*70)
    print("A/B/C COMPARISON: Single vs Sequential vs Scatter-Gather")
    print("="*70)
    print(f"A) Single: {SINGLE_MODEL}")
    print(f"B) Sequential: {' → '.join(SEQUENTIAL_MODELS)}")
    print(f"C) Scatter-Gather: 8 models (4 families × 2)")
    print("="*70 + "\n")
    
    client = OllamaClient()
    results = {"A_SINGLE": [], "B_SEQUENTIAL": [], "C_SCATTER_GATHER": []}
    
    try:
        for i, (question, expected) in enumerate(TEST_QUESTIONS):
            print(f"[{i+1}/{len(TEST_QUESTIONS)}] {question[:40]}...")
            
            # Run all three methods
            result_a = await method_a_single(client, question, expected)
            result_b = await method_b_sequential(client, question, expected)
            result_c = await method_c_scatter_gather(client, question, expected)
            
            results["A_SINGLE"].append(result_a)
            results["B_SEQUENTIAL"].append(result_b)
            results["C_SCATTER_GATHER"].append(result_c)
            
            # Print comparison
            print(f"  Expected: {expected}")
            print(f"  A) Single:   {'✅' if result_a.correct else '❌'} {result_a.answer[:20]} ({result_a.latency_ms:.0f}ms)")
            print(f"  B) Seq:      {'✅' if result_b.correct else '❌'} {result_b.answer[:20]} ({result_b.latency_ms:.0f}ms)")
            print(f"  C) Scatter:  {'✅' if result_c.correct else '❌'} {result_c.answer[:20]} ({result_c.latency_ms:.0f}ms)")
            print()
        
        # Summary
        print("="*70)
        print("SUMMARY")
        print("="*70)
        
        for method, method_results in results.items():
            correct = sum(1 for r in method_results if r.correct)
            avg_latency = sum(r.latency_ms for r in method_results) / len(method_results)
            print(f"{method:20} Accuracy: {correct}/{len(method_results)} ({correct/len(method_results)*100:.1f}%)  Avg Latency: {avg_latency:.0f}ms")
        
        print("="*70)
        
        # Log results
        log_comparison(results)
        
        return results
        
    finally:
        await client.close()

def log_comparison(results: dict):
    results_dir = Path(__file__).parent / "results"
    results_dir.mkdir(exist_ok=True)
    
    for method, method_results in results.items():
        correct = sum(1 for r in method_results if r.correct)
        avg_latency = sum(r.latency_ms for r in method_results) / len(method_results)
        
        entry = {
            "ts": datetime.now(timezone.utc).isoformat(),
            "type": "ABC_COMPARISON",
            "method": method,
            "accuracy": correct / len(method_results),
            "correct": correct,
            "total": len(method_results),
            "avg_latency_ms": avg_latency,
            "hive": "HFO_GEN88",
            "gen": 88,
            "port": 4,
        }
        
        with open(results_dir / "abc_comparison_log.jsonl", "a") as f:
            f.write(json.dumps(entry) + "\n")
    
    print(f"\nResults logged to results/abc_comparison_log.jsonl")

if __name__ == "__main__":
    asyncio.run(run_comparison())
