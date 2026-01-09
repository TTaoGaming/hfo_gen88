import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { WebWeaver } from './WEB_WEAVER.js';
import { KiroEnvelopeSchema } from './contracts/index.js';
import { fuseLayers } from './core/interlock.js';

describe('P1 Web Weaver - Interlock Verification', () => {
  const weaver = new WebWeaver();

  it('should fuse multiple layers of objects correctly', () => {
    const layer1 = { a: 1, b: 2 };
    const layer2 = { b: 3, c: 4 };
    const layer3 = { d: 5 };
    
    const result = fuseLayers([layer1, layer2, layer3]);
    
    expect(result).toEqual({
      a: 1,
      b: 3,
      c: 4,
      d: 5
    });
  });

  it('should return an empty object when fusing an empty array', () => {
    expect(fuseLayers([])).toEqual({});
  });

  it('should handle non-overlapping layers', () => {
    const result = fuseLayers([{ a: 1 }, { b: 2 }]);
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it('should standardize a raw payload into a Kiro-compliant envelope', () => {
    const payload = { action: 'test-action', data: [1, 2, 3] };
    const stigmergy = {
      origin_id: crypto.randomUUID(),
      entropy_score: 0.5,
      hive_phase: 'I',
      commander_id: 'TEST_COMMANDER'
    };

    const envelope = weaver.standardize(payload, stigmergy as any);

    expect(envelope.version).toBe('kiro.1');
    expect(envelope.payload).toEqual(payload);
    expect(envelope.stigmergy.commander_id).toBe('TEST_COMMANDER');
    expect(KiroEnvelopeSchema.safeParse(envelope).success).toBe(true);
  });

  it('should enforce interlock schemas during standardization', () => {
    const payload = { count: 10 };
    const schema = z.object({ count: z.number().max(5) }); // Will fail
    const stigmergy = {
      origin_id: crypto.randomUUID(),
      entropy_score: 0.1,
      hive_phase: 'I',
      commander_id: 'TEST'
    };

    expect(() => weaver.standardize(payload, stigmergy as any, { payloadSchema: schema }))
      .toThrow(/Interlock Validation Failed/);
  });

  it('should fail standardization if stigmergy headers are missing', () => {
    const payload = { foo: 'bar' };
    const invalidStigmergy = { origin_id: 'not-a-uuid' };

    expect(() => weaver.standardize(payload, invalidStigmergy as any))
      .toThrow(/Kiro Spec Violation/);
  });

  it('should validate a stigmergy event', () => {
    const event = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      sourcePort: 1,
      eventType: 'BRIDGE',
      payload: { status: 'ok' }
    };

    const result = weaver.validateStigmergyEvent(event);
    expect(result.success).toBe(true);
  });

  it('should fuse schemas and bridge data', () => {
    const schemaA = z.object({ a: z.string() });
    const schemaB = z.object({ b: z.number() });
    const fused = weaver.fuse(schemaA, schemaB);
    
    const data = { a: 'hello', b: 42 };
    const result = weaver.bridge(data, fused);
    expect(result.success).toBe(true);
  });

  it('should support CloudEvents 1.0 integration', () => {
    const payload = { user: 'alice' };
    const stigmergy = {
      origin_id: crypto.randomUUID(),
      entropy_score: 0.1,
      hive_phase: 'V',
      commander_id: 'WEB_WEAVER'
    };
    const cloudEvent = {
      specversion: '1.0',
      type: 'user.created',
      source: '/api/users',
      id: 'evt-123'
    };

    const envelope = weaver.standardize(payload, stigmergy as any, { cloudEvent });

    expect(envelope.cloud_event?.type).toBe('user.created');
    expect(envelope.cloud_event?.specversion).toBe('1.0');
  });

  it('should support MCP context integration', () => {
    const payload = { tool: 'search' };
    const stigmergy = {
      origin_id: crypto.randomUUID(),
      entropy_score: 0.1,
      hive_phase: 'H',
      commander_id: 'SPIDER_SOVEREIGN'
    };
    const mcpContext = {
      mcp_version: '1.0.0',
      capabilities: {},
      client: { name: 'copilot', version: '1.0' }
    };

    const envelope = weaver.standardize(payload, stigmergy as any, { mcpContext });

    expect(envelope.mcp_context?.client.name).toBe('copilot');
  });
});
