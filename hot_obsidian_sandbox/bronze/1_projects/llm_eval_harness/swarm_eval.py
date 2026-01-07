#!/usr/bin/env python3
"""
HFO Swarm Evaluation - Powers of 8 (1, 8, 64 agents)

Lightweight swarm orchestrator using asyncio + httpx for Ollama.
Based on OpenAI Swarm pattern: Agents + Handoffs + Parallel Execution.

Gen 88 - Port 4 (DISRUPT)
"""
import asyncio
import argparse
import json
import os
import sys
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Callable, Optional
from enum import Enum

import httpx
from dotenv import load_dotenv

# Load env from project root
env_path = Path(__file__).parent.parent.parent.parent.parent / ".env"
load_dotenv(env_path)

# === HIVE Phase Enum ===
class HivePhase(Enum):
    H = "Hunt"      # Research, plan
    I = "Interlock" # TDD RED
    V = "Validate"  # TDD GREEN
    E = "Evolve"    # TDD REFACTOR

# === Agent Definition ===
@dataclass
class Agent:
    """A single agent in the swarm."""
    id: int
    model: str
    role: str
    instructions: str
    hive_phase: HivePhase = HivePhase.H
    
@dataclass
class SwarmTask:
    """A task to be executed by the swarm."""
    prompt: str
    expected: Optional[str] = None
    hive_phase: HivePhase = HivePhase.H

@dataclass
class AgentResult:
    """Result from a single agent execution."""
    agent_id: int
    model: str
    response: str
    latency_ms: float
    correct: Optional[bool] = None
    error: Optional[str] = None

@dataclass
class SwarmResult:
    """Aggregated result from swarm execution."""
    task: SwarmTask
    results: list[AgentResult] = field(default_factory=list)
    consensus: Optional[str] = None
    agreement_rate: float = 0.0
    total_latency_ms: float = 0.0

# === Ollama Async Client ===
class OllamaSwarm:
    """Async swarm orchestrator for Ollama."""
    
    def __init__(self, base_url: str = None, timeout: float = 120):
        self.base_url = base_url or os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        self.timeout = timeout
        self.client = httpx.AsyncClient(timeout=timeout)
    
    async def close(self):
        await self.client.aclose()
    
    async def call_agent(self, agent: Agent, prompt: str) -> AgentResult:
        """Execute a single agent call."""
        start = datetime.now()
        
        full_prompt = f"{agent.instructions}\n\n{prompt}"
        
        try:
            r = await self.client.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": agent.model,
                    "prompt": full_prompt,
                    "stream": False,
                },
            )
            
            latency = (datetime.now() - start).total_seconds() * 1000
            
            if r.status_code != 200:
                return AgentResult(
                    agent_id=agent.id,
                    model=agent.model,
                    response="",
                    latency_ms=latency,
                    error=f"HTTP {r.status_code}: {r.text[:100]}",
                )
            
            response = r.json().get("response", "").strip()
            return AgentResult(
                agent_id=agent.id,
                model=agent.model,
                response=response,
                latency_ms=latency,
            )
            
        except Exception as e:
            latency = (datetime.now() - start).total_seconds() * 1000
            return AgentResult(
                agent_id=agent.id,
                model=agent.model,
                response="",
                latency_ms=latency,
                error=str(e),
            )
    
    async def run_swarm(self, agents: list[Agent], task: SwarmTask) -> SwarmResult:
        """Run all agents in parallel on a task."""
        start = datetime.now()
        
        # Execute all agents concurrently
        tasks = [self.call_agent(agent, task.prompt) for agent in agents]
        results = await asyncio.gather(*tasks)
        
        total_latency = (datetime.now() - start).total_seconds() * 1000
        
        # Check correctness if expected answer provided
        if task.expected:
            for result in results:
                if result.response:
                    result.correct = check_answer(result.response, task.expected)
        
        # Calculate consensus
        responses = [r.response for r in results if r.response and not r.error]
        consensus, agreement = calculate_consensus(responses)
        
        return SwarmResult(
            task=task,
            results=list(results),
            consensus=consensus,
            agreement_rate=agreement,
            total_latency_ms=total_latency,
        )

# === Consensus Functions ===
def normalize_response(response: str) -> str:
    """Normalize response for comparison."""
    first_line = response.split('\n')[0].strip().lower()
    for prefix in ["the answer is", "answer:", "result:", "response:"]:
        if first_line.startswith(prefix):
            first_line = first_line[len(prefix):].strip()
    return first_line

def check_answer(response: str, expected: str) -> bool:
    """Check if response matches expected."""
    norm_r = normalize_response(response)
    norm_e = expected.lower()
    return norm_e in norm_r or norm_r == norm_e

def calculate_consensus(responses: list[str]) -> tuple[Optional[str], float]:
    """Calculate consensus from responses."""
    if not responses:
        return None, 0.0
    
    # Normalize and count
    normalized = [normalize_response(r) for r in responses]
    counts = {}
    for r in normalized:
        counts[r] = counts.get(r, 0) + 1
    
    # Find most common
    most_common = max(counts.items(), key=lambda x: x[1])
    agreement = most_common[1] / len(responses)
    
    return most_common[0], agreement

# === Agent Factory ===
def create_swarm(size: int, models: list[str], role: str, instructions: str) -> list[Agent]:
    """Create a swarm of agents with round-robin model assignment."""
    agents = []
    for i in range(size):
        model = models[i % len(models)]
        agents.append(Agent(
            id=i,
            model=model,
            role=role,
            instructions=instructions,
        ))
    return agents

# === HFO-Specific Swarm Tasks ===
HIVE_INSTRUCTIONS = """You are an HFO HIVE agent. Follow the HIVE/8 workflow:
- H (Hunt): Research and plan
- I (Interlock): Write failing tests (TDD RED)
- V (Validate): Make tests pass (TDD GREEN)
- E (Evolve): Refactor and prepare next generation

Answer concisely with just the requested information."""

STIGMERGY_INSTRUCTIONS = """You are an OBSIDIAN stigmergy agent. The 8 ports are:
- Port 0: OBSERVE (Sensing)
- Port 1: BRIDGE (Protocol translation)
- Port 2: SHAPE (Data transformation)
- Port 3: INJECT (Payload delivery)
- Port 4: DISRUPT (Testing, chaos)
- Port 5: IMMUNIZE (Validation, defense)
- Port 6: ASSIMILATE (Storage, memory)
- Port 7: NAVIGATE (Decision, orchestration)

Answer concisely with just the requested information."""

SWARM_TASKS = {
    "hive_consensus": [
        SwarmTask("What HIVE phase involves writing failing tests? Answer with just the letter.", "I", HivePhase.I),
        SwarmTask("What is the correct order of HIVE phases? Answer with just the four letters.", "HIVE", HivePhase.H),
        SwarmTask("In which phase do you refactor code? Answer with just the letter.", "E", HivePhase.E),
    ],
    "stigmergy_consensus": [
        SwarmTask("Which port handles testing and chaos? Answer with just the number.", "4", HivePhase.E),
        SwarmTask("What verb corresponds to Port 7? Answer in UPPERCASE.", "NAVIGATE", HivePhase.H),
        SwarmTask("Which port stores data to memory? Answer with just the number.", "6", HivePhase.I),
    ],
    "coordination": [
        SwarmTask("Count from 1 to 5. Answer with just the numbers separated by commas.", "1,2,3,4,5"),
        SwarmTask("What is 7 * 8? Answer with just the number.", "56"),
    ],
}

# === Logging ===
def log_swarm_result(result: SwarmResult, swarm_size: int, models: list[str]):
    """Log swarm result to JSONL."""
    results_dir = Path(__file__).parent / "results"
    results_dir.mkdir(exist_ok=True)
    
    entry = {
        "ts": datetime.now(timezone.utc).isoformat(),
        "type": "SWARM_RESULT",
        "mark": "SWARM_BENCHMARK",
        "swarm_size": swarm_size,
        "models": models,
        "task_prompt": result.task.prompt[:100],
        "expected": result.task.expected,
        "consensus": result.consensus,
        "agreement_rate": result.agreement_rate,
        "total_latency_ms": result.total_latency_ms,
        "correct_count": sum(1 for r in result.results if r.correct),
        "error_count": sum(1 for r in result.results if r.error),
        "hive_phase": result.task.hive_phase.name if result.task.hive_phase else None,
        "hive": "HFO_GEN88",
        "gen": 88,
        "port": 4,
    }
    
    with open(results_dir / "swarm_log.jsonl", "a") as f:
        f.write(json.dumps(entry) + "\n")

# === Main Runner ===
async def run_swarm_evaluation(
    swarm_size: int,
    models: list[str],
    task_set: str,
    instructions: str,
):
    """Run swarm evaluation."""
    print(f"\n{'='*60}")
    print(f"HFO Swarm Evaluation - Powers of 8")
    print(f"{'='*60}")
    print(f"Swarm Size: {swarm_size}")
    print(f"Models: {', '.join(models)}")
    print(f"Task Set: {task_set}")
    print(f"{'='*60}\n")
    
    if task_set not in SWARM_TASKS:
        print(f"ERROR: Unknown task set '{task_set}'")
        print(f"Available: {', '.join(SWARM_TASKS.keys())}")
        return
    
    tasks = SWARM_TASKS[task_set]
    agents = create_swarm(swarm_size, models, "evaluator", instructions)
    
    swarm = OllamaSwarm()
    
    try:
        total_correct = 0
        total_tasks = 0
        
        for i, task in enumerate(tasks):
            print(f"[{i+1}/{len(tasks)}] Running swarm on task...")
            print(f"  Prompt: {task.prompt[:60]}...")
            
            result = await swarm.run_swarm(agents, task)
            
            # Count correct
            correct = sum(1 for r in result.results if r.correct)
            errors = sum(1 for r in result.results if r.error)
            
            print(f"  Consensus: {result.consensus}")
            print(f"  Agreement: {result.agreement_rate*100:.0f}%")
            print(f"  Correct: {correct}/{swarm_size}")
            if errors:
                print(f"  Errors: {errors}")
            print(f"  Latency: {result.total_latency_ms:.0f}ms (parallel)")
            
            total_correct += correct
            total_tasks += swarm_size
            
            # Log result
            log_swarm_result(result, swarm_size, models)
        
        # Summary
        print(f"\n{'='*60}")
        print(f"Swarm Summary")
        print(f"{'='*60}")
        print(f"Total Accuracy: {total_correct}/{total_tasks} ({total_correct/total_tasks*100:.1f}%)")
        print(f"Results logged to results/swarm_log.jsonl")
        print(f"{'='*60}")
        
    finally:
        await swarm.close()

def main():
    parser = argparse.ArgumentParser(description="HFO Swarm Evaluation - Powers of 8")
    parser.add_argument("--size", type=int, choices=[1, 8, 64], default=8,
                        help="Swarm size (powers of 8)")
    parser.add_argument("--models", nargs="+", default=["qwen3:0.6b"],
                        help="Models to use (round-robin assignment)")
    parser.add_argument("--task", default="hive_consensus",
                        choices=list(SWARM_TASKS.keys()),
                        help="Task set to run")
    parser.add_argument("--list-tasks", action="store_true",
                        help="List available task sets")
    
    args = parser.parse_args()
    
    if args.list_tasks:
        print("\nAvailable Swarm Task Sets:")
        print("-" * 40)
        for name, tasks in SWARM_TASKS.items():
            print(f"  {name:20} - {len(tasks)} tasks")
        print("-" * 40)
        return
    
    # Select instructions based on task
    if "hive" in args.task:
        instructions = HIVE_INSTRUCTIONS
    elif "stigmergy" in args.task:
        instructions = STIGMERGY_INSTRUCTIONS
    else:
        instructions = "Answer concisely with just the requested information."
    
    asyncio.run(run_swarm_evaluation(
        swarm_size=args.size,
        models=args.models,
        task_set=args.task,
        instructions=instructions,
    ))

if __name__ == "__main__":
    main()
