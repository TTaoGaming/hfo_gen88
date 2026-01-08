/**
 * 🦑 P6-SUB-0: L1 CACHE
 * Fast in-memory key-value store with TTL.
 */

export interface CacheEntry<T> {
  value: T;
  expiry: number;
}

export class L1Cache {
  private store: Map<string, CacheEntry<any>> = new Map();

  public set<T>(key: string, value: T, ttlMs: number = 1000): void {
    this.store.set(key, {
      value,
      expiry: Date.now() + ttlMs,
    });
  }

  public get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiry) {
      this.store.delete(key);
      return undefined;
    }

    return entry.value;
  }

  public clear(): void {
    this.store.clear();
  }
}
