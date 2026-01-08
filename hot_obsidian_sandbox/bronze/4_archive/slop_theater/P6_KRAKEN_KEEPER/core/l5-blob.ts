/**
 * P6-SUB-4: L5 BLOB
 * Purpose: Binary Large Object (BLOB) management and integrity verification.
 */

import { z } from 'zod';
import { createHash } from 'crypto';

export const BlobSchema = z.object({
  id: z.string(),
  data: z.instanceof(Buffer),
  hash: z.string().optional(),
  mimeType: z.string().default('application/octet-stream'),
});

export type Blob = z.infer<typeof BlobSchema>;

export class L5BlobStorage {
  private storage: Map<string, Blob> = new Map();

  /**
   * Calculates SHA-256 hash of a buffer
   */
  calculateHash(data: Buffer): string {
    return createHash('sha256').update(data).digest('hex');
  }

  store(id: string, data: Buffer, mimeType?: string): string {
    const hash = this.calculateHash(data);
    const blob: Blob = {
      id,
      data,
      hash,
      mimeType: mimeType || 'application/octet-stream',
    };
    this.storage.set(id, blob);
    return hash;
  }

  get(id: string): Blob | undefined {
    return this.storage.get(id);
  }

  verify(id: string): boolean {
    const blob = this.get(id);
    if (!blob) return false;
    return this.calculateHash(blob.data) === blob.hash;
  }
}
