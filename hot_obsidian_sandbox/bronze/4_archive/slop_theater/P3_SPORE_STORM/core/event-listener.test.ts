/**
 * P3 Sub 1: Event Listener Test
 * @provenance hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P3_SPORE_STORM/core/event-listener.test.ts
 */

import { describe, it, expect, vi } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { EventListener, SporeEvent } from './event-listener.js';

describe('EventListener', () => {
  it('should trigger handler on emit', () => {
    const listener = new EventListener();
    const handler = vi.fn();
    listener.on('TEST_EVENT', handler);

    const event: SporeEvent = {
        type: 'TEST_EVENT',
        payload: { data: 123 },
        timestamp: new Date().toISOString()
    };

    listener.emit(event);
    expect(handler).toHaveBeenCalledWith(event);
  });

  it('should process events from a JSONL file', () => {
    const testFile = path.resolve(process.cwd(), 'blackboard_test.jsonl');
    const event: SporeEvent = {
        type: 'TRIGGER',
        payload: 'RUN',
        timestamp: new Date().toISOString()
    };
    fs.writeFileSync(testFile, JSON.stringify(event) + '\n');

    const listener = new EventListener();
    const handler = vi.fn();
    listener.on('TRIGGER', handler);

    listener.processBlackboard(testFile);
    expect(handler).toHaveBeenCalled();

    if (fs.existsSync(testFile)) fs.unlinkSync(testFile);
  });
});
