/**
 * P7-SUB-1: MCTS
 * Purpose: Monte Carlo Tree Search skeleton for strategic pathfinding.
 */

import { z } from 'zod';

export const MCTSTreeNodeSchema = z.object({
  id: z.string(),
  visits: z.number().default(0),
  score: z.number().default(0),
  children: z.array(z.string()).default([]),
  parentId: z.string().optional(),
});

export type MCTSTreeNode = z.infer<typeof MCTSTreeNodeSchema>;

export class MCTSPlanner {
  private tree: Map<string, MCTSTreeNode> = new Map();

  addNode(node: MCTSTreeNode): void {
    this.tree.set(node.id, node);
  }

  select(id: string): string {
    const node = this.tree.get(id);
    if (!node || node.children.length === 0) return id;
    
    // UCB1 simplified selection
    return node.children[0]; 
  }

  update(id: string, reward: number): void {
    const node = this.tree.get(id);
    if (node) {
      node.visits += 1;
      node.score += reward;
      if (node.parentId) {
        this.update(node.parentId, reward);
      }
    }
  }

  getBestAction(rootId: string): string {
    const root = this.tree.get(rootId);
    if (!root) return '';
    return root.children.sort((a, b) => {
      const na = this.tree.get(a);
      const nb = this.tree.get(b);
      return (nb?.score || 0) / (nb?.visits || 1) - (na?.score || 0) / (na?.visits || 1);
    })[0];
  }
}
