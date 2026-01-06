/**
 * 🥈 TEST: Port 7 Spider Sovereign — TTV Engine
 * 
 * Authority: Spider Sovereign (The Social Spider)
 * Verb: NAVIGATE / DECIDE
 * Topic: Total Tool Virtualization & Cognitive Liberation
 * Provenance: hot_obsidian_sandbox/bronze/P7_TTV_KINETIC.md
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
    TTVEngine,
    distance3D,
    pointInRectangle,
    pointInCircle,
    pointInPolygon,
    assessSkill,
} from './ttv-engine.js';
import {
    VirtualizedTool,
    FusedState,
    ReferenceRecording,
} from './ttv-contracts.js';

describe('Geometry Utilities', () => {
    describe('distance3D', () => {
        it('should calculate distance between two points', () => {
            const a = { x: 0, y: 0, z: 0 };
            const b = { x: 3, y: 4, z: 0 };
            expect(distance3D(a, b)).toBe(5); // 3-4-5 triangle
        });

        it('should return 0 for same point', () => {
            const a = { x: 1, y: 2, z: 3 };
            expect(distance3D(a, a)).toBe(0);
        });

        it('should handle 3D distance', () => {
            const a = { x: 0, y: 0, z: 0 };
            const b = { x: 1, y: 1, z: 1 };
            expect(distance3D(a, b)).toBeCloseTo(Math.sqrt(3));
        });
    });

    describe('pointInRectangle', () => {
        const rect = [
            { x: 0, y: 0, z: 0 },
            { x: 1, y: 0, z: 0 },
            { x: 1, y: 1, z: 0 },
            { x: 0, y: 1, z: 0 },
        ];

        it('should return true for point inside', () => {
            expect(pointInRectangle({ x: 0.5, y: 0.5, z: 0 }, rect)).toBe(true);
        });

        it('should return true for point on edge', () => {
            expect(pointInRectangle({ x: 0, y: 0.5, z: 0 }, rect)).toBe(true);
        });

        it('should return false for point outside', () => {
            expect(pointInRectangle({ x: 2, y: 0.5, z: 0 }, rect)).toBe(false);
        });
    });

    describe('pointInCircle', () => {
        const center = { x: 0, y: 0, z: 0 };
        const radius = 1;

        it('should return true for point inside', () => {
            expect(pointInCircle({ x: 0.5, y: 0, z: 0 }, center, radius)).toBe(true);
        });

        it('should return true for point on edge', () => {
            expect(pointInCircle({ x: 1, y: 0, z: 0 }, center, radius)).toBe(true);
        });

        it('should return false for point outside', () => {
            expect(pointInCircle({ x: 2, y: 0, z: 0 }, center, radius)).toBe(false);
        });
    });

    describe('pointInPolygon', () => {
        const triangle = [
            { x: 0, y: 0, z: 0 },
            { x: 2, y: 0, z: 0 },
            { x: 1, y: 2, z: 0 },
        ];

        it('should return true for point inside triangle', () => {
            expect(pointInPolygon({ x: 1, y: 0.5, z: 0 }, triangle)).toBe(true);
        });

        it('should return false for point outside triangle', () => {
            expect(pointInPolygon({ x: 0, y: 2, z: 0 }, triangle)).toBe(false);
        });
    });
});

describe('TTVEngine', () => {
    let engine: TTVEngine;
    let paperPiano: VirtualizedTool;

    beforeEach(() => {
        paperPiano = {
            id: 'paper_piano_test',
            name: 'Test Paper Piano',
            type: 'piano',
            markers: [],
            regions: [
                {
                    id: 'key_c4',
                    type: 'rectangle',
                    vertices: [
                        { x: 0, y: 0, z: 0 },
                        { x: 0.025, y: 0, z: 0 },
                        { x: 0.025, y: 0.1, z: 0 },
                        { x: 0, y: 0.1, z: 0 },
                    ],
                    semanticRole: 'piano_key_60',
                    triggerType: 'touch',
                },
                {
                    id: 'key_d4',
                    type: 'rectangle',
                    vertices: [
                        { x: 0.025, y: 0, z: 0 },
                        { x: 0.05, y: 0, z: 0 },
                        { x: 0.05, y: 0.1, z: 0 },
                        { x: 0.025, y: 0.1, z: 0 },
                    ],
                    semanticRole: 'piano_key_62',
                    triggerType: 'touch',
                },
            ],
            referenceFrame: 'world',
        };

        engine = new TTVEngine(paperPiano, { touchThresholdZ: 0.01 });
    });

    describe('perceive', () => {
        it('should detect touch_start when finger enters region and touches', () => {
            const state: FusedState = {
                timestamp: 1000,
                handPoses: {
                    right: {
                        position: { x: 0.0125, y: 0.05, z: 0.005 }, // Inside key_c4, touching
                        orientation: { x: 0, y: 0, z: 0, w: 1 },
                        confidence: 0.95,
                        timestamp: 1000,
                    },
                },
                propPoses: [],
                confidence: 0.95,
                sources: ['test'],
            };

            const events = engine.perceive(state);
            
            expect(events.length).toBe(1);
            expect(events[0].type).toBe('touch_start');
            expect(events[0].regionId).toBe('key_c4');
        });

        it('should detect touch_end when finger leaves region', () => {
            // First touch
            const touchState: FusedState = {
                timestamp: 1000,
                handPoses: {
                    right: {
                        position: { x: 0.0125, y: 0.05, z: 0.005 },
                        orientation: { x: 0, y: 0, z: 0, w: 1 },
                        confidence: 0.95,
                        timestamp: 1000,
                    },
                },
                propPoses: [],
                confidence: 0.95,
                sources: ['test'],
            };
            engine.perceive(touchState);

            // Then release
            const releaseState: FusedState = {
                timestamp: 1100,
                handPoses: {
                    right: {
                        position: { x: 0.0125, y: 0.05, z: 0.1 }, // Lifted up
                        orientation: { x: 0, y: 0, z: 0, w: 1 },
                        confidence: 0.95,
                        timestamp: 1100,
                    },
                },
                propPoses: [],
                confidence: 0.95,
                sources: ['test'],
            };
            const events = engine.perceive(releaseState);

            expect(events.length).toBe(1);
            expect(events[0].type).toBe('touch_end');
            expect(events[0].regionId).toBe('key_c4');
        });

        it('should not detect touch when finger is above threshold', () => {
            const state: FusedState = {
                timestamp: 1000,
                handPoses: {
                    right: {
                        position: { x: 0.0125, y: 0.05, z: 0.1 }, // Above threshold
                        orientation: { x: 0, y: 0, z: 0, w: 1 },
                        confidence: 0.95,
                        timestamp: 1000,
                    },
                },
                propPoses: [],
                confidence: 0.95,
                sources: ['test'],
            };

            const events = engine.perceive(state);
            expect(events.length).toBe(0);
        });
    });

    describe('react', () => {
        it('should generate MIDI note-on for touch_start on piano key', () => {
            const events = [{
                id: 'event_1',
                timestamp: 1000,
                type: 'touch_start' as const,
                regionId: 'key_c4',
                toolId: 'paper_piano_test',
                position: { x: 0.0125, y: 0.05, z: 0.005 },
                pressure: 0.8,
            }];

            const actions = engine.react(events);

            expect(actions.length).toBe(1);
            expect(actions[0].type).toBe('midi_note');
            expect(actions[0].payload.note).toBe(60); // Middle C
            expect(actions[0].payload.on).toBe(true);
            expect(actions[0].payload.velocity).toBe(102); // 0.8 * 127 ≈ 102
        });

        it('should generate MIDI note-off for touch_end on piano key', () => {
            const events = [{
                id: 'event_1',
                timestamp: 1000,
                type: 'touch_end' as const,
                regionId: 'key_c4',
                toolId: 'paper_piano_test',
                position: { x: 0.0125, y: 0.05, z: 0.1 },
            }];

            const actions = engine.react(events);

            expect(actions.length).toBe(1);
            expect(actions[0].type).toBe('midi_note');
            expect(actions[0].payload.note).toBe(60);
            expect(actions[0].payload.on).toBe(false);
        });
    });

    describe('process (full pipeline)', () => {
        it('should process state and generate actions', () => {
            const state: FusedState = {
                timestamp: 1000,
                handPoses: {
                    right: {
                        position: { x: 0.0125, y: 0.05, z: 0.005 },
                        orientation: { x: 0, y: 0, z: 0, w: 1 },
                        confidence: 0.95,
                        timestamp: 1000,
                    },
                },
                propPoses: [],
                confidence: 0.95,
                sources: ['test'],
            };

            const actions = engine.process(state);

            expect(actions.length).toBe(1);
            expect(actions[0].type).toBe('midi_note');
        });

        it('should handle multiple simultaneous touches', () => {
            // Touch both keys
            const state: FusedState = {
                timestamp: 1000,
                handPoses: {
                    right: {
                        position: { x: 0.0125, y: 0.05, z: 0.005 }, // key_c4
                        orientation: { x: 0, y: 0, z: 0, w: 1 },
                        confidence: 0.95,
                        timestamp: 1000,
                    },
                    left: {
                        position: { x: 0.0375, y: 0.05, z: 0.005 }, // key_d4
                        orientation: { x: 0, y: 0, z: 0, w: 1 },
                        confidence: 0.95,
                        timestamp: 1000,
                    },
                },
                propPoses: [],
                confidence: 0.95,
                sources: ['test'],
            };

            const actions = engine.process(state);

            expect(actions.length).toBe(2);
            const notes = actions.map(a => a.payload.note).sort();
            expect(notes).toEqual([60, 62]); // C4 and D4
        });
    });

    describe('getActiveInteractions', () => {
        it('should track active interactions', () => {
            const state: FusedState = {
                timestamp: 1000,
                handPoses: {
                    right: {
                        position: { x: 0.0125, y: 0.05, z: 0.005 },
                        orientation: { x: 0, y: 0, z: 0, w: 1 },
                        confidence: 0.95,
                        timestamp: 1000,
                    },
                },
                propPoses: [],
                confidence: 0.95,
                sources: ['test'],
            };

            engine.perceive(state);
            const active = engine.getActiveInteractions();

            expect(active.length).toBe(1);
            expect(active[0].regionId).toBe('key_c4');
        });
    });

    describe('reset', () => {
        it('should clear all state', () => {
            const state: FusedState = {
                timestamp: 1000,
                handPoses: {
                    right: {
                        position: { x: 0.0125, y: 0.05, z: 0.005 },
                        orientation: { x: 0, y: 0, z: 0, w: 1 },
                        confidence: 0.95,
                        timestamp: 1000,
                    },
                },
                propPoses: [],
                confidence: 0.95,
                sources: ['test'],
            };

            engine.perceive(state);
            expect(engine.getActiveInteractions().length).toBe(1);

            engine.reset();
            expect(engine.getActiveInteractions().length).toBe(0);
        });
    });
});

describe('Skill Assessment', () => {
    it('should assess skill against reference recording', () => {
        const studentFrames: FusedState[] = [
            {
                timestamp: 0,
                handPoses: {
                    right: {
                        position: { x: 0.01, y: 0.05, z: 0.005 },
                        orientation: { x: 0, y: 0, z: 0, w: 1 },
                        confidence: 0.9,
                        timestamp: 0,
                    },
                },
                propPoses: [],
                confidence: 0.9,
                sources: ['test'],
            },
        ];

        const studentEvents = [
            {
                id: 'event_1',
                timestamp: 100,
                type: 'touch_start' as const,
                regionId: 'key_c4',
                toolId: 'test',
                position: { x: 0.01, y: 0.05, z: 0.005 },
            },
        ];

        const reference: ReferenceRecording = {
            id: 'ref_1',
            name: 'Test Reference',
            toolId: 'test',
            duration: 1000,
            frames: [
                {
                    timestamp: 0,
                    handPoses: {
                        right: {
                            position: { x: 0.0125, y: 0.05, z: 0.005 }, // Slightly different
                            orientation: { x: 0, y: 0, z: 0, w: 1 },
                            confidence: 0.95,
                            timestamp: 0,
                        },
                    },
                    propPoses: [],
                    confidence: 0.95,
                    sources: ['test'],
                },
            ],
            interactions: [
                {
                    id: 'ref_event_1',
                    timestamp: 110, // 10ms later
                    type: 'touch_start' as const,
                    regionId: 'key_c4',
                    toolId: 'test',
                    position: { x: 0.0125, y: 0.05, z: 0.005 },
                },
            ],
        };

        const assessment = assessSkill(studentFrames, studentEvents, reference);

        expect(assessment.scores.accuracy).toBeGreaterThan(0);
        expect(assessment.scores.accuracy).toBeLessThanOrEqual(100);
        expect(assessment.scores.timing).toBeGreaterThan(0);
        expect(assessment.scores.overall).toBeGreaterThan(0);
        expect(assessment.feedback.length).toBeGreaterThan(0);
    });
});

describe('TTV Use Case: Paper Piano Integration', () => {
    it('should simulate a complete piano playing session', () => {
        const piano: VirtualizedTool = {
            id: 'paper_piano_c_major',
            name: 'Paper Piano C Major Scale',
            type: 'piano',
            markers: [],
            regions: ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C2'].map((note, i) => ({
                id: `key_${note}`,
                type: 'rectangle' as const,
                vertices: [
                    { x: i * 0.025, y: 0, z: 0 },
                    { x: (i + 1) * 0.025, y: 0, z: 0 },
                    { x: (i + 1) * 0.025, y: 0.1, z: 0 },
                    { x: i * 0.025, y: 0.1, z: 0 },
                ],
                semanticRole: `piano_key_${60 + [0, 2, 4, 5, 7, 9, 11, 12][i]}`, // C major scale
                triggerType: 'touch' as const,
            })),
            referenceFrame: 'world',
        };

        const engine = new TTVEngine(piano);
        const allActions: any[] = [];

        // Simulate playing C major scale
        const scale = [0, 2, 4, 5, 7, 9, 11, 12]; // Semitones from C4
        
        for (let i = 0; i < scale.length; i++) {
            const keyX = i * 0.025 + 0.0125; // Center of each key
            
            // Touch down
            const touchState: FusedState = {
                timestamp: i * 500,
                handPoses: {
                    right: {
                        position: { x: keyX, y: 0.05, z: 0.005 },
                        orientation: { x: 0, y: 0, z: 0, w: 1 },
                        confidence: 0.95,
                        timestamp: i * 500,
                    },
                },
                propPoses: [],
                confidence: 0.95,
                sources: ['test'],
            };
            allActions.push(...engine.process(touchState));

            // Release
            const releaseState: FusedState = {
                timestamp: i * 500 + 400,
                handPoses: {
                    right: {
                        position: { x: keyX, y: 0.05, z: 0.1 },
                        orientation: { x: 0, y: 0, z: 0, w: 1 },
                        confidence: 0.95,
                        timestamp: i * 500 + 400,
                    },
                },
                propPoses: [],
                confidence: 0.95,
                sources: ['test'],
            };
            allActions.push(...engine.process(releaseState));
        }

        // Should have 16 actions (8 note-on + 8 note-off)
        expect(allActions.length).toBe(16);

        // Check that we played the C major scale
        const noteOns = allActions.filter(a => a.payload.on === true);
        const notes = noteOns.map(a => a.payload.note);
        expect(notes).toEqual([60, 62, 64, 65, 67, 69, 71, 72]); // C major scale
    });
});
