/**
 * Silver Baton Quine Validator
 * Validates SILVER_BATON_GEN89.md against correctness properties
 */
import { z } from 'zod';
import * as fs from 'fs';
import * as crypto from 'crypto';

// === ZOD SCHEMAS ===

export const BatonMetadataSchema = z.object({
  generation: z.number().int().positive(),
  predecessor: z.number().int().nonnegative(),
  status: z.enum(['BOOTSTRAP', 'ACTIVE', 'DEPRECATED']),
  checksum: z.string().regex(/^sha256:[a-f0-9]{64}$|^sha256:PLACEHOLDER.*$/),
  created: z.string(),
});
export type BatonMetadata = z.infer<typeof BatonMetadataSchema>;

export const PatternEntrySchema = z.object({
  name: z.string().min(1),
  description: z.string().min(10),
  whyItWorked: z.string().min(10),
  recommendation: z.string().min(10),
});
export type PatternEntry = z.infer<typeof PatternEntrySchema>;

export const AntipatternEntrySchema = z.object({
  name: z.string().min(1),
  whatHappened: z.string().min(10),
  whyItFailed: z.string().min(10),
  recommendation: z.string().min(10),
});
export type AntipatternEntry = z.infer<typeof AntipatternEntrySchema>;

// === PARSING UTILITIES ===

export function extractFrontmatter(content: string): Record<string, unknown> | null {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  
  const yaml = match[1];
  const result: Record<string, unknown> = {};
  
  for (const line of yaml.split(/\r?\n/)) {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      let value: unknown = line.slice(colonIdx + 1).trim();
      // Parse numbers
      if (/^\d+$/.test(value as string)) {
        value = parseInt(value as string, 10);
      }
      result[key] = value;
    }
  }
  return result;
}

export function extractSections(content: string): Map<number, { start: number; end: number; content: string }> {
  const sections = new Map<number, { start: number; end: number; content: string }>();
  const lines = content.split('\n');
  
  let currentSection: number | null = null;
  let sectionStart = 0;
  let sectionLines: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^## §(\d)/);
    if (match) {
      // Save previous section
      if (currentSection !== null) {
        sections.set(currentSection, {
          start: sectionStart,
          end: i - 1,
          content: sectionLines.join('\n')
        });
      }
      currentSection = parseInt(match[1], 10);
      sectionStart = i;
      sectionLines = [lines[i]];
    } else if (currentSection !== null) {
      sectionLines.push(lines[i]);
    }
  }
  
  // Save last section
  if (currentSection !== null) {
    sections.set(currentSection, {
      start: sectionStart,
      end: lines.length - 1,
      content: sectionLines.join('\n')
    });
  }
  
  return sections;
}

export function extractCodeBlocks(content: string, language?: string): string[] {
  const pattern = language 
    ? new RegExp('```' + language + '\\n([\\s\\S]*?)```', 'g')
    : /```\w*\n([\s\S]*?)```/g;
  
  const blocks: string[] = [];
  let match;
  while ((match = pattern.exec(content)) !== null) {
    blocks.push(match[1]);
  }
  return blocks;
}

export function countLines(content: string): number {
  return content.split('\n').length;
}

// === VALIDATORS ===

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateFrontmatter(content: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const frontmatter = extractFrontmatter(content);
  if (!frontmatter) {
    errors.push('Missing YAML frontmatter');
    return { valid: false, errors, warnings };
  }
  
  const result = BatonMetadataSchema.safeParse(frontmatter);
  if (!result.success) {
    for (const issue of result.error.issues) {
      errors.push(`Frontmatter: ${issue.path.join('.')}: ${issue.message}`);
    }
  }
  
  if (frontmatter.checksum?.toString().includes('PLACEHOLDER')) {
    warnings.push('Checksum is placeholder - needs computation');
  }
  
  return { valid: errors.length === 0, errors, warnings };
}

export function validateSections(content: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const sections = extractSections(content);
  
  // Check all required sections exist (0-7)
  for (let i = 0; i <= 7; i++) {
    if (!sections.has(i)) {
      errors.push(`Missing section §${i}`);
    }
  }
  
  // Check sequential ordering
  const sectionNums = Array.from(sections.keys()).sort((a, b) => a - b);
  let lastStart = -1;
  for (const num of sectionNums) {
    const section = sections.get(num)!;
    if (section.start < lastStart) {
      errors.push(`Section §${num} appears out of order`);
    }
    lastStart = section.start;
  }
  
  // Check §0 is within first 50 lines
  const section0 = sections.get(0);
  if (section0 && section0.start > 50) {
    errors.push(`§0 COLD START must be within first 50 lines (found at line ${section0.start})`);
  }
  
  return { valid: errors.length === 0, errors, warnings };
}

export function validateLineCounts(content: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const totalLines = countLines(content);
  if (totalLines > 500) {
    errors.push(`Total lines (${totalLines}) exceeds 500 limit`);
  }
  
  const sections = extractSections(content);
  for (const [num, section] of sections) {
    const sectionLines = countLines(section.content);
    if (sectionLines > 60) {
      errors.push(`Section §${num} has ${sectionLines} lines (max 60)`);
    }
  }
  
  return { valid: errors.length === 0, errors, warnings };
}

export function computeChecksum(content: string): string {
  const sections = extractSections(content);
  let checksumContent = '';
  
  for (let i = 0; i <= 7; i++) {
    const section = sections.get(i);
    if (section) {
      checksumContent += section.content + '\n';
    }
  }
  
  const hash = crypto.createHash('sha256').update(checksumContent).digest('hex');
  return `sha256:${hash}`;
}

export function validateChecksum(content: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const frontmatter = extractFrontmatter(content);
  if (!frontmatter?.checksum) {
    errors.push('No checksum in frontmatter');
    return { valid: false, errors, warnings };
  }
  
  const storedChecksum = frontmatter.checksum as string;
  if (storedChecksum.includes('PLACEHOLDER')) {
    warnings.push('Checksum is placeholder');
    return { valid: true, errors, warnings };
  }
  
  const computed = computeChecksum(content);
  if (computed !== storedChecksum) {
    errors.push(`Checksum mismatch: stored=${storedChecksum}, computed=${computed}`);
  }
  
  return { valid: errors.length === 0, errors, warnings };
}

export function validateAll(content: string): ValidationResult {
  const results = [
    validateFrontmatter(content),
    validateSections(content),
    validateLineCounts(content),
    validateChecksum(content),
  ];
  
  return {
    valid: results.every(r => r.valid),
    errors: results.flatMap(r => r.errors),
    warnings: results.flatMap(r => r.warnings),
  };
}

// === CLI ===

const isMainModule = import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('baton-validator.ts');

if (isMainModule) {
  const filePath = process.argv[2] || 'hot_obsidian_sandbox/bronze/SILVER_BATON_GEN89.md';
  
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const result = validateAll(content);
  
  console.log('\n🔍 Silver Baton Validation Results\n');
  
  if (result.errors.length > 0) {
    console.log('❌ ERRORS:');
    for (const err of result.errors) {
      console.log(`   - ${err}`);
    }
  }
  
  if (result.warnings.length > 0) {
    console.log('⚠️  WARNINGS:');
    for (const warn of result.warnings) {
      console.log(`   - ${warn}`);
    }
  }
  
  if (result.valid) {
    console.log('✅ Baton is valid');
  } else {
    console.log('\n❌ Baton validation FAILED');
    process.exit(1);
  }
  
  // Print computed checksum for reference
  console.log(`\n📝 Computed checksum: ${computeChecksum(content)}`);
}
