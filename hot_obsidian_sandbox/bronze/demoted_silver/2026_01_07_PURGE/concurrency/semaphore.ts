/**
 * Semaphore - Concurrency Control Primitive
 * @provenance hfo-testing-promotion/8.1
 * Validates: Requirements 5.1, 5.5
 */

/**
 * A counting semaphore for limiting concurrent operations.
 * Validates: Requirements 5.1, 5.5
 */
export class Semaphore {
  private permits: number;
  private readonly maxPermits: number;
  private queue: (() => void)[] = [];

  /**
   * Create a semaphore with N permits.
   * @param n Number of permits (must be positive)
   */
  constructor(n: number) {
    if (n <= 0 || !Number.isInteger(n)) {
      throw new Error('Semaphore permits must be a positive integer');
    }
    this.permits = n;
    this.maxPermits = n;
  }

  /**
   * Acquire a permit. Blocks if none available.
   * Validates: Requirements 5.1
   */
  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return;
    }
    await new Promise<void>(resolve => this.queue.push(resolve));
  }

  /**
   * Release a permit. Wakes up one waiting acquirer if any.
   * Validates: Requirements 5.1
   */
  release(): void {
    if (this.queue.length > 0) {
      const next = this.queue.shift()!;
      next();
    } else {
      if (this.permits >= this.maxPermits) {
        throw new Error('Semaphore over-release: permits would exceed max');
      }
      this.permits++;
    }
  }

  /**
   * Get number of available permits.
   * Validates: Requirements 5.5
   */
  available(): number {
    return this.permits;
  }

  /**
   * Get number of waiters in queue.
   */
  waiting(): number {
    return this.queue.length;
  }

  /**
   * Get maximum permits.
   */
  max(): number {
    return this.maxPermits;
  }

  /**
   * Try to acquire a permit without blocking.
   * Returns true if acquired, false if not available.
   */
  tryAcquire(): boolean {
    if (this.permits > 0) {
      this.permits--;
      return true;
    }
    return false;
  }
}

/**
 * Execute a function with semaphore protection.
 * Automatically releases permit when done.
 */
export async function withSemaphore<T>(
  sem: Semaphore,
  fn: () => Promise<T>
): Promise<T> {
  await sem.acquire();
  try {
    return await fn();
  } finally {
    sem.release();
  }
}
