/**
 * 🎯 GESTURE POINTER MONOLITH - Gen 88
 * 
 * Single-file pipeline: Webcam → MediaPipe → OneEuro → Rapier2D → FSM → W3C Pointer
 * 
 * No hexagons. No ports. Just functions that call functions.
 * 
 * @provenance .kiro/specs/gesture-pointer-monolith/requirements.md
 */

import { z } from 'zod';
import RAPIER from '@dimforge/rapier2d-compat';

// ============================================================================
// CONTRACTS (Zod schemas at boundaries only)
// ============================================================================

export const LandmarkSchema = z.object({
  x: z.number(),
  y: z.number(), 
  z: z.number(),
});

export const MediaPipeResultSchema = z.object({
  landmarks: z.array(z.array(LandmarkSchema)).optional(),
  gestures: z.array(z.array(z.object({
    categoryName: z.string(),
    score: z.number(),
  }))).optional(),
  handedness: z.array(z.array(z.object({
    categoryName: z.string(),
  }))).optional(),
});

export const PointerStateSchema = z.enum(['IDLE', 'ARMED', 'TRACKING', 'CLICKING']);
export type PointerState = z.infer<typeof PointerStateSchema>;

// ============================================================================
// ONE EURO FILTER (velocity-adaptive smoothing)
// ============================================================================

class LowPassFilter {
  private s: number | null = null;
  
  filter(value: number, alpha: number): number {
    this.s = this.s === null ? value : alpha * value + (1 - alpha) * this.s;
    return this.s;
  }
  
  last(): number { return this.s ?? 0; }
}

export class OneEuroFilter {
  private x = new LowPassFilter();
  private y = new LowPassFilter();
  private dx = new LowPassFilter();
  private dy = new LowPassFilter();
  private lastTime: number | null = null;

  constructor(
    private minCutoff = 0.5,
    private beta = 0.001,
    private dcutoff = 1.0
  ) {}

  private alpha(cutoff: number, dt: number): number {
    const r = 2 * Math.PI * cutoff * dt;
    return r / (r + 1);
  }

  filter(rawX: number, rawY: number, timestamp: number): { x: number; y: number } {
    if (this.lastTime === null || this.lastTime === timestamp) {
      this.lastTime = timestamp;
      return { x: this.x.filter(rawX, 1), y: this.y.filter(rawY, 1) };
    }

    const dt = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;

    // Velocity estimation
    const vx = (rawX - this.x.last()) / dt;
    const vy = (rawY - this.y.last()) / dt;
    
    const edx = this.dx.filter(vx, this.alpha(this.dcutoff, dt));
    const edy = this.dy.filter(vy, this.alpha(this.dcutoff, dt));

    // Adaptive cutoff based on velocity
    const cutoffX = this.minCutoff + this.beta * Math.abs(edx);
    const cutoffY = this.minCutoff + this.beta * Math.abs(edy);

    return {
      x: this.x.filter(rawX, this.alpha(cutoffX, dt)),
      y: this.y.filter(rawY, this.alpha(cutoffY, dt)),
    };
  }
}

// ============================================================================
// RAPIER PHYSICS CURSOR (spring-damped rigid body)
// ============================================================================

export class PhysicsCursor {
  private world!: RAPIER.World;
  private cursorBody!: RAPIER.RigidBody;
  private targetX = 0.5;
  private targetY = 0.5;
  private initialized = false;
  private stiffness = 50;
  private damping = 5;

  async init(stiffness = 50, damping = 5): Promise<void> {
    await RAPIER.init();
    
    this.stiffness = stiffness;
    this.damping = damping;
    this.world = new RAPIER.World({ x: 0, y: 0 }); // No gravity
    
    // Dynamic cursor body
    const cursorDesc = RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(0.5, 0.5)
      .setLinearDamping(damping);
    this.cursorBody = this.world.createRigidBody(cursorDesc);
    
    // Add a small collider so the body has mass
    const colliderDesc = RAPIER.ColliderDesc.ball(0.01).setMass(1);
    this.world.createCollider(colliderDesc, this.cursorBody);
    
    this.initialized = true;
  }

  setTarget(x: number, y: number): void {
    if (!this.initialized) return;
    this.targetX = x;
    this.targetY = y;
  }

  step(): { x: number; y: number } {
    if (!this.initialized) return { x: 0.5, y: 0.5 };
    
    // Apply spring force manually (Hooke's law: F = -k * displacement)
    const pos = this.cursorBody.translation();
    const dx = this.targetX - pos.x;
    const dy = this.targetY - pos.y;
    
    // Spring force
    const fx = this.stiffness * dx;
    const fy = this.stiffness * dy;
    
    this.cursorBody.applyImpulse({ x: fx * 0.016, y: fy * 0.016 }, true);
    
    this.world.step();
    const newPos = this.cursorBody.translation();
    return { x: newPos.x, y: newPos.y };
  }
}

// ============================================================================
// GESTURE FSM (state machine for pointer intent)
// ============================================================================

export class GestureFSM {
  state: PointerState = 'IDLE';
  private noHandTimer = 0;
  private readonly NO_HAND_TIMEOUT = 500; // ms

  transition(gesture: string, palmFacing: boolean, hasHand: boolean, dt: number): {
    state: PointerState;
    action: 'NONE' | 'MOVE' | 'DOWN' | 'UP';
  } {
    // No hand timeout
    if (!hasHand) {
      this.noHandTimer += dt;
      if (this.noHandTimer > this.NO_HAND_TIMEOUT) {
        this.state = 'IDLE';
        return { state: this.state, action: 'NONE' };
      }
    } else {
      this.noHandTimer = 0;
    }

    const prev = this.state;
    let action: 'NONE' | 'MOVE' | 'DOWN' | 'UP' = 'NONE';

    switch (this.state) {
      case 'IDLE':
        if (gesture === 'Open_Palm' && palmFacing) {
          this.state = 'ARMED';
        }
        break;

      case 'ARMED':
        if (gesture === 'Pointing_Up') {
          this.state = 'TRACKING';
          action = 'MOVE';
        } else if (gesture !== 'Open_Palm') {
          this.state = 'IDLE';
        }
        break;

      case 'TRACKING':
        if (gesture === 'Closed_Fist') {
          this.state = 'CLICKING';
          action = 'DOWN';
        } else if (gesture === 'Pointing_Up') {
          action = 'MOVE';
        } else if (gesture === 'Open_Palm' && palmFacing) {
          this.state = 'ARMED';
        } else {
          this.state = 'IDLE';
        }
        break;

      case 'CLICKING':
        if (gesture !== 'Closed_Fist') {
          this.state = 'TRACKING';
          action = 'UP';
        }
        break;
    }

    return { state: this.state, action };
  }
}

// ============================================================================
// W3C POINTER EVENT EMITTER
// ============================================================================

export interface PointerEventData {
  type: 'pointermove' | 'pointerdown' | 'pointerup';
  clientX: number;
  clientY: number;
  pointerId: number;
  pointerType: string;
  button: number;
  buttons: number;
  pressure: number;
  isPrimary: boolean;
}

export function createPointerEvent(
  type: 'pointermove' | 'pointerdown' | 'pointerup',
  x: number,
  y: number,
  viewportWidth: number,
  viewportHeight: number
): PointerEventData {
  const clientX = x * viewportWidth;
  const clientY = y * viewportHeight;
  
  return {
    type,
    clientX,
    clientY,
    pointerId: 1,
    pointerType: 'hand',
    button: type === 'pointermove' ? -1 : 0,
    buttons: type === 'pointerdown' ? 1 : 0,
    pressure: type === 'pointerdown' ? 0.5 : 0,
    isPrimary: true,
  };
}

/**
 * Convert PointerEventData to a real PointerEvent (browser only)
 */
export function toNativePointerEvent(data: PointerEventData): PointerEvent {
  return new PointerEvent(data.type, {
    clientX: data.clientX,
    clientY: data.clientY,
    pointerId: data.pointerId,
    pointerType: 'touch', // 'hand' not supported, use 'touch' as fallback
    button: data.button,
    buttons: data.buttons,
    pressure: data.pressure,
    isPrimary: data.isPrimary,
    bubbles: true,
    cancelable: true,
  });
}

// ============================================================================
// MAIN PIPELINE CLASS
// ============================================================================

export class GesturePipeline {
  private oneEuro = new OneEuroFilter(0.5, 0.001, 1.0);
  private physics = new PhysicsCursor();
  private fsm = new GestureFSM();
  private lastTimestamp = 0;
  private initialized = false;

  async init(): Promise<void> {
    await this.physics.init(50, 5);
    this.initialized = true;
  }

  /**
   * Process a single frame from MediaPipe
   * Returns the pointer event data to dispatch (or null)
   */
  process(
    mediapipeResult: unknown,
    timestamp: number,
    viewportWidth: number,
    viewportHeight: number
  ): PointerEventData | null {
    if (!this.initialized) return null;

    const dt = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;

    // Parse MediaPipe result
    const parsed = MediaPipeResultSchema.safeParse(mediapipeResult);
    if (!parsed.success) return null;

    const result = parsed.data;
    const hasHand = (result.landmarks?.length ?? 0) > 0;
    
    if (!hasHand) {
      this.fsm.transition('None', false, false, dt);
      return null;
    }

    // Extract index fingertip (landmark 8)
    const landmarks = result.landmarks![0];
    const indexTip = landmarks[8];
    
    // Get gesture
    const gesture = result.gestures?.[0]?.[0]?.categoryName ?? 'None';
    
    // Determine palm facing (wrist.y > middle_mcp.y means palm faces camera)
    const wrist = landmarks[0];
    const middleMcp = landmarks[9];
    const palmFacing = wrist.y > middleMcp.y;

    // Stage 1: OneEuro filter
    const filtered = this.oneEuro.filter(indexTip.x, indexTip.y, timestamp);

    // Stage 2: Rapier physics
    this.physics.setTarget(filtered.x, filtered.y);
    const smoothed = this.physics.step();

    // Stage 3: FSM
    const { action } = this.fsm.transition(gesture, palmFacing, hasHand, dt);

    // Stage 4: Emit W3C Pointer Event
    if (action === 'NONE') return null;

    const eventType = action === 'MOVE' ? 'pointermove' 
                    : action === 'DOWN' ? 'pointerdown' 
                    : 'pointerup';

    return createPointerEvent(eventType, smoothed.x, smoothed.y, viewportWidth, viewportHeight);
  }

  getState(): PointerState {
    return this.fsm.state;
  }
}

// ============================================================================
// EXPORTS FOR TESTING
// ============================================================================

export { RAPIER };
