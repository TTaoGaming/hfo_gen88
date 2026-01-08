import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { z } from 'zod';

const MANIFEST_PATH = 'c:/Dev/active/hfo_gen88/hot_obsidian_sandbox/bronze/P4_RED_REGNANT/MANIFEST.yaml';

const ManifestSchema = z.object({
  identity: z.object({
    port: z.number(),
    commander: z.string(),
    archetype: z.string(),
    verb: z.string(),
    jadc2_verb: z.string(),
    hive_phase: z.string(),
    trigram: z.string(),
    element: z.string(),
    mantra: z.string(),
  }),
  galois_lattice: z.object({
    coordinate: z.array(z.number()).length(2),
    semantic_role: z.string(),
    purpose: z.string(),
    tension: z.object({
      diagonal_quine: z.string(),
      anti_diagonal_synergy: z.string(),
    }),
  }),
  dna: z.object({
    hfo_generation: z.number(),
    provenance: z.string(),
    integrity_chain: z.string(),
    negative_trust_protocol: z.string(),
  }),
  enforcement: z.object({
    gate: z.string(),
    thresholds: z.object({
      mutation_score: z.array(z.number()).length(2),
      root_pollution: z.string(),
      amnesia_detection: z.array(z.string()),
      theater_detection: z.string(),
    }),
  }),
  scenarios: z.array(z.object({
    name: z.string(),
    gherkin: z.string(),
  })),
});

describe('Red Regnant Manifest Validation', () => {
  it('should exist and be a valid YAML file', () => {
    expect(fs.existsSync(MANIFEST_PATH)).toBe(true);
    const content = fs.readFileSync(MANIFEST_PATH, 'utf-8');
    const data = yaml.load(content);
    expect(data).toBeDefined();
  });

  it('should satisfy the HFO Manifest Schema', () => {
    const content = fs.readFileSync(MANIFEST_PATH, 'utf-8');
    const data = yaml.load(content);
    const result = ManifestSchema.safeParse(data);
    if (!result.success) {
      console.error('Manifest validation failed:', result.error.format());
    }
    expect(result.success).toBe(true);
  });

  it('should have the correct Galois Lattice coordinate (4,4)', () => {
    const content = fs.readFileSync(MANIFEST_PATH, 'utf-8');
    const data: any = yaml.load(content);
    expect(data.galois_lattice.coordinate).toEqual([4, 4]);
  });

  it('should align with the Red Queen archetype', () => {
    const content = fs.readFileSync(MANIFEST_PATH, 'utf-8');
    const data: any = yaml.load(content);
    expect(data.identity.commander).toBe('Red Regnant');
    expect(data.identity.archetype).toContain('Red Queen');
  });
});
