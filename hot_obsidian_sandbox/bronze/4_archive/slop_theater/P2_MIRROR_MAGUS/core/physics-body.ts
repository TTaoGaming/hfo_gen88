/**
 * 🪞 P2-SUB-2: PHYSICS RIGID BODY
 * Manages physical properties like mass, damping, and spring stiffness for gestures.
 */

export interface PhysicsState {
  position: number;
  velocity: number;
  acceleration: number;
}

export class PhysicsRigidBody {
  private state: PhysicsState = { position: 0, velocity: 0, acceleration: 0 };

  constructor(
    private mass: number = 1.0,
    private damping: number = 0.1,
    private stiffness: number = 0.5
  ) {}

  /**
   * Applies a spring force towards a target position.
   * F = -k*x - c*v
   */
  public update(target: number, dt: number): PhysicsState {
    const error = target - this.state.position;
    const springForce = this.stiffness * error;
    const dampingForce = this.damping * this.state.velocity;
    
    const netForce = springForce - dampingForce;
    this.state.acceleration = netForce / this.mass;
    
    // Euler integration
    this.state.velocity += this.state.acceleration * dt;
    this.state.position += this.state.velocity * dt;

    return { ...this.state };
  }

  public getPosition(): number {
    return this.state.position;
  }
}
