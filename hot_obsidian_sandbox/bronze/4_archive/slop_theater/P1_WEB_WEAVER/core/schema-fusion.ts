/**
 * 🕸️ P1-SUB-1: SCHEMA FUSION
 * Composes multiple schemas into unified operational contracts.
 */

import { z } from 'zod';

export class SchemaFusion {
  /**
   * Merges two Zod objects into one.
   */
  public fuse<A extends z.ZodRawShape, B extends z.ZodRawShape>(
    schemaA: z.ZodObject<A>,
    schemaB: z.ZodObject<B>
  ): z.ZodObject<A & B> {
    return schemaA.merge(schemaB);
  }

  /**
   * Creates a 'Lattice' schema which is an intersection of multiple requirements.
   */
  public lattice<T extends z.ZodTypeAny>(schemas: T[]): z.ZodTypeAny {
    return schemas.reduce((acc, schema) => acc.and(schema));
  }
}
