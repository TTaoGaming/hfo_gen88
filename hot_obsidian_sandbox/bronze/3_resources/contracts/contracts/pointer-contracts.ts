import { z } from 'zod';
import { VacuoleEnvelope } from './envelope.js';

/**
 * 🎯 PORT 0: GESTURE CONTROL CONTRACTS (Gen 87.X3)
 * 
 * Hexagonal CDD (Contract-Driven Design) for the Gesture Control Plane.
 * These schemas enforce "Contract Law" at every stage of the pipeline.
 * 
 * @source hot_obsidian_sandbox/bronze/stale_context_payloads/GEN87_X3_CONTEXT_PAYLOAD_V1_20251230Z.md
 */

/**
 * Single 3D landmark from MediaPipe/Human.js
 */
export const LandmarkSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
});

export type Landmark = z.infer<typeof LandmarkSchema>;

/**
 * SENSOR PORT: Raw data from the hand tracking sensor
 */
export const SensorFrameSchema = z.object({
  frameId: z.number(),
  timestamp: z.number(),
  landmarks: z.array(LandmarkSchema).length(21),
  gesture: z.string(), // e.g., 'Open_Palm', 'Closed_Fist'
  handedness: z.enum(['Left', 'Right']),
  confidence: z.number().min(0).max(1),
});

export type SensorFrame = z.infer<typeof SensorFrameSchema>;

/**
 * SMOOTHER PORT: Refined data after filtering (e.g., OneEuro, Kalman)
 */
export const SmoothedFrameSchema = z.object({
  position: z.object({ x: z.number(), y: z.number() }),
  velocity: z.object({ vx: z.number(), vy: z.number() }),
  predicted: z.object({
    x: z.number(),
    y: z.number(),
    lookaheadMs: z.number(),
  }).optional(),
  gesture: z.string(),
  palmFacing: z.boolean(),
});

export type SmoothedFrame = z.infer<typeof SmoothedFrameSchema>;

/**
 * FSM PORT: High-level intent/action from the state machine
 */
export const FSMActionSchema = z.object({
  type: z.enum(['MOVE', 'CLICK', 'DRAG_START', 'DRAG_END', 'SCROLL', 'ZOOM', 'NONE']),
  position: z.object({ x: z.number(), y: z.number() }),
  state: z.string(), // Current FSM state name
  metadata: z.record(z.string(), z.any()).optional(),
});

export type FSMAction = z.infer<typeof FSMActionSchema>;

/**
 * EMITTER PORT: W3C Pointer Events Level 3 compliant output
 */
export const PointerEventOutSchema = z.object({
  type: z.enum(['pointermove', 'pointerdown', 'pointerup', 'pointercancel']),
  clientX: z.number(),
  clientY: z.number(),
  pointerId: z.number(),
  pointerType: z.enum(['mouse', 'pen', 'touch', 'hand']),
  button: z.number(),
  buttons: z.number(),
  pressure: z.number().min(0).max(1),
  tiltX: z.number().min(-90).max(90).optional(),
  tiltY: z.number().min(-90).max(90).optional(),
  twist: z.number().min(0).max(359).optional(),
  isPrimary: z.boolean(),
  width: z.number().optional(),
  height: z.number().optional(),
  coalescedEvents: z.array(z.any()).optional(),
  predictedEvents: z.array(z.any()).optional(),
});

export type PointerEventOut = z.infer<typeof PointerEventOutSchema>;

/**
 * Universal Port interface pattern
 */
export interface Port<TInput, TOutput> {
  readonly name: string;
  readonly inputSchema: z.ZodSchema<TInput>;
  readonly outputSchema: z.ZodSchema<TOutput>;
  process(input: TInput): TOutput | Promise<TOutput>;
}
