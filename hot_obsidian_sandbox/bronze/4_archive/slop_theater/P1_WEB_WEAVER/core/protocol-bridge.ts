/**
 * 🕸️ P1-SUB-0: PROTOCOL BRIDGE
 * Validates and transforms external messages across protocol boundaries using Zod.
 */

import { z } from 'zod';

export class ProtocolBridge {
  /**
   * Bridges a message from an untrusted source to a validated schema.
   */
  public bridge<T>(message: unknown, schema: z.ZodType<T>): T {
    const result = schema.safeParse(message);
    if (!result.success) {
      throw new Error(`Bridge Validation Failed: ${result.error.errors.map(e => e.message).join(', ')}`);
    }
    return result.data;
  }
}
