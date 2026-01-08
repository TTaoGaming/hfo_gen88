/**
 * P3 Sub 5: Flow Orchestrator
 * @provenance hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P3_SPORE_STORM/core/flow-orchestrator.ts
 * "The flow is the mission. From sensing to delivery, the storm follows the path."
 */

import { EventListener, SporeEvent } from './event-listener.js';
import { PayloadInjector } from './payload-injector.js';
import { ShellExecutor } from './shell-executor.js';

/**
 * Flow Orchestrator - Manages the end-to-end Spore Storm workflow.
 */
export class FlowOrchestrator {
  private listener = new EventListener();
  private payloadInjector = new PayloadInjector();
  private shellExecutor = new ShellExecutor();

  /**
   * Initializes a flow where a specific event triggers a payload injection.
   */
  setupTriggeredInjection(eventType: string, targetFile: string, payload: any) {
    this.listener.on(eventType, (event) => {
      this.payloadInjector.injectPayload(targetFile, payload);
    });
  }

  /**
   * Process incoming events.
   */
  process(event: SporeEvent) {
    this.listener.emit(event);
  }
}
