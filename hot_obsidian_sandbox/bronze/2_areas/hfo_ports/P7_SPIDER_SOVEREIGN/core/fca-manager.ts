/**
 * P7-SUB-3: FCA
 * Purpose: Formal Concept Analysis (FCA) for pattern discovery and concept lattices.
 */

import { z } from 'zod';

export const ConceptSchema = z.object({
  extent: z.array(z.string()), // Objects
  intent: z.array(z.string()), // Attributes
});

export type Concept = z.infer<typeof ConceptSchema>;

export class FCAManager {
  private concepts: Concept[] = [];

  extractConcept(objects: string[], attributes: string[]): Concept {
    const concept: Concept = { extent: objects, intent: attributes };
    this.concepts.push(concept);
    return concept;
  }

  /**
   * Simple check if an object fits a concept
   */
  fits(objectAttributes: string[], concept: Concept): boolean {
    return concept.intent.every(attr => objectAttributes.includes(attr));
  }

  getLattice(): Concept[] {
    return this.concepts;
  }
}
