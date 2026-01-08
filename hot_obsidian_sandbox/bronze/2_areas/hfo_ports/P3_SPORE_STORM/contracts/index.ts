/**
 * P3 SPORE STORM - Zod Contracts
 * 
 * @port 3
 * @commander SPORE_STORM
 * @verb INJECT / DELIVER
 * @provenance: LEGENDARY_COMMANDERS_V9.md
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5
 */

import { z } from 'zod';

// --- INJECTION TYPE ---

export const InjectionTypeSchema = z.enum([
  'FILE',       // File system injection
  'EVENT',      // Event bus injection
  'CASCADE',    // Multi-target cascade
  'STIGMERGY',  // Blackboard injection
  'WEBHOOK',    // External webhook
]);

export type InjectionType = z.infer<typeof InjectionTypeSchema>;

// --- INJECTION PAYLOAD ---

export const InjectionPayloadSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.number(),
  type: InjectionTypeSchema,
  target: z.string(),
  data: z.unknown(),
  priority: z.enum(['low', 'normal', 'high', 'critical']).default('normal'),
  metadata: z.object({
    sourcePort: z.number().int().min(0).max(7),
    correlationId: z.string().optional(),
    ttl: z.number().min(0).default(60000),
    retryCount: z.number().int().min(0).default(0),
    maxRetries: z.number().int().min(0).default(3),
  }),
});

export type InjectionPayload = z.infer<typeof InjectionPayloadSchema>;

// --- DELIVERY RESULT ---

export const DeliveryResultSchema = z.object({
  success: z.boolean(),
  payload: InjectionPayloadSchema,
  deliveredAt: z.number().optional(),
  error: z.string().optional(),
  retryable: z.boolean().default(false),
  acknowledgment: z.object({
    receivedBy: z.string(),
    timestamp: z.number(),
  }).optional(),
});

export type DeliveryResult = z.infer<typeof DeliveryResultSchema>;

// --- CASCADE CONFIG ---

export const CascadeConfigSchema = z.object({
  targets: z.array(z.string()).min(1),
  strategy: z.enum(['parallel', 'sequential', 'fanout']),
  failureMode: z.enum(['fail_fast', 'best_effort', 'all_or_nothing']),
  timeout: z.number().min(0).default(30000),
});

export type CascadeConfig = z.infer<typeof CascadeConfigSchema>;

// --- CASCADE RESULT ---

export const CascadeResultSchema = z.object({
  id: z.string().uuid(),
  config: CascadeConfigSchema,
  results: z.array(DeliveryResultSchema),
  successCount: z.number().int().min(0),
  failureCount: z.number().int().min(0),
  totalDuration: z.number().min(0),
});

export type CascadeResult = z.infer<typeof CascadeResultSchema>;

// --- STIGMERGY EVENT (for logging) ---

export const StigmergyInjectionEventSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.number(),
  sourcePort: z.literal(3), // P3 only
  eventType: z.literal('INJECTION'),
  payload: InjectionPayloadSchema,
  result: DeliveryResultSchema.optional(),
});

export type StigmergyInjectionEvent = z.infer<typeof StigmergyInjectionEventSchema>;

// --- INJECTION FUNCTIONS ---

/**
 * Creates an injection payload
 */
export function createInjection(
  type: InjectionType,
  target: string,
  data: unknown,
  options?: {
    priority?: 'low' | 'normal' | 'high' | 'critical';
    correlationId?: string;
    ttl?: number;
  }
): InjectionPayload {
  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    type,
    target,
    data,
    priority: options?.priority ?? 'normal',
    metadata: {
      sourcePort: 3,
      correlationId: options?.correlationId,
      ttl: options?.ttl ?? 60000,
      retryCount: 0,
      maxRetries: 3,
    },
  };
}

/**
 * Creates a delivery result
 */
export function createDeliveryResult(
  payload: InjectionPayload,
  success: boolean,
  options?: {
    error?: string;
    retryable?: boolean;
    receivedBy?: string;
  }
): DeliveryResult {
  return {
    success,
    payload,
    deliveredAt: success ? Date.now() : undefined,
    error: options?.error,
    retryable: options?.retryable ?? false,
    acknowledgment: options?.receivedBy ? {
      receivedBy: options.receivedBy,
      timestamp: Date.now(),
    } : undefined,
  };
}

/**
 * Checks if a payload can be retried
 */
export function canRetry(payload: InjectionPayload): boolean {
  return payload.metadata.retryCount < payload.metadata.maxRetries;
}

/**
 * Increments retry count on a payload
 */
export function incrementRetry(payload: InjectionPayload): InjectionPayload {
  return {
    ...payload,
    metadata: {
      ...payload.metadata,
      retryCount: payload.metadata.retryCount + 1,
    },
  };
}

/**
 * Checks if a payload has expired based on TTL
 */
export function isExpired(payload: InjectionPayload): boolean {
  return Date.now() > payload.timestamp + payload.metadata.ttl;
}

/**
 * Creates a stigmergy event for logging an injection
 */
export function createStigmergyEvent(
  payload: InjectionPayload,
  result?: DeliveryResult
): StigmergyInjectionEvent {
  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    sourcePort: 3,
    eventType: 'INJECTION',
    payload,
    result,
  };
}
