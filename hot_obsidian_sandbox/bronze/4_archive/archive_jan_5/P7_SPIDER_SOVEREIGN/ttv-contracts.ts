/**
 * 🕷️ PORT 7: SPIDER SOVEREIGN — TTV CONTRACTS
 * 
 * Authority: Spider Sovereign (The Social Spider)
 * Verb: NAVIGATE / DECIDE
 * Topic: Total Tool Virtualization & Cognitive Liberation
 * Provenance: hot_obsidian_sandbox/bronze/P7_TTV_KINETIC.md
 * 
 * These contracts define the data structures for Total Tool Virtualization (TTV).
 * The goal is 1:1 skill transfer with proprioception through multi-sensor fusion.
 */

import { z } from 'zod';

// =============================================================================
// CORE TTV SCHEMAS
// =============================================================================

/**
 * A 3D point in space (meters from origin)
 */
export const Point3DSchema = z.object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
});
export type Point3D = z.infer<typeof Point3DSchema>;

/**
 * A quaternion for rotation (normalized)
 */
export const QuaternionSchema = z.object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
    w: z.number(),
});
export type Quaternion = z.infer<typeof QuaternionSchema>;

/**
 * A 6DOF pose (position + orientation)
 */
export const Pose6DOFSchema = z.object({
    position: Point3DSchema,
    orientation: QuaternionSchema,
    confidence: z.number().min(0).max(1),
    timestamp: z.number(), // Unix timestamp in ms
});
export type Pose6DOF = z.infer<typeof Pose6DOFSchema>;

// =============================================================================
// VIRTUALIZED TOOL SCHEMAS
// =============================================================================

/**
 * A marker that defines a control point on a virtualized tool
 */
export const MarkerSchema = z.object({
    id: z.string(),
    color: z.enum(['red', 'green', 'blue', 'yellow', 'cyan', 'magenta', 'white', 'black']),
    position: Point3DSchema,
    radius: z.number().positive(), // Detection radius in meters
    semanticRole: z.string(), // e.g., "octave_indicator", "key_c4", "joystick_top"
});
export type Marker = z.infer<typeof MarkerSchema>;

/**
 * A region that defines an interactive area on a virtualized tool
 */
export const InteractiveRegionSchema = z.object({
    id: z.string(),
    type: z.enum(['rectangle', 'circle', 'polygon']),
    vertices: z.array(Point3DSchema).min(3), // For polygon, or bounding box corners
    semanticRole: z.string(), // e.g., "piano_key_c4", "button_fire"
    triggerType: z.enum(['touch', 'hover', 'dwell', 'gesture']),
    dwellTimeMs: z.number().optional(), // For dwell triggers
});
export type InteractiveRegion = z.infer<typeof InteractiveRegionSchema>;

/**
 * A virtualized tool definition
 */
export const VirtualizedToolSchema = z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['piano', 'joystick', 'surgical_instrument', 'weapon', 'generic']),
    markers: z.array(MarkerSchema),
    regions: z.array(InteractiveRegionSchema),
    referenceFrame: z.enum(['world', 'body', 'prop']),
    calibrationData: z.record(z.string(), z.unknown()).optional(), // @bespoke calibration
});
export type VirtualizedTool = z.infer<typeof VirtualizedToolSchema>;

// =============================================================================
// SENSOR FUSION SCHEMAS
// =============================================================================

/**
 * Sensor modality types
 */
export const SensorModalitySchema = z.enum([
    'camera_rgb',
    'camera_depth',
    'camera_thermal',
    'imu_accelerometer',
    'imu_gyroscope',
    'imu_magnetometer',
    'audio_microphone',
    'audio_ultrasonic',
]);
export type SensorModality = z.infer<typeof SensorModalitySchema>;

/**
 * A sensor reading from any modality
 */
export const SensorReadingSchema = z.object({
    sensorId: z.string(),
    modality: SensorModalitySchema,
    timestamp: z.number(),
    data: z.unknown(), // @bespoke sensor-specific data
    confidence: z.number().min(0).max(1),
});
export type SensorReading = z.infer<typeof SensorReadingSchema>;

/**
 * Fused sensor state (output of sensor fusion)
 */
export const FusedStateSchema = z.object({
    timestamp: z.number(),
    bodyPose: Pose6DOFSchema.optional(),
    handPoses: z.object({
        left: Pose6DOFSchema.optional(),
        right: Pose6DOFSchema.optional(),
    }),
    propPoses: z.array(z.object({
        propId: z.string(),
        pose: Pose6DOFSchema,
    })),
    confidence: z.number().min(0).max(1),
    sources: z.array(z.string()), // Sensor IDs that contributed
});
export type FusedState = z.infer<typeof FusedStateSchema>;

// =============================================================================
// INTERACTION SCHEMAS
// =============================================================================

/**
 * An interaction event (finger touching a region, etc.)
 */
export const InteractionEventSchema = z.object({
    id: z.string(),
    timestamp: z.number(),
    type: z.enum(['touch_start', 'touch_end', 'hover_enter', 'hover_exit', 'dwell_complete', 'gesture']),
    regionId: z.string(),
    toolId: z.string(),
    position: Point3DSchema,
    velocity: Point3DSchema.optional(),
    pressure: z.number().min(0).max(1).optional(),
    gestureType: z.string().optional(), // e.g., "swipe_left", "pinch"
});
export type InteractionEvent = z.infer<typeof InteractionEventSchema>;

/**
 * An action to be performed (output of interaction processing)
 */
export const TTVActionSchema = z.object({
    id: z.string(),
    timestamp: z.number(),
    type: z.enum(['midi_note', 'control_input', 'audio_play', 'visual_feedback', 'haptic_feedback']),
    payload: z.record(z.string(), z.unknown()), // @bespoke action-specific data
});
export type TTVAction = z.infer<typeof TTVActionSchema>;

// =============================================================================
// SKILL ASSESSMENT SCHEMAS
// =============================================================================

/**
 * A reference recording for skill comparison
 */
export const ReferenceRecordingSchema = z.object({
    id: z.string(),
    name: z.string(),
    toolId: z.string(),
    expertId: z.string().optional(),
    duration: z.number(), // ms
    frames: z.array(FusedStateSchema),
    interactions: z.array(InteractionEventSchema),
    metadata: z.record(z.string(), z.unknown()).optional(), // @bespoke metadata
});
export type ReferenceRecording = z.infer<typeof ReferenceRecordingSchema>;

/**
 * A skill assessment result
 */
export const SkillAssessmentSchema = z.object({
    id: z.string(),
    timestamp: z.number(),
    studentId: z.string(),
    referenceId: z.string(),
    toolId: z.string(),
    scores: z.object({
        accuracy: z.number().min(0).max(100), // Position accuracy %
        timing: z.number().min(0).max(100), // Timing accuracy %
        smoothness: z.number().min(0).max(100), // Movement smoothness %
        overall: z.number().min(0).max(100), // Weighted overall %
    }),
    feedback: z.array(z.object({
        timestamp: z.number(),
        type: z.enum(['error', 'warning', 'suggestion', 'praise']),
        message: z.string(),
        regionId: z.string().optional(),
    })),
});
export type SkillAssessment = z.infer<typeof SkillAssessmentSchema>;

// =============================================================================
// TTV SESSION SCHEMA
// =============================================================================

/**
 * A TTV session (complete virtualization instance)
 */
export const TTVSessionSchema = z.object({
    id: z.string(),
    startTime: z.number(),
    endTime: z.number().optional(),
    tool: VirtualizedToolSchema,
    sensorConfig: z.array(z.object({
        sensorId: z.string(),
        modality: SensorModalitySchema,
        calibration: z.record(z.string(), z.unknown()).optional(), // @bespoke calibration
    })),
    recordings: z.array(ReferenceRecordingSchema).optional(),
    assessments: z.array(SkillAssessmentSchema).optional(),
    status: z.enum(['initializing', 'calibrating', 'active', 'paused', 'completed', 'error']),
});
export type TTVSession = z.infer<typeof TTVSessionSchema>;

// =============================================================================
// VACUOLE ENVELOPE WRAPPERS
// =============================================================================

import { VacuoleEnvelope } from '../contracts/envelope.js';

export const TTVSessionEnvelope = VacuoleEnvelope.extend({
    payload: TTVSessionSchema,
});

export const InteractionEventEnvelope = VacuoleEnvelope.extend({
    payload: InteractionEventSchema,
});

export const FusedStateEnvelope = VacuoleEnvelope.extend({
    payload: FusedStateSchema,
});

export const SkillAssessmentEnvelope = VacuoleEnvelope.extend({
    payload: SkillAssessmentSchema,
});
