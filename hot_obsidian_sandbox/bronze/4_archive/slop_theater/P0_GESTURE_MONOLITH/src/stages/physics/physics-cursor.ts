/**
 * 🎯 PHYSICS CURSOR
 * 
 * Rapier2D spring-damped cursor with coasting and snap-lock.
 * 
 * @provenance .kiro/specs/gesture-pointer-monolith/design.md
 * 
 * Property 4: Physics coasting during tracking loss
 * For any tracking loss, the physics cursor SHALL continue moving
 * based on its last velocity (inertia), not jump to a default position.
 * 
 * Property 5: Snap-lock on tracking resumption
 * For any tracking resumption after loss, the physics cursor SHALL
 * converge toward the new detected position within bounded steps.
 */

import RAPIER from '@dimforge/rapier2d-compat';
import type { Point2D, Velocity2D } from '../../contracts/schemas.js';

export interface PhysicsCursorConfig {
  stiffness: number;        // Spring constant, default 50
  damping: number;          // Damping coefficient, default 5
  snapLockThreshold: number; // Distance to trigger snap, default 0.1
  mass: number;             // Cursor mass, default 1
}

export interface PhysicsCursorState {
  position: Point2D;
  velocity: Velocity2D;
  isCoasting: boolean;
}

export class PhysicsCursor {
  private world!: RAPIER.World;
  private cursorBody!: RAPIER.RigidBody;
  private targetX = 0.5;
  private targetY = 0.5;
  private initialized = false;
  private isCoasting = false;
  private coastingStartTime: number | null = null;
  
  private stiffness: number;
  private damping: number;
  private snapLockThreshold: number;
  private mass: number;

  constructor(config: Partial<PhysicsCursorConfig> = {}) {
    this.stiffness = config.stiffness ?? 50;
    this.damping = config.damping ?? 5;
    this.snapLockThreshold = config.snapLockThreshold ?? 0.1;
    this.mass = config.mass ?? 1;
  }

  /**
   * Initialize Rapier2D world and cursor body
   */
  async init(): Promise<void> {
    await RAPIER.init();
    
    // Create world with no gravity (cursor floats)
    this.world = new RAPIER.World({ x: 0, y: 0 });
    
    // Create dynamic cursor body at center
    const cursorDesc = RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(0.5, 0.5)
      .setLinearDamping(this.damping);
    this.cursorBody = this.world.createRigidBody(cursorDesc);
    
    // Add collider for mass
    const colliderDesc = RAPIER.ColliderDesc.ball(0.01).setMass(this.mass);
    this.world.createCollider(colliderDesc, this.cursorBody);
    
    this.initialized = true;
  }

  /**
   * Set target position for spring force
   * Calling this ends coasting mode
   */
  setTarget(x: number, y: number): void {
    if (!this.initialized) return;
    
    const pos = this.cursorBody.translation();
    const distance = Math.sqrt(
      Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2)
    );
    
    // Snap-lock: if resuming from coast with large distance, snap closer
    if (this.isCoasting && distance > this.snapLockThreshold) {
      // Blend position: move 70% toward target immediately
      const blendFactor = 0.7;
      const snapX = pos.x + (x - pos.x) * blendFactor;
      const snapY = pos.y + (y - pos.y) * blendFactor;
      this.cursorBody.setTranslation({ x: snapX, y: snapY }, true);
    }
    
    this.targetX = x;
    this.targetY = y;
    this.isCoasting = false;
    this.coastingStartTime = null;
  }

  /**
   * Enter coasting mode (no target updates)
   * Cursor continues on inertia
   */
  startCoasting(timestamp: number): void {
    if (!this.initialized) return;
    this.isCoasting = true;
    this.coastingStartTime = timestamp;
  }

  /**
   * Step physics simulation
   * @param dt - Time delta in seconds (default 1/30 for 30fps)
   */
  step(dt: number = 1 / 30): PhysicsCursorState {
    if (!this.initialized) {
      return {
        position: { x: 0.5, y: 0.5 },
        velocity: { vx: 0, vy: 0 },
        isCoasting: false,
      };
    }
    
    const pos = this.cursorBody.translation();
    
    // Apply spring force only when not coasting
    if (!this.isCoasting) {
      const dx = this.targetX - pos.x;
      const dy = this.targetY - pos.y;
      
      // Hooke's law: F = -k * displacement
      // We apply as impulse: impulse = force * dt
      const fx = this.stiffness * dx * dt;
      const fy = this.stiffness * dy * dt;
      
      this.cursorBody.applyImpulse({ x: fx, y: fy }, true);
    }
    // When coasting, no force applied - cursor continues on inertia
    // Rapier's linear damping will gradually slow it down
    
    this.world.step();
    
    const newPos = this.cursorBody.translation();
    const vel = this.cursorBody.linvel();
    
    return {
      position: { x: newPos.x, y: newPos.y },
      velocity: { vx: vel.x, vy: vel.y },
      isCoasting: this.isCoasting,
    };
  }

  /**
   * Get current position without stepping
   */
  getPosition(): Point2D {
    if (!this.initialized) return { x: 0.5, y: 0.5 };
    const pos = this.cursorBody.translation();
    return { x: pos.x, y: pos.y };
  }

  /**
   * Get current velocity without stepping
   */
  getVelocity(): Velocity2D {
    if (!this.initialized) return { vx: 0, vy: 0 };
    const vel = this.cursorBody.linvel();
    return { vx: vel.x, vy: vel.y };
  }

  /**
   * Check if currently coasting
   */
  getIsCoasting(): boolean {
    return this.isCoasting;
  }

  /**
   * Get coasting duration in ms (or null if not coasting)
   */
  getCoastingDuration(currentTime: number): number | null {
    if (!this.isCoasting || this.coastingStartTime === null) return null;
    return currentTime - this.coastingStartTime;
  }

  /**
   * Calculate predictive position based on velocity extrapolation
   * @param lookahead - Time to extrapolate in seconds
   */
  getPredictivePosition(lookahead: number = 0.05): Point2D {
    const pos = this.getPosition();
    const vel = this.getVelocity();
    return {
      x: pos.x + vel.vx * lookahead,
      y: pos.y + vel.vy * lookahead,
    };
  }

  /**
   * Update configuration
   */
  configure(config: Partial<PhysicsCursorConfig>): void {
    if (config.stiffness !== undefined) this.stiffness = config.stiffness;
    if (config.damping !== undefined) {
      this.damping = config.damping;
      if (this.initialized) {
        this.cursorBody.setLinearDamping(this.damping);
      }
    }
    if (config.snapLockThreshold !== undefined) {
      this.snapLockThreshold = config.snapLockThreshold;
    }
  }

  /**
   * Reset cursor to center position
   */
  reset(): void {
    if (!this.initialized) return;
    this.cursorBody.setTranslation({ x: 0.5, y: 0.5 }, true);
    this.cursorBody.setLinvel({ x: 0, y: 0 }, true);
    this.targetX = 0.5;
    this.targetY = 0.5;
    this.isCoasting = false;
    this.coastingStartTime = null;
  }

  /**
   * Check if initialized
   */
  isReady(): boolean {
    return this.initialized;
  }
}

export { RAPIER };
