/**
 * P3 SPORE STORM - Main Implementation
 * @port 3
 * @commander SPORE_STORM
 * @verb INJECT / DELIVER
 * @provenance hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P3_SPORE_STORM/SPORE_STORM.ts
 * "The sky darkens. The spores descend. The system evolves."
 */

export * from './core/file-injector.js';
export * from './core/event-listener.js';
export * from './core/cascade-director.js';
export * from './core/payload-injector.js';
export * from './core/shell-executor.js';
export * from './core/flow-orchestrator.js';
export * from './core/spore-agent.js';
export * from './core/spore-toolset.js';

import { FlowOrchestrator } from './core/flow-orchestrator.js';

/**
 * Spore Storm Commander - The primary interface for HFO delivery.
 */
export class SporeStorm {
  readonly orchestrator = new FlowOrchestrator();
}
