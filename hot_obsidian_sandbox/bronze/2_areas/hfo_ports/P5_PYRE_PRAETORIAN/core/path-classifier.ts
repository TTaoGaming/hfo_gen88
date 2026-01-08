/**
 * P5 PYRE PRAETORIAN - Path Classifier
 * 
 * @port 5
 * @commander PYRE_PRAETORIAN
 * @verb IMMUNIZE
 * @tier SILVER
 * @promoted 2026-01-07
 * @mutation-score 84.07%
 * @provenance: p4-p5-silver-sprint/design.md
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
 * 
 * Classifies file paths into medallions (BRONZE, SILVER, GOLD, ROOT)
 * and temperatures (HOT, COLD), then enforces policy decisions.
 */

import { z } from 'zod';
import { createHash } from 'crypto';

// --- MEDALLION AND TEMPERATURE ---

export const Medallion = z.enum(['BRONZE', 'SILVER', 'GOLD', 'ROOT']);
export type Medallion = z.infer<typeof Medallion>;

export const Temperature = z.enum(['HOT', 'COLD']);
export type Temperature = z.infer<typeof Temperature>;

export const PolicyDecision = z.enum(['ALLOWED', 'DENIED']);
export type PolicyDecision = z.infer<typeof PolicyDecision>;

// --- ROOT WHITELIST ---

export const ROOT_WHITELIST_FILES = [
  'AGENTS.md',
  'llms.txt',
  'obsidianblackboard.jsonl',
  'package.json',
  'package-lock.json',
  '.env',
  '.gitignore',
  'tsconfig.json',
  'vitest.config.ts',
] as const;

export const ROOT_WHITELIST_PATTERNS = [
  /^ttao-notes-.*\.md$/,
  /^vitest\..*\.config\.ts$/,
  /^stryker\..*\.config\.mjs$/,
] as const;

export const ROOT_WHITELIST_DIRS = [
  'hot_obsidian_sandbox',
  'cold_obsidian_sandbox',
  '.kiro',
  '.git',
  '.github',
  '.vscode',
  '.husky',
  '.venv',
  'node_modules',
  '.stryker-tmp',
  'audit',
  'reports',
] as const;


// --- PATH CLASSIFICATION ---

export interface PathClassification {
  medallion: Medallion;
  temperature: Temperature | null;
}

/**
 * Classify a file path into medallion and temperature
 * 
 * @param path - File path to classify
 * @returns Classification with medallion and temperature
 */
export function classifyPath(path: string): PathClassification {
  if (!path || typeof path !== 'string') {
    throw new TypeError('Path must be a non-empty string');
  }
  
  // Normalize path separators
  const normalized = path.replace(/\\/g, '/').replace(/^\/+/, '');
  
  // Hot sandbox
  if (normalized.startsWith('hot_obsidian_sandbox/bronze/') || 
      normalized === 'hot_obsidian_sandbox/bronze') {
    return { medallion: 'BRONZE', temperature: 'HOT' };
  }
  if (normalized.startsWith('hot_obsidian_sandbox/silver/') ||
      normalized === 'hot_obsidian_sandbox/silver') {
    return { medallion: 'SILVER', temperature: 'HOT' };
  }
  if (normalized.startsWith('hot_obsidian_sandbox/gold/') ||
      normalized === 'hot_obsidian_sandbox/gold') {
    return { medallion: 'GOLD', temperature: 'HOT' };
  }
  
  // Cold sandbox
  if (normalized.startsWith('cold_obsidian_sandbox/bronze/') ||
      normalized === 'cold_obsidian_sandbox/bronze') {
    return { medallion: 'BRONZE', temperature: 'COLD' };
  }
  if (normalized.startsWith('cold_obsidian_sandbox/silver/') ||
      normalized === 'cold_obsidian_sandbox/silver') {
    return { medallion: 'SILVER', temperature: 'COLD' };
  }
  if (normalized.startsWith('cold_obsidian_sandbox/gold/') ||
      normalized === 'cold_obsidian_sandbox/gold') {
    return { medallion: 'GOLD', temperature: 'COLD' };
  }
  
  // Everything else is ROOT
  return { medallion: 'ROOT', temperature: null };
}

/**
 * Check if a root file/directory is whitelisted
 * 
 * @param filename - The filename or directory name to check
 * @returns true if whitelisted, false otherwise
 */
export function isRootWhitelisted(filename: string): boolean {
  if (!filename || typeof filename !== 'string') {
    return false;
  }
  
  // Normalize and get the first path segment
  const normalized = filename.replace(/\\/g, '/').replace(/^\/+/, '');
  const firstSegment = normalized.split('/')[0];
  
  // Check directories
  if (ROOT_WHITELIST_DIRS.includes(firstSegment as any)) {
    return true;
  }
  
  // Check exact file matches
  if (ROOT_WHITELIST_FILES.includes(firstSegment as any)) {
    return true;
  }
  
  // Check patterns
  for (const pattern of ROOT_WHITELIST_PATTERNS) {
    if (pattern.test(firstSegment)) {
      return true;
    }
  }
  
  return false;
}


// --- POLICY EVALUATION ---

export interface PolicyResult {
  decision: PolicyDecision;
  reason: string;
}

/**
 * Evaluate policy for a write operation
 * 
 * - BRONZE: Always allowed (kinetic energy zone)
 * - SILVER/GOLD: Denied without WARLOCK_APPROVAL
 * - ROOT: Allowed only if whitelisted
 * 
 * @param path - File path to evaluate
 * @returns Policy decision with reason
 */
export function evaluatePolicy(path: string): PolicyResult {
  const { medallion } = classifyPath(path);
  
  // Bronze is always allowed (kinetic energy zone)
  if (medallion === 'BRONZE') {
    return { decision: 'ALLOWED', reason: 'Bronze tier allows writes' };
  }
  
  // Silver and Gold require approval
  if (medallion === 'SILVER') {
    return { decision: 'DENIED', reason: 'Silver tier requires WARLOCK_APPROVAL' };
  }
  if (medallion === 'GOLD') {
    return { decision: 'DENIED', reason: 'Gold tier requires WARLOCK_APPROVAL' };
  }
  
  // Root requires whitelist check
  if (medallion === 'ROOT') {
    if (isRootWhitelisted(path)) {
      return { decision: 'ALLOWED', reason: 'Root file is whitelisted' };
    }
    return { decision: 'DENIED', reason: 'Root pollution: file not whitelisted' };
  }
  
  // Fallback (should never reach)
  return { decision: 'DENIED', reason: 'Unknown path classification' };
}

// --- POLICY RECEIPT ---

export const PolicyReceiptSchema = z.object({
  type: z.literal('POLICY'),
  port: z.literal(5),
  timestamp: z.number(),
  path: z.string().min(1),
  medallion: Medallion,
  temperature: Temperature.nullable(),
  decision: PolicyDecision,
  reason: z.string(),
  receiptHash: z.string().regex(/^sha256:[a-f0-9]{64}$/),
});
export type PolicyReceipt = z.infer<typeof PolicyReceiptSchema>;

/**
 * Create a policy receipt for a path evaluation
 * 
 * @param path - File path that was evaluated
 * @returns PolicyReceipt with cryptographic hash
 */
export function createPolicyReceipt(path: string): PolicyReceipt {
  if (!path || path.trim().length === 0) {
    throw new TypeError('Path cannot be empty');
  }
  
  const { medallion, temperature } = classifyPath(path);
  const { decision, reason } = evaluatePolicy(path);
  
  const content = {
    type: 'POLICY' as const,
    port: 5 as const,
    timestamp: Date.now(),
    path: path.trim(),
    medallion,
    temperature,
    decision,
    reason,
  };
  
  // Compute SHA-256 hash of content
  const hash = createHash('sha256')
    .update(JSON.stringify(content))
    .digest('hex');
  
  return {
    ...content,
    receiptHash: `sha256:${hash}`,
  };
}

/**
 * Verify a policy receipt's integrity
 * 
 * @param receipt - The receipt to verify
 * @returns true if receipt is valid, false if tampered
 */
export function verifyPolicyReceipt(receipt: PolicyReceipt): boolean {
  const { receiptHash, ...content } = receipt;
  
  const computed = createHash('sha256')
    .update(JSON.stringify(content))
    .digest('hex');
  
  return `sha256:${computed}` === receiptHash;
}
