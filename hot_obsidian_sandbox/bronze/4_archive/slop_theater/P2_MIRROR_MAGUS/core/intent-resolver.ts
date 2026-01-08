/**
 * 🪞 P2-SUB-5: INTENT RESOLVER
 * Resolves classified shapes into semantic system intents.
 */

import { ShapePrimitive } from './shape-classifier';

export type SystemIntent = 'ACTIVATE' | 'CANCEL' | 'NAVIGATE' | 'NONE';

export class IntentResolver {
  /**
   * Resolves intent based on shape and a confidence score.
   */
  public resolve(shape: ShapePrimitive, confidence: number = 1.0): SystemIntent {
    if (confidence < 0.7) return 'NONE';

    switch (shape) {
      case 'TAP':
        return 'ACTIVATE';
      case 'SWIPE':
        return 'NAVIGATE';
      case 'CIRCLE':
        return 'CANCEL';
      default:
        return 'NONE';
    }
  }
}
