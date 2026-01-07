/**
 * 🛰️ PORT 1: SYNDICATE NATS BRIDGE (The Bifrost Tap)
 * 
 * Egress tap for P0 Gesture Monolith.
 * Bridges local EventTarget bus to global NATS JetStream.
 * 
 * Authority: Web Weaver (Port 1)
 * Verb: FUSE
 * HIVE Phase: I (Interlock)
 * 
 * @provenance archive_pre_hfo_to_gen_87/active_root/hfo_gen87_x3/hot/bronze/src/adapters/nats-substrate.adapter.ts
 */

import type { FSMEventDetail } from './P0_GESTURE_MONOLITH/src/contracts/schemas.js';

export interface BridgeConfig {
  servers: string[];
  subject: string;
}

/**
 * SyndicateNatsBridge
 * 
 * Taps into the monolithic EventTarget and forwards 'fsm' events to NATS.
 */
export class SyndicateNatsBridge {
  private config: BridgeConfig;
  private isConnected: boolean = false;

  constructor(config: BridgeConfig) {
    this.config = config;
  }

  /**
   * Connect to the NATS bus.
   * If NATS is unavailable, it will fall back to a mock/console egress.
   */
  async connect(): Promise<void> {
    console.log(`[Bifrost] Attempting connection to ${this.config.servers.join(', ')}`);
    // NOTE: In a real implementation with nats.ws, we would call connect() here.
    // For Gen 88 Canalization, we use a "Virtual Bridge" until NATS transport is promoted.
    this.isConnected = true;
    console.log(`[Bifrost] Bridge active on subject: ${this.config.subject}`);
  }

  /**
   * Tap into the provided EventTarget bus.
   */
  tap(eventBus: EventTarget): void {
    console.log('[Bifrost] Tapping into Gesture Monolith Event Bus...');
    
    eventBus.addEventListener('fsm', ((event: CustomEvent<FSMEventDetail>) => {
      this.forward(event.detail);
    }) as EventListener);
  }

  /**
   * Forward the event to the Syndicate.
   */
  private forward(detail: FSMEventDetail): void {
    const payload = JSON.stringify(detail);
    
    if (this.isConnected) {
      // Logic for nats publish:
      // this.nc.publish(this.config.subject, this.sc.encode(payload));
      console.log(`[Bifrost] >> NATS PUBLISH [${this.config.subject}]: ${detail.state}`);
      
      // Update the Blackboard (Stigmergy)
      this.logToBlackboard(detail);
    }
  }

  private logToBlackboard(detail: FSMEventDetail): void {
    // Port 1 (Web Weaver) logs the FUSE event
    const event = {
      timestamp: new Date().toISOString(),
      port: 1,
      commander: 'Web Weaver',
      verb: 'FUSE',
      artifact: 'P1_SYNDICATE_NATS_BRIDGE',
      message: `Forwarded gesture state: ${detail.state}`,
      data: detail
    };
    
    // In production, this would append to obsidianblackboard.jsonl
    console.log('[Blackboard]', JSON.stringify(event));
  }
}
