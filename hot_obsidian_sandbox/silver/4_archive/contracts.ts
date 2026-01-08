/**
 * P5 PYRE PRAETORIAN - Silver Contracts
 * 
 * @port 5
 * @commander PYRE_PRAETORIAN
 * @verb DEFEND / IMMUNIZE
 * @tier SILVER
 * @promoted 2026-01-08
 */

import { z } from 'zod';

export const MedallionTypeSchema = z.enum(['gold', 'silver', 'bronze']);
export type MedallionType = z.infer<typeof MedallionTypeSchema>;

export const MedallionViolationSchema = z.object({
  file: z.string(),
  expected: z.union([MedallionTypeSchema, z.literal('root')]),
  actual: z.string(),
  message: z.string(),
});

export type MedallionViolation = z.infer<typeof MedallionViolationSchema>;

export const IMMUNIZATION_REPORT_SCHEMA = z.object({
  ts: z.string(),
  artifact: z.string(),
  violations: z.array(MedallionViolationSchema),
  pure: z.boolean(),
});

export type ImmunizationReport = z.infer<typeof IMMUNIZATION_REPORT_SCHEMA>;
