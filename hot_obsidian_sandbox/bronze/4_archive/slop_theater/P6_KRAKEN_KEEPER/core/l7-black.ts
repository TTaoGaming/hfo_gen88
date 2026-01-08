/**
 * P6-SUB-6: L7 BLACK
 * Purpose: Encrypted and sensitive storage for protected secrets.
 */

import { z } from 'zod';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

export const SecretSchema = z.object({
  id: z.string(),
  encryptedValue: z.string(),
  iv: z.string(),
});

export type Secret = z.infer<typeof SecretSchema>;

export class L7BlackStorage {
  private secrets: Map<string, Secret> = new Map();
  private readonly algorithm = 'aes-256-cbc';
  private readonly key: Buffer;

  constructor(encryptionKey?: string) {
    // In production, this would be injected from an env var or vault.
    this.key = encryptionKey 
      ? Buffer.alloc(32, encryptionKey) 
      : Buffer.alloc(32, '0'.repeat(64), 'hex');
  }

  encrypt(id: string, plainText: string): void {
    const iv = randomBytes(16);
    const cipher = createCipheriv(this.algorithm, this.key, iv);
    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    this.secrets.set(id, {
      id,
      encryptedValue: encrypted,
      iv: iv.toString('hex'),
    });
  }

  decrypt(id: string): string | undefined {
    const secret = this.secrets.get(id);
    if (!secret) return undefined;

    const iv = Buffer.from(secret.iv, 'hex');
    const decipher = createDecipheriv(this.algorithm, this.key, iv);
    let decrypted = decipher.update(secret.encryptedValue, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
