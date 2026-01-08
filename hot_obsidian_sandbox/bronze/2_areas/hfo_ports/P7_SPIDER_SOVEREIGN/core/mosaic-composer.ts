/**
 * P7-SUB-5: MOSAIC
 * Purpose: Distributed logic and mission composition via "tiles".
 */

import { z } from 'zod';

export const TileSchema = z.object({
  id: z.string(),
  capability: z.string(),
  reliability: z.number().min(0).max(1),
});

export type Tile = z.infer<typeof TileSchema>;

export class MosaicComposer {
  private tiles: Map<string, Tile> = new Map();

  registerTile(tile: Tile): void {
    this.tiles.set(tile.id, tile);
  }

  composeMission(requiredCapabilities: string[]): Tile[] {
    const composition: Tile[] = [];
    for (const cap of requiredCapabilities) {
      const bestTile = Array.from(this.tiles.values())
        .filter(t => t.capability === cap)
        .sort((a, b) => b.reliability - a.reliability)[0];
      
      if (bestTile) composition.push(bestTile);
    }
    return composition;
  }
}
