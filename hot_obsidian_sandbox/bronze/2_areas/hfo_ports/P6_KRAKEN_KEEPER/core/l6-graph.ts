/**
 * P6-SUB-5: L6 GRAPH
 * Purpose: Relational graph storage for data nodes and linked entities.
 */

import { z } from 'zod';

export const NodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  properties: z.record(z.any()).default({}),
});

export const EdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
  relation: z.string(),
  weight: z.number().default(1.0),
});

export type Node = z.infer<typeof NodeSchema>;
export type Edge = z.infer<typeof EdgeSchema>;

export class L6GraphStore {
  private nodes: Map<string, Node> = new Map();
  private edges: Edge[] = [];

  addNode(node: Node): void {
    NodeSchema.parse(node);
    this.nodes.set(node.id, node);
  }

  addEdge(edge: Edge): void {
    EdgeSchema.parse(edge);
    this.edges.push(edge);
  }

  getNeighbors(id: string): string[] {
    return this.edges
      .filter(e => e.from === id)
      .map(e => e.to);
  }

  query(type: string): Node[] {
    return Array.from(this.nodes.values()).filter(n => n.type === type);
  }
}
