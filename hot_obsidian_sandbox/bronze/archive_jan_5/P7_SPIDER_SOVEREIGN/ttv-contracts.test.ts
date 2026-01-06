/**
 * 🥈 TEST: Port 7 Spider Sovereign — TTV Contracts
 * 
 * Authority: Spider Sovereign (The Social Spider)
 * Verb: NAVIGATE / DECIDE
 * Topic: Total Tool Virtualization & Cognitive Liberation
 * Provenance: hot_obsidian_sandbox/bronze/P7_TTV_KINETIC.md
 */
import { describe, it, expect } from 'vitest';
import {
    Point3DSchema,
    QuaternionSchema,
    Pose6DOFSchema,
    MarkerSchema,
    InteractiveRegionSchema,
    VirtualizedToolSchema,
    SensorModalitySchema,
    SensorReadingSchema,
    FusedStateSchema,
    InteractionEventSchema,
    TTVActionSchema,
    ReferenceRecordingSchema,
    SkillAssessmentSchema,
    TTVSessionSchema,
} from './ttv-contracts.js';

describe('Port 7: TTV Contracts', () => {
    describe('Point3D', () => {
        it('should validate a valid 3D point', () => {
            const point = { x: 1.0, y: 2.0, z: 3.0 };
            expect(Point3DSchema.parse(point)).toEqual(point);
        });

        it('should reject invalid coordinates', () => {
            expect(() => Point3DSchema.parse({ x: 'a', y: 2, z: 3 })).toThrow();
        });
    });

    describe('Quaternion', () => {
        it('should validate a valid quaternion', () => {
            const quat = { x: 0, y: 0, z: 0, w: 1 }; // Identity quaternion
            expect(QuaternionSchema.parse(quat)).toEqual(quat);
        });
    });

    describe('Pose6DOF', () => {
        it('should validate a valid 6DOF pose', () => {
            const pose = {
                position: { x: 0, y: 0, z: 0 },
                orientation: { x: 0, y: 0, z: 0, w: 1 },
                confidence: 0.95,
                timestamp: Date.now(),
            };
            expect(Pose6DOFSchema.parse(pose)).toEqual(pose);
        });

        it('should reject confidence outside 0-1 range', () => {
            const pose = {
                position: { x: 0, y: 0, z: 0 },
                orientation: { x: 0, y: 0, z: 0, w: 1 },
                confidence: 1.5, // Invalid
                timestamp: Date.now(),
            };
            expect(() => Pose6DOFSchema.parse(pose)).toThrow();
        });
    });

    describe('Marker', () => {
        it('should validate a valid marker', () => {
            const marker = {
                id: 'marker_1',
                color: 'red' as const,
                position: { x: 0.1, y: 0.2, z: 0 },
                radius: 0.02,
                semanticRole: 'octave_indicator',
            };
            expect(MarkerSchema.parse(marker)).toEqual(marker);
        });

        it('should reject invalid color', () => {
            const marker = {
                id: 'marker_1',
                color: 'purple', // Invalid
                position: { x: 0.1, y: 0.2, z: 0 },
                radius: 0.02,
                semanticRole: 'octave_indicator',
            };
            expect(() => MarkerSchema.parse(marker)).toThrow();
        });
    });

    describe('InteractiveRegion', () => {
        it('should validate a valid rectangular region', () => {
            const region = {
                id: 'key_c4',
                type: 'rectangle' as const,
                vertices: [
                    { x: 0, y: 0, z: 0 },
                    { x: 0.02, y: 0, z: 0 },
                    { x: 0.02, y: 0.1, z: 0 },
                    { x: 0, y: 0.1, z: 0 },
                ],
                semanticRole: 'piano_key_c4',
                triggerType: 'touch' as const,
            };
            expect(InteractiveRegionSchema.parse(region)).toEqual(region);
        });

        it('should reject region with less than 3 vertices', () => {
            const region = {
                id: 'key_c4',
                type: 'polygon' as const,
                vertices: [
                    { x: 0, y: 0, z: 0 },
                    { x: 0.02, y: 0, z: 0 },
                ],
                semanticRole: 'piano_key_c4',
                triggerType: 'touch' as const,
            };
            expect(() => InteractiveRegionSchema.parse(region)).toThrow();
        });
    });

    describe('VirtualizedTool', () => {
        it('should validate a paper piano tool', () => {
            const piano = {
                id: 'paper_piano_1',
                name: 'Paper Piano (1 Octave)',
                type: 'piano' as const,
                markers: [
                    {
                        id: 'octave_marker',
                        color: 'red' as const,
                        position: { x: 0, y: 0, z: 0 },
                        radius: 0.01,
                        semanticRole: 'octave_indicator',
                    },
                ],
                regions: [
                    {
                        id: 'key_c4',
                        type: 'rectangle' as const,
                        vertices: [
                            { x: 0, y: 0, z: 0 },
                            { x: 0.02, y: 0, z: 0 },
                            { x: 0.02, y: 0.1, z: 0 },
                            { x: 0, y: 0.1, z: 0 },
                        ],
                        semanticRole: 'piano_key_c4',
                        triggerType: 'touch' as const,
                    },
                ],
                referenceFrame: 'world' as const,
            };
            expect(VirtualizedToolSchema.parse(piano)).toEqual(piano);
        });
    });

    describe('SensorModality', () => {
        it('should validate all sensor modalities', () => {
            const modalities = [
                'camera_rgb',
                'camera_depth',
                'camera_thermal',
                'imu_accelerometer',
                'imu_gyroscope',
                'imu_magnetometer',
                'audio_microphone',
                'audio_ultrasonic',
            ];
            modalities.forEach(m => {
                expect(SensorModalitySchema.parse(m)).toBe(m);
            });
        });
    });

    describe('FusedState', () => {
        it('should validate a fused sensor state', () => {
            const state = {
                timestamp: Date.now(),
                handPoses: {
                    right: {
                        position: { x: 0.3, y: 0.5, z: 0.2 },
                        orientation: { x: 0, y: 0, z: 0, w: 1 },
                        confidence: 0.9,
                        timestamp: Date.now(),
                    },
                },
                propPoses: [],
                confidence: 0.85,
                sources: ['camera_1', 'imu_1'],
            };
            expect(FusedStateSchema.parse(state)).toEqual(state);
        });
    });

    describe('InteractionEvent', () => {
        it('should validate a touch event', () => {
            const event = {
                id: 'event_1',
                timestamp: Date.now(),
                type: 'touch_start' as const,
                regionId: 'key_c4',
                toolId: 'paper_piano_1',
                position: { x: 0.01, y: 0.05, z: 0.001 },
                pressure: 0.7,
            };
            expect(InteractionEventSchema.parse(event)).toEqual(event);
        });
    });

    describe('TTVAction', () => {
        it('should validate a MIDI note action', () => {
            const action = {
                id: 'action_1',
                timestamp: Date.now(),
                type: 'midi_note' as const,
                payload: {
                    note: 60, // Middle C
                    velocity: 100,
                    channel: 0,
                },
            };
            expect(TTVActionSchema.parse(action)).toEqual(action);
        });
    });

    describe('SkillAssessment', () => {
        it('should validate a skill assessment', () => {
            const assessment = {
                id: 'assessment_1',
                timestamp: Date.now(),
                studentId: 'student_1',
                referenceId: 'ref_1',
                toolId: 'paper_piano_1',
                scores: {
                    accuracy: 85,
                    timing: 78,
                    smoothness: 92,
                    overall: 85,
                },
                feedback: [
                    {
                        timestamp: Date.now(),
                        type: 'suggestion' as const,
                        message: 'Try to keep your wrist more relaxed',
                    },
                ],
            };
            expect(SkillAssessmentSchema.parse(assessment)).toEqual(assessment);
        });

        it('should reject scores outside 0-100 range', () => {
            const assessment = {
                id: 'assessment_1',
                timestamp: Date.now(),
                studentId: 'student_1',
                referenceId: 'ref_1',
                toolId: 'paper_piano_1',
                scores: {
                    accuracy: 150, // Invalid
                    timing: 78,
                    smoothness: 92,
                    overall: 85,
                },
                feedback: [],
            };
            expect(() => SkillAssessmentSchema.parse(assessment)).toThrow();
        });
    });

    describe('TTVSession', () => {
        it('should validate a complete TTV session', () => {
            const session = {
                id: 'session_1',
                startTime: Date.now(),
                tool: {
                    id: 'paper_piano_1',
                    name: 'Paper Piano',
                    type: 'piano' as const,
                    markers: [],
                    regions: [
                        {
                            id: 'key_c4',
                            type: 'rectangle' as const,
                            vertices: [
                                { x: 0, y: 0, z: 0 },
                                { x: 0.02, y: 0, z: 0 },
                                { x: 0.02, y: 0.1, z: 0 },
                                { x: 0, y: 0.1, z: 0 },
                            ],
                            semanticRole: 'piano_key_c4',
                            triggerType: 'touch' as const,
                        },
                    ],
                    referenceFrame: 'world' as const,
                },
                sensorConfig: [
                    {
                        sensorId: 'camera_1',
                        modality: 'camera_rgb' as const,
                    },
                ],
                status: 'active' as const,
            };
            expect(TTVSessionSchema.parse(session)).toEqual(session);
        });
    });
});

describe('TTV Use Case: Paper Piano', () => {
    it('should model a complete paper piano interaction flow', () => {
        // 1. Define the tool
        const piano = VirtualizedToolSchema.parse({
            id: 'paper_piano_c4_c5',
            name: 'Paper Piano (C4-C5)',
            type: 'piano',
            markers: [
                { id: 'origin', color: 'red', position: { x: 0, y: 0, z: 0 }, radius: 0.01, semanticRole: 'origin' },
            ],
            regions: Array.from({ length: 8 }, (_, i) => ({
                id: `key_${i}`,
                type: 'rectangle',
                vertices: [
                    { x: i * 0.025, y: 0, z: 0 },
                    { x: (i + 1) * 0.025, y: 0, z: 0 },
                    { x: (i + 1) * 0.025, y: 0.1, z: 0 },
                    { x: i * 0.025, y: 0.1, z: 0 },
                ],
                semanticRole: `piano_key_${60 + i}`, // MIDI notes 60-67
                triggerType: 'touch',
            })),
            referenceFrame: 'world',
        });

        expect(piano.regions.length).toBe(8);
        expect(piano.regions[0].semanticRole).toBe('piano_key_60');

        // 2. Simulate a fused state (finger position)
        const fingerState = FusedStateSchema.parse({
            timestamp: Date.now(),
            handPoses: {
                right: {
                    position: { x: 0.0125, y: 0.05, z: 0.001 }, // Over key 0
                    orientation: { x: 0, y: 0, z: 0, w: 1 },
                    confidence: 0.95,
                    timestamp: Date.now(),
                },
            },
            propPoses: [],
            confidence: 0.95,
            sources: ['mediapipe_1'],
        });

        expect(fingerState.handPoses.right?.position.x).toBeCloseTo(0.0125);

        // 3. Generate interaction event
        const touchEvent = InteractionEventSchema.parse({
            id: 'touch_1',
            timestamp: Date.now(),
            type: 'touch_start',
            regionId: 'key_0',
            toolId: piano.id,
            position: fingerState.handPoses.right!.position,
            pressure: 0.8,
        });

        expect(touchEvent.regionId).toBe('key_0');

        // 4. Generate action
        const midiAction = TTVActionSchema.parse({
            id: 'midi_1',
            timestamp: Date.now(),
            type: 'midi_note',
            payload: {
                note: 60, // Middle C
                velocity: Math.round(touchEvent.pressure! * 127),
                channel: 0,
                duration: 500,
            },
        });

        expect(midiAction.payload.note).toBe(60);
        expect(midiAction.payload.velocity).toBe(102); // 0.8 * 127 ≈ 102
    });
});

describe('TTV Use Case: Stick Joystick', () => {
    it('should model a joystick virtualization', () => {
        const joystick = VirtualizedToolSchema.parse({
            id: 'stick_joystick_1',
            name: 'Stick Joystick',
            type: 'joystick',
            markers: [
                { id: 'top', color: 'red', position: { x: 0, y: 0.3, z: 0 }, radius: 0.02, semanticRole: 'joystick_top' },
                { id: 'base', color: 'green', position: { x: 0, y: 0, z: 0 }, radius: 0.02, semanticRole: 'joystick_base' },
            ],
            regions: [
                {
                    id: 'deadzone',
                    type: 'circle',
                    vertices: [
                        { x: 0, y: 0, z: 0 },
                        { x: 0.02, y: 0, z: 0 },
                        { x: 0, y: 0.02, z: 0 },
                    ],
                    semanticRole: 'deadzone',
                    triggerType: 'hover',
                },
            ],
            referenceFrame: 'prop',
        });

        expect(joystick.markers.length).toBe(2);
        expect(joystick.referenceFrame).toBe('prop');

        // Simulate stick tilt
        const stickPose = Pose6DOFSchema.parse({
            position: { x: 0.1, y: 0.3, z: 0.05 }, // Tilted forward-right
            orientation: { x: 0.1, y: 0.1, z: 0, w: 0.99 }, // Slight tilt
            confidence: 0.9,
            timestamp: Date.now(),
        });

        // Generate control input action
        const controlAction = TTVActionSchema.parse({
            id: 'control_1',
            timestamp: Date.now(),
            type: 'control_input',
            payload: {
                axis: 'pitch',
                value: stickPose.orientation.x * 10, // Scale to -1 to 1
                raw: stickPose.orientation,
            },
        });

        expect(controlAction.type).toBe('control_input');
    });
});
