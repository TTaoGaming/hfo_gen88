/**
 * 🧪 SYNDICATE BRIDGE VERIFICATION TEST (Isolated Unit)
 */

import { describe, it, expect, vi } from 'vitest';
import { SyndicateNatsBridge } from '../../../P1_SYNDICATE_NATS_BRIDGE.ts';
import type { FSMEventDetail } from '../contracts/schemas.js';

describe('P1 Syndicate NATS Bridge', () => {
  it('should forward events from a mock bus to NATS publish', async () => {
    // 1. Setup
    const eventBus = new EventTarget();
    const bridge = new SyndicateNatsBridge({
      servers: ['nats://localhost:4222'],
      subject: 'hfo.test.kinetic'
    });

    // Spy on console.log
    const consoleSpy = vi.spyOn(console, 'log');

    // 2. Action
    await bridge.connect();
    bridge.tap(eventBus);

    // Dispatch a mock FSM event
    const mockDetail: FSMEventDetail = {
      state: 'ENGAGED',
      action: 'MOVE',
      timestamp: Date.now(),
      cursor: {
        x: 0.5,
        y: 0.5,
        z: 0.1,
        velocity: { x: 0, y: 0 },
        pressure: 0.5,
        button: 0,
        id: 1,
        type: 'mouse'
      }
    };

    eventBus.dispatchEvent(new CustomEvent('fsm', { detail: mockDetail }));

    // 3. Verify
    const publishCalled = consoleSpy.mock.calls.some(call => 
      call[0] && call[0].includes('[Bifrost] >> NATS PUBLISH [hfo.test.kinetic]: ENGAGED')
    );
    
    expect(publishCalled).toBe(true);
    console.log('✅ Port 1 Bridge (Isolated) Verified: Egress Functional.');
  });
});
