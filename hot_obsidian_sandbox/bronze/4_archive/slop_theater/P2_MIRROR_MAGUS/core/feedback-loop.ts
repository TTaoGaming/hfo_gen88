/**
 * 🪞 P2-SUB-7: FEEDBACK LOOP
 * Generates feedback payloads for haptic/visual synthesis.
 */

import { SystemIntent } from './intent-resolver';

export interface FeedbackSignal {
  type: 'HAPTIC' | 'VISUAL';
  pattern: string;
  intensity: number;
}

export class FeedbackLoop {
  /**
   * Generates feedback signals based on resolved intent.
   */
  public generate(intent: SystemIntent): FeedbackSignal[] {
    const signals: FeedbackSignal[] = [];

    switch (intent) {
      case 'ACTIVATE':
        signals.push({ type: 'HAPTIC', pattern: 'SHORT_DOUBLE', intensity: 1.0 });
        signals.push({ type: 'VISUAL', pattern: 'POP', intensity: 0.8 });
        break;
      case 'NAVIGATE':
        signals.push({ type: 'HAPTIC', pattern: 'SLIDE', intensity: 0.5 });
        break;
      case 'CANCEL':
        signals.push({ type: 'HAPTIC', pattern: 'LONG_SINGLE', intensity: 1.0 });
        signals.push({ type: 'VISUAL', pattern: 'FADE', intensity: 1.0 });
        break;
    }

    return signals;
  }
}
