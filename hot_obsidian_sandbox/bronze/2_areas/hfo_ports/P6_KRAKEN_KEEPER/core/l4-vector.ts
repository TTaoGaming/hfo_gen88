/**
 * P6-SUB-3: L4 VECTOR
 * Purpose: High-dimensional vector storage and similarity sensing.
 */

import { z } from 'zod';

export const VectorSchema = z.object({
  id: z.string(),
  dimensions: z.array(z.number()),
  metadata: z.record(z.any()).optional(),
});

export type Vector = z.infer<typeof VectorSchema>;

export class L4VectorStore {
  private vectors: Map<string, Vector> = new Map();

  upsert(vector: Vector): void {
    VectorSchema.parse(vector);
    this.vectors.set(vector.id, vector);
  }

  get(id: string): Vector | undefined {
    return this.vectors.get(id);
  }

  /**
   * Simple Cosine Similarity (Placeholder for Kraken depths)
   */
  similarity(v1: number[], v2: number[]): number {
    if (v1.length !== v2.length) return 0;
    const dotProduct = v1.reduce((acc, val, i) => acc + val * v2[i], 0);
    const mag1 = Math.sqrt(v1.reduce((acc, val) => acc + val * val, 0));
    const mag2 = Math.sqrt(v2.reduce((acc, val) => acc + val * val, 0));
    if (mag1 === 0 || mag2 === 0) return 0;
    return dotProduct / (mag1 * mag2);
  }

  search(query: number[], limit: number = 5): Vector[] {
    return Array.from(this.vectors.values())
      .sort((a, b) => this.similarity(b.dimensions, query) - this.similarity(a.dimensions, query))
      .slice(0, limit);
  }
}
