/**
 * @port 1
 * @commander WEB_WEAVER
 * @gen 88
 * @status BRONZE
 * @provenance LEGENDARY_COMMANDERS_V9.md
 * @verb FUSE
 * Purpose: Integration test for Pheromone Stigmergy Standard (Kiro v1).
 */

import { describe, it, expect } from 'vitest';
import { KiroEnvelopeSchema, StigmergyHeadersSchema } from './kiro_spec';

describe('P1 WEB WEAVER - Stigmergy Interlock', () => {
  it('validates a minimum viable pheromone mark', () => {
    const validHeader = {
      origin_id: crypto.randomUUID(),
      entropy_score: 0.1,
      hive_phase: 'H',
      commander_id: 'LIDLESS_LEGION'
    };
    
    const result = StigmergyHeadersSchema.safeParse(validHeader);
    expect(result.success).toBe(true);
  });

  it('rejects a mark without a hive phase', () => {
    const invalidHeader = {
      origin_id: crypto.randomUUID(),
      entropy_score: 0.5,
      commander_id: 'SPORE_STORM'
    };
    
    //@ts-ignore
    const result = StigmergyHeadersSchema.safeParse(invalidHeader);
    expect(result.success).toBe(false);
  });

  it('standardizes a full Kiro envelope for cross-port passage', () => {
    const fullEnvelope = {
      version: 'kiro.1',
      envelope_id: crypto.randomUUID(),
      timestamp: Date.now(),
      stigmergy: {
        origin_id: crypto.randomUUID(),
        entropy_score: 0.88,
        hive_phase: 'E',
        commander_id: 'SPIDER_SOVEREIGN'
      },
      payload: {
        msg: "Mission complete. Promote to Silver.",
        target_medallion: "SILVER"
      }
    };

    const result = KiroEnvelopeSchema.safeParse(fullEnvelope);
    if (!result.success) {
      console.error(result.error);
    }
    expect(result.success).toBe(true);
  });
});
