/**
 * ⏳ THE OBSIDIAN HOURGLASS — Engine Tests
 * 
 * Authority: Spider Sovereign (The Social Spider)
 * Verb: NAVIGATE / DECIDE
 * Topic: Durable Swarm Orchestration & Strange Loop Workflows
 * Provenance: hot_obsidian_sandbox/bronze/P7_SPIDER_SOVEREIGN/hourglass-engine.ts
 * 
 * TDD RED → GREEN: These tests validate the Obsidian Hourglass engine.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import * as fs from 'fs';
import {
    ObsidianHourglass,
    createHourglass,
    resolveGaloisCell,
    createAgentIdentity,
    createAgentState,
    createSwarmConfig,
    createSwarmState,
    logToBlackboard,
    logHourglassEvent,
} from './hourglass-engine';
import { AgentState } from './hourglass-contracts';

// Mock fs to prevent actual file writes during tests
vi.mock('fs', () => ({
    appendFileSync: vi.fn(),
}));

describe('⏳ Obsidian Hourglass Engine', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // =========================================================================
    // GALOIS LATTICE RESOLVER TESTS
    // =========================================================================

    describe('resolveGaloisCell', () => {
        it('resolves diagonal cells (self-reference)', () => {
            const cell = resolveGaloisCell(7, 7);
            expect(cell.isDiagonal).toBe(true);
            expect(cell.isAntiDiagonal).toBe(false);
            expect(cell.commanderX).toBe('Spider Sovereign');
            expect(cell.commanderY).toBe('Spider Sovereign');
            expect(cell.role).toContain('Self-Reference');
        });

        it('resolves anti-diagonal cells (HIVE phases)', () => {
            // H: Hunt (0,7) or (7,0)
            const huntCell = resolveGaloisCell(0, 7);
            expect(huntCell.isAntiDiagonal).toBe(true);
            expect(huntCell.hivePhase).toBe('H');
            expect(huntCell.role).toContain('H'); // HIVE Anti-Diagonal: H

            // I: Interlock (1,6) or (6,1)
            const interlockCell = resolveGaloisCell(1, 6);
            expect(interlockCell.isAntiDiagonal).toBe(true);
            expect(interlockCell.hivePhase).toBe('I');

            // V: Validate (2,5) or (5,2)
            const validateCell = resolveGaloisCell(2, 5);
            expect(validateCell.isAntiDiagonal).toBe(true);
            expect(validateCell.hivePhase).toBe('V');

            // E: Evolve (3,4) or (4,3)
            const evolveCell = resolveGaloisCell(3, 4);
            expect(evolveCell.isAntiDiagonal).toBe(true);
            expect(evolveCell.hivePhase).toBe('E');
        });

        it('resolves regular cells', () => {
            const cell = resolveGaloisCell(0, 1);
            expect(cell.isDiagonal).toBe(false);
            expect(cell.isAntiDiagonal).toBe(false);
            expect(cell.commanderX).toBe('Lidless Legion');
            expect(cell.commanderY).toBe('Web Weaver');
        });

        it('wraps coordinates to 0-7 range', () => {
            const cell = resolveGaloisCell(8, 9);
            expect(cell.x).toBe(0);
            expect(cell.y).toBe(1);
        });
    });

    // =========================================================================
    // FACTORY FUNCTION TESTS
    // =========================================================================

    describe('createAgentIdentity', () => {
        it('creates valid agent identity', () => {
            const identity = createAgentIdentity(7, { x: 7, y: 0 }, 'SWARM_123');
            expect(identity.port).toBe(7);
            expect(identity.coordinate.x).toBe(7);
            expect(identity.swarmId).toBe('SWARM_123');
            expect(identity.id).toContain('AGENT_7_7_0');
        });

        it('includes parentAgentId when provided', () => {
            const identity = createAgentIdentity(0, { x: 0, y: 0 }, 'SWARM_123', 'PARENT_AGENT');
            expect(identity.parentAgentId).toBe('PARENT_AGENT');
        });
    });

    describe('createAgentState', () => {
        it('creates valid agent state', () => {
            const identity = createAgentIdentity(7, { x: 7, y: 0 }, 'SWARM_123');
            const state = createAgentState(identity, 'HIVE', 'H', 'HUNT_SCATTER');
            expect(state.workflow).toBe('HIVE');
            expect(state.phase).toBe('H');
            expect(state.step).toBe('HUNT_SCATTER');
            expect(state.status).toBe('idle');
        });
    });

    describe('createSwarmConfig', () => {
        it('creates valid swarm config', () => {
            const config = createSwarmConfig('HIVE', 'Test context');
            expect(config.workflow).toBe('HIVE');
            expect(config.context).toBe('Test context');
            expect(config.pattern).toBe('1010');
            expect(config.agentCount).toBe(8);
        });

        it('accepts custom agent count (powers of 8)', () => {
            const config = createSwarmConfig('PREY', 'Test', '1010', 64);
            expect(config.agentCount).toBe(64);
        });
    });

    describe('createSwarmState', () => {
        it('creates valid swarm state', () => {
            const config = createSwarmConfig('HIVE', 'Test');
            const state = createSwarmState(config, 'H');
            expect(state.currentPhase).toBe('H');
            expect(state.currentStep).toBe('HUNT_SCATTER');
            expect(state.status).toBe('initializing');
            expect(state.agents).toEqual([]);
        });

        it('sets correct step for PREY workflow', () => {
            const config = createSwarmConfig('PREY', 'Test', '1010', 1);
            const state = createSwarmState(config, 'P');
            expect(state.currentStep).toBe('PERCEIVE');
        });
    });

    // =========================================================================
    // STIGMERGY LOGGING TESTS
    // =========================================================================

    describe('logToBlackboard', () => {
        it('appends JSON to blackboard file', () => {
            const event = { type: 'TEST', data: 'value' };
            logToBlackboard(event);
            expect(fs.appendFileSync).toHaveBeenCalledWith(
                expect.stringContaining('obsidianblackboard.jsonl'),
                JSON.stringify(event) + '\n'
            );
        });
    });

    describe('logHourglassEvent', () => {
        it('logs valid hourglass event', () => {
            logHourglassEvent('HIVE', 'H', '1010', 'HUNT_SCATTER', 8, 'SWARM_1', 'SESSION_1');
            expect(fs.appendFileSync).toHaveBeenCalled();
            const call = (fs.appendFileSync as any).mock.calls[0];
            const logged = JSON.parse(call[1].trim());
            expect(logged.type).toBe('HOURGLASS_EVENT');
            expect(logged.workflow).toBe('HIVE');
            expect(logged.phase).toBe('H');
            expect(logged.port).toBe(7);
            expect(logged.gen).toBe(88);
        });
    });

    // =========================================================================
    // HOURGLASS ENGINE TESTS
    // =========================================================================

    describe('ObsidianHourglass', () => {
        let hourglass: ObsidianHourglass;

        beforeEach(() => {
            hourglass = createHourglass('Test mission');
        });

        describe('session management', () => {
            it('creates session with correct initial state', () => {
                const session = hourglass.getSession();
                expect(session.context).toBe('Test mission');
                expect(session.status).toBe('initializing');
                expect(session.currentWorkflow).toBe('HIVE');
                expect(session.currentPhase).toBe('H');
                expect(session.iterationCount).toBe(0);
            });

            it('starts session', () => {
                hourglass.start();
                expect(hourglass.getSession().status).toBe('running');
            });

            it('pauses session', () => {
                hourglass.start();
                hourglass.pause();
                expect(hourglass.getSession().status).toBe('paused');
            });

            it('completes session', () => {
                hourglass.start();
                hourglass.complete();
                const session = hourglass.getSession();
                expect(session.status).toBe('completed');
                expect(session.endTime).toBeDefined();
            });

            it('fails session with error', () => {
                hourglass.start();
                hourglass.fail('Test error');
                const session = hourglass.getSession();
                expect(session.status).toBe('failed');
                expect(session.endTime).toBeDefined();
            });
        });

        describe('HIVE/8 strategic loop', () => {
            it('initiates HIVE swarm', async () => {
                const swarm = await hourglass.initiateHIVE('Feature development');
                expect(swarm.config.workflow).toBe('HIVE');
                expect(swarm.config.context).toBe('Feature development');
                expect(swarm.currentPhase).toBe('H');
                expect(hourglass.getSession().hiveSwarms.length).toBe(1);
            });

            it('executes HIVE phase with scatter (8 agents)', async () => {
                const swarm = await hourglass.initiateHIVE('Test', 8);
                const results = await hourglass.executeHIVEPhase(swarm, 'H', async (agent) => {
                    return { agentId: agent.identity.id, result: 'hunted' };
                });
                expect(results.length).toBe(8);
                expect(swarm.agents.length).toBe(8);
            });

            it('executes HIVE phase with gather (1 agent)', async () => {
                const swarm = await hourglass.initiateHIVE('Test', 8);
                const results = await hourglass.executeHIVEPhase(swarm, 'I', async (agent) => {
                    return { agentId: agent.identity.id, result: 'interlocked' };
                });
                expect(results.length).toBe(1);
            });

            it('runs full HIVE cycle (H → I → V → E)', async () => {
                const executors = {
                    hunt: async (agent: AgentState) => ({ phase: 'H', agent: agent.identity.id }),
                    interlock: async (agent: AgentState) => ({ phase: 'I', agent: agent.identity.id }),
                    validate: async (agent: AgentState) => ({ phase: 'V', agent: agent.identity.id }),
                    evolve: async (agent: AgentState) => ({ phase: 'E', agent: agent.identity.id }),
                };

                const { swarm, artifacts } = await hourglass.runHIVECycle('Full cycle test', executors, 8);

                expect(swarm.status).toBe('completed');
                expect(artifacts.H.length).toBe(8);  // Scatter
                expect(artifacts.I.length).toBe(1);  // Gather
                expect(artifacts.V.length).toBe(8);  // Scatter
                expect(artifacts.E.length).toBe(1);  // Gather
                expect(hourglass.getSession().iterationCount).toBe(1);
            });
        });

        describe('PREY/8 tactical loop', () => {
            it('initiates PREY swarm', async () => {
                const swarm = await hourglass.initiatePREY('Tool execution');
                expect(swarm.config.workflow).toBe('PREY');
                expect(swarm.config.agentCount).toBe(1);
                expect(swarm.currentPhase).toBe('P');
                expect(hourglass.getSession().preySwarms.length).toBe(1);
            });

            it('executes PREY phase (single agent)', async () => {
                const swarm = await hourglass.initiatePREY('Test');
                const result = await hourglass.executePREYPhase(swarm, 'P', async (agent) => {
                    return { perceived: true };
                });
                expect(result).toEqual({ perceived: true });
                expect(swarm.agents.length).toBe(1);
            });

            it('runs full PREY cycle (P → R → E → Y)', async () => {
                const executors = {
                    perceive: async (agent: AgentState) => ({ phase: 'P', data: 'sensor_data' }),
                    react: async (agent: AgentState) => ({ phase: 'R', plan: 'action_plan' }),
                    execute: async (agent: AgentState) => ({ phase: 'E', result: 'executed' }),
                    yield: async (agent: AgentState) => ({ phase: 'Y', output: 'final_output' }),
                };

                const { swarm, artifacts } = await hourglass.runPREYCycle('Full PREY test', executors);

                expect(swarm.status).toBe('completed');
                expect(artifacts.P).toEqual({ phase: 'P', data: 'sensor_data' });
                expect(artifacts.R).toEqual({ phase: 'R', plan: 'action_plan' });
                expect(artifacts.E).toEqual({ phase: 'E', result: 'executed' });
                expect(artifacts.Y).toEqual({ phase: 'Y', output: 'final_output' });
            });
        });

        describe('strange loop mechanics', () => {
            it('records strange loop event', () => {
                const event = hourglass.recordStrangeLoop(
                    'HIVE', 'E', 'SWARM_1',
                    'PREY', 'P',
                    { artifact: 'test' }
                );
                expect(event.loopType).toBe('HIVE_TO_PREY');
                expect(hourglass.getSession().strangeLoops.length).toBe(1);
            });

            it('triggers HIVE → PREY strange loop', async () => {
                const hiveSwarm = await hourglass.initiateHIVE('Test');
                hiveSwarm.currentPhase = 'E';

                const preyExecutors = {
                    perceive: async () => ({ perceived: true }),
                    react: async () => ({ reacted: true }),
                    execute: async () => ({ executed: true }),
                    yield: async () => ({ yielded: true }),
                };

                const { swarm } = await hourglass.hiveToPreyLoop(
                    hiveSwarm,
                    { evolveArtifact: 'test' },
                    'PREY from HIVE',
                    preyExecutors
                );

                expect(swarm.config.workflow).toBe('PREY');
                expect(hourglass.getSession().strangeLoops.length).toBe(1);
                expect(hourglass.getSession().strangeLoops[0].loopType).toBe('HIVE_TO_PREY');
            });

            it('triggers PREY → HIVE strange loop', async () => {
                const preySwarm = await hourglass.initiatePREY('Test');
                preySwarm.currentPhase = 'Y';

                const hiveExecutors = {
                    hunt: async () => ({ hunted: true }),
                    interlock: async () => ({ interlocked: true }),
                    validate: async () => ({ validated: true }),
                    evolve: async () => ({ evolved: true }),
                };

                const { swarm } = await hourglass.preyToHiveLoop(
                    preySwarm,
                    { yieldArtifact: 'test' },
                    'HIVE from PREY',
                    hiveExecutors,
                    8
                );

                expect(swarm.config.workflow).toBe('HIVE');
                expect(hourglass.getSession().strangeLoops.length).toBe(1);
                expect(hourglass.getSession().strangeLoops[0].loopType).toBe('PREY_TO_HIVE');
            });
        });

        describe('thought management', () => {
            it('records thoughts with sequential numbering', () => {
                const thought1 = hourglass.think({
                    thought: 'First thought',
                    nextThoughtNeeded: true,
                });
                const thought2 = hourglass.think({
                    thought: 'Second thought',
                    nextThoughtNeeded: false,
                });

                expect(thought1.thoughtNumber).toBe(1);
                expect(thought2.thoughtNumber).toBe(2);
                expect(hourglass.getThoughts().length).toBe(2);
            });

            it('resolves semantic role from coordinate', () => {
                const thought = hourglass.think({
                    thought: 'Hunting for exemplars',
                    nextThoughtNeeded: true,
                    coordinate: { x: 0, y: 7 },
                });

                expect(thought.semanticRole).toContain('Anti-Diagonal');
                expect(thought.purpose).toBeDefined();
            });

            it('records revision thoughts', () => {
                const original = hourglass.think({
                    thought: 'Original thought',
                    nextThoughtNeeded: true,
                });
                const revision = hourglass.think({
                    thought: 'Revised thought',
                    nextThoughtNeeded: false,
                    isRevision: true,
                    revisesThought: original.thoughtNumber,
                });

                expect(revision.isRevision).toBe(true);
                expect(revision.revisesThought).toBe(1);
            });

            it('logs thoughts to blackboard', () => {
                hourglass.think({
                    thought: 'Test thought',
                    nextThoughtNeeded: false,
                });

                expect(fs.appendFileSync).toHaveBeenCalled();
            });
        });
    });

    // =========================================================================
    // INTEGRATION TESTS (HOLONIC STRUCTURE)
    // =========================================================================

    describe('integration: holonic structure', () => {
        it('spawns PREY loops within HIVE phase', async () => {
            const hourglass = createHourglass('Holonic test');
            hourglass.start();

            const hiveSwarm = await hourglass.initiateHIVE('Feature development');
            
            // Spawn multiple PREY loops within Hunt phase
            const preyExecutors = {
                perceive: async () => ({ sensed: 'data' }),
                react: async () => ({ analyzed: true }),
                execute: async () => ({ acted: true }),
                yield: async () => ({ assessed: 'complete' }),
            };

            const prey1 = await hourglass.spawnPREYWithinHIVE(
                'H', hiveSwarm.config.id, 'Web search', preyExecutors
            );
            const prey2 = await hourglass.spawnPREYWithinHIVE(
                'H', hiveSwarm.config.id, 'Knowledge bank query', preyExecutors
            );

            const session = hourglass.getSession();
            expect(session.preySwarms.length).toBe(2);
            // Each spawn creates 2 strange loops: HIVE→PREY and PREY→HIVE
            expect(session.strangeLoops.length).toBe(4);
            expect(session.strangeLoops[0].loopType).toBe('HIVE_TO_PREY');
            expect(session.strangeLoops[1].loopType).toBe('PREY_TO_HIVE');
        });

        it('chains PREY loops (PREY N → PREY N+1)', async () => {
            const hourglass = createHourglass('Chain test');
            hourglass.start();

            const hiveSwarm = await hourglass.initiateHIVE('Test');
            
            const preyExecutors = {
                perceive: async () => ({ step: 1 }),
                react: async () => ({ step: 2 }),
                execute: async () => ({ step: 3 }),
                yield: async () => ({ step: 4, data: 'for_next' }),
            };

            // First PREY
            const prey1 = await hourglass.spawnPREYWithinHIVE(
                'H', hiveSwarm.config.id, 'First PREY', preyExecutors
            );

            // Chain to second PREY
            const prey2 = await hourglass.chainPREY(
                prey1.swarm,
                prey1.artifacts.Y,
                'Second PREY (chained)',
                preyExecutors
            );

            const session = hourglass.getSession();
            expect(session.preySwarms.length).toBe(2);
            // Should have PREY→PREY strange loop
            const preyToPreyLoop = session.strangeLoops.find(l => l.loopType === 'PREY_TO_PREY');
            expect(preyToPreyLoop).toBeDefined();
        });

        it('runs complete HIVE cycle with nested PREY multitudes', async () => {
            const hourglass = createHourglass('Full holonic test');
            hourglass.start();

            // Run HIVE cycle where each phase spawns PREY loops
            const hiveExecutors = {
                hunt: async (agent: AgentState) => {
                    // Hunt spawns 2 PREY loops for research
                    const prey1 = await hourglass.spawnPREYWithinHIVE(
                        'H', agent.identity.swarmId, 'Research 1',
                        {
                            perceive: async () => ({ query: 'test' }),
                            react: async () => ({ results: ['a'] }),
                            execute: async () => ({ processed: true }),
                            yield: async () => ({ summary: 'done' }),
                        }
                    );
                    return { huntResult: 'done', preyYield: prey1.artifacts.Y };
                },
                interlock: async () => ({ contracts: ['Schema1'] }),
                validate: async () => ({ tests: 'passing' }),
                evolve: async () => ({ mutationScore: 85 }),
            };

            const { swarm, artifacts } = await hourglass.runHIVECycle(
                'Feature with holonic PREY',
                hiveExecutors,
                8
            );

            hourglass.complete();

            const session = hourglass.getSession();
            expect(session.status).toBe('completed');
            expect(session.hiveSwarms.length).toBe(1);
            // 8 hunt agents each spawn 1 PREY = 8 PREY swarms
            expect(session.preySwarms.length).toBe(8);
            expect(session.iterationCount).toBe(1);
        });

        it('handles errors gracefully in nested PREY', async () => {
            const hourglass = createHourglass('Error test');
            hourglass.start();

            const swarm = await hourglass.initiateHIVE('Test');
            
            // PREY that fails during execute
            try {
                await hourglass.spawnPREYWithinHIVE(
                    'H', swarm.config.id, 'Failing PREY',
                    {
                        perceive: async () => ({ ok: true }),
                        react: async () => ({ ok: true }),
                        execute: async () => { throw new Error('PREY execution failed'); },
                        yield: async () => ({ ok: true }),
                    }
                );
            } catch (e) {
                // Expected
            }

            const session = hourglass.getSession();
            const failedAgent = session.preySwarms[0]?.agents.find(a => a.status === 'failed');
            expect(failedAgent).toBeDefined();
            expect(failedAgent?.error).toBe('PREY execution failed');
        });
    });
});
