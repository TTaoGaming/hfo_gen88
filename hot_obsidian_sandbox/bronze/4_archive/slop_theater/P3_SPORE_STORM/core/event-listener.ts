/**
 * P3 Sub 1: Event Listener
 * @provenance hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P3_SPORE_STORM/core/event-listener.ts
 * "The siren sounds, the spore responds. Kinetic activation."
 */

import * as fs from 'node:fs';
import { z } from 'zod';

export const SporeEventSchema = z.object({
  type: z.string(),
  payload: z.any(),
  timestamp: z.string()
});

export type SporeEvent = z.infer<typeof SporeEventSchema>;

/**
 * Event Listener - Monitors for triggers that initiate a Spore Storm.
 */
export class EventListener {
  private handlers: Map<string, (event: SporeEvent) => void> = new Map();

  /**
   * Register a handler for a specific event type.
   */
  on(type: string, handler: (event: SporeEvent) => void) {
    this.handlers.set(type, handler);
  }

  /**
   * Emit an event into the listener.
   */
  emit(event: SporeEvent) {
    const handler = this.handlers.get(event.type);
    if (handler) {
      handler(event);
    }
  }

  /**
   * Tail a JSONL file (Blackboard) for new events. (Simplified Simulation)
   */
  processBlackboard(filePath: string) {
    if (!fs.existsSync(filePath)) return;
    const lines = fs.readFileSync(filePath, 'utf8').split('\n').filter(Boolean);
    
    for (const line of lines) {
      try {
        const json = JSON.parse(line);
        const result = SporeEventSchema.safeParse(json);
        if (result.success) {
          this.emit(result.data);
        }
      } catch (e) {
        // Ignore malformed lines (P5 handles reporting)
      }
    }
  }
}
