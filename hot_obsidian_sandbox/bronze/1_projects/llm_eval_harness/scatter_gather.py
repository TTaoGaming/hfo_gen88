#!/usr/bin/env python3
"""
HFO Scatter-Gather Pattern (1-8-1)

BFT-inspired consensus pattern:
1. COORDINATOR (smart model) - Prepares task for swarmlings
8. SWARMLINGS (4 families × 2) - Execute in parallel, diverse perspectives  
1. AGGREGATOR (smart model) - Collects responses, applies BFT consensus

BFT 3f+1: With 8 nodes and f=2 faults tolerated, need 6+ agreeing for quorum.

Gen 88 - Port 7 (NAVIGATE) for orchestration
"""
import asyncio
import argparse
import json
import os
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import httpx
from dotenv import load_dotenv

# Load env
env_path = Path(__file__).parent.parent.parent.parent.parent / ".env"
load_dotenv(env_path)

# === Configuration ===
COORDINATOR_MODEL = "gemma3:4b"  # Smartest local model
SWARMLING_MODELS = [
    "gemma3:1b",      # Google
    "qwen3:0.6b",     # Alibaba
    "llama3.2:1b",    # Meta
    "smollm2:135m",   # HuggingFace
    "gemma3:1b",      # Google (duplicate for BFT)
    "qwen3:0.6b",     # Alibaba (duplicate for BFT)
    "llama3.2:1b",    # Meta (duplicate for BFT)
    "smollm2:135m",   # HuggingFace (duplicate for BFT)
]
AGGREGATOR_MODEL = "gemma3:4b"  # Same smart model

# BFT Parameters
BFT_N = 8           # Total nodes
BFT_F = 2           # Faults tolerated
BFT_QUORUM = 6      # 3f+1 = 7, but we use 2f+1 = 5 for practical quorum, 6 for safety

@dataclass
class ScatterGatherResult:
    """Result from 1-8-1 pattern."""
    question: str
    expected: Optional[str]
    coordinator_prep: str
    swarmling_responses: list[dict]
    aggregator_consensus: str
    bft_quorum_reached: bool
    agreement_rate: float
    majority_answer: str
    correct: bool
    total_latency_ms: float

# === Ollama Client ===
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

# === 1-8-1 Pattern ===
async def scatter_gather(
    client: OllamaClient,
    question: str,
    expected: Optional[str] = None,
) -> ScatterGatherResult:
    """Execute 1-8-1 scatter-gather pattern."""
    start = datetime.now()
    
    # === PHASE 1: COORDINATOR (1) ===
    coordinator_prompt = f"""You are the COORDINATOR in a distributed consensus system.
Your job is to prepare a clear, focused task for 8 swarmling agents.

Original question: {question}

Rewrite this as a clear instruction for the swarmlings. They should each independently answer.
Keep it simple and direct. Output ONLY the rewritten instruction, nothing else."""

    coordinator_prep, _ = await client.generate(COORDINATOR_MODEL, coordinator_prompt)
    
    # === PHASE 2: SWARMLINGS (8) ===
    swarmling_prompt = f"""Answer this question concisely with just the answer, no explanation:

{coordinator_prep}"""

    # Execute all 8 in parallel
    tasks = [client.generate(model, swarmling_prompt) for model in SWARMLING_MODELS]
    responses = await asyncio.gather(*tasks)
    
    swarmling_responses = []
    for i, (response, latency) in enumerate(responses):
        swarmling_responses.append({
            "id": i,
            "model": SWARMLING_MODELS[i],
            "family": SWARMLING_MODELS[i].split(":")[0],
            "response": response,
            "latency_ms": latency,
        })
    
    # === PHASE 3: AGGREGATOR (1) ===
    # First, calculate raw consensus
    answers = [normalize(r["response"]) for r in swarmling_responses]
    answer_counts = {}
    for a in answers:
        answer_counts[a] = answer_counts.get(a, 0) + 1
    
    majority_answer, majority_count = max(answer_counts.items(), key=lambda x: x[1])
    agreement_rate = majority_count / len(answers)
    bft_quorum_reached = majority_count >= BFT_QUORUM
    
    # Aggregator synthesizes final answer
    aggregator_prompt = f"""You are the AGGREGATOR in a distributed consensus system.
8 swarmlings answered this question: {question}

Their responses:
{json.dumps([{"model": r["model"], "answer": r["response"][:100]} for r in swarmling_responses], indent=2)}

Raw consensus analysis:
- Most common answer: "{majority_answer}" ({majority_count}/8 = {agreement_rate*100:.0f}%)
- BFT Quorum (6/8): {"REACHED" if bft_quorum_reached else "NOT REACHED"}

Based on this, provide the FINAL ANSWER. If quorum was reached, use the majority answer.
If not, use your judgment to pick the best answer.
Output ONLY the final answer, nothing else."""

    aggregator_consensus, _ = await client.generate(AGGREGATOR_MODEL, aggregator_prompt)
    
    total_latency = (datetime.now() - start).total_seconds() * 1000
    
    # Check correctness
    correct = False
    if expected:
        correct = expected.lower() in normalize(aggregator_consensus).lower() or \
                  normalize(aggregator_consensus).lower() == expected.lower()
    
    return ScatterGatherResult(
        question=question,
        expected=expected,
        coordinator_prep=coordinator_prep,
        swarmling_responses=swarmling_responses,
        aggregator_consensus=aggregator_consensus,
        bft_quorum_reached=bft_quorum_reached,
        agreement_rate=agreement_rate,
        majority_answer=majority_answer,
        correct=correct,
        total_latency_ms=total_latency,
    )

def normalize(s: str) -> str:
    """Normalize response for comparison."""
    return s.split('\n')[0].strip().lower()

# === Test Questions ===
EVAL_QUESTIONS = [
    ("What is 2 + 2?", "4"),
    ("What is the capital of France?", "Paris"),
    ("Is 17 a prime number? Answer yes or no.", "yes"),
    ("Which HIVE phase involves writing failing tests? Answer with just the letter.", "I"),
    ("Which OBSIDIAN port handles testing and chaos? Answer with just the number.", "4"),
    ("What verb corresponds to OBSIDIAN Port 7? Answer in UPPERCASE.", "NAVIGATE"),
]

# === Logging ===
def log_result(result: ScatterGatherResult):
    results_dir = Path(__file__).parent / "results"
    results_dir.mkdir(exist_ok=True)
    
    entry = {
        "ts": datetime.now(timezone.utc).isoformat(),
        "type": "SCATTER_GATHER_RESULT",
        "mark": "BFT_CONSENSUS",
        "pattern": "1-8-1",
        "question": result.question[:50],
        "expected": result.expected,
        "coordinator_model": COORDINATOR_MODEL,
        "swarmling_models": list(set(SWARMLING_MODELS)),
        "aggregator_model": AGGREGATOR_MODEL,
        "majority_answer": result.majority_answer,
        "aggregator_answer": result.aggregator_consensus[:50],
        "agreement_rate": result.agreement_rate,
        "bft_quorum": result.bft_quorum_reached,
        "correct": result.correct,
        "latency_ms": result.total_latency_ms,
        "hive": "HFO_GEN88",
        "gen": 88,
        "port": 7,
    }
    
    with open(results_dir / "scatter_gather_log.jsonl", "a") as f:
        f.write(json.dumps(entry) + "\n")

# === Main ===
async def run_evaluation(verbose: bool = True):
    """Run full 1-8-1 evaluation."""
    print("\n" + "="*70)
    print("HFO Scatter-Gather Pattern (1-8-1) - BFT Consensus Evaluation")
    print("="*70)
    print(f"Coordinator: {COORDINATOR_MODEL}")
    print(f"Swarmlings: {', '.join(set(SWARMLING_MODELS))} (4 families × 2)")
    print(f"Aggregator: {AGGREGATOR_MODEL}")
    print(f"BFT Quorum: {BFT_QUORUM}/{BFT_N}")
    print("="*70 + "\n")
    
    client = OllamaClient()
    results = []
    
    try:
        for i, (question, expected) in enumerate(EVAL_QUESTIONS):
            print(f"[{i+1}/{len(EVAL_QUESTIONS)}] {question[:50]}...")
            
            result = await scatter_gather(client, question, expected)
            results.append(result)
            
            status = "✅" if result.correct else "❌"
            quorum = "🔒" if result.bft_quorum_reached else "⚠️"
            
            print(f"  {status} Expected: {expected}")
            print(f"  {quorum} Majority: {result.majority_answer[:30]} ({result.agreement_rate*100:.0f}%)")
            print(f"     Aggregator: {result.aggregator_consensus[:30]}")
            print(f"     Latency: {result.total_latency_ms:.0f}ms")
            
            if verbose:
                print(f"     Swarmling breakdown:")
                for sr in result.swarmling_responses:
                    print(f"       [{sr['family']}] {sr['response'][:25]}...")
            
            log_result(result)
            print()
        
        # Summary
        correct = sum(1 for r in results if r.correct)
        quorum_reached = sum(1 for r in results if r.bft_quorum_reached)
        avg_agreement = sum(r.agreement_rate for r in results) / len(results)
        
        print("="*70)
        print("SUMMARY")
        print("="*70)
        print(f"Accuracy: {correct}/{len(results)} ({correct/len(results)*100:.1f}%)")
        print(f"BFT Quorum Reached: {quorum_reached}/{len(results)}")
        print(f"Average Agreement: {avg_agreement*100:.1f}%")
        print("="*70)
        
        return results
        
    finally:
        await client.close()

def main():
    parser = argparse.ArgumentParser(description="HFO 1-8-1 Scatter-Gather Pattern")
    parser.add_argument("--verbose", "-v", action="store_true", help="Show swarmling details")
    parser.add_argument("--question", "-q", help="Run single question")
    args = parser.parse_args()
    
    if args.question:
        async def single():
            client = OllamaClient()
            try:
                result = await scatter_gather(client, args.question)
                print(f"\nQuestion: {result.question}")
                print(f"Coordinator prep: {result.coordinator_prep}")
                print(f"\nSwarmling responses:")
                for sr in result.swarmling_responses:
                    print(f"  [{sr['family']}] {sr['response']}")
                print(f"\nAggregator consensus: {result.aggregator_consensus}")
                print(f"Agreement: {result.agreement_rate*100:.0f}%")
                print(f"BFT Quorum: {'REACHED' if result.bft_quorum_reached else 'NOT REACHED'}")
            finally:
                await client.close()
        asyncio.run(single())
    else:
        asyncio.run(run_evaluation(args.verbose))

if __name__ == "__main__":
    main()
