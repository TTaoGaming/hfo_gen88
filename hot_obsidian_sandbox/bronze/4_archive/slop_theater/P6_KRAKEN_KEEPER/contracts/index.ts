/**
 * P6 KRAKEN KEEPER - Zod Contracts
 * 
 * @port 6
 * @commander KRAKEN_KEEPER
 * @verb ASSIMILATE / STORE
 * @provenance: LEGENDARY_COMMANDERS_V9.md
 * Validates: Requirements 8.1, 8.2, 8.3, 8.4
 */

import { z } from 'zod';

// --- ARCHIVE ENTRY ---

export const ArchiveEntrySchema = z.object({
  id: z.string().uuid(),
  timestamp: z.number(),
  artifact: z.string(),
  fitness: z.number().min(0).max(1),
  cell: z.object({
    x: z.number().int().min(0),
    y: z.number().int().min(0),
  }),
  metadata: z.object({
    generation: z.number().int().min(0),
    sourcePort: z.number().int().min(0).max(7),
    tags: z.array(z.string()).default([]),
  }),
  hash: z.string().regex(/^sha256:[a-f0-9]{64}$/),
});

export type ArchiveEntry = z.infer<typeof ArchiveEntrySchema>;

// --- MAP-ELITE CELL ---

export const MapEliteCellSchema = z.object({
  x: z.number().int().min(0),
  y: z.number().int().min(0),
  elite: ArchiveEntrySchema.optional(),
  history: z.array(z.object({
    id: z.string().uuid(),
    fitness: z.number(),
    timestamp: z.number(),
  })).default([]),
});

export type MapEliteCell = z.infer<typeof MapEliteCellSchema>;

// --- MAP-ELITE ARCHIVE ---

export const MapEliteArchiveSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  dimensions: z.object({
    x: z.number().int().min(1),
    y: z.number().int().min(1),
  }),
  cells: z.array(z.array(MapEliteCellSchema)),
  totalEntries: z.number().int().min(0),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type MapEliteArchive = z.infer<typeof MapEliteArchiveSchema>;

// --- ASSIMILATION RESULT ---

export const AssimilationResultSchema = z.object({
  success: z.boolean(),
  entry: ArchiveEntrySchema.optional(),
  displaced: ArchiveEntrySchema.optional(),
  reason: z.enum(['NEW_ELITE', 'LOWER_FITNESS', 'CELL_OCCUPIED', 'INVALID_ENTRY']),
});

export type AssimilationResult = z.infer<typeof AssimilationResultSchema>;

// --- STORAGE QUERY ---

export const StorageQuerySchema = z.object({
  cellRange: z.object({
    minX: z.number().int().min(0),
    maxX: z.number().int().min(0),
    minY: z.number().int().min(0),
    maxY: z.number().int().min(0),
  }).optional(),
  minFitness: z.number().min(0).max(1).optional(),
  tags: z.array(z.string()).optional(),
  limit: z.number().int().min(1).max(1000).default(100),
});

export type StorageQuery = z.infer<typeof StorageQuerySchema>;

// --- MAP-ELITE FUNCTIONS ---

/**
 * Creates an empty MAP-ELITE archive
 */
export function createArchive(name: string, dimX: number, dimY: number): MapEliteArchive {
  const cells: MapEliteCell[][] = [];
  for (let y = 0; y < dimY; y++) {
    const row: MapEliteCell[] = [];
    for (let x = 0; x < dimX; x++) {
      row.push({ x, y, elite: undefined, history: [] });
    }
    cells.push(row);
  }
  
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    name,
    dimensions: { x: dimX, y: dimY },
    cells,
    totalEntries: 0,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Assimilates an entry into the archive (MAP-ELITE algorithm)
 * Only stores if fitness is higher than current elite in cell
 */
export function assimilate(archive: MapEliteArchive, entry: ArchiveEntry): AssimilationResult {
  const { x, y } = entry.cell;
  
  // Bounds check
  if (x >= archive.dimensions.x || y >= archive.dimensions.y) {
    return { success: false, reason: 'INVALID_ENTRY' };
  }
  
  const cell = archive.cells[y][x];
  const currentElite = cell.elite;
  
  // If no current elite, this becomes the elite
  if (!currentElite) {
    cell.elite = entry;
    cell.history.push({ id: entry.id, fitness: entry.fitness, timestamp: entry.timestamp });
    archive.totalEntries++;
    archive.updatedAt = Date.now();
    return { success: true, entry, reason: 'NEW_ELITE' };
  }
  
  // If new entry has higher fitness, replace
  if (entry.fitness > currentElite.fitness) {
    cell.elite = entry;
    cell.history.push({ id: entry.id, fitness: entry.fitness, timestamp: entry.timestamp });
    archive.updatedAt = Date.now();
    return { success: true, entry, displaced: currentElite, reason: 'NEW_ELITE' };
  }
  
  // Lower fitness, don't store
  return { success: false, reason: 'LOWER_FITNESS' };
}

/**
 * Retrieves the elite from a specific cell
 */
export function getElite(archive: MapEliteArchive, x: number, y: number): ArchiveEntry | undefined {
  if (x >= archive.dimensions.x || y >= archive.dimensions.y) {
    return undefined;
  }
  return archive.cells[y][x].elite;
}

/**
 * Queries the archive for entries matching criteria
 */
export function queryArchive(archive: MapEliteArchive, query: StorageQuery): ArchiveEntry[] {
  const results: ArchiveEntry[] = [];
  
  const minX = query.cellRange?.minX ?? 0;
  const maxX = query.cellRange?.maxX ?? archive.dimensions.x - 1;
  const minY = query.cellRange?.minY ?? 0;
  const maxY = query.cellRange?.maxY ?? archive.dimensions.y - 1;
  
  for (let y = minY; y <= maxY && y < archive.dimensions.y; y++) {
    for (let x = minX; x <= maxX && x < archive.dimensions.x; x++) {
      const elite = archive.cells[y][x].elite;
      if (!elite) continue;
      
      // Filter by fitness
      if (query.minFitness !== undefined && elite.fitness < query.minFitness) continue;
      
      // Filter by tags
      if (query.tags && query.tags.length > 0) {
        const hasAllTags = query.tags.every(tag => elite.metadata.tags.includes(tag));
        if (!hasAllTags) continue;
      }
      
      results.push(elite);
      if (results.length >= query.limit) return results;
    }
  }
  
  return results;
}
