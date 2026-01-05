/**
 * 🕷️ PORT 7: SPIDER SOVEREIGN (The Navigator)
 * 
 * Authority: Spider Sovereign (The Hunter)
 * Verb: DECIDE
 * Topic: Decision Making & Navigation
 * Provenance: hot_obsidian_sandbox/bronze/P7_DECISION_KINETIC.md
 * 
 * This port implements the Sequential Thinking engine.
 */

import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';

const VacuoleEnvelope = <T extends z.ZodTypeAny>(schema: T, data: unknown) => schema.parse(data);

const ThoughtSchema = z.object({
    thoughtNumber: z.number(),
    totalThoughts: z.number(),
    thought: z.string(),
    isRevision: z.boolean().optional(),
    revisesThought: z.number().optional(),
    parentId: z.number().optional(), // Link tactical PREY to strategic HIVE
    agentId: z.string().default('SPIDER_SOVEREIGN_P7'),
    coordinate: z.object({
        x: z.number(), // Port (0-7)
        y: z.number(), // Phase (0-7)
        z: z.number().optional() // Depth
    }).optional(),
    semanticRole: z.string().optional(), // Resolved from Galois Lattice
    purpose: z.string().optional(), // Resolved from Galois Lattice
    swarmPattern: z.string().optional(), // e.g., "HIVE/8:1010"
    step: z.string().optional(), // e.g., "HUNT_SCATTER", "INTERLOCK_GATHER"
    nextThoughtNeeded: z.boolean(),
    timestamp: z.string().default(() => new Date().toISOString()),
    port: z.literal(7),
    workflow: z.enum(['HIVE', 'PREY']).optional(),
    phase: z.string().optional()
});

export type Thought = z.infer<typeof ThoughtSchema>;

const BLACKBOARD_PATH = path.join(process.cwd(), 'obsidianblackboard.jsonl');

/**
 * H-POMDP Octree Node for State-Action Space Navigation.
 * Base-8 partitioning for high-dimensional cognitive mapping.
 */
interface OctreeNode {
    id: string;
    depth: number;
    children: (OctreeNode | null)[]; // Exactly 8 children
    state: unknown; // @bespoke H-POMDP state
    action: string;
    value: number;
}

/**
 * Logs a thought to the Obsidian Blackboard.
 */
function logToBlackboard(thought: Thought) {
    const entry = JSON.stringify(thought) + '\n';
    fs.appendFileSync(BLACKBOARD_PATH, entry);
}

/**
 * The Sequential Thinking Engine (Spider Sovereign).
 * Implements Strategic HIVE/8 and Tactical PREY/8 Strange Loops.
 * Uses H-POMDP with SVDAG/Octree for state-action navigation.
 */
export class Navigator {
    private thoughts: Thought[] = [];
    private totalThoughts: number = 8; // Base 8
    private root: OctreeNode;

    constructor(initialTotalThoughts: number = 8) {
        this.totalThoughts = initialTotalThoughts;
        this.root = this.createNode('root', 0, 'INITIAL_STATE', 'START');
    }

    private createNode(id: string, depth: number, state: unknown, action: string): OctreeNode { // @bespoke H-POMDP state
        return {
            id,
            depth,
            children: new Array(8).fill(null),
            state,
            action,
            value: 0
        };
    }

    /**
     * Resolves the semantic role and purpose from the 8x8 Galois Lattice.
     * X: Port (0-7) | Y: Port (0-7)
     */
    private resolveGaloisLattice(x: number, y: number): { role: string; purpose: string } {
        const commanders = [
            "Lidless Legion",
            "Web Weaver",
            "Mirror Magus",
            "Spore Storm",
            "Red Regnant",
            "Pyre Praetorian",
            "Kraken Keeper",
            "Spider Sovereign"
        ];

        const verbs = [
            "OBSERVE",
            "BRIDGE",
            "SHAPE",
            "INJECT",
            "DISRUPT",
            "IMMUNIZE",
            "ASSIMILATE",
            "NAVIGATE"
        ];

        const portX = x % 8;
        const portY = y % 8;
        
        const commanderX = commanders[portX];
        const commanderY = commanders[portY];
        const verbX = verbs[portX];
        const verbY = verbs[portY];

        let role = `${commanderX} acting on ${commanderY}`;
        let purpose = `How do we ${verbX} the ${verbY}?`;

        // Special Patterns from the 8x8 Galois Lattice Geometry
        if (portX === portY) {
            role = `Legendary Diagonal: ${commanderX} (Self-Reference)`;
            const diagonalPurposes: Record<number, string> = {
                0: "Meta-sensing. Calibrating sensors and verifying ISR integrity.",
                1: "Protocol stabilization. Hardening the nervous system and optimizing web latency.",
                2: "Morphological evolution. Refactoring polymorphic adapters and UI primitives.",
                3: "Recursive delivery. Optimizing the spore storm's cascade and emission rate.",
                4: "Chaos engineering. Testing the test suite and red-teaming the Red Regnant.",
                5: "Security hardening. Defending the defenders and verifying Pyre integrity.",
                6: "Memory compression. Indexing the datalake and optimizing MAP ELITE storage.",
                7: "Strategic reflection. The Spider Sovereign deciding on the decision-making process."
            };
            purpose = diagonalPurposes[portX] || purpose;
        } else if (portX + portY === 7) {
            const phases: Record<number, string> = {
                0: "HUNT", 7: "HUNT",
                1: "INTERLOCK", 6: "INTERLOCK",
                2: "VALIDATE", 5: "VALIDATE",
                3: "EVOLVE", 4: "EVOLVE"
            };
            role = `HIVE Anti-Diagonal: ${phases[portX]} (${commanderX} ↔ ${commanderY})`;
            const antiDiagonalPurposes: Record<number, string> = {
                0: "Strategic Hunt: Sensing what the Spider Sovereign decides to target.",
                7: "Strategic Hunt: Deciding what the Lidless Legion should sense.",
                1: "Strategic Interlock: Bridging data for Kraken Keeper assimilation.",
                6: "Strategic Interlock: Assimilating data bridged by the Web Weaver.",
                2: "Strategic Validation: Shaping forms for Pyre Praetorian immunization.",
                5: "Strategic Validation: Immunizing forms shaped by the Mirror Magus.",
                3: "Strategic Evolution: Injecting changes for Red Regnant disruption.",
                4: "Strategic Evolution: Disrupting changes injected by the Spore Storm."
            };
            purpose = antiDiagonalPurposes[portX] || purpose;
        }

        return { role, purpose };
    }

    /**
     * Navigates the H-POMDP state-action space using Octree partitioning.
     */
    public async navigate(state: any, action: string): Promise<OctreeNode> {
        await this.hive('I', `Navigating H-POMDP state-action space at depth ${this.root.depth}.`);
        
        // Simple Octree traversal/expansion logic
        let current = this.root;
        const childIndex = Math.abs(JSON.stringify(state).length % 8);
        
        if (!current.children[childIndex]) {
            current.children[childIndex] = this.createNode(
                `${current.id}.${childIndex}`,
                current.depth + 1,
                state,
                action
            );
            await this.hive('V', `Expanded Octree at index ${childIndex} for state-action mapping.`);
        }

        return current.children[childIndex]!;
    }

    /**
     * Core thinking step.
     */
    public async think(params: {
        thought: string;
        nextThoughtNeeded: boolean;
        isRevision?: boolean;
        revisesThought?: number;
        parentId?: number;
        agentId?: string;
        coordinate?: { x: number; y: number; z?: number };
        swarmPattern?: string;
        step?: string;
        workflow?: 'HIVE' | 'PREY';
        phase?: string;
    }): Promise<number> {
        const thoughtNumber = this.thoughts.length + 1;
        
        let semanticRole = undefined;
        let purpose = undefined;
        
        if (params.coordinate) {
            const lattice = this.resolveGaloisLattice(params.coordinate.x, params.coordinate.y);
            semanticRole = lattice.role;
            purpose = lattice.purpose;
        }

        const thought: Thought = VacuoleEnvelope(ThoughtSchema, {
            thoughtNumber,
            totalThoughts: this.totalThoughts,
            thought: params.thought,
            isRevision: params.isRevision,
            revisesThought: params.revisesThought,
            parentId: params.parentId,
            agentId: params.agentId || 'SPIDER_SOVEREIGN_P7',
            coordinate: params.coordinate,
            semanticRole,
            purpose,
            swarmPattern: params.swarmPattern,
            step: params.step,
            nextThoughtNeeded: params.nextThoughtNeeded,
            port: 7,
            workflow: params.workflow,
            phase: params.phase
        });

        this.thoughts.push(thought);
        logToBlackboard(thought);

        // Base 8 expansion
        if (thoughtNumber >= this.totalThoughts) {
            this.totalThoughts *= 8; 
        }

        return thoughtNumber;
    }

    /**
     * Swarm Orchestration: HIVE/8:1010
     * 1: Scatter (8 agents)
     * 0: Gather (1 agent)
     */
    public async swarm(pattern: "1010", phase: 'H' | 'I' | 'V' | 'E', context: string) {
        const swarmId = `SWARM_${Date.now()}`;
        
        if (phase === 'H') {
            // 1: HUNT SCATTER (8 Agents)
            await this.hive('H', `Initiating HUNT SCATTER (8 agents) for: ${context}`, true);
            for (let i = 0; i < 8; i++) {
                await this.think({
                    thought: `Agent ${i} hunting in sector ${i}`,
                    nextThoughtNeeded: true,
                    agentId: `HUNT_AGENT_${i}`,
                    swarmPattern: "HIVE/8:1010",
                    step: "HUNT_SCATTER",
                    coordinate: { x: i, y: 0 },
                    workflow: 'HIVE',
                    phase: 'H'
                });
            }
        } else if (phase === 'I') {
            // 0: INTERLOCK GATHER (1 Agent)
            await this.hive('I', `Initiating INTERLOCK GATHER (1 agent) for: ${context}`, true);
            await this.think({
                thought: `Gathering hunt results into unified contract.`,
                nextThoughtNeeded: true,
                agentId: `INTERLOCK_MASTER`,
                swarmPattern: "HIVE/8:1010",
                step: "INTERLOCK_GATHER",
                coordinate: { x: 0, y: 1 },
                workflow: 'HIVE',
                phase: 'I'
            });
        }
        // ... and so on for V (Scatter) and E (Gather)
    }

    /**
     * Strategic HIVE/8 Loop: H (Hindsight), I (Insight), V (Validation), E (Evolution)
     * Evolution is a Strange Loop point that feeds the next iteration.
     */
    public async hive(phase: 'H' | 'I' | 'V' | 'E', thought: string, nextThoughtNeeded: boolean = true, isRevision: boolean = false): Promise<number> {
        const id = await this.think({
            thought,
            nextThoughtNeeded,
            workflow: 'HIVE',
            phase,
            isRevision
        });

        if (phase === 'E') {
            // Strange Loop: Evolution feeds the next HIVE iteration or PREY execution
            await this.think({
                thought: "STRANGE LOOP: Evolution phase complete. Feeding artifacts to next workflow.",
                nextThoughtNeeded: true,
                phase: 'E',
                workflow: 'HIVE',
                parentId: id
            });
        }

        return id;
    }

    /**
     * Tactical PREY/8 Loop: P (Perceive), R (React), E (Execute), Y (Yield)
     * Yield is a Strange Loop point that feeds the next workflow as an artifact.
     */
    public async prey(phase: 'P' | 'R' | 'E' | 'Y', thought: string, nextThoughtNeeded: boolean = true, isRevision: boolean = false, parentId?: number): Promise<number> {
        const id = await this.think({
            thought,
            nextThoughtNeeded,
            workflow: 'PREY',
            phase,
            isRevision,
            parentId
        });

        if (phase === 'Y') {
            // Strange Loop: Yield feeds the next workflow as an artifact
            await this.think({
                thought: "STRANGE LOOP: Yielding tactical artifact to strategic HIVE.",
                nextThoughtNeeded: true,
                phase: 'Y',
                workflow: 'PREY',
                parentId: id
            });
        }

        return id;
    }

    /**
     * Use Port 0 (via Port 1) to sense the web using the PREY workflow.
     * Hunting uses PREY within the HIVE 'H' phase.
     */
    public async senseWeb(query: string) {
        const { sense } = await import('../P1_WEB_WEAVER/bridger.js');
        const hiveId = await this.hive('H', `Hunting for: "${query}" using tactical PREY loop.`);
        await this.prey('P', `Perceiving the web for: "${query}" via Port 0 Lidless Legion.`, true, false, hiveId);
        
        try {
            const results = await sense(query);
            await this.prey('R', `Reacting to ${results.results.length} results from the web.`, true, false, hiveId);
            await this.prey('Y', `Yielding web results for query: ${query}`, false, false, hiveId);
            return results;
        } catch (error) {
            await this.prey('Y', `Web sensing failed: ${error instanceof Error ? error.message : String(error)}`, true, true, hiveId);
            throw error;
        }
    }

    public getHistory() {
        return this.thoughts;
    }
}
