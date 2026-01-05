/**
 * 🕷️ DURABLE WORKFLOW COORDINATOR
 * 
 * Integrates Temporal (Durable Execution) and LangGraph (Stateful Agents).
 * Orchestrates the HIVE/8:1010 Swarm Pattern.
 */

import { proxyActivities } from '@temporalio/workflow';
import { StateGraph, MessagesAnnotation, Command } from "@langchain/langgraph";
import { Navigator } from './navigator.js';

// Temporal Activities (Stateless, Retriable)
const activities = proxyActivities({
    startToCloseTimeout: '1 minute',
});

/**
 * LangGraph State Definition
 */
const SwarmState = {
    ...MessagesAnnotation.spec,
    phase: { value: (x: string) => x, default: () => 'H' },
    results: { value: (x: any[]) => x.concat(x), default: () => [] },
};

/**
 * LangGraph Node: Hunt Agent (Scatter)
 */
const huntAgent = async (state: any) => {
    const navigator = new Navigator();
    const agentId = `HUNT_AGENT_${state.results.length}`;
    
    await navigator.think({
        thought: `LangGraph Agent ${agentId} performing hunt.`,
        nextThoughtNeeded: true,
        agentId,
        swarmPattern: "HIVE/8:1010",
        step: "HUNT_SCATTER",
        coordinate: { x: state.results.length, y: 0 },
        workflow: 'HIVE',
        phase: 'H'
    });

    return new Command({
        update: {
            results: [{ agentId, data: "Found exemplar X" }],
            messages: [`Agent ${agentId} completed hunt.`]
        },
        goto: state.results.length < 7 ? "huntAgent" : "interlockMaster"
    });
};

/**
 * LangGraph Node: Interlock Master (Gather)
 */
const interlockMaster = async (state: any) => {
    const navigator = new Navigator();
    
    await navigator.think({
        thought: `LangGraph Interlock Master gathering ${state.results.length} results.`,
        nextThoughtNeeded: true,
        agentId: "INTERLOCK_MASTER",
        swarmPattern: "HIVE/8:1010",
        step: "INTERLOCK_GATHER",
        coordinate: { x: 0, y: 1 },
        workflow: 'HIVE',
        phase: 'I'
    });

    return {
        messages: ["Interlock complete. Moving to Validation."],
        phase: 'V'
    };
};

/**
 * Temporal Workflow: HIVE Swarm Orchestration
 */
export async function hiveSwarmWorkflow(context: string): Promise<string> {
    const navigator = new Navigator();
    
    // 1. HUNT (Scatter)
    await navigator.hive('H', `Temporal Workflow starting HUNT for: ${context}`);
    
    // Compile LangGraph for the Hunt/Interlock phase
    const workflow = new StateGraph({ channels: SwarmState })
        .addNode("huntAgent", huntAgent)
        .addNode("interlockMaster", interlockMaster)
        .addEdge("__start__", "huntAgent")
        .compile();

    const finalState = await workflow.invoke({ messages: [context] });

    return `Swarm completed phase: ${finalState.phase}`;
}
