/**
 * ⏳ THE OBSIDIAN HOURGLASS — Contracts
 * 
 * Authority: Spider Sovereign (The Social Spider)
 * Verb: NAVIGATE / DECIDE
 * Topic: Durable Swarm Orchestration & Strange Loop Workflows
 * Provenance: hot_obsidian_sandbox/bronze/P7_SPIDER_SOVEREIGN/OBSIDIAN_HOURGLASS.md
 * 
 * These contracts define the data structures for the Obsidian Hourglass,
 * the legendary artifact that orchestrates HIVE/8 and PREY/8 strange loops.
 */

import { z } from 'zod';

// =============================================================================
// CORE HOURGLASS SCHEMAS
// =============================================================================

/**
 * HIVE/8 Strategic Phases (Anti-Diagonal Port Pairs: X + Y = 7)
 * 
 * Each phase uses a specific port pair from the Galois Lattice anti-diagonal:
 * - H: Port 0 (OBSERVE) + Port 7 (NAVIGATE) → Research, sense, decide targets
 * - I: Port 1 (BRIDGE) + Port 6 (ASSIMILATE) → Contracts, data bridging, storage
 * - V: Port 2 (SHAPE) + Port 5 (IMMUNIZE) → Transform, harden, pass tests
 * - E: Port 3 (INJECT) + Port 4 (DISRUPT) → Mutation testing, chaos engineering
 * 
 * H: Hindsight (Hunt) - Look back at what was
 * I: Insight (Interlock) - Look at what is
 * V: Validated Foresight (Validate) - Look at what could be
 * E: Evolution (Evolve) - Look at what will be
 */
export const HIVEPhaseSchema = z.enum(['H', 'I', 'V', 'E']);
export type HIVEPhase = z.infer<typeof HIVEPhaseSchema>;

/**
 * PREY/8 Tactical Phases (JADC2: Sense → Make Sense → Act → Assess)
 * 
 * PREY winds around HIVE in a SERPENTINE pattern through the Galois Lattice.
 * Port pairs: 0+6, 1+7, 2+4, 3+5 (non-overlapping with HIVE anti-diagonal)
 * 
 * - P: Port 0 (OBSERVE) + Port 6 (ASSIMILATE) → Sense and capture
 * - R: Port 1 (BRIDGE) + Port 7 (NAVIGATE) → Connect and decide
 * - E: Port 2 (SHAPE) + Port 4 (DISRUPT) → Transform and test
 * - Y: Port 3 (INJECT) + Port 5 (IMMUNIZE) → Deliver and verify
 * 
 * P: Perceive - Gather raw telemetry
 * R: React - Process and plan
 * E: Execute - Invoke tools
 * Y: Yield - Return results
 */
export const PREYPhaseSchema = z.enum(['P', 'R', 'E', 'Y']);
export type PREYPhase = z.infer<typeof PREYPhaseSchema>;

/**
 * Workflow type
 */
export const WorkflowTypeSchema = z.enum(['HIVE', 'PREY']);
export type WorkflowType = z.infer<typeof WorkflowTypeSchema>;

/**
 * Swarm pattern (1 = scatter, 0 = gather)
 */
export const SwarmPatternSchema = z.enum(['1010', '0101', '1111', '0000']);
export type SwarmPattern = z.infer<typeof SwarmPatternSchema>;

/**
 * Swarm step within a pattern
 */
export const SwarmStepSchema = z.enum([
    'HUNT_SCATTER',
    'INTERLOCK_GATHER',
    'VALIDATE_SCATTER',
    'EVOLVE_GATHER',
    'PERCEIVE',
    'REACT',
    'EXECUTE',
    'YIELD',
]);
export type SwarmStep = z.infer<typeof SwarmStepSchema>;

// =============================================================================
// AGENT SCHEMAS
// =============================================================================

/**
 * Agent coordinate in the Galois Lattice
 */
export const AgentCoordinateSchema = z.object({
    x: z.number().min(0).max(7), // Port (0-7)
    y: z.number().min(0).max(7), // Phase (0-7)
    z: z.number().optional(), // Depth (for nested workflows)
});
export type AgentCoordinate = z.infer<typeof AgentCoordinateSchema>;

/**
 * Agent identity
 */
export const AgentIdentitySchema = z.object({
    id: z.string(),
    port: z.number().min(0).max(7),
    coordinate: AgentCoordinateSchema,
    swarmId: z.string(),
    parentAgentId: z.string().optional(), // For nested PREY within HIVE
});
export type AgentIdentity = z.infer<typeof AgentIdentitySchema>;

/**
 * Agent state
 */
export const AgentStateSchema = z.object({
    identity: AgentIdentitySchema,
    workflow: WorkflowTypeSchema,
    phase: z.union([HIVEPhaseSchema, PREYPhaseSchema]),
    step: SwarmStepSchema,
    status: z.enum(['idle', 'running', 'completed', 'failed', 'waiting']),
    startTime: z.number(),
    endTime: z.number().optional(),
    result: z.unknown().optional(), // @bespoke agent result
    error: z.string().optional(),
});
export type AgentState = z.infer<typeof AgentStateSchema>;

// =============================================================================
// SWARM SCHEMAS
// =============================================================================

/**
 * Swarm configuration
 */
export const SwarmConfigSchema = z.object({
    id: z.string(),
    pattern: SwarmPatternSchema,
    agentCount: z.number().refine(n => [1, 8, 64, 512].includes(n), {
        message: 'Agent count must be a power of 8 (1, 8, 64, 512)',
    }),
    workflow: WorkflowTypeSchema,
    context: z.string(),
    timeout: z.number().default(60000), // ms
});
export type SwarmConfig = z.infer<typeof SwarmConfigSchema>;

/**
 * Swarm state
 */
export const SwarmStateSchema = z.object({
    config: SwarmConfigSchema,
    agents: z.array(AgentStateSchema),
    currentPhase: z.union([HIVEPhaseSchema, PREYPhaseSchema]),
    currentStep: SwarmStepSchema,
    status: z.enum(['initializing', 'scattering', 'gathering', 'completed', 'failed']),
    startTime: z.number(),
    endTime: z.number().optional(),
    artifacts: z.array(z.unknown()), // @bespoke collected artifacts
});
export type SwarmState = z.infer<typeof SwarmStateSchema>;

// =============================================================================
// STRANGE LOOP SCHEMAS
// =============================================================================

/**
 * Strange Loop event (transition between workflows)
 * 
 * Strange loops are BILATERAL:
 * - PREY N+1 feeds PREY N (tactical chaining)
 * - PREY yields feed HIVE (tactical → strategic)
 * - HIVE evolution drives PREY (strategic → tactical)
 * 
 * HIVE encompasses PREY - each HIVE phase can spawn multitudes of PREY loops.
 */
export const StrangeLoopEventSchema = z.object({
    id: z.string(),
    timestamp: z.number(),
    from: z.object({
        workflow: WorkflowTypeSchema,
        phase: z.union([HIVEPhaseSchema, PREYPhaseSchema]),
        swarmId: z.string(),
        depth: z.number().default(0), // Nesting depth (0 = top-level HIVE)
    }),
    to: z.object({
        workflow: WorkflowTypeSchema,
        phase: z.union([HIVEPhaseSchema, PREYPhaseSchema]),
        swarmId: z.string().optional(), // May be new swarm
        depth: z.number().default(0),
    }),
    artifact: z.unknown(), // @bespoke the artifact being passed
    loopType: z.enum([
        'HIVE_TO_PREY',   // Strategic spawns tactical (HIVE phase → nested PREY)
        'PREY_TO_HIVE',   // Tactical informs strategic (PREY yield → HIVE)
        'HIVE_TO_HIVE',   // Evolution feeds Hindsight (E → H)
        'PREY_TO_PREY',   // Tactical chaining (PREY N yield → PREY N+1 perceive)
    ]),
    parentHivePhase: HIVEPhaseSchema.optional(), // Which HIVE phase spawned this PREY
    preySequence: z.number().optional(), // PREY loop number within parent HIVE phase
});
export type StrangeLoopEvent = z.infer<typeof StrangeLoopEventSchema>;

// =============================================================================
// THOUGHT SCHEMAS (Sequential Thinking)
// =============================================================================

/**
 * A thought in the sequential thinking chain
 */
export const ThoughtSchema = z.object({
    thoughtNumber: z.number(),
    totalThoughts: z.number(),
    thought: z.string(),
    isRevision: z.boolean().default(false),
    revisesThought: z.number().optional(),
    parentId: z.number().optional(), // Link tactical PREY to strategic HIVE
    agentId: z.string(),
    coordinate: AgentCoordinateSchema.optional(),
    semanticRole: z.string().optional(), // Resolved from Galois Lattice
    purpose: z.string().optional(), // Resolved from Galois Lattice
    swarmPattern: SwarmPatternSchema.optional(),
    step: SwarmStepSchema.optional(),
    nextThoughtNeeded: z.boolean(),
    timestamp: z.string(),
    port: z.literal(7),
    workflow: WorkflowTypeSchema.optional(),
    phase: z.string().optional(),
});
export type Thought = z.infer<typeof ThoughtSchema>;

// =============================================================================
// HOURGLASS SESSION SCHEMAS
// =============================================================================

/**
 * Hourglass session (complete orchestration instance)
 * 
 * HIVE/8 encompasses PREY/8 - the session tracks:
 * - Top-level HIVE swarms (strategic)
 * - Nested PREY swarms within each HIVE phase (tactical)
 * - Bilateral strange loops connecting them
 */
export const HourglassSessionSchema = z.object({
    id: z.string(),
    startTime: z.number(),
    endTime: z.number().optional(),
    context: z.string(), // Mission context
    hiveSwarms: z.array(SwarmStateSchema),
    preySwarms: z.array(SwarmStateSchema),
    strangeLoops: z.array(StrangeLoopEventSchema),
    thoughts: z.array(ThoughtSchema),
    status: z.enum(['initializing', 'running', 'completed', 'failed', 'paused']),
    currentWorkflow: WorkflowTypeSchema,
    currentPhase: z.union([HIVEPhaseSchema, PREYPhaseSchema]),
    currentDepth: z.number().default(0), // 0 = HIVE level, 1+ = nested PREY depth
    iterationCount: z.number().default(0), // How many times the hourglass has turned
    preyCountByPhase: z.record(HIVEPhaseSchema, z.number()).optional(), // PREY loops spawned per HIVE phase
});
export type HourglassSession = z.infer<typeof HourglassSessionSchema>;

// =============================================================================
// HIVE PHASE ARTIFACTS
// =============================================================================

/**
 * Hunt (H) phase artifact - research results
 */
export const HuntArtifactSchema = z.object({
    type: z.literal('hunt'),
    agentId: z.string(),
    query: z.string(),
    results: z.array(z.object({
        source: z.string(),
        content: z.string(),
        relevance: z.number().min(0).max(1),
        timestamp: z.number(),
    })),
    exemplars: z.array(z.string()),
    antiPatterns: z.array(z.string()),
    painPoints: z.array(z.string()),
});
export type HuntArtifact = z.infer<typeof HuntArtifactSchema>;

/**
 * Interlock (I) phase artifact - contracts
 */
export const InterlockArtifactSchema = z.object({
    type: z.literal('interlock'),
    contracts: z.array(z.object({
        name: z.string(),
        schema: z.string(), // Zod schema as string
        tests: z.array(z.string()), // Test file paths
    })),
    dataModels: z.array(z.string()),
    failingTests: z.number(),
});
export type InterlockArtifact = z.infer<typeof InterlockArtifactSchema>;

/**
 * Validate (V) phase artifact - implementations
 */
export const ValidateArtifactSchema = z.object({
    type: z.literal('validate'),
    agentId: z.string(),
    implementations: z.array(z.object({
        file: z.string(),
        status: z.enum(['passing', 'failing', 'pending']),
        coverage: z.number().min(0).max(100),
    })),
    passingTests: z.number(),
    totalTests: z.number(),
});
export type ValidateArtifact = z.infer<typeof ValidateArtifactSchema>;

/**
 * Evolve (E) phase artifact - mutation results
 */
export const EvolveArtifactSchema = z.object({
    type: z.literal('evolve'),
    mutationScore: z.number().min(0).max(100),
    killedMutants: z.number(),
    totalMutants: z.number(),
    promotionDecision: z.enum(['promote', 'demote', 'retry']),
    artifacts: z.array(z.string()), // Files to promote/demote
    strangeLoopTarget: z.enum(['next_hive', 'prey', 'complete']),
});
export type EvolveArtifact = z.infer<typeof EvolveArtifactSchema>;

/**
 * Union of all HIVE artifacts
 */
export const HIVEArtifactSchema = z.discriminatedUnion('type', [
    HuntArtifactSchema,
    InterlockArtifactSchema,
    ValidateArtifactSchema,
    EvolveArtifactSchema,
]);
export type HIVEArtifact = z.infer<typeof HIVEArtifactSchema>;

// =============================================================================
// PREY PHASE ARTIFACTS
// =============================================================================

/**
 * Perceive (P) phase artifact - sensor data
 */
export const PerceiveArtifactSchema = z.object({
    type: z.literal('perceive'),
    sensorData: z.unknown(), // @bespoke sensor-specific
    timestamp: z.number(),
    sources: z.array(z.string()),
});
export type PerceiveArtifact = z.infer<typeof PerceiveArtifactSchema>;

/**
 * React (R) phase artifact - analysis
 */
export const ReactArtifactSchema = z.object({
    type: z.literal('react'),
    analysis: z.string(),
    plannedActions: z.array(z.object({
        tool: z.string(),
        action: z.string(),
        params: z.record(z.string(), z.unknown()), // @bespoke tool params
    })),
    confidence: z.number().min(0).max(1),
});
export type ReactArtifact = z.infer<typeof ReactArtifactSchema>;

/**
 * Execute (E) phase artifact - tool results
 */
export const ExecuteArtifactSchema = z.object({
    type: z.literal('execute'),
    tool: z.string(),
    action: z.string(),
    result: z.unknown(), // @bespoke tool result
    success: z.boolean(),
    duration: z.number(), // ms
});
export type ExecuteArtifact = z.infer<typeof ExecuteArtifactSchema>;

/**
 * Yield (Y) phase artifact - final output
 */
export const YieldArtifactSchema = z.object({
    type: z.literal('yield'),
    output: z.unknown(), // @bespoke final output
    strangeLoopTarget: z.enum(['hive_h', 'prey_p', 'complete']),
    parentHiveId: z.string().optional(),
});
export type YieldArtifact = z.infer<typeof YieldArtifactSchema>;

/**
 * Union of all PREY artifacts
 */
export const PREYArtifactSchema = z.discriminatedUnion('type', [
    PerceiveArtifactSchema,
    ReactArtifactSchema,
    ExecuteArtifactSchema,
    YieldArtifactSchema,
]);
export type PREYArtifact = z.infer<typeof PREYArtifactSchema>;

// =============================================================================
// GALOIS LATTICE RESOLUTION
// =============================================================================

/**
 * Galois Lattice cell (resolved semantic meaning)
 */
export const GaloisCellSchema = z.object({
    x: z.number().min(0).max(7),
    y: z.number().min(0).max(7),
    commanderX: z.string(),
    commanderY: z.string(),
    verbX: z.string(),
    verbY: z.string(),
    role: z.string(),
    purpose: z.string(),
    isDiagonal: z.boolean(), // X === Y (self-reference)
    isAntiDiagonal: z.boolean(), // X + Y === 7 (HIVE phase)
    hivePhase: HIVEPhaseSchema.optional(), // Only for anti-diagonal
});
export type GaloisCell = z.infer<typeof GaloisCellSchema>;

// =============================================================================
// STIGMERGY EVENT SCHEMAS
// =============================================================================

/**
 * Hourglass event for stigmergy logging
 */
export const HourglassEventSchema = z.object({
    ts: z.string(),
    type: z.literal('HOURGLASS_EVENT'),
    workflow: WorkflowTypeSchema,
    phase: z.union([HIVEPhaseSchema, PREYPhaseSchema]),
    pattern: SwarmPatternSchema,
    step: SwarmStepSchema,
    agentCount: z.number(),
    swarmId: z.string(),
    sessionId: z.string(),
    port: z.literal(7),
    hive: z.literal('HFO_GEN88'),
    gen: z.literal(88),
});
export type HourglassEvent = z.infer<typeof HourglassEventSchema>;

// =============================================================================
// CONSTANTS
// =============================================================================

export const COMMANDERS = [
    'Lidless Legion',   // Port 0
    'Web Weaver',       // Port 1
    'Mirror Magus',     // Port 2
    'Spore Storm',      // Port 3
    'Red Regnant',      // Port 4
    'Pyre Praetorian',  // Port 5
    'Kraken Keeper',    // Port 6
    'Spider Sovereign', // Port 7
] as const;

export const HFO_VERBS = [
    'OBSERVE',   // Port 0
    'BRIDGE',    // Port 1
    'SHAPE',     // Port 2
    'INJECT',    // Port 3
    'DISRUPT',   // Port 4
    'IMMUNIZE',  // Port 5
    'ASSIMILATE',// Port 6
    'NAVIGATE',  // Port 7
] as const;

export const HIVE_PHASE_PORTS: Record<HIVEPhase, [number, number]> = {
    H: [0, 7], // Hunt: Lidless Legion (OBSERVE) + Spider Sovereign (NAVIGATE)
    I: [1, 6], // Interlock: Web Weaver (BRIDGE) + Kraken Keeper (ASSIMILATE)
    V: [2, 5], // Validate: Mirror Magus (SHAPE) + Pyre Praetorian (IMMUNIZE)
    E: [3, 4], // Evolve: Spore Storm (INJECT) + Red Regnant (DISRUPT)
};

/**
 * PREY/8 Phase Port Pairs (Serpentine Pattern)
 * 
 * PREY winds around HIVE in a serpentine pattern through the Galois Lattice.
 * These pairs do NOT overlap with HIVE (anti-diagonal) or Diagonal (self-reference).
 * 
 * The 64-cell Galois Lattice has:
 * - 8 Diagonal cells (X=Y): Legendary Commanders (self-referential)
 * - 8 Anti-Diagonal cells (X+Y=7): HIVE/8 phases
 * - 8 Serpentine cells: PREY/8 phases (winding around HIVE)
 * - 40 remaining cells: Other interactions
 */
export const PREY_PHASE_PORTS: Record<PREYPhase, [number, number]> = {
    P: [0, 6], // Perceive: Lidless Legion (OBSERVE) + Kraken Keeper (ASSIMILATE)
    R: [1, 7], // React: Web Weaver (BRIDGE) + Spider Sovereign (NAVIGATE)
    E: [2, 4], // Execute: Mirror Magus (SHAPE) + Red Regnant (DISRUPT)
    Y: [3, 5], // Yield: Spore Storm (INJECT) + Pyre Praetorian (IMMUNIZE)
};

export const POWERS_OF_8 = [1, 8, 64, 512, 4096] as const;
