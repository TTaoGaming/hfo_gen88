/**
 * 🕸️ P1-SUB-4: CONTRACT STORE
 * Centralized repository for Zod schemas (Contracts).
 */

import { z } from 'zod';

export class ContractStore {
  private contracts: Map<string, z.ZodTypeAny> = new Map();

  public register(name: string, schema: z.ZodTypeAny): void {
    this.contracts.set(name, schema);
  }

  public get(name: string): z.ZodTypeAny {
    const schema = this.contracts.get(name);
    if (!schema) throw new Error(`Contract '${name}' not found.`);
    return schema;
  }

  public validate(name: string, data: unknown): any {
    return this.get(name).parse(data);
  }
}
