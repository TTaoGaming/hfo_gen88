/**
 * ⏳ THE OBSIDIAN HOURGLASS — Contract Tests
 * 
 * Authority: Spider Sovereign (The Social Spider)
 * Verb: NAVIGATE / DECIDE
 * Topic: Durable Swarm Orchestration & Strange Loop Workflows
 * Provenance: hot_obsidian_sandbox/bronze/P7_SPIDER_SOVEREIGN/hourglass-contracts.ts
 * 
 * TDD RED → GREEN: These tests validate all Zod schemas for the Obsidian Hourglass.
 */

import { describe, it, expect } from 'vitest';
import {
    HIVEPhaseSchema,
    PREYPhaseSchema,
    WorkflowTypeSchema,
    SwarmPatternSchema,
    SwarmStepSchema,
    AgentCoordinateSchema,
    AgentIdentitySchema,
    AgentStateSchema,
    SwarmConfigSchema,
    SwarmStateSchema,
    StrangeLoopEventSchema,
    ThoughtSchema,
    HourglassSessionSchema,
    HuntArtifactSchema,
    InterlockArtifactSchema,
    ValidateArtifactSchema,
    EvolveArtifactSchema,
    HIVEArtifactSchema,
    PerceiveArtifactSchema,
    ReactArtifactSchema,
    ExecuteArtifactSchema,
    YieldArtifactSchema,
    PREYArtifactSchema,
    GaloisCellSchema,
    HourglassEventSchema,
    COMMANDERS,
    HFO_VERBS,
    HIVE_PHASE_PORTS,
    PREY_PHASE_PORTS,
    POWERS_OF_8,
} from './hourglass-contracts';

// =============================================================================
// CORE HOURGLASS SCHEMA TESTS
// =============================================================================

describe('⏳ Obsidian Hourglass Contracts', () => {
    describe('HIVEPhaseSchema', () => {
        it('accepts valid HIVE phases', () => {
            expect(HIVEPhaseSchema.parse('H')).toBe('H');
            expect(HIVEPhaseSchema.parse('I')).toBe('I');
            expect(HIVEPhaseSchema.parse('V')).toBe('V');
            expect(HIVEPhaseSchema.parse('E')).toBe('E');
        });

        it('rejects invalid phases', () => {
            expect(() => HIVEPhaseSchema.parse('X')).toThrow();
            expect(() => HIVEPhaseSchema.parse('P')).toThrow();
            expect(() => HIVEPhaseSchema.parse('')).toThrow();
        });
    });

    describe('PREYPhaseSchema', () => {
        it('accepts valid PREY phases', () => {
            expect(PREYPhaseSchema.parse('P')).toBe('P');
            expect(PREYPhaseSchema.parse('R')).toBe('R');
            expect(PREYPhaseSchema.parse('E')).toBe('E');
            expect(PREYPhaseSchema.parse('Y')).toBe('Y');
        });

        it('rejects invalid phases', () => {
            expect(() => PREYPhaseSchema.parse('H')).toThrow();
            expect(() => PREYPhaseSchema.parse('X')).toThrow();
        });
    });

    describe('WorkflowTypeSchema', () => {
        it('accepts HIVE and PREY', () => {
            expect(WorkflowTypeSchema.parse('HIVE')).toBe('HIVE');
            expect(WorkflowTypeSchema.parse('PREY')).toBe('PREY');
        });

        it('rejects invalid workflow types', () => {
            expect(() => WorkflowTypeSchema.parse('SWARM')).toThrow();
        });
    });

    describe('SwarmPatternSchema', () => {
        it('accepts valid swarm patterns', () => {
            expect(SwarmPatternSchema.parse('1010')).toBe('1010');
            expect(SwarmPatternSchema.parse('0101')).toBe('0101');
            expect(SwarmPatternSchema.parse('1111')).toBe('1111');
            expect(SwarmPatternSchema.parse('0000')).toBe('0000');
        });

        it('rejects invalid patterns', () => {
            expect(() => SwarmPatternSchema.parse('1100')).toThrow();
            expect(() => SwarmPatternSchema.parse('10')).toThrow();
        });
    });

    describe('SwarmStepSchema', () => {
        it('accepts all valid swarm steps', () => {
            const validSteps = [
                'HUNT_SCATTER', 'INTERLOCK_GATHER', 'VALIDATE_SCATTER', 'EVOLVE_GATHER',
                'PERCEIVE', 'REACT', 'EXECUTE', 'YIELD'
            ];
            validSteps.forEach(step => {
                expect(SwarmStepSchema.parse(step)).toBe(step);
            });
        });
    });
});

// =============================================================================
// AGENT SCHEMA TESTS
// =============================================================================

describe('🕷️ Agent Schemas', () => {
    describe('AgentCoordinateSchema', () => {
        it('accepts valid coordinates within 8x8 lattice', () => {
            const coord = AgentCoordinateSchema.parse({ x: 0, y: 7 });
            expect(coord.x).toBe(0);
            expect(coord.y).toBe(7);
        });

        it('accepts optional z depth', () => {
            const coord = AgentCoordinateSchema.parse({ x: 3, y: 4, z: 2 });
            expect(coord.z).toBe(2);
        });

        it('rejects coordinates outside 0-7 range', () => {
            expect(() => AgentCoordinateSchema.parse({ x: -1, y: 0 })).toThrow();
            expect(() => AgentCoordinateSchema.parse({ x: 0, y: 8 })).toThrow();
        });
    });

    describe('AgentIdentitySchema', () => {
        it('accepts valid agent identity', () => {
            const identity = AgentIdentitySchema.parse({
                id: 'AGENT_001',
                port: 7,
                coordinate: { x: 7, y: 0 },
                swarmId: 'SWARM_123',
            });
            expect(identity.id).toBe('AGENT_001');
            expect(identity.port).toBe(7);
        });

        it('accepts optional parentAgentId for nested PREY', () => {
            const identity = AgentIdentitySchema.parse({
                id: 'PREY_AGENT',
                port: 0,
                coordinate: { x: 0, y: 0 },
                swarmId: 'SWARM_456',
                parentAgentId: 'HIVE_AGENT',
            });
            expect(identity.parentAgentId).toBe('HIVE_AGENT');
        });
    });

    describe('AgentStateSchema', () => {
        it('accepts valid agent state', () => {
            const state = AgentStateSchema.parse({
                identity: {
                    id: 'AGENT_001',
                    port: 7,
                    coordinate: { x: 7, y: 0 },
                    swarmId: 'SWARM_123',
                },
                workflow: 'HIVE',
                phase: 'H',
                step: 'HUNT_SCATTER',
                status: 'running',
                startTime: Date.now(),
            });
            expect(state.status).toBe('running');
            expect(state.workflow).toBe('HIVE');
        });

        it('accepts all valid status values', () => {
            const statuses = ['idle', 'running', 'completed', 'failed', 'waiting'];
            statuses.forEach(status => {
                const state = AgentStateSchema.parse({
                    identity: {
                        id: 'AGENT_001',
                        port: 0,
                        coordinate: { x: 0, y: 0 },
                        swarmId: 'SWARM_123',
                    },
                    workflow: 'PREY',
                    phase: 'P',
                    step: 'PERCEIVE',
                    status,
                    startTime: Date.now(),
                });
                expect(state.status).toBe(status);
            });
        });
    });
});

// =============================================================================
// SWARM SCHEMA TESTS
// =============================================================================

describe('🐝 Swarm Schemas', () => {
    describe('SwarmConfigSchema', () => {
        it('accepts valid swarm config with powers of 8', () => {
            const config = SwarmConfigSchema.parse({
                id: 'SWARM_001',
                pattern: '1010',
                agentCount: 8,
                workflow: 'HIVE',
                context: 'Feature development',
            });
            expect(config.agentCount).toBe(8);
            expect(config.timeout).toBe(60000); // default
        });

        it('accepts all valid powers of 8', () => {
            [1, 8, 64, 512].forEach(count => {
                const config = SwarmConfigSchema.parse({
                    id: `SWARM_${count}`,
                    pattern: '1010',
                    agentCount: count,
                    workflow: 'HIVE',
                    context: 'Test',
                });
                expect(config.agentCount).toBe(count);
            });
        });

        it('rejects non-powers of 8', () => {
            expect(() => SwarmConfigSchema.parse({
                id: 'SWARM_BAD',
                pattern: '1010',
                agentCount: 10, // Not a power of 8
                workflow: 'HIVE',
                context: 'Test',
            })).toThrow('Agent count must be a power of 8');
        });
    });

    describe('SwarmStateSchema', () => {
        it('accepts valid swarm state', () => {
            const state = SwarmStateSchema.parse({
                config: {
                    id: 'SWARM_001',
                    pattern: '1010',
                    agentCount: 8,
                    workflow: 'HIVE',
                    context: 'Test',
                },
                agents: [],
                currentPhase: 'H',
                currentStep: 'HUNT_SCATTER',
                status: 'scattering',
                startTime: Date.now(),
                artifacts: [],
            });
            expect(state.status).toBe('scattering');
        });
    });
});

// =============================================================================
// STRANGE LOOP SCHEMA TESTS
// =============================================================================

describe('🔄 Strange Loop Schemas', () => {
    describe('StrangeLoopEventSchema', () => {
        it('accepts HIVE to PREY transition with nesting info', () => {
            const event = StrangeLoopEventSchema.parse({
                id: 'LOOP_001',
                timestamp: Date.now(),
                from: { workflow: 'HIVE', phase: 'H', swarmId: 'SWARM_1', depth: 0 },
                to: { workflow: 'PREY', phase: 'P', depth: 1 },
                artifact: { type: 'hunt_context', data: 'test' },
                loopType: 'HIVE_TO_PREY',
                parentHivePhase: 'H',
                preySequence: 1,
            });
            expect(event.loopType).toBe('HIVE_TO_PREY');
            expect(event.parentHivePhase).toBe('H');
            expect(event.preySequence).toBe(1);
        });

        it('accepts PREY to HIVE transition', () => {
            const event = StrangeLoopEventSchema.parse({
                id: 'LOOP_002',
                timestamp: Date.now(),
                from: { workflow: 'PREY', phase: 'Y', swarmId: 'SWARM_2', depth: 1 },
                to: { workflow: 'HIVE', phase: 'H', swarmId: 'SWARM_3', depth: 0 },
                artifact: { type: 'yield', output: 'results' },
                loopType: 'PREY_TO_HIVE',
            });
            expect(event.loopType).toBe('PREY_TO_HIVE');
        });

        it('accepts PREY to PREY chaining', () => {
            const event = StrangeLoopEventSchema.parse({
                id: 'LOOP_003',
                timestamp: Date.now(),
                from: { workflow: 'PREY', phase: 'Y', swarmId: 'PREY_1', depth: 1 },
                to: { workflow: 'PREY', phase: 'P', swarmId: 'PREY_2', depth: 1 },
                artifact: { previousYield: 'data' },
                loopType: 'PREY_TO_PREY',
                parentHivePhase: 'H',
                preySequence: 2,
            });
            expect(event.loopType).toBe('PREY_TO_PREY');
        });

        it('accepts all loop types', () => {
            const loopTypes = ['HIVE_TO_PREY', 'PREY_TO_HIVE', 'HIVE_TO_HIVE', 'PREY_TO_PREY'];
            loopTypes.forEach(loopType => {
                const event = StrangeLoopEventSchema.parse({
                    id: `LOOP_${loopType}`,
                    timestamp: Date.now(),
                    from: { workflow: 'HIVE', phase: 'E', swarmId: 'SWARM_1' },
                    to: { workflow: 'HIVE', phase: 'H' },
                    artifact: null,
                    loopType,
                });
                expect(event.loopType).toBe(loopType);
            });
        });
    });
});

// =============================================================================
// THOUGHT SCHEMA TESTS
// =============================================================================

describe('💭 Thought Schemas', () => {
    describe('ThoughtSchema', () => {
        it('accepts valid thought', () => {
            const thought = ThoughtSchema.parse({
                thoughtNumber: 1,
                totalThoughts: 8,
                thought: 'Analyzing the problem space',
                agentId: 'SPIDER_SOVEREIGN',
                nextThoughtNeeded: true,
                timestamp: new Date().toISOString(),
                port: 7,
            });
            expect(thought.thoughtNumber).toBe(1);
            expect(thought.port).toBe(7);
        });

        it('accepts revision thoughts', () => {
            const thought = ThoughtSchema.parse({
                thoughtNumber: 3,
                totalThoughts: 8,
                thought: 'Revising previous analysis',
                isRevision: true,
                revisesThought: 1,
                agentId: 'SPIDER_SOVEREIGN',
                nextThoughtNeeded: true,
                timestamp: new Date().toISOString(),
                port: 7,
            });
            expect(thought.isRevision).toBe(true);
            expect(thought.revisesThought).toBe(1);
        });

        it('accepts thought with coordinate and semantic role', () => {
            const thought = ThoughtSchema.parse({
                thoughtNumber: 1,
                totalThoughts: 8,
                thought: 'Hunting for exemplars',
                agentId: 'HUNT_AGENT_0',
                coordinate: { x: 0, y: 7 },
                semanticRole: 'HIVE Anti-Diagonal: HUNT',
                purpose: 'Strategic Hunt',
                swarmPattern: '1010',
                step: 'HUNT_SCATTER',
                nextThoughtNeeded: true,
                timestamp: new Date().toISOString(),
                port: 7,
                workflow: 'HIVE',
                phase: 'H',
            });
            expect(thought.coordinate?.x).toBe(0);
            expect(thought.workflow).toBe('HIVE');
        });

        it('rejects port other than 7', () => {
            expect(() => ThoughtSchema.parse({
                thoughtNumber: 1,
                totalThoughts: 8,
                thought: 'Test',
                agentId: 'TEST',
                nextThoughtNeeded: false,
                timestamp: new Date().toISOString(),
                port: 0, // Wrong port!
            })).toThrow();
        });
    });
});

// =============================================================================
// HOURGLASS SESSION SCHEMA TESTS
// =============================================================================

describe('⏳ Hourglass Session Schema', () => {
    it('accepts valid session with holonic tracking', () => {
        const session = HourglassSessionSchema.parse({
            id: 'SESSION_001',
            startTime: Date.now(),
            context: 'Feature development mission',
            hiveSwarms: [],
            preySwarms: [],
            strangeLoops: [],
            thoughts: [],
            status: 'running',
            currentWorkflow: 'HIVE',
            currentPhase: 'H',
            currentDepth: 0,
            preyCountByPhase: { H: 3, I: 1, V: 2, E: 0 },
        });
        expect(session.status).toBe('running');
        expect(session.iterationCount).toBe(0); // default
        expect(session.currentDepth).toBe(0);
    });

    it('accepts all valid session statuses', () => {
        const statuses = ['initializing', 'running', 'completed', 'failed', 'paused'];
        statuses.forEach(status => {
            const session = HourglassSessionSchema.parse({
                id: `SESSION_${status}`,
                startTime: Date.now(),
                context: 'Test',
                hiveSwarms: [],
                preySwarms: [],
                strangeLoops: [],
                thoughts: [],
                status,
                currentWorkflow: 'HIVE',
                currentPhase: 'H',
            });
            expect(session.status).toBe(status);
        });
    });
});

// =============================================================================
// HIVE ARTIFACT SCHEMA TESTS
// =============================================================================

describe('🐝 HIVE Artifact Schemas', () => {
    describe('HuntArtifactSchema', () => {
        it('accepts valid hunt artifact', () => {
            const artifact = HuntArtifactSchema.parse({
                type: 'hunt',
                agentId: 'HUNT_AGENT_0',
                query: 'gesture recognition libraries',
                results: [
                    { source: 'web', content: 'MediaPipe', relevance: 0.9, timestamp: Date.now() }
                ],
                exemplars: ['mediapipe-hands'],
                antiPatterns: ['polling-based-detection'],
                painPoints: ['latency', 'accuracy'],
            });
            expect(artifact.type).toBe('hunt');
            expect(artifact.results.length).toBe(1);
        });
    });

    describe('InterlockArtifactSchema', () => {
        it('accepts valid interlock artifact', () => {
            const artifact = InterlockArtifactSchema.parse({
                type: 'interlock',
                contracts: [
                    { name: 'GestureSchema', schema: 'z.object({...})', tests: ['gesture.test.ts'] }
                ],
                dataModels: ['Gesture', 'Hand', 'Finger'],
                failingTests: 5,
            });
            expect(artifact.type).toBe('interlock');
            expect(artifact.failingTests).toBe(5);
        });
    });

    describe('ValidateArtifactSchema', () => {
        it('accepts valid validate artifact', () => {
            const artifact = ValidateArtifactSchema.parse({
                type: 'validate',
                agentId: 'VALIDATE_AGENT_0',
                implementations: [
                    { file: 'gesture.ts', status: 'passing', coverage: 85 }
                ],
                passingTests: 10,
                totalTests: 12,
            });
            expect(artifact.type).toBe('validate');
            expect(artifact.passingTests).toBe(10);
        });
    });

    describe('EvolveArtifactSchema', () => {
        it('accepts valid evolve artifact', () => {
            const artifact = EvolveArtifactSchema.parse({
                type: 'evolve',
                mutationScore: 87,
                killedMutants: 87,
                totalMutants: 100,
                promotionDecision: 'promote',
                artifacts: ['gesture.ts', 'gesture.test.ts'],
                strangeLoopTarget: 'next_hive',
            });
            expect(artifact.type).toBe('evolve');
            expect(artifact.promotionDecision).toBe('promote');
        });

        it('accepts all promotion decisions', () => {
            ['promote', 'demote', 'retry'].forEach(decision => {
                const artifact = EvolveArtifactSchema.parse({
                    type: 'evolve',
                    mutationScore: 50,
                    killedMutants: 50,
                    totalMutants: 100,
                    promotionDecision: decision,
                    artifacts: [],
                    strangeLoopTarget: 'complete',
                });
                expect(artifact.promotionDecision).toBe(decision);
            });
        });
    });

    describe('HIVEArtifactSchema (discriminated union)', () => {
        it('discriminates by type field', () => {
            const hunt = HIVEArtifactSchema.parse({
                type: 'hunt',
                agentId: 'A',
                query: 'Q',
                results: [],
                exemplars: [],
                antiPatterns: [],
                painPoints: [],
            });
            expect(hunt.type).toBe('hunt');

            const evolve = HIVEArtifactSchema.parse({
                type: 'evolve',
                mutationScore: 80,
                killedMutants: 80,
                totalMutants: 100,
                promotionDecision: 'promote',
                artifacts: [],
                strangeLoopTarget: 'complete',
            });
            expect(evolve.type).toBe('evolve');
        });
    });
});

// =============================================================================
// PREY ARTIFACT SCHEMA TESTS
// =============================================================================

describe('🦅 PREY Artifact Schemas', () => {
    describe('PerceiveArtifactSchema', () => {
        it('accepts valid perceive artifact', () => {
            const artifact = PerceiveArtifactSchema.parse({
                type: 'perceive',
                sensorData: { hands: [{ landmarks: [] }] },
                timestamp: Date.now(),
                sources: ['mediapipe', 'webcam'],
            });
            expect(artifact.type).toBe('perceive');
        });
    });

    describe('ReactArtifactSchema', () => {
        it('accepts valid react artifact', () => {
            const artifact = ReactArtifactSchema.parse({
                type: 'react',
                analysis: 'Detected pinch gesture',
                plannedActions: [
                    { tool: 'cursor', action: 'click', params: { x: 100, y: 200 } }
                ],
                confidence: 0.95,
            });
            expect(artifact.type).toBe('react');
            expect(artifact.confidence).toBe(0.95);
        });

        it('rejects confidence outside 0-1 range', () => {
            expect(() => ReactArtifactSchema.parse({
                type: 'react',
                analysis: 'Test',
                plannedActions: [],
                confidence: 1.5,
            })).toThrow();
        });
    });

    describe('ExecuteArtifactSchema', () => {
        it('accepts valid execute artifact', () => {
            const artifact = ExecuteArtifactSchema.parse({
                type: 'execute',
                tool: 'cursor',
                action: 'click',
                result: { success: true },
                success: true,
                duration: 50,
            });
            expect(artifact.type).toBe('execute');
            expect(artifact.duration).toBe(50);
        });
    });

    describe('YieldArtifactSchema', () => {
        it('accepts valid yield artifact', () => {
            const artifact = YieldArtifactSchema.parse({
                type: 'yield',
                output: { gestureRecognized: 'pinch', confidence: 0.95 },
                strangeLoopTarget: 'hive_h',
            });
            expect(artifact.type).toBe('yield');
            expect(artifact.strangeLoopTarget).toBe('hive_h');
        });

        it('accepts all strange loop targets', () => {
            ['hive_h', 'prey_p', 'complete'].forEach(target => {
                const artifact = YieldArtifactSchema.parse({
                    type: 'yield',
                    output: null,
                    strangeLoopTarget: target,
                });
                expect(artifact.strangeLoopTarget).toBe(target);
            });
        });
    });

    describe('PREYArtifactSchema (discriminated union)', () => {
        it('discriminates by type field', () => {
            const perceive = PREYArtifactSchema.parse({
                type: 'perceive',
                sensorData: {},
                timestamp: Date.now(),
                sources: [],
            });
            expect(perceive.type).toBe('perceive');

            const yield_ = PREYArtifactSchema.parse({
                type: 'yield',
                output: 'done',
                strangeLoopTarget: 'complete',
            });
            expect(yield_.type).toBe('yield');
        });
    });
});

// =============================================================================
// GALOIS LATTICE SCHEMA TESTS
// =============================================================================

describe('🔮 Galois Lattice Schema', () => {
    describe('GaloisCellSchema', () => {
        it('accepts valid diagonal cell (self-reference)', () => {
            const cell = GaloisCellSchema.parse({
                x: 7,
                y: 7,
                commanderX: 'Spider Sovereign',
                commanderY: 'Spider Sovereign',
                verbX: 'NAVIGATE',
                verbY: 'NAVIGATE',
                role: 'Strategic reflection',
                purpose: 'The Spider Sovereign deciding on the decision-making process',
                isDiagonal: true,
                isAntiDiagonal: false,
            });
            expect(cell.isDiagonal).toBe(true);
            expect(cell.isAntiDiagonal).toBe(false);
        });

        it('accepts valid anti-diagonal cell (HIVE phase)', () => {
            const cell = GaloisCellSchema.parse({
                x: 0,
                y: 7,
                commanderX: 'Lidless Legion',
                commanderY: 'Spider Sovereign',
                verbX: 'OBSERVE',
                verbY: 'NAVIGATE',
                role: 'HIVE Anti-Diagonal: HUNT',
                purpose: 'Strategic Hunt: Sensing what the Spider Sovereign decides to target',
                isDiagonal: false,
                isAntiDiagonal: true,
                hivePhase: 'H',
            });
            expect(cell.isAntiDiagonal).toBe(true);
            expect(cell.hivePhase).toBe('H');
        });

        it('rejects coordinates outside 0-7 range', () => {
            expect(() => GaloisCellSchema.parse({
                x: 8,
                y: 0,
                commanderX: 'Invalid',
                commanderY: 'Invalid',
                verbX: 'INVALID',
                verbY: 'INVALID',
                role: 'Invalid',
                purpose: 'Invalid',
                isDiagonal: false,
                isAntiDiagonal: false,
            })).toThrow();
        });
    });
});

// =============================================================================
// STIGMERGY EVENT SCHEMA TESTS
// =============================================================================

describe('📜 Stigmergy Event Schema', () => {
    describe('HourglassEventSchema', () => {
        it('accepts valid hourglass event', () => {
            const event = HourglassEventSchema.parse({
                ts: new Date().toISOString(),
                type: 'HOURGLASS_EVENT',
                workflow: 'HIVE',
                phase: 'H',
                pattern: '1010',
                step: 'HUNT_SCATTER',
                agentCount: 8,
                swarmId: 'SWARM_123',
                sessionId: 'SESSION_456',
                port: 7,
                hive: 'HFO_GEN88',
                gen: 88,
            });
            expect(event.type).toBe('HOURGLASS_EVENT');
            expect(event.gen).toBe(88);
        });

        it('rejects wrong port', () => {
            expect(() => HourglassEventSchema.parse({
                ts: new Date().toISOString(),
                type: 'HOURGLASS_EVENT',
                workflow: 'HIVE',
                phase: 'H',
                pattern: '1010',
                step: 'HUNT_SCATTER',
                agentCount: 8,
                swarmId: 'SWARM_123',
                sessionId: 'SESSION_456',
                port: 0, // Wrong!
                hive: 'HFO_GEN88',
                gen: 88,
            })).toThrow();
        });

        it('rejects wrong gen', () => {
            expect(() => HourglassEventSchema.parse({
                ts: new Date().toISOString(),
                type: 'HOURGLASS_EVENT',
                workflow: 'HIVE',
                phase: 'H',
                pattern: '1010',
                step: 'HUNT_SCATTER',
                agentCount: 8,
                swarmId: 'SWARM_123',
                sessionId: 'SESSION_456',
                port: 7,
                hive: 'HFO_GEN88',
                gen: 87, // Wrong!
            })).toThrow();
        });
    });
});

// =============================================================================
// CONSTANTS TESTS
// =============================================================================

describe('📊 Constants', () => {
    it('has 8 commanders', () => {
        expect(COMMANDERS.length).toBe(8);
        expect(COMMANDERS[0]).toBe('Lidless Legion');
        expect(COMMANDERS[7]).toBe('Spider Sovereign');
    });

    it('has 8 HFO verbs', () => {
        expect(HFO_VERBS.length).toBe(8);
        expect(HFO_VERBS[0]).toBe('OBSERVE');
        expect(HFO_VERBS[7]).toBe('NAVIGATE');
    });

    it('has correct HIVE phase port pairs (anti-diagonal X+Y=7)', () => {
        expect(HIVE_PHASE_PORTS.H).toEqual([0, 7]); // OBSERVE + NAVIGATE
        expect(HIVE_PHASE_PORTS.I).toEqual([1, 6]); // BRIDGE + ASSIMILATE
        expect(HIVE_PHASE_PORTS.V).toEqual([2, 5]); // SHAPE + IMMUNIZE
        expect(HIVE_PHASE_PORTS.E).toEqual([3, 4]); // INJECT + DISRUPT
    });

    it('has powers of 8', () => {
        expect(POWERS_OF_8).toContain(1);
        expect(POWERS_OF_8).toContain(8);
        expect(POWERS_OF_8).toContain(64);
        expect(POWERS_OF_8).toContain(512);
    });

    it('HIVE phase ports sum to 7 (anti-diagonal)', () => {
        Object.values(HIVE_PHASE_PORTS).forEach(([a, b]) => {
            expect(a + b).toBe(7);
        });
    });
});


describe('📊 PREY Phase Port Pairs', () => {
    it('has correct PREY phase port pairs (serpentine pattern)', () => {
        expect(PREY_PHASE_PORTS.P).toEqual([0, 6]); // OBSERVE + ASSIMILATE
        expect(PREY_PHASE_PORTS.R).toEqual([1, 7]); // BRIDGE + NAVIGATE
        expect(PREY_PHASE_PORTS.E).toEqual([2, 4]); // SHAPE + DISRUPT
        expect(PREY_PHASE_PORTS.Y).toEqual([3, 5]); // INJECT + IMMUNIZE
    });

    it('Perceive uses Port 0 + 6 (Lidless Legion + Kraken Keeper)', () => {
        const [portA, portB] = PREY_PHASE_PORTS.P;
        expect(COMMANDERS[portA]).toBe('Lidless Legion');
        expect(COMMANDERS[portB]).toBe('Kraken Keeper');
        expect(HFO_VERBS[portA]).toBe('OBSERVE');
        expect(HFO_VERBS[portB]).toBe('ASSIMILATE');
    });

    it('React uses Port 1 + 7 (Web Weaver + Spider Sovereign)', () => {
        const [portA, portB] = PREY_PHASE_PORTS.R;
        expect(COMMANDERS[portA]).toBe('Web Weaver');
        expect(COMMANDERS[portB]).toBe('Spider Sovereign');
        expect(HFO_VERBS[portA]).toBe('BRIDGE');
        expect(HFO_VERBS[portB]).toBe('NAVIGATE');
    });

    it('Execute uses Port 2 + 4 (Mirror Magus + Red Regnant)', () => {
        const [portA, portB] = PREY_PHASE_PORTS.E;
        expect(COMMANDERS[portA]).toBe('Mirror Magus');
        expect(COMMANDERS[portB]).toBe('Red Regnant');
        expect(HFO_VERBS[portA]).toBe('SHAPE');
        expect(HFO_VERBS[portB]).toBe('DISRUPT');
    });

    it('Yield uses Port 3 + 5 (Spore Storm + Pyre Praetorian)', () => {
        const [portA, portB] = PREY_PHASE_PORTS.Y;
        expect(COMMANDERS[portA]).toBe('Spore Storm');
        expect(COMMANDERS[portB]).toBe('Pyre Praetorian');
        expect(HFO_VERBS[portA]).toBe('INJECT');
        expect(HFO_VERBS[portB]).toBe('IMMUNIZE');
    });

    it('PREY pairs do NOT overlap with HIVE anti-diagonal', () => {
        // HIVE uses: (0,7), (1,6), (2,5), (3,4) and their mirrors
        // PREY uses: (0,6), (1,7), (2,4), (3,5) - different!
        const hivePairs = Object.values(HIVE_PHASE_PORTS);
        const preyPairs = Object.values(PREY_PHASE_PORTS);
        
        // Check that no PREY pair sums to 7 (anti-diagonal)
        preyPairs.forEach(([a, b]) => {
            expect(a + b).not.toBe(7);
        });
        
        // Check that all HIVE pairs sum to 7
        hivePairs.forEach(([a, b]) => {
            expect(a + b).toBe(7);
        });
    });
});
