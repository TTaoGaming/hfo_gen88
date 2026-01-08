/**
 * 📜 GESTURE MONOLITH CONTRACTS
 * 
 * Zod schemas for all inter-stage communication.
 * CustomEvents carry these validated payloads.
 * 
 * @provenance .kiro/specs/gesture-pointer-monolith/design.md
 */

import { z } from 'zod';

// ============================================================================
// LANDMARK CONSTANTS
// ============================================================================

export const LANDMARK = {
  WRIST: 0,
  THUMB_CMC: 1, THUMB_MCP: 2, THUMB_IP: 3, THUMB_TIP: 4,
  INDEX_MCP: 5, INDEX_PIP: 6, INDEX_DIP: 7, INDEX_TIP: 8,
  MIDDLE_MCP: 9, MIDDLE_PIP: 10, MIDDLE_DIP: 11, MIDDLE_TIP: 12,
  RING_MCP: 13, RING_PIP: 14, RING_DIP: 15, RING_TIP: 16,
  PINKY_MCP: 17, PINKY_PIP: 18, PINKY_DIP: 19, PINKY_TIP: 20,
} as const;

// ============================================================================
// SENSOR STAGE SCHEMAS
// ============================================================================

export const Point3DSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
});

export const LandmarkArraySchema = z.array(Point3DSchema).length(21);

export const GestureNameSchema = z.enum([
  'Open_Palm',
  'Pointing_Up',
  'Closed_Fist',
  'Thumb_Up',
  'Thumb_Down',
  'Victory',
  'ILoveYou',
  'None',
]);

export const SensorStageConfigSchema = z.object({
  resolution: z.enum(['480p', '720p', '1080p']).default('720p'),
  modelComplexity: z.enum(['lite', 'full']).default('lite'),
  coneAngle: z.number().min(0).max(90).default(45),
});

export const LandmarkEventDetailSchema = z.object({
  landmarks: LandmarkArraySchema,
  gesture: GestureNameSchema,
  confidence: z.number().min(0).max(1),
  palmAngle: z.number().min(0).max(180),
  timestamp: z.number(),
});

export const NoHandEventDetailSchema = z.object({
  timestamp: z.number(),
});

// ============================================================================
// PHYSICS STAGE SCHEMAS
// ============================================================================

export const Point2DSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const Velocity2DSchema = z.object({
  vx: z.number(),
  vy: z.number(),
});

export const PhysicsStageConfigSchema = z.object({
  stiffness: z.number().min(1).max(200).default(50),
  damping: z.number().min(0.1).max(20).default(5),
  minCutoff: z.number().min(0.01).max(10).default(0.5),
  beta: z.number().min(0).max(1).default(0.001),
  fps: z.number().min(15).max(60).default(30),
  snapLockThreshold: z.number().min(0.01).max(1).default(0.1),
});

export const CursorEventDetailSchema = z.object({
  raw: Point2DSchema,
  physics: Point2DSchema,
  predictive: Point2DSchema,
  velocity: Velocity2DSchema,
  isCoasting: z.boolean(),
  timestamp: z.number(),
});

// ============================================================================
// FSM STAGE SCHEMAS
// ============================================================================

export const FSMStateSchema = z.enum(['IDLE', 'ARMED', 'ENGAGED']);

export const FSMActionSchema = z.enum(['NONE', 'MOVE', 'DOWN', 'UP', 'CANCEL']);

export const FSMStageConfigSchema = z.object({
  dwellTime: z.number().min(0).max(1000).default(100),
  enterThreshold: z.number().min(0).max(1).default(0.7),
  exitThreshold: z.number().min(0).max(1).default(0.5),
  coneAngle: z.number().min(0).max(90).default(45),
  timeout: z.number().min(100).max(10000).default(2000),
});

export const FSMEventDetailSchema = z.object({
  state: FSMStateSchema,
  action: FSMActionSchema,
  position: Point2DSchema,
  timestamp: z.number(),
});

// ============================================================================
// EMITTER STAGE SCHEMAS
// ============================================================================

export const PointerEventTypeSchema = z.enum([
  'pointermove',
  'pointerdown',
  'pointerup',
  'pointercancel',
]);

export const PointerEventDataSchema = z.object({
  type: PointerEventTypeSchema,
  clientX: z.number(),
  clientY: z.number(),
  pointerId: z.literal(1),
  pointerType: z.literal('touch'),
  button: z.number(),
  buttons: z.number(),
  pressure: z.number().min(0).max(1),
  isPrimary: z.literal(true),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type Point3D = z.infer<typeof Point3DSchema>;
export type Point2D = z.infer<typeof Point2DSchema>;
export type Velocity2D = z.infer<typeof Velocity2DSchema>;
export type GestureName = z.infer<typeof GestureNameSchema>;
export type FSMState = z.infer<typeof FSMStateSchema>;
export type FSMAction = z.infer<typeof FSMActionSchema>;
export type PointerEventType = z.infer<typeof PointerEventTypeSchema>;

export type SensorStageConfig = z.infer<typeof SensorStageConfigSchema>;
export type PhysicsStageConfig = z.infer<typeof PhysicsStageConfigSchema>;
export type FSMStageConfig = z.infer<typeof FSMStageConfigSchema>;

export type LandmarkEventDetail = z.infer<typeof LandmarkEventDetailSchema>;
export type NoHandEventDetail = z.infer<typeof NoHandEventDetailSchema>;
export type CursorEventDetail = z.infer<typeof CursorEventDetailSchema>;
export type FSMEventDetail = z.infer<typeof FSMEventDetailSchema>;
export type PointerEventData = z.infer<typeof PointerEventDataSchema>;
