/**
 * 👁️ P0-SUB-5: GRAPH CRAWLER
 * Senses and crawls the HFO knowledge graph.
 */

export interface GraphNode {
  id: string;
  type: string;
  links: string[];
}

export class GraphCrawler {
  private nodes: Map<string, GraphNode> = new Map();

  public ingest(node: GraphNode): void {
    this.nodes.set(node.id, node);
  }

  /**
   * Senses the degree of a node (connectedness).
   */
  public getDegree(id: string): number {
    return this.nodes.get(id)?.links.length || 0;
  }

  /**
   * Senses if a path exists between two nodes (simple crawl).
   */
  public isConnected(start: string, target: string, visited: Set<string> = new Set()): boolean {
    if (start === target) return true;
    visited.add(start);
    
    const node = this.nodes.get(start);
    if (!node) return false;

    for (const link of node.links) {
      if (!visited.has(link)) {
        if (this.isConnected(link, target, visited)) return true;
      }
    }
    return false;
  }
}
