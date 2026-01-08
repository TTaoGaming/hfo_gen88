/**
 * 🪞 P2-SUB-6: MIRROR STATE
 * Finite State Machine for the shaping lifecycle.
 */

export type MirrorStateLabel = 'IDLE' | 'TRACKING' | 'COOLING';

export class MirrorStateMachine {
  private currentState: MirrorStateLabel = 'IDLE';

  public transition(event: 'START' | 'STOP' | 'RESET'): MirrorStateLabel {
    switch (this.currentState) {
      case 'IDLE':
        if (event === 'START') this.currentState = 'TRACKING';
        break;
      case 'TRACKING':
        if (event === 'STOP') this.currentState = 'COOLING';
        if (event === 'RESET') this.currentState = 'IDLE';
        break;
      case 'COOLING':
        if (event === 'START') this.currentState = 'TRACKING';
        if (event === 'RESET') this.currentState = 'IDLE';
        break;
    }
    return this.currentState;
  }

  public getState(): MirrorStateLabel {
    return this.currentState;
  }
}
