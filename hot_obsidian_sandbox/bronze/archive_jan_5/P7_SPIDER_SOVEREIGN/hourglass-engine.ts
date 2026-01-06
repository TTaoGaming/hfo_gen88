/**
 * ⏳ THE OBSIDIAN HOURGLASS — Engine
 * 
 * Authority: Spider Sovereign (The Social Spider)
 * Verb: NAVIGATE / DECIDE
 * Topic: Durable Swarm Orchestration & Strange Loop Workflows
 * Provenance: hot_obsidian_sandbox/bronze/P7_SPIDER_SOVEREIGN/OBSIDIAN_HOURGLASS.md
 * 
 * This engine implements the Obsidian Hourglass orchestration logic,
 * managing HIVE/8 and PREY/8 strange loops with 1010 swarm patterns.
 * 
 * HOLONIC STRUCTURE:
 * - HIVE/8 = Strategic (PDCA/TDD) - the outer loop
 * - PREY/8 = Tactical (JADC2: Sense → Make Sense → Act → Assess) - inner loops
 * - Each HIVE phase can spawn MULTITUDES of PREY loops
 * - Strange loops are BILATERAL: PREY feeds PREY, PREY feeds HIVE, HIVE drives PREY
 */

import * as fs from 'fs';
import * as path from 'path';
import {
    HIVEPhase,
    PREYPhase,
    WorkflowType,
    SwarmPattern,
    SwarmStep,
    AgentCoordinate,
    AgentIdentity,
    AgentState,
    SwarmConfig,
    SwarmState,
    StrangeLoopEvent,
    Thought,
    HourglassSession,
    HIVEArtifact,
    PREYArtifact,
    GaloisCell,
    HourglassEvent,
    SwarmConfigSchema,
    HourglassSessionSchema,
    StrangeLoopEventSchema,
    ThoughtSchema,
    GaloisCellSchema,
    HourglassEventSchema,
    COMMANDERS,
    HFO_VERBS,
    HIVE_PHASE_PORTS,
    PREY_PHASE_PORTS,
    POWERS_OF_8,
} from './hourglass-contracts';

// =============================================================================
// CONSTANTS
// =============================================================================

const BLACKBOARD_PATH = path.join(process.cwd(), 'obsidianblackboard.jsonl');

/** HIVE phase to swarm step mapping (1010 pattern) */
const HIVE_PHASE_STEPS: Record<HIVEPhase, SwarmStep> = {
    H: 'HUNT_SCATTER',      // 1: Scatter
    I: 'INTERLOCK_GATHER',  // 0: Gather
    V: 'VALIDATE_SCATTER',  // 1: Scatter
    E: 'EVOLVE_GATHER',     // 0: Gather
};

/** PREY phase to swarm step mapping (JADC2: Sense → Make Sense → Act → Assess) */
const PREY_PHASE_STEPS: Record<PREYPhase, SwarmStep> = {
    P: 'PERCEIVE',  // SENSE
    R: 'REACT',     // MAKE SENSE
    E: 'EXECUTE',   // ACT
    Y: 'YIELD',     // ASSESS
};

/** 1010 pattern: 1=scatter (8 agents), 0=gather (1 agent) */
const PATTERN_1010: Record<HIVEPhase, 1 | 0> = {
    H: 1, // Scatter
    I: 0, // Gather
    V: 1, // Scatter
    E: 0, // Gather
};

// =============================================================================
// GALOIS LATTICE RESOLVER
// =============================================================================

/**
 * Resolves the semantic role and purpose from the 8x8 Galois Lattice.
 */
export function resolveGaloisCell(x: number, y: number): GaloisCell {
    const portX = x % 8;
    const portY = y % 8;
    
    const commanderX = COMMANDERS[portX];
    const commanderY = COMMANDERS[portY];
    const verbX = HFO_VERBS[portX];
    const verbY = HFO_VERBS[portY];
    
    const isDiagonal = portX === portY;
    const isAntiDiagonal = portX + portY === 7;
    
    let role = `${commanderX} acting on ${commanderY}`;
    let purpose = `How do we ${verbX} the ${verbY}?`;
    let hivePhase: HIVEPhase | undefined;
    
    if (isDiagonal) {
        role = `Legendary Diagonal: ${commanderX} (Self-Reference)`;
        const diagonalPurposes: Record<number, string> = {
            0: "Meta-sensing. Calibrating sensors and verifying ISR integrity.",
            1: "Protocol stabilization. Hardening the nervous system.",
            2: "Morphological evolution. Refactoring polymorphic adapters.",
            3: "Recursive delivery. Optimizing the spore storm's cascade.",
            4: "Chaos engineering. Testing the test suite.",
            5: "Security hardening. Defending the defenders.",
            6: "Memory compression. Indexing the datalake.",
            7: "Strategic reflection. Deciding on the decision-making process.",
        };
        purpose = diagonalPurposes[portX] || purpose;
    } else if (isAntiDiagonal) {
        const phases: Record<number, HIVEPhase> = {
            0: 'H', 7: 'H',
            1: 'I', 6: 'I',
            2: 'V', 5: 'V',
            3: 'E', 4: 'E',
        };
        hivePhase = phases[portX];
        role = `HIVE Anti-Diagonal: ${hivePhase} (${commanderX} ↔ ${commanderY})`;
        const antiDiagonalPurposes: Record<number, string> = {
            0: "Strategic Hunt: Sensing what the Spider Sovereign decides to target.",
            7: "Strategic Hunt: Deciding what the Lidless Legion should sense.",
            1: "Strategic Interlock: Bridging data for Kraken Keeper assimilation.",
            6: "Strategic Interlock: Assimilating data bridged by the Web Weaver.",
            2: "Strategic Validation: Shaping forms for Pyre Praetorian immunization.",
            5: "Strategic Validation: Immunizing forms shaped by the Mirror Magus.",
            3: "Strategic Evolution: Injecting changes for Red Regnant disruption.",
            4: "Strategic Evolution: Disrupting changes injected by the Spore Storm.",
        };
        purpose = antiDiagonalPurposes[portX] || purpose;
    }
    
    return GaloisCellSchema.parse({
        x: portX,
        y: portY,
        commanderX,
        commanderY,
        verbX,
        verbY,
        role,
        purpose,
        isDiagonal,
        isAntiDiagonal,
        hivePhase,
    });
}

// =============================================================================
// STIGMERGY LOGGING
// =============================================================================

/**
 * Logs an event to the Obsidian Blackboard (stigmergy layer).
 */
export function logToBlackboard(event: Record<string, unknown>): void {
    const entry = JSON.stringify(event) + '\n';
    fs.appendFileSync(BLACKBOARD_PATH, entry);
}

/**
 * Logs a hourglass event to the blackboard.
 */
export function logHourglassEvent(
    workflow: WorkflowType,
    phase: HIVEPhase | PREYPhase,
    pattern: SwarmPattern,
    step: SwarmStep,
    agentCount: number,
    swarmId: string,
    sessionId: string
): void {
    const event = HourglassEventSchema.parse({
        ts: new Date().toISOString(),
        type: 'HOURGLASS_EVENT',
        workflow,
        phase,
        pattern,
        step,
        agentCount,
        swarmId,
        sessionId,
        port: 7,
        hive: 'HFO_GEN88',
        gen: 88,
    });
    logToBlackboard(event);
}

// =============================================================================
// AGENT FACTORY
// =============================================================================

/**
 * Creates an agent identity.
 */
export function createAgentIdentity(
    port: number,
    coordinate: AgentCoordinate,
    swarmId: string,
    parentAgentId?: string
): AgentIdentity {
    return {
        id: `AGENT_${port}_${coordinate.x}_${coordinate.y}_${Date.now()}`,
        port,
        coordinate,
        swarmId,
        parentAgentId,
    };
}

/**
 * Creates an agent state.
 */
export function createAgentState(
    identity: AgentIdentity,
    workflow: WorkflowType,
    phase: HIVEPhase | PREYPhase,
    step: SwarmStep
): AgentState {
    return {
        identity,
        workflow,
        phase,
        step,
        status: 'idle',
        startTime: Date.now(),
    };
}

// =============================================================================
// SWARM FACTORY
// =============================================================================

/**
 * Creates a swarm configuration.
 */
export function createSwarmConfig(
    workflow: WorkflowType,
    context: string,
    pattern: SwarmPattern = '1010',
    agentCount: 1 | 8 | 64 | 512 = 8
): SwarmConfig {
    return SwarmConfigSchema.parse({
        id: `SWARM_${workflow}_${Date.now()}`,
        pattern,
        agentCount,
        workflow,
        context,
    });
}

/**
 * Creates a swarm state from config.
 */
export function createSwarmState(
    config: SwarmConfig,
    initialPhase: HIVEPhase | PREYPhase
): SwarmState {
    const step = config.workflow === 'HIVE'
        ? HIVE_PHASE_STEPS[initialPhase as HIVEPhase]
        : PREY_PHASE_STEPS[initialPhase as PREYPhase];
    
    return {
        config,
        agents: [],
        currentPhase: initialPhase,
        currentStep: step,
        status: 'initializing',
        startTime: Date.now(),
        artifacts: [],
    };
}

// =============================================================================
// THE OBSIDIAN HOURGLASS ENGINE
// =============================================================================

/**
 * The Obsidian Hourglass Engine.
 * Orchestrates HIVE/8 and PREY/8 strange loops with 1010 swarm patterns.
 * 
 * HOLONIC STRUCTURE:
 * - HIVE/8 encompasses PREY/8
 * - Each HIVE phase spawns multitudes of PREY loops
 * - Strange loops are bilateral (PREY ↔ PREY, PREY ↔ HIVE)
 */
export class ObsidianHourglass {
    private session: HourglassSession;
    private thoughtCounter: number = 0;
    private currentDepth: number = 0; // 0 = HIVE level, 1+ = nested PREY
    private preyCountByPhase: Record<HIVEPhase, number> = { H: 0, I: 0, V: 0, E: 0 };
    private currentHivePhase: HIVEPhase | null = null;
    
    constructor(context: string) {
        this.session = HourglassSessionSchema.parse({
            id: `HOURGLASS_${Date.now()}`,
            startTime: Date.now(),
            context,
            hiveSwarms: [],
            preySwarms: [],
            strangeLoops: [],
            thoughts: [],
            status: 'initializing',
            currentWorkflow: 'HIVE',
            currentPhase: 'H',
            currentDepth: 0,
        });
    }
    
    // =========================================================================
    // SESSION MANAGEMENT
    // =========================================================================
    
    /**
     * Gets the current session.
     */
    getSession(): HourglassSession {
        return this.session;
    }
    
    /**
     * Starts the hourglass session.
     */
    start(): void {
        this.session.status = 'running';
        this.logEvent('SESSION_START');
    }
    
    /**
     * Pauses the hourglass session.
     */
    pause(): void {
        this.session.status = 'paused';
        this.logEvent('SESSION_PAUSE');
    }
    
    /**
     * Completes the hourglass session.
     */
    complete(): void {
        this.session.status = 'completed';
        this.session.endTime = Date.now();
        this.logEvent('SESSION_COMPLETE');
    }
    
    /**
     * Fails the hourglass session.
     */
    fail(error: string): void {
        this.session.status = 'failed';
        this.session.endTime = Date.now();
        this.logEvent('SESSION_FAIL', { error });
    }
    
    // =========================================================================
    // HIVE/8 STRATEGIC LOOP
    // =========================================================================
    
    /**
     * Initiates a HIVE/8 strategic loop.
     */
    async initiateHIVE(context: string, agentCount: 1 | 8 | 64 | 512 = 8): Promise<SwarmState> {
        const config = createSwarmConfig('HIVE', context, '1010', agentCount);
        const swarm = createSwarmState(config, 'H');
        
        this.session.hiveSwarms.push(swarm);
        this.session.currentWorkflow = 'HIVE';
        this.session.currentPhase = 'H';
        
        logHourglassEvent('HIVE', 'H', '1010', 'HUNT_SCATTER', agentCount, config.id, this.session.id);
        
        return swarm;
    }
    
    /**
     * Executes a HIVE phase.
     */
    async executeHIVEPhase(
        swarm: SwarmState,
        phase: HIVEPhase,
        executor: (agent: AgentState) => Promise<unknown>
    ): Promise<unknown[]> {
        swarm.currentPhase = phase;
        swarm.currentStep = HIVE_PHASE_STEPS[phase];
        
        const isScatter = PATTERN_1010[phase] === 1;
        const agentCount = isScatter ? swarm.config.agentCount : 1;
        
        swarm.status = isScatter ? 'scattering' : 'gathering';
        
        // Create agents for this phase
        const agents: AgentState[] = [];
        const [portA, portB] = HIVE_PHASE_PORTS[phase];
        
        for (let i = 0; i < agentCount; i++) {
            const port = i % 2 === 0 ? portA : portB;
            const coordinate: AgentCoordinate = { x: port, y: i % 8 };
            const identity = createAgentIdentity(port, coordinate, swarm.config.id);
            const agent = createAgentState(identity, 'HIVE', phase, swarm.currentStep);
            agents.push(agent);
            swarm.agents.push(agent);
        }
        
        // Execute all agents
        const results: unknown[] = [];
        for (const agent of agents) {
            agent.status = 'running';
            try {
                const result = await executor(agent);
                agent.result = result;
                agent.status = 'completed';
                results.push(result);
            } catch (error) {
                agent.error = error instanceof Error ? error.message : String(error);
                agent.status = 'failed';
            }
            agent.endTime = Date.now();
        }
        
        swarm.artifacts.push(...results);
        
        logHourglassEvent(
            'HIVE',
            phase,
            swarm.config.pattern,
            swarm.currentStep,
            agentCount,
            swarm.config.id,
            this.session.id
        );
        
        return results;
    }
    
    /**
     * Runs a full HIVE/8 cycle (H → I → V → E).
     */
    async runHIVECycle(
        context: string,
        executors: {
            hunt: (agent: AgentState) => Promise<unknown>;
            interlock: (agent: AgentState) => Promise<unknown>;
            validate: (agent: AgentState) => Promise<unknown>;
            evolve: (agent: AgentState) => Promise<unknown>;
        },
        agentCount: 1 | 8 | 64 | 512 = 8
    ): Promise<{ swarm: SwarmState; artifacts: Record<HIVEPhase, unknown[]> }> {
        const swarm = await this.initiateHIVE(context, agentCount);
        
        const artifacts: Record<HIVEPhase, unknown[]> = {
            H: [],
            I: [],
            V: [],
            E: [],
        };
        
        // H: Hunt (Scatter)
        artifacts.H = await this.executeHIVEPhase(swarm, 'H', executors.hunt);
        
        // I: Interlock (Gather)
        artifacts.I = await this.executeHIVEPhase(swarm, 'I', executors.interlock);
        
        // V: Validate (Scatter)
        artifacts.V = await this.executeHIVEPhase(swarm, 'V', executors.validate);
        
        // E: Evolve (Gather)
        artifacts.E = await this.executeHIVEPhase(swarm, 'E', executors.evolve);
        
        swarm.status = 'completed';
        swarm.endTime = Date.now();
        
        this.session.iterationCount++;
        
        return { swarm, artifacts };
    }
    
    // =========================================================================
    // PREY/8 TACTICAL LOOP
    // =========================================================================
    
    /**
     * Initiates a PREY/8 tactical loop nested within a HIVE phase.
     * PREY loops are spawned by HIVE phases and feed back into them.
     */
    async initiatePREY(context: string, parentHivePhase?: HIVEPhase): Promise<SwarmState> {
        const config = createSwarmConfig('PREY', context, '1010', 1);
        const swarm = createSwarmState(config, 'P');
        
        // Track nesting
        this.currentDepth++;
        if (parentHivePhase) {
            this.preyCountByPhase[parentHivePhase]++;
            this.currentHivePhase = parentHivePhase;
        }
        
        this.session.preySwarms.push(swarm);
        this.session.currentWorkflow = 'PREY';
        this.session.currentPhase = 'P';
        
        logHourglassEvent('PREY', 'P', '1010', 'PERCEIVE', 1, config.id, this.session.id);
        
        return swarm;
    }
    
    /**
     * Executes a PREY phase (single agent using correct port pair).
     */
    async executePREYPhase(
        swarm: SwarmState,
        phase: PREYPhase,
        executor: (agent: AgentState) => Promise<unknown>
    ): Promise<unknown> {
        swarm.currentPhase = phase;
        swarm.currentStep = PREY_PHASE_STEPS[phase];
        swarm.status = 'scattering'; // PREY is always single-agent
        
        // Get the correct port pair for this PREY phase
        const [portA, portB] = PREY_PHASE_PORTS[phase];
        const port = portA; // Primary port for the phase
        
        // Create single agent for PREY with correct port
        const coordinate: AgentCoordinate = { x: port, y: ['P', 'R', 'E', 'Y'].indexOf(phase) };
        const identity = createAgentIdentity(port, coordinate, swarm.config.id);
        const agent = createAgentState(identity, 'PREY', phase, swarm.currentStep);
        swarm.agents.push(agent);
        
        agent.status = 'running';
        try {
            const result = await executor(agent);
            agent.result = result;
            agent.status = 'completed';
            swarm.artifacts.push(result);
            
            logHourglassEvent(
                'PREY',
                phase,
                swarm.config.pattern,
                swarm.currentStep,
                1,
                swarm.config.id,
                this.session.id
            );
            
            return result;
        } catch (error) {
            agent.error = error instanceof Error ? error.message : String(error);
            agent.status = 'failed';
            throw error;
        } finally {
            agent.endTime = Date.now();
        }
    }
    
    /**
     * Runs a full PREY/8 cycle (P → R → E → Y) - JADC2: Sense → Make Sense → Act → Assess.
     * Can be nested within a HIVE phase or run standalone.
     */
    async runPREYCycle(
        context: string,
        executors: {
            perceive: (agent: AgentState) => Promise<unknown>;
            react: (agent: AgentState) => Promise<unknown>;
            execute: (agent: AgentState) => Promise<unknown>;
            yield: (agent: AgentState) => Promise<unknown>;
        },
        parentHivePhase?: HIVEPhase
    ): Promise<{ swarm: SwarmState; artifacts: Record<PREYPhase, unknown> }> {
        const swarm = await this.initiatePREY(context, parentHivePhase);
        
        const artifacts: Record<PREYPhase, unknown> = {
            P: null,
            R: null,
            E: null,
            Y: null,
        };
        
        // P: Perceive (SENSE)
        artifacts.P = await this.executePREYPhase(swarm, 'P', executors.perceive);
        
        // R: React (MAKE SENSE)
        artifacts.R = await this.executePREYPhase(swarm, 'R', executors.react);
        
        // E: Execute (ACT)
        artifacts.E = await this.executePREYPhase(swarm, 'E', executors.execute);
        
        // Y: Yield (ASSESS)
        artifacts.Y = await this.executePREYPhase(swarm, 'Y', executors.yield);
        
        swarm.status = 'completed';
        swarm.endTime = Date.now();
        
        // Restore depth after PREY completes
        this.currentDepth = Math.max(0, this.currentDepth - 1);
        if (this.currentDepth === 0) {
            this.session.currentWorkflow = 'HIVE';
            if (this.currentHivePhase) {
                this.session.currentPhase = this.currentHivePhase;
            }
        }
        
        return { swarm, artifacts };
    }
    
    // =========================================================================
    // STRANGE LOOP MECHANICS
    // =========================================================================
    
    /**
     * Records a strange loop transition.
     * Strange loops are BILATERAL - they feed each other in both directions.
     */
    recordStrangeLoop(
        fromWorkflow: WorkflowType,
        fromPhase: HIVEPhase | PREYPhase,
        fromSwarmId: string,
        toWorkflow: WorkflowType,
        toPhase: HIVEPhase | PREYPhase,
        artifact: unknown,
        toSwarmId?: string,
        parentHivePhase?: HIVEPhase,
        preySequence?: number
    ): StrangeLoopEvent {
        const loopType = `${fromWorkflow}_TO_${toWorkflow}` as StrangeLoopEvent['loopType'];
        
        const event = StrangeLoopEventSchema.parse({
            id: `LOOP_${Date.now()}`,
            timestamp: Date.now(),
            from: { 
                workflow: fromWorkflow, 
                phase: fromPhase, 
                swarmId: fromSwarmId,
                depth: fromWorkflow === 'PREY' ? this.currentDepth : 0,
            },
            to: { 
                workflow: toWorkflow, 
                phase: toPhase, 
                swarmId: toSwarmId,
                depth: toWorkflow === 'PREY' ? this.currentDepth + 1 : 0,
            },
            artifact,
            loopType,
            parentHivePhase,
            preySequence,
        });
        
        this.session.strangeLoops.push(event);
        this.logEvent('STRANGE_LOOP', event);
        
        return event;
    }
    
    /**
     * Spawns a PREY loop within a HIVE phase (HIVE → PREY strange loop).
     * This is the primary way HIVE phases execute tactical operations.
     */
    async spawnPREYWithinHIVE(
        hivePhase: HIVEPhase,
        hiveSwarmId: string,
        preyContext: string,
        preyExecutors: {
            perceive: (agent: AgentState) => Promise<unknown>;
            react: (agent: AgentState) => Promise<unknown>;
            execute: (agent: AgentState) => Promise<unknown>;
            yield: (agent: AgentState) => Promise<unknown>;
        }
    ): Promise<{ swarm: SwarmState; artifacts: Record<PREYPhase, unknown> }> {
        const preySequence = this.preyCountByPhase[hivePhase] + 1;
        
        // Record the HIVE → PREY strange loop
        this.recordStrangeLoop(
            'HIVE', hivePhase, hiveSwarmId,
            'PREY', 'P',
            { context: preyContext },
            undefined,
            hivePhase,
            preySequence
        );
        
        // Run the PREY cycle nested within this HIVE phase
        const result = await this.runPREYCycle(preyContext, preyExecutors, hivePhase);
        
        // Record the PREY → HIVE strange loop (yield feeds back to HIVE)
        this.recordStrangeLoop(
            'PREY', 'Y', result.swarm.config.id,
            'HIVE', hivePhase,
            result.artifacts.Y,
            hiveSwarmId,
            hivePhase,
            preySequence
        );
        
        return result;
    }
    
    /**
     * Chains PREY loops (PREY N yield → PREY N+1 perceive).
     * Used for tactical sequences within a HIVE phase.
     */
    async chainPREY(
        previousPreySwarm: SwarmState,
        previousYield: unknown,
        nextContext: string,
        nextExecutors: {
            perceive: (agent: AgentState) => Promise<unknown>;
            react: (agent: AgentState) => Promise<unknown>;
            execute: (agent: AgentState) => Promise<unknown>;
            yield: (agent: AgentState) => Promise<unknown>;
        }
    ): Promise<{ swarm: SwarmState; artifacts: Record<PREYPhase, unknown> }> {
        // Record PREY → PREY strange loop
        this.recordStrangeLoop(
            'PREY', 'Y', previousPreySwarm.config.id,
            'PREY', 'P',
            previousYield,
            undefined,
            this.currentHivePhase || undefined,
            this.currentHivePhase ? this.preyCountByPhase[this.currentHivePhase] + 1 : undefined
        );
        
        return this.runPREYCycle(nextContext, nextExecutors, this.currentHivePhase || undefined);
    }
    
    /**
     * Triggers a HIVE → PREY strange loop (strategic triggers tactical).
     */
    async hiveToPreyLoop(
        hiveSwarm: SwarmState,
        artifact: unknown,
        preyContext: string,
        preyExecutors: {
            perceive: (agent: AgentState) => Promise<unknown>;
            react: (agent: AgentState) => Promise<unknown>;
            execute: (agent: AgentState) => Promise<unknown>;
            yield: (agent: AgentState) => Promise<unknown>;
        }
    ): Promise<{ swarm: SwarmState; artifacts: Record<PREYPhase, unknown> }> {
        this.recordStrangeLoop(
            'HIVE',
            hiveSwarm.currentPhase as HIVEPhase,
            hiveSwarm.config.id,
            'PREY',
            'P',
            artifact
        );
        
        return this.runPREYCycle(preyContext, preyExecutors, hiveSwarm.config.id);
    }
    
    /**
     * Triggers a PREY → HIVE strange loop (tactical informs strategic).
     */
    async preyToHiveLoop(
        preySwarm: SwarmState,
        artifact: unknown,
        hiveContext: string,
        hiveExecutors: {
            hunt: (agent: AgentState) => Promise<unknown>;
            interlock: (agent: AgentState) => Promise<unknown>;
            validate: (agent: AgentState) => Promise<unknown>;
            evolve: (agent: AgentState) => Promise<unknown>;
        },
        agentCount: 1 | 8 | 64 | 512 = 8
    ): Promise<{ swarm: SwarmState; artifacts: Record<HIVEPhase, unknown[]> }> {
        this.recordStrangeLoop(
            'PREY',
            preySwarm.currentPhase as PREYPhase,
            preySwarm.config.id,
            'HIVE',
            'H',
            artifact
        );
        
        return this.runHIVECycle(hiveContext, hiveExecutors, agentCount);
    }
    
    // =========================================================================
    // THOUGHT MANAGEMENT
    // =========================================================================
    
    /**
     * Records a thought in the sequential thinking chain.
     */
    think(params: {
        thought: string;
        nextThoughtNeeded: boolean;
        isRevision?: boolean;
        revisesThought?: number;
        parentId?: number;
        agentId?: string;
        coordinate?: AgentCoordinate;
        swarmPattern?: SwarmPattern;
        step?: SwarmStep;
        workflow?: WorkflowType;
        phase?: string;
    }): Thought {
        this.thoughtCounter++;
        
        let semanticRole: string | undefined;
        let purpose: string | undefined;
        
        if (params.coordinate) {
            const cell = resolveGaloisCell(params.coordinate.x, params.coordinate.y);
            semanticRole = cell.role;
            purpose = cell.purpose;
        }
        
        const thought = ThoughtSchema.parse({
            thoughtNumber: this.thoughtCounter,
            totalThoughts: Math.max(8, this.thoughtCounter),
            thought: params.thought,
            isRevision: params.isRevision ?? false,
            revisesThought: params.revisesThought,
            parentId: params.parentId,
            agentId: params.agentId ?? 'SPIDER_SOVEREIGN_P7',
            coordinate: params.coordinate,
            semanticRole,
            purpose,
            swarmPattern: params.swarmPattern,
            step: params.step,
            nextThoughtNeeded: params.nextThoughtNeeded,
            timestamp: new Date().toISOString(),
            port: 7,
            workflow: params.workflow,
            phase: params.phase,
        });
        
        this.session.thoughts.push(thought);
        logToBlackboard(thought);
        
        return thought;
    }
    
    /**
     * Gets all thoughts in the session.
     */
    getThoughts(): Thought[] {
        return this.session.thoughts;
    }
    
    // =========================================================================
    // INTERNAL HELPERS
    // =========================================================================
    
    private logEvent(type: string, data?: Record<string, unknown>): void {
        logToBlackboard({
            ts: new Date().toISOString(),
            type,
            sessionId: this.session.id,
            port: 7,
            hive: 'HFO_GEN88',
            gen: 88,
            ...data,
        });
    }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

/**
 * Creates a new Obsidian Hourglass instance.
 */
export function createHourglass(context: string): ObsidianHourglass {
    return new ObsidianHourglass(context);
}
