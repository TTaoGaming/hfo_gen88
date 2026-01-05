/**
 * 🥈 TEST: Port 7 Spider Sovereign
 * 
 * Authority: Spider Sovereign (The Hunter)
 * Verb: DECIDE
 * Topic: Decision Making & Navigation
 * Provenance: hot_obsidian_sandbox/bronze/P7_DECISION_KINETIC.md
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Navigator } from './navigator.js';
import * as path from 'path';

vi.mock('../P1_WEB_WEAVER/bridger.js', () => ({
    sense: vi.fn()
}));

describe('Port 7: Spider Sovereign (Navigator)', () => {
    let navigator: Navigator;
    const blackboardPath = path.join(process.cwd(), 'obsidianblackboard.jsonl');

    beforeEach(() => {
        navigator = new Navigator(8);
        vi.clearAllMocks();
    });

    it('should log thoughts to the blackboard with base 8 expansion, agentId, and Galois Lattice semantics', async () => {
        await navigator.think({
            thought: 'Initial observation.',
            nextThoughtNeeded: true,
            coordinate: { x: 1, y: 6 } // Web Weaver (1) acting on Kraken Keeper (6) -> INTERLOCK
        });

        const history = navigator.getHistory();
        expect(history[0].totalThoughts).toBe(8);
        expect(history[0].port).toBe(7);
        expect(history[0].agentId).toBe('SPIDER_SOVEREIGN_P7');
        expect(history[0].coordinate).toEqual({ x: 1, y: 6 });
        expect(history[0].semanticRole).toContain('HIVE Anti-Diagonal: INTERLOCK');
        expect(history[0].semanticRole).toContain('Web Weaver ↔ Kraken Keeper');
        expect(history[0].purpose).toBe('Strategic Interlock: Bridging data for Kraken Keeper assimilation.');
    });

    it('should resolve Legendary Diagonal quines', async () => {
        await navigator.think({
            thought: 'Self-reflection.',
            nextThoughtNeeded: true,
            coordinate: { x: 7, y: 7 } // Spider Sovereign (7) acting on itself
        });

        const history = navigator.getHistory();
        expect(history[0].semanticRole).toBe('Legendary Diagonal: Spider Sovereign (Self-Reference)');
        expect(history[0].purpose).toBe('Strategic reflection. The Spider Sovereign deciding on the decision-making process.');
    });

    it('should implement swarm orchestration markings (HIVE/8:1010)', async () => {
        await navigator.swarm("1010", 'H', 'Test Swarm');
        
        const history = navigator.getHistory();
        const huntScatter = history.filter(t => t.step === 'HUNT_SCATTER');
        expect(huntScatter.length).toBe(8);
        expect(huntScatter[0].swarmPattern).toBe("HIVE/8:1010");
        expect(huntScatter[0].coordinate).toBeDefined();
    });

    it('should implement the Strategic HIVE/8 Loop', async () => {
        await navigator.hive('H', 'Researching the problem space.');
        await navigator.hive('I', 'Defining contracts.');
        
        const history = navigator.getHistory();
        expect(history[0].workflow).toBe('HIVE');
        expect(history[0].phase).toBe('H');
        expect(history[1].phase).toBe('I');
    });

    it('should implement the Tactical PREY/8 Loop with React phase', async () => {
        await navigator.prey('P', 'Perceiving environment.');
        await navigator.prey('R', 'Reacting to data.');
        
        const history = navigator.getHistory();
        expect(history[0].workflow).toBe('PREY');
        expect(history[0].phase).toBe('P');
        expect(history[1].phase).toBe('R');
    });

    it('should trigger Strange Loop on Yield and Evolution', async () => {
        await navigator.prey('Y', 'Yielding result.');
        await navigator.hive('E', 'Evolving system.');
        
        const history = navigator.getHistory();
        expect(history.some(t => t.thought.includes('STRANGE LOOP: Yielding'))).toBe(true);
        expect(history.some(t => t.thought.includes('STRANGE LOOP: Evolution'))).toBe(true);
    });

    it('should implement hierarchical stigmergy (PREY linked to HIVE)', async () => {
        const hiveId = await navigator.hive('H', 'Strategic Hunt');
        await navigator.prey('P', 'Tactical Perceive', true, false, hiveId);
        
        const history = navigator.getHistory();
        expect(history[1].parentId).toBe(hiveId);
        expect(history[1].workflow).toBe('PREY');
    });

    it('should integrate with Port 0 via Port 1 using PREY within HIVE H with hierarchy', async () => {
        const { sense } = await import('../P1_WEB_WEAVER/bridger.js');
        const mockResults = {
            results: [{ title: 'Test Result', url: 'https://test.com', content: 'Test content', score: 0.9 }],
            query: 'test query',
            responseTime: 100
        };
        (sense as any).mockResolvedValue(mockResults); // @bespoke mock access

        const results = await navigator.senseWeb('test query');
        
        expect(sense).toHaveBeenCalledWith('test query');
        expect(results).toEqual(mockResults);
        
        const history = navigator.getHistory();
        const hiveH = history.find(t => t.workflow === 'HIVE' && t.phase === 'H' && t.thought.includes('Hunting for'));
        expect(hiveH).toBeDefined();
        
        const preySteps = history.filter(t => t.workflow === 'PREY' && t.parentId === hiveH?.thoughtNumber);
        expect(preySteps.length).toBeGreaterThan(0);
    });

    it('should handle failures and log them as revisions', async () => {
        const { sense } = await import('../P1_WEB_WEAVER/bridger.js');
        (sense as any).mockRejectedValue(new Error('API Down')); // @bespoke mock access

        await expect(navigator.senseWeb('fail query')).rejects.toThrow('API Down');
        
        const history = navigator.getHistory();
        const failureThought = history.find(t => t.thought.includes('Web sensing failed'));
        expect(failureThought).toBeDefined();
        expect(failureThought?.isRevision).toBe(true);
    });

    it('should navigate H-POMDP state-action space using Octree', async () => {
        const state = { context: 'test' };
        const action = 'SEARCH';
        const node = await navigator.navigate(state, action);
        
        expect(node.depth).toBe(1);
        expect(node.state).toEqual(state);
        expect(node.action).toBe(action);
        expect(node.children.length).toBe(8);
        
        const history = navigator.getHistory();
        expect(history.some(t => t.thought.includes('Navigating H-POMDP'))).toBe(true);
        expect(history.some(t => t.thought.includes('Expanded Octree'))).toBe(true);
    });
});
