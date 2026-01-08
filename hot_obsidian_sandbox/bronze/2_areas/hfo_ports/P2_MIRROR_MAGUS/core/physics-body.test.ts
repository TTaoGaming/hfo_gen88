import { describe, it, expect } from 'vitest';
import { PhysicsRigidBody } from './physics-body';

describe('P2_MIRROR_MAGUS Sub 2: Physics Rigid Body', () => {
  it('should move towards target with spring physics', () => {
    const body = new PhysicsRigidBody(1.0, 0.1, 0.5);
    const target = 100;
    const dt = 1.0;

    // First step
    const state1 = body.update(target, dt);
    // Force = 0.5 * (100 - 0) - 0.1 * 0 = 50
    // Acceleration = 50 / 1 = 50
    // Velocity = 0 + 50 * 1 = 50
    // Position = 0 + 50 * 1 = 50
    expect(state1.position).toBe(50);
    expect(state1.velocity).toBe(50);

    // Second step
    const state2 = body.update(target, dt);
    // Error = 100 - 50 = 50
    // Spring Force = 0.5 * 50 = 25
    // Damping Force = 0.1 * 50 = 5
    // Net Force = 25 - 5 = 20
    // Accel = 20
    // Vel = 50 + 20 * 1 = 70
    // Pos = 50 + 70 * 1 = 120 (Overshoot due to integration step)
    expect(state2.position).toBe(120);
  });
});
