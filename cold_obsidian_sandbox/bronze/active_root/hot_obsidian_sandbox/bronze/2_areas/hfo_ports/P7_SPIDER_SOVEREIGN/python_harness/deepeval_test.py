#!/usr/bin/env python3
"""
DeepEval test for gemma3:1b
Gen 88 | Port 4 (DISRUPT)

Uses deepeval's assertion-based testing (no LLM judge required)
"""
import os
import json
import requests
from datetime import datetime, timezone
from pathlib import Path

# Configure Ollama
os.environ["OLLAMA_BASE_URL"] = "http://localhost:11434"

from deepeval import assert_test
from deepeval.metrics import BaseMetric
from deepeval.test_case import LLMTestCase

RESULTS_DIR = Path(__file__).parent / "results"

class ContainsMetric(BaseMetric):
    """Simple contains check metric."""
    def __init__(self, expected: str, threshold: float = 1.0):
        self.expected = expected.lower()
        self.threshold = threshold
        
    def measure(self, test_case: LLMTestCase) -> float:
        actual = test_case.actual_output.lower()
        if self.expected in actual:
            self.score = 1.0
            self.success = True
            self.reason = f"Output contains '{self.expected}'"
        else:
            self.score = 0.0
            self.success = False
            self.reason = f"Output does not contain '{self.expected}'"
        return self.score
    
    async def a_measure(self, test_case: LLMTestCase) -> float:
        return self.measure(test_case)
    
    def is_successful(self) -> bool:
        return self.success
    
    @property
    def __name__(self):
        return "ContainsMetric"

def call_ollama(model: str, prompt: str) -> str:
    """Call Ollama API."""
    response = requests.post(
        "http://localhost:11434/api/generate",
        json={"model": model, "prompt": prompt, "stream": False},
        timeout=60
    )
    return response.json().get("response", "").strip()

def run_deepeval_gemma1b():
    """Run deepeval tests on gemma3:1b."""
    model = "gemma3:1b"
    
    # Test cases with expected substrings
    tests = [
        ("What is 2 + 2?", "4"),
        ("What is the capital of France?", "paris"),
        ("Is 17 a prime number? Answer yes or no.", "yes"),
        ("Which OBSIDIAN port handles testing? Port 0: OBSERVE, Port 4: DISRUPT", "4"),
        ("What phase of HIVE involves failing tests? H=Hunt, I=Interlock, V=Validate, E=Evolve", "i"),
        ("Name a programming language.", "python"),  # Flexible - many valid answers
    ]
    
    results = []
    print(f"=== DeepEval Testing: {model} ===\n")
    
    for question, expected in tests:
        prompt = f"Answer concisely with just the answer: {question}"
        output = call_ollama(model, prompt)
        
        # Create test case
        test_case = LLMTestCase(
            input=question,
            actual_output=output
        )
        
        # Check if expected is in output
        passed = expected.lower() in output.lower()
        
        results.append({
            "input": question,
            "expected": expected,
            "actual": output,
            "passed": passed
        })
        
        status = "✓" if passed else "✗"
        print(f"{status} Q: {question[:50]}...")
        print(f"  A: {output[:100]}")
        print(f"  Expected: '{expected}' | Passed: {passed}\n")
    
    # Calculate accuracy
    passed_count = sum(1 for r in results if r["passed"])
    total = len(results)
    accuracy = passed_count / total * 100
    
    print(f"=== DeepEval Results for {model} ===")
    print(f"Passed: {passed_count}/{total}")
    print(f"Accuracy: {accuracy:.1f}%")
    
    # Save results
    result_entry = {
        "ts": datetime.now(timezone.utc).isoformat(),
        "type": "DEEPEVAL_RESULT",
        "model": model,
        "harness": "deepeval",
        "accuracy": accuracy,
        "passed": passed_count,
        "total": total,
        "results": results
    }
    
    log_file = RESULTS_DIR / "deepeval_log.jsonl"
    with open(log_file, "a") as f:
        f.write(json.dumps(result_entry) + "\n")
    
    print(f"\nResults saved to {log_file}")
    return accuracy

if __name__ == "__main__":
    run_deepeval_gemma1b()
