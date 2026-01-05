/**
 * 🥈 TEST: Durable Workflow
 * 
 * Authority: Spider Sovereign (The Hunter)
 * Verb: DECIDE
 * Topic: Decision Making & Navigation
 * Provenance: hot_obsidian_sandbox/bronze/P7_DECISION_KINETIC.md
 */
import { describe, it, expect, vi } from 'vitest';
import { hiveSwarmWorkflow } from './durable_workflow.js';

// Mock Temporal and LangGraph
vi.mock('@temporalio/workflow', () => ({
    proxyActivities: vi.fn().mockReturnValue({})
}));

vi.mock('@langchain/langgraph', () => ({
    StateGraph: vi.fn().mockImplementation(() => ({
        addNode: vi.fn().mockReturnThis(),
        addEdge: vi.fn().mockReturnThis(),
        compile: vi.fn().mockReturnValue({
            invoke: vi.fn().mockResolvedValue({ phase: 'V' })
        })
    })),
    MessagesAnnotation: { spec: {} },
    Command: vi.fn()
}));

describe('Durable Workflow', () => {
    it('should execute hiveSwarmWorkflow', async () => {
        const result = await hiveSwarmWorkflow('test context');
        expect(result).toContain('Swarm completed phase: V');
    });
});
