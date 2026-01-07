/**
 * Semaphore Property Tests
 * @provenance hfo-testing-promotion/8.3
 * Feature: hfo-testing-promotion
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { Semaphore, withSemaphore } from './semaphore';

describe('Semaphore Properties', () => {
  /**
   * Property 9: Semaphore Concurrency Limit
   * For any Semaphore with N permits, at no point SHALL more than N
   * concurrent operations hold permits simultaneously.
   * Validates: Requirements 5.5
   */
  describe('Property 9: Semaphore Concurrency Limit', () => {
    it('never exceeds max permits in use', async () => {
      // Test with various permit counts
      for (const maxPermits of [1, 2, 4, 8]) {
        const sem = new Semaphore(maxPermits);
        let concurrent = 0;
        let maxConcurrent = 0;

        const tasks = Array.from({ length: 20 }, async () => {
          await sem.acquire();
          concurrent++;
          maxConcurrent = Math.max(maxConcurrent, concurrent);
          
          // Invariant: concurrent should never exceed maxPermits
          expect(concurrent).toBeLessThanOrEqual(maxPermits);
          
          // Simulate work
          await new Promise(r => setTimeout(r, 1));
          
          concurrent--;
          sem.release();
        });

        await Promise.all(tasks);
        
        expect(maxConcurrent).toBeLessThanOrEqual(maxPermits);
        expect(sem.available()).toBe(maxPermits);
      }
    });

    it('available permits never negative with tryAcquire', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 8 }),
          fc.array(fc.boolean(), { minLength: 1, maxLength: 50 }),
          (maxPermits, ops) => {
            const sem = new Semaphore(maxPermits);
            let held = 0;

            for (const shouldAcquire of ops) {
              if (shouldAcquire && sem.tryAcquire()) {
                held++;
              } else if (!shouldAcquire && held > 0) {
                sem.release();
                held--;
              }

              // Invariant: available is never negative
              expect(sem.available()).toBeGreaterThanOrEqual(0);
              // Invariant: available + held = maxPermits
              expect(sem.available() + held).toBe(maxPermits);
            }

            // Cleanup
            while (held > 0) {
              sem.release();
              held--;
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('withSemaphore always releases on success', async () => {
      for (let i = 0; i < 50; i++) {
        const maxPermits = (i % 8) + 1;
        const sem = new Semaphore(maxPermits);
        const initialAvailable = sem.available();

        await withSemaphore(sem, async () => {
          return 42;
        });

        // Invariant: permits restored after withSemaphore
        expect(sem.available()).toBe(initialAvailable);
      }
    });

    it('withSemaphore always releases on error', async () => {
      for (let i = 0; i < 50; i++) {
        const maxPermits = (i % 8) + 1;
        const sem = new Semaphore(maxPermits);
        const initialAvailable = sem.available();

        try {
          await withSemaphore(sem, async () => {
            throw new Error('test');
          });
        } catch {
          // Expected
        }

        // Invariant: permits restored after withSemaphore
        expect(sem.available()).toBe(initialAvailable);
      }
    });

    it('tryAcquire is consistent with available', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 8 }),
          fc.integer({ min: 0, max: 10 }),
          (maxPermits, acquireCount) => {
            const sem = new Semaphore(maxPermits);
            
            // Acquire some permits using tryAcquire
            let acquired = 0;
            for (let i = 0; i < acquireCount; i++) {
              if (sem.tryAcquire()) {
                acquired++;
              }
            }

            // tryAcquire should succeed iff available > 0
            const available = sem.available();
            const result = sem.tryAcquire();
            
            if (available > 0) {
              expect(result).toBe(true);
              sem.release(); // Restore
            } else {
              expect(result).toBe(false);
            }

            // Cleanup
            for (let i = 0; i < acquired; i++) {
              sem.release();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('permits invariant: available + held = max', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 8 }),
          fc.array(fc.boolean(), { minLength: 0, maxLength: 30 }),
          (maxPermits, ops) => {
            const sem = new Semaphore(maxPermits);
            let held = 0;

            for (const acquire of ops) {
              if (acquire && held < maxPermits) {
                if (sem.tryAcquire()) {
                  held++;
                }
              } else if (!acquire && held > 0) {
                sem.release();
                held--;
              }

              // Core invariant
              expect(sem.available() + held).toBe(maxPermits);
              expect(sem.available()).toBeGreaterThanOrEqual(0);
              expect(sem.available()).toBeLessThanOrEqual(maxPermits);
            }

            // Cleanup
            while (held > 0) {
              sem.release();
              held--;
            }
            
            expect(sem.available()).toBe(maxPermits);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
