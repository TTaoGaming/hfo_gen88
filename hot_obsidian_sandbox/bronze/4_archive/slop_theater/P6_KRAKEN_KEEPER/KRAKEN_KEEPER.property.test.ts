/**
 * P6 KRAKEN KEEPER - Property Tests
 * 
 * @port 6
 * @commander KRAKEN_KEEPER
 * @verb ASSIMILATE / STORE
 * @provenance: LEGENDARY_COMMANDERS_V9.md
 * Validates: Property 18 (MAP-ELITE Archive Invariant)
 */

import { describe, it, expect } from 'vitest';
import {
  ArchiveEntrySchema,
  MapEliteArchiveSchema,
  AssimilationResultSchema,
  createArchive,
  assimilate,
  getElite,
  queryArchive,
  type ArchiveEntry,
  type MapEliteArchive,
} from './contracts/index.js';


// Helper to create test entries
function createTestEntry(x: number, y: number, fitness: number): ArchiveEntry {
  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    artifact: `artifact-${x}-${y}`,
    fitness,
    cell: { x, y },
    metadata: {
      generation: 1,
      sourcePort: 6,
      tags: [],
    },
    hash: `sha256:${'a'.repeat(64)}`,
  };
}

describe('P6 KRAKEN KEEPER - Property Tests', () => {
  // --- Property 18: MAP-ELITE Archive Invariant ---
  describe('Property 18: MAP-ELITE Archive Invariant', () => {
    it('stored artifact has highest fitness in cell', () => {
      const archive = createArchive('test', 10, 10);
      
      // Insert entry with fitness 0.5
      const entry1 = createTestEntry(3, 3, 0.5);
      assimilate(archive, entry1);
      
      // Insert entry with fitness 0.3 (lower) - should NOT replace
      const entry2 = createTestEntry(3, 3, 0.3);
      const result2 = assimilate(archive, entry2);
      expect(result2.success).toBe(false);
      expect(result2.reason).toBe('LOWER_FITNESS');
      
      // Insert entry with fitness 0.8 (higher) - should replace
      const entry3 = createTestEntry(3, 3, 0.8);
      const result3 = assimilate(archive, entry3);
      expect(result3.success).toBe(true);
      expect(result3.displaced?.fitness).toBe(0.5);
      
      // Verify elite is the highest fitness
      const elite = getElite(archive, 3, 3);
      expect(elite?.fitness).toBe(0.8);
    });

    it('empty cell accepts any entry', () => {
      const archive = createArchive('test', 5, 5);
      const entry = createTestEntry(2, 2, 0.1);
      
      const result = assimilate(archive, entry);
      expect(result.success).toBe(true);
      expect(result.reason).toBe('NEW_ELITE');
    });


    it('out-of-bounds cell is rejected', () => {
      const archive = createArchive('test', 5, 5);
      const entry = createTestEntry(10, 10, 0.9); // Out of bounds
      
      const result = assimilate(archive, entry);
      expect(result.success).toBe(false);
      expect(result.reason).toBe('INVALID_ENTRY');
    });

    it('archive tracks total entries correctly', () => {
      const archive = createArchive('test', 3, 3);
      expect(archive.totalEntries).toBe(0);
      
      assimilate(archive, createTestEntry(0, 0, 0.5));
      expect(archive.totalEntries).toBe(1);
      
      assimilate(archive, createTestEntry(1, 1, 0.5));
      expect(archive.totalEntries).toBe(2);
      
      // Replacing doesn't increase count
      assimilate(archive, createTestEntry(0, 0, 0.9));
      expect(archive.totalEntries).toBe(2);
    });
  });

  // --- Archive Schema Validation ---
  describe('Archive Schema Validation', () => {
    it('archive entry validates against schema', () => {
      const entry = createTestEntry(1, 2, 0.75);
      const result = ArchiveEntrySchema.safeParse(entry);
      expect(result.success).toBe(true);
    });

    it('archive validates against schema', () => {
      const archive = createArchive('test-archive', 4, 4);
      const result = MapEliteArchiveSchema.safeParse(archive);
      expect(result.success).toBe(true);
    });

    it('assimilation result validates against schema', () => {
      const archive = createArchive('test', 5, 5);
      const entry = createTestEntry(2, 2, 0.6);
      const result = assimilate(archive, entry);
      
      const parsed = AssimilationResultSchema.safeParse(result);
      expect(parsed.success).toBe(true);
    });
  });


  // --- Query Tests ---
  describe('Archive Query', () => {
    it('queries by cell range', () => {
      const archive = createArchive('test', 5, 5);
      assimilate(archive, createTestEntry(0, 0, 0.5));
      assimilate(archive, createTestEntry(1, 1, 0.6));
      assimilate(archive, createTestEntry(4, 4, 0.7));
      
      const results = queryArchive(archive, { cellRange: { minX: 0, maxX: 2, minY: 0, maxY: 2 }, limit: 100 });
      expect(results).toHaveLength(2);
    });

    it('queries by minimum fitness', () => {
      const archive = createArchive('test', 3, 3);
      assimilate(archive, createTestEntry(0, 0, 0.3));
      assimilate(archive, createTestEntry(1, 1, 0.6));
      assimilate(archive, createTestEntry(2, 2, 0.9));
      
      const results = queryArchive(archive, { minFitness: 0.5, limit: 100 });
      expect(results).toHaveLength(2);
      expect(results.every(e => e.fitness >= 0.5)).toBe(true);
    });

    it('respects query limit', () => {
      const archive = createArchive('test', 5, 5);
      for (let i = 0; i < 5; i++) {
        assimilate(archive, createTestEntry(i, 0, 0.5 + i * 0.1));
      }
      
      const results = queryArchive(archive, { limit: 3 });
      expect(results).toHaveLength(3);
    });

    it('getElite returns undefined for empty cell', () => {
      const archive = createArchive('test', 5, 5);
      expect(getElite(archive, 2, 2)).toBeUndefined();
    });

    it('getElite returns undefined for out-of-bounds', () => {
      const archive = createArchive('test', 5, 5);
      expect(getElite(archive, 10, 10)).toBeUndefined();
    });
  });
});
