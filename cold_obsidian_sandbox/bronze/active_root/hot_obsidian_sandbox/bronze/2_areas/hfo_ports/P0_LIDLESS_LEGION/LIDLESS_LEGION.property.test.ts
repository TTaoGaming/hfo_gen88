/**
 * P0 LIDLESS LEGION - Property Tests
 * 
 * @port 0
 * @commander LIDLESS_LEGION
 * @verb OBSERVE / SENSE
 * @provenance: LEGENDARY_COMMANDERS_V9.md
 * Validates: Property 2 (Observation Logging), Property 3 (Separation of Concerns)
 */

import { describe, it, expect } from 'vitest';
import {
  ObservationSchema,
  ObservationBatchSchema,
  ObservationFilterSchema,
  createObservation,
  filterObservations,
  batchObservations,
  isAllowedVerb,
  isForbiddenVerb,
  type Observation,
  type ObservationSource,
} from './contracts/index.js';

describe('P0 LIDLESS LEGION - Property Tests', () => {
  // --- Property 2: Observation Logging Invariant ---
  describe('Property 2: Observation Logging Invariant', () => {
    it('every observation has a valid UUID', () => {
      const sources: ObservationSource[] = ['TAVILY', 'PERPLEXITY', 'OSINT', 'MEDIAPIPE', 'WEBCAM', 'FILE_SYSTEM', 'STIGMERGY'];
      
      for (const source of sources) {
        const obs = createObservation(source, { test: 'data' });
        expect(obs.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      }
    });

    it('every observation has a timestamp', () => {
      const before = Date.now();
      const obs = createObservation('TAVILY', { query: 'test' });
      const after = Date.now();
      
      expect(obs.timestamp).toBeGreaterThanOrEqual(before);
      expect(obs.timestamp).toBeLessThanOrEqual(after);
    });

    it('observations validate against schema', () => {
      const obs = createObservation('PERPLEXITY', { result: 'data' }, {
        query: 'test query',
        confidence: 0.95,
        latencyMs: 150,
        tags: ['search', 'grounding'],
      });
      
      const result = ObservationSchema.safeParse(obs);
      expect(result.success).toBe(true);
    });

    it('observation batches validate against schema', () => {
      const obs1 = createObservation('TAVILY', { a: 1 });
      const obs2 = createObservation('OSINT', { b: 2 });
      const batch = batchObservations([obs1, obs2], 'correlation-123');
      
      const result = ObservationBatchSchema.safeParse(batch);
      expect(result.success).toBe(true);
      expect(batch.observations).toHaveLength(2);
    });

    it('confidence is bounded [0, 1]', () => {
      const obs = createObservation('MEDIAPIPE', {}, { confidence: 0.5 });
      expect(obs.confidence).toBeGreaterThanOrEqual(0);
      expect(obs.confidence).toBeLessThanOrEqual(1);
      
      // Schema rejects out-of-bounds
      const invalid = { ...obs, confidence: 1.5 };
      const result = ObservationSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  // --- Property 3: Separation of Concerns (P0) ---
  describe('Property 3: Separation of Concerns', () => {
    it('OBSERVE is an allowed verb', () => {
      expect(isAllowedVerb('OBSERVE')).toBe(true);
    });

    it('SENSE is an allowed verb', () => {
      expect(isAllowedVerb('SENSE')).toBe(true);
    });

    it('SHAPE is forbidden for P0', () => {
      expect(isForbiddenVerb('SHAPE')).toBe(true);
      expect(isAllowedVerb('SHAPE')).toBe(false);
    });

    it('STORE is forbidden for P0', () => {
      expect(isForbiddenVerb('STORE')).toBe(true);
      expect(isAllowedVerb('STORE')).toBe(false);
    });

    it('DECIDE is forbidden for P0', () => {
      expect(isForbiddenVerb('DECIDE')).toBe(true);
      expect(isAllowedVerb('DECIDE')).toBe(false);
    });

    it('INJECT is forbidden for P0', () => {
      expect(isForbiddenVerb('INJECT')).toBe(true);
      expect(isAllowedVerb('INJECT')).toBe(false);
    });

    it('DISRUPT is forbidden for P0', () => {
      expect(isForbiddenVerb('DISRUPT')).toBe(true);
      expect(isAllowedVerb('DISRUPT')).toBe(false);
    });

    it('IMMUNIZE is forbidden for P0', () => {
      expect(isForbiddenVerb('IMMUNIZE')).toBe(true);
      expect(isAllowedVerb('IMMUNIZE')).toBe(false);
    });

    it('BRIDGE is forbidden for P0', () => {
      expect(isForbiddenVerb('BRIDGE')).toBe(true);
      expect(isAllowedVerb('BRIDGE')).toBe(false);
    });

    it('ASSIMILATE is forbidden for P0', () => {
      expect(isForbiddenVerb('ASSIMILATE')).toBe(true);
      expect(isAllowedVerb('ASSIMILATE')).toBe(false);
    });
  });

  // --- Observation Filtering ---
  describe('Observation Filtering', () => {
    const observations: Observation[] = [
      createObservation('TAVILY', { a: 1 }, { confidence: 0.9, tags: ['search'] }),
      createObservation('PERPLEXITY', { b: 2 }, { confidence: 0.8, tags: ['search', 'ai'] }),
      createObservation('OSINT', { c: 3 }, { confidence: 0.7, tags: ['intel'] }),
      createObservation('MEDIAPIPE', { d: 4 }, { confidence: 0.95, tags: ['gesture'] }),
    ];

    it('filters by source', () => {
      const result = filterObservations(observations, { sources: ['TAVILY', 'PERPLEXITY'], limit: 100 });
      expect(result).toHaveLength(2);
      expect(result.every(o => o.source === 'TAVILY' || o.source === 'PERPLEXITY')).toBe(true);
    });

    it('filters by minimum confidence', () => {
      const result = filterObservations(observations, { minConfidence: 0.85, limit: 100 });
      expect(result).toHaveLength(2);
      expect(result.every(o => o.confidence >= 0.85)).toBe(true);
    });

    it('filters by tags (all must match)', () => {
      const result = filterObservations(observations, { tags: ['search'], limit: 100 });
      expect(result).toHaveLength(2);
      
      const result2 = filterObservations(observations, { tags: ['search', 'ai'], limit: 100 });
      expect(result2).toHaveLength(1);
    });

    it('respects limit', () => {
      const result = filterObservations(observations, { limit: 2 });
      expect(result).toHaveLength(2);
    });

    it('filter schema validates', () => {
      const filter = { sources: ['TAVILY'], minConfidence: 0.5, limit: 50 };
      const result = ObservationFilterSchema.safeParse(filter);
      expect(result.success).toBe(true);
    });
  });
});
