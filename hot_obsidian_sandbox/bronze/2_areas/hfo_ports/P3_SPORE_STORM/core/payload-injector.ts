/**
 * P3 Sub 3: Payload Injector
 * @provenance hot_obsidian_sandbox/bronze/2_areas/hfo_ports/P3_SPORE_STORM/core/payload-injector.ts
 * "The payload is the message. The schema is the law."
 */

import { z } from 'zod';
import { FileInjector } from './file-injector.js';

export const PayloadSchema = z.object({
  id: z.string(),
  data: z.string(),
  type: z.enum(['CODE', 'DATA', 'CONFIG']),
  checksum: z.string().optional()
});

export type Payload = z.infer<typeof PayloadSchema>;

/**
 * Payload Injector - Validates and delivers structured payloads.
 */
export class PayloadInjector {
  private injector = new FileInjector();

  /**
   * Validates and injects a payload.
   */
  injectPayload(file: string, payload: unknown, options: { marker?: string } = {}) {
    const result = PayloadSchema.safeParse(payload);
    if (!result.success) {
      throw new Error(`Invalid Spore Payload: ${result.error.message}`);
    }

    const formatted = `// SPORE_START:${result.data.id}:${result.data.type}\n${result.data.data}\n// SPORE_END:${result.data.id}`;
    return this.injector.inject(file, formatted, options);
  }
}
