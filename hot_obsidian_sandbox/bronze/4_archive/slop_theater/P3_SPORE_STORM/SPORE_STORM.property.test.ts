/**
 * P3 SPORE STORM - Property Tests
 * 
 * @port 3
 * @commander SPORE_STORM
 * @verb INJECT / DELIVER
 * @provenance: LEGENDARY_COMMANDERS_V9.md
 * Validates: Property 7 (Injection Logging Invariant)
 */

import { describe, it, expect } from 'vitest';
import {
  InjectionPayloadSchema,
  DeliveryResultSchema,
  CascadeConfigSchema,
  CascadeResultSchema,
  StigmergyInjectionEventSchema,
  createInjection,
  createDeliveryResult,
  createStigmergyEvent,
  canRetry,
  incrementRetry,
  isExpired,
  type InjectionType,
} from './contracts/index.js';

describe('P3 SPORE STORM - Property Tests', () => {
  // --- Property 7: Injection Logging Invariant ---
  describe('Property 7: Injection Logging Invariant', () => {
    it('every injection has a valid UUID', () => {
      const types: InjectionType[] = ['FILE', 'EVENT', 'CASCADE', 'STIGMERGY', 'WEBHOOK'];
      
      for (const type of types) {
        const injection = createInjection(type, 'target', { data: 'test' });
        expect(injection.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      }
    });

    it('every injection has a timestamp', () => {
      const before = Date.now();
      const injection = createInjection('FILE', '/path/to/file', { content: 'data' });
      const after = Date.now();
      
      expect(injection.timestamp).toBeGreaterThanOrEqual(before);
      expect(injection.timestamp).toBeLessThanOrEqual(after);
    });

    it('injection sourcePort is always 3 (P3)', () => {
      const injection = createInjection('EVENT', 'event-bus', {});
      expect(injection.metadata.sourcePort).toBe(3);
    });

    it('injection validates against schema', () => {
      const injection = createInjection('CASCADE', 'multi-target', { cascade: true }, {
        priority: 'high',
        correlationId: 'corr-123',
        ttl: 30000,
      });
      
      const result = InjectionPayloadSchema.safeParse(injection);
      expect(result.success).toBe(true);
    });

    it('stigmergy event logs injection correctly', () => {
      const injection = createInjection('STIGMERGY', 'blackboard', { event: 'test' });
      const event = createStigmergyEvent(injection);
      
      expect(event.sourcePort).toBe(3);
      expect(event.eventType).toBe('INJECTION');
      expect(event.payload).toEqual(injection);
      
      const result = StigmergyInjectionEventSchema.safeParse(event);
      expect(result.success).toBe(true);
    });

    it('stigmergy event includes delivery result when provided', () => {
      const injection = createInjection('WEBHOOK', 'https://example.com', {});
      const deliveryResult = createDeliveryResult(injection, true, { receivedBy: 'webhook-handler' });
      const event = createStigmergyEvent(injection, deliveryResult);
      
      expect(event.result).toBeDefined();
      expect(event.result?.success).toBe(true);
    });
  });

  // --- Delivery Result Validation ---
  describe('Delivery Result Validation', () => {
    it('successful delivery has deliveredAt timestamp', () => {
      const injection = createInjection('FILE', '/path', {});
      const result = createDeliveryResult(injection, true, { receivedBy: 'file-system' });
      
      expect(result.success).toBe(true);
      expect(result.deliveredAt).toBeDefined();
      expect(result.acknowledgment).toBeDefined();
      expect(result.acknowledgment?.receivedBy).toBe('file-system');
    });

    it('failed delivery has error message', () => {
      const injection = createInjection('WEBHOOK', 'https://fail.com', {});
      const result = createDeliveryResult(injection, false, { error: 'Connection refused', retryable: true });
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Connection refused');
      expect(result.retryable).toBe(true);
      expect(result.deliveredAt).toBeUndefined();
    });

    it('delivery result validates against schema', () => {
      const injection = createInjection('EVENT', 'bus', {});
      const result = createDeliveryResult(injection, true);
      
      const parsed = DeliveryResultSchema.safeParse(result);
      expect(parsed.success).toBe(true);
    });
  });

  // --- Retry Logic ---
  describe('Retry Logic', () => {
    it('new injection can be retried', () => {
      const injection = createInjection('WEBHOOK', 'target', {});
      expect(canRetry(injection)).toBe(true);
      expect(injection.metadata.retryCount).toBe(0);
      expect(injection.metadata.maxRetries).toBe(3);
    });

    it('incrementRetry increases retry count', () => {
      let injection = createInjection('WEBHOOK', 'target', {});
      expect(injection.metadata.retryCount).toBe(0);
      
      injection = incrementRetry(injection);
      expect(injection.metadata.retryCount).toBe(1);
      
      injection = incrementRetry(injection);
      expect(injection.metadata.retryCount).toBe(2);
    });

    it('cannot retry after max retries reached', () => {
      let injection = createInjection('WEBHOOK', 'target', {});
      
      injection = incrementRetry(injection);
      injection = incrementRetry(injection);
      injection = incrementRetry(injection);
      
      expect(injection.metadata.retryCount).toBe(3);
      expect(canRetry(injection)).toBe(false);
    });
  });

  // --- TTL / Expiration ---
  describe('TTL / Expiration', () => {
    it('new injection is not expired', () => {
      const injection = createInjection('FILE', 'target', {});
      expect(isExpired(injection)).toBe(false);
    });

    it('injection with past timestamp + TTL is expired', () => {
      const injection = createInjection('FILE', 'target', {}, { ttl: 1000 });
      // Manually set timestamp to past
      const expiredInjection = {
        ...injection,
        timestamp: Date.now() - 2000, // 2 seconds ago
      };
      
      expect(isExpired(expiredInjection)).toBe(true);
    });
  });

  // --- Cascade Config ---
  describe('Cascade Config', () => {
    it('cascade config validates against schema', () => {
      const config = {
        targets: ['target1', 'target2', 'target3'],
        strategy: 'parallel' as const,
        failureMode: 'best_effort' as const,
        timeout: 15000,
      };
      
      const result = CascadeConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('cascade config requires at least one target', () => {
      const config = {
        targets: [],
        strategy: 'sequential' as const,
        failureMode: 'fail_fast' as const,
      };
      
      const result = CascadeConfigSchema.safeParse(config);
      expect(result.success).toBe(false);
    });

    it('cascade result validates against schema', () => {
      const injection = createInjection('CASCADE', 'multi', {});
      const cascadeResult = {
        id: crypto.randomUUID(),
        config: {
          targets: ['t1', 't2'],
          strategy: 'fanout' as const,
          failureMode: 'all_or_nothing' as const,
          timeout: 30000,
        },
        results: [
          createDeliveryResult(injection, true),
          createDeliveryResult(injection, false, { error: 'timeout' }),
        ],
        successCount: 1,
        failureCount: 1,
        totalDuration: 500,
      };
      
      const result = CascadeResultSchema.safeParse(cascadeResult);
      expect(result.success).toBe(true);
    });
  });
});
