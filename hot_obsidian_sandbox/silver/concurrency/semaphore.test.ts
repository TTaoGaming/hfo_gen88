/**
 * Semaphore Unit Tests
 * @provenance hfo-testing-promotion/8.2
 * Validates: Requirements 5.1, 5.5
 */

import { describe, it, expect } from 'vitest';
import { Semaphore, withSemaphore } from './semaphore';

describe('Semaphore', () => {
  describe('constructor', () => {
    it('should create semaphore with positive permits', () => {
      const sem = new Semaphore(3);
      expect(sem.available()).toBe(3);
      expect(sem.max()).toBe(3);
    });

    it('should throw for zero permits', () => {
      expect(() => new Semaphore(0)).toThrow();
    });

    it('should throw for negative permits', () => {
      expect(() => new Semaphore(-1)).toThrow();
    });

    it('should throw for non-integer permits', () => {
      expect(() => new Semaphore(1.5)).toThrow();
    });
  });

  describe('acquire/release', () => {
    it('should decrement permits on acquire', async () => {
      const sem = new Semaphore(3);
      await sem.acquire();
      expect(sem.available()).toBe(2);
    });

    it('should increment permits on release', async () => {
      const sem = new Semaphore(3);
      await sem.acquire();
      sem.release();
      expect(sem.available()).toBe(3);
    });

    it('should allow multiple acquires up to limit', async () => {
      const sem = new Semaphore(3);
      await sem.acquire();
      await sem.acquire();
      await sem.acquire();
      expect(sem.available()).toBe(0);
    });

    it('should block when no permits available', async () => {
      const sem = new Semaphore(1);
      await sem.acquire();
      
      let acquired = false;
      const acquirePromise = sem.acquire().then(() => { acquired = true; });
      
      // Should not have acquired yet
      await new Promise(r => setTimeout(r, 10));
      expect(acquired).toBe(false);
      expect(sem.waiting()).toBe(1);
      
      // Release should unblock
      sem.release();
      await acquirePromise;
      expect(acquired).toBe(true);
    });

    it('should throw on over-release', async () => {
      const sem = new Semaphore(1);
      expect(() => sem.release()).toThrow('over-release');
    });

    it('should process waiters in FIFO order', async () => {
      const sem = new Semaphore(1);
      await sem.acquire();
      
      const order: number[] = [];
      const p1 = sem.acquire().then(() => order.push(1));
      const p2 = sem.acquire().then(() => order.push(2));
      const p3 = sem.acquire().then(() => order.push(3));
      
      sem.release();
      await p1;
      sem.release();
      await p2;
      sem.release();
      await p3;
      
      expect(order).toEqual([1, 2, 3]);
    });
  });

  describe('tryAcquire', () => {
    it('should return true and decrement when available', () => {
      const sem = new Semaphore(2);
      expect(sem.tryAcquire()).toBe(true);
      expect(sem.available()).toBe(1);
    });

    it('should return false when not available', async () => {
      const sem = new Semaphore(1);
      await sem.acquire();
      expect(sem.tryAcquire()).toBe(false);
      expect(sem.available()).toBe(0);
    });
  });

  describe('withSemaphore', () => {
    it('should acquire before and release after', async () => {
      const sem = new Semaphore(1);
      
      const result = await withSemaphore(sem, async () => {
        expect(sem.available()).toBe(0);
        return 42;
      });
      
      expect(result).toBe(42);
      expect(sem.available()).toBe(1);
    });

    it('should release on error', async () => {
      const sem = new Semaphore(1);
      
      await expect(
        withSemaphore(sem, async () => {
          throw new Error('test error');
        })
      ).rejects.toThrow('test error');
      
      expect(sem.available()).toBe(1);
    });
  });

  describe('waiting', () => {
    it('should return 0 when no waiters', () => {
      const sem = new Semaphore(3);
      expect(sem.waiting()).toBe(0);
    });

    it('should count waiters correctly', async () => {
      const sem = new Semaphore(1);
      await sem.acquire();
      
      sem.acquire(); // Will wait
      sem.acquire(); // Will wait
      
      expect(sem.waiting()).toBe(2);
      
      sem.release();
      sem.release();
    });
  });
});
