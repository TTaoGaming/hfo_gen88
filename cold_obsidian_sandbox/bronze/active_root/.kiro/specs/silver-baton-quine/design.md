# Design Document: Silver Baton Quine

## Overview

The Silver Baton Quine is a single markdown file (~400-500 lines) that serves as the complete handoff artifact from Gen 88 to Gen 89. It follows a layered structure optimized for AI agent consumption, with critical information front-loaded and machine-parseable metadata in YAML frontmatter.

The design prioritizes:
1. **Self-containment**: No external dependencies
2. **Truncation resilience**: Critical info at top
3. **Machine parseability**: Structured sections with clear delimiters
4. **Copy-paste readiness**: All code blocks are syntactically valid

## Architecture

### Document Structure

```
┌─────────────────────────────────────────┐
│ YAML Frontmatter (5-10 lines)           │
│ - generation, predecessor, status       │
│ - checksum, created date                │
├─────────────────────────────────────────┤
│ §0 COLD START (40-50 lines)             │
│ - Purpose statement                     │
│ - First 3 commands                      │
│ - Health verification                   │
├─────────────────────────────────────────┤
│ §1 CONTRACTS (60 lines)                 │
│ - Zod schemas in TypeScript blocks      │
├─────────────────────────────────────────┤
│ §2 ARCHITECTURE (40 lines)              │
│ - 8-port table                          │
│ - Medallion flow                        │
├─────────────────────────────────────────┤
│ §3 PATTERNS (60 lines)                  │
│ - 5+ successful patterns                │
├─────────────────────────────────────────┤
│ §4 ANTIPATTERNS (60 lines)              │
│ - 5+ failed patterns                    │
├─────────────────────────────────────────┤
│ §5 ENFORCEMENT (60 lines)               │
│ - Complete enforce.ts script            │
├─────────────────────────────────────────┤
│ §6 PAIN REGISTRY (30 lines)             │
│ - Empty template for Gen 89             │
├─────────────────────────────────────────┤
│ §7 BOOTSTRAP CHECKLIST (30 lines)       │
│ - Phased task list                      │
├─────────────────────────────────────────┤
│ §8 APPENDIX (optional, 50 lines)        │
│ - Deep references, links                │
└─────────────────────────────────────────┘
```

### Section Numbering Convention

Each section uses the § symbol followed by a number (0-8) for unambiguous referencing:
- `§0` through `§7` are core sections (included in checksum)
- `§8` is the appendix (excluded from checksum)

This enables precise cross-references like "see §3 for patterns" that AI agents can reliably locate.

## Components and Interfaces

### Component 1: YAML Frontmatter Parser

The frontmatter block uses standard YAML between `---` delimiters:

```yaml
---
generation: 89
predecessor: 88
status: BOOTSTRAP
checksum: sha256:abc123...
created: 2026-01-06
---
```

**Fields:**
- `generation`: Integer, the target generation (89)
- `predecessor`: Integer, the source generation (88)
- `status`: Enum ["BOOTSTRAP", "ACTIVE", "DEPRECATED"]
- `checksum`: String, format `sha256:<64-char-hex>`
- `created`: ISO date string

### Component 2: Section Delimiter Pattern

Each section follows this pattern:

```markdown
## §N SECTION_NAME

> **TL;DR**: One-sentence summary of this section.

[Section content - max 60 lines]
```

The `> **TL;DR**:` callout provides a scannable summary for AI agents.

### Component 3: Code Block Convention

All code blocks use triple backticks with language identifier:

```typescript
// Fenced code blocks are copy-paste ready
export const ExampleSchema = z.object({
  field: z.string(),
});
```

Code blocks must:
- Be syntactically valid in their declared language
- Include necessary imports (or note them in comments)
- Be self-contained (no references to external files)

## Data Models

### Baton Metadata Schema

```typescript
import { z } from 'zod';

export const BatonMetadataSchema = z.object({
  generation: z.number().int().positive(),
  predecessor: z.number().int().nonnegative(),
  status: z.enum(['BOOTSTRAP', 'ACTIVE', 'DEPRECATED']),
  checksum: z.string().regex(/^sha256:[a-f0-9]{64}$/),
  created: z.string().datetime(),
});

export type BatonMetadata = z.infer<typeof BatonMetadataSchema>;
```

### Pattern Entry Schema

```typescript
export const PatternEntrySchema = z.object({
  name: z.string().min(1),
  description: z.string().min(10),
  whyItWorked: z.string().min(10),
  recommendation: z.string().min(10),
  codeExample: z.string().optional(),
});

export type PatternEntry = z.infer<typeof PatternEntrySchema>;
```

### Antipattern Entry Schema

```typescript
export const AntipatternEntrySchema = z.object({
  name: z.string().min(1),
  whatHappened: z.string().min(10),
  whyItFailed: z.string().min(10),
  recommendation: z.string().min(10),
});

export type AntipatternEntry = z.infer<typeof AntipatternEntrySchema>;
```

### Checklist Item Schema

```typescript
export const ChecklistItemSchema = z.object({
  phase: z.number().int().min(0).max(3),
  task: z.string().min(5),
  completed: z.boolean().default(false),
});

export type ChecklistItem = z.infer<typeof ChecklistItemSchema>;
```



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: YAML Frontmatter Structure

*For any* valid Silver Baton, the YAML frontmatter SHALL contain all required fields (generation, predecessor, status, checksum, created) with valid types.

**Validates: Requirements 1.1**

### Property 2: Section Markers Present

*For any* valid Silver Baton, section markers §0 through §7 SHALL all be present in the document.

**Validates: Requirements 1.3**

### Property 3: Self-Containment (No External References)

*For any* valid Silver Baton, the document SHALL NOT contain external file references (import statements to relative paths, `#[[file:` syntax, or similar).

**Validates: Requirements 1.4, 3.4**

### Property 4: Cold Start Position

*For any* valid Silver Baton, the §0 section marker SHALL appear within the first 50 lines of the document.

**Validates: Requirements 2.1**

### Property 5: Sequential Section Ordering

*For any* valid Silver Baton, section markers SHALL appear in sequential order (§0 before §1, §1 before §2, etc.).

**Validates: Requirements 2.4**

### Property 6: TypeScript Code Block Validity (Round-Trip)

*For any* TypeScript code block in the Silver Baton, extracting and parsing it through a TypeScript parser SHALL NOT produce syntax errors.

**Validates: Requirements 3.2**

### Property 7: Port Table Completeness

*For any* valid Silver Baton, the architecture section SHALL contain a table with exactly 8 rows mapping ports 0-7 to their verbs.

**Validates: Requirements 4.1**

### Property 8: Functional Naming (No Mythology)

*For any* valid Silver Baton in sections §0-§7, the document SHALL contain functional verb names (OBSERVE, BRIDGE, SHAPE, INJECT, DISRUPT, IMMUNIZE, STORE, NAVIGATE) and SHALL NOT contain mythological terms (Lidless Legion, Spider Sovereign, etc.) or I Ching trigrams (☷, ☶, ☵, etc.).

**Validates: Requirements 4.2, 4.4**

### Property 9: Pattern Entry Completeness

*For any* pattern entry in §3, the entry SHALL contain all four required components: name, description, why it worked, and recommendation. The section SHALL contain at least 5 such entries.

**Validates: Requirements 5.1, 5.2**

### Property 10: Antipattern Entry Completeness

*For any* antipattern entry in §4, the entry SHALL contain all four required components: name, what happened, why it failed, and recommendation. The section SHALL contain at least 5 such entries.

**Validates: Requirements 6.1, 6.2**

### Property 11: Enforcement Script Presence

*For any* valid Silver Baton, section §5 SHALL contain at least one fenced TypeScript code block with enforcement logic (containing patterns like `process.exit`, `fs.readdirSync`, or violation logging).

**Validates: Requirements 7.1**

### Property 12: Checklist Structure

*For any* valid Silver Baton, section §7 SHALL contain markdown checkbox items (`- [ ]` or `- [x]`) with no more than 15 total items.

**Validates: Requirements 8.1, 8.3, 8.4**

### Property 13: Total Line Count Constraint

*For any* valid Silver Baton, the total line count SHALL NOT exceed 500 lines.

**Validates: Requirements 9.1**

### Property 14: Section Line Count Constraint

*For any* section in a valid Silver Baton, the section's line count SHALL NOT exceed 60 lines.

**Validates: Requirements 9.2**

### Property 15: Checksum Round-Trip

*For any* valid Silver Baton, computing the SHA256 hash of content from §0 through §7 SHALL match the checksum value stored in the YAML frontmatter.

**Validates: Requirements 10.2**

## Error Handling

### Invalid YAML Frontmatter
- If frontmatter is missing or malformed, the baton parser SHALL reject the document with error "INVALID_FRONTMATTER"
- If required fields are missing, the parser SHALL list missing fields in the error message

### Section Parsing Errors
- If a section marker is missing, the parser SHALL report "MISSING_SECTION: §N"
- If sections are out of order, the parser SHALL report "SECTION_ORDER_VIOLATION: §N before §M"

### Checksum Mismatch
- If computed checksum doesn't match stored checksum, the validator SHALL report "CHECKSUM_MISMATCH" with both values
- The validator SHALL NOT automatically reject mismatched documents (may be intentional during editing)

### Line Count Violations
- If total lines exceed 500, the validator SHALL report "LINE_COUNT_EXCEEDED: N/500"
- If any section exceeds 60 lines, the validator SHALL report "SECTION_TOO_LONG: §N has M lines"

## Testing Strategy

### Unit Tests
- Test YAML frontmatter parsing with valid and invalid inputs
- Test section marker detection regex
- Test line counting logic
- Test checksum computation

### Property-Based Tests
Property-based testing will use `fast-check` to generate random valid and invalid batons:

1. **Frontmatter Property Test**: Generate random metadata, serialize to YAML, parse back, verify round-trip
2. **Section Order Property Test**: Generate random section orderings, verify sequential detection
3. **Line Count Property Test**: Generate documents of various lengths, verify constraint checking
4. **Checksum Property Test**: Generate content, compute checksum, embed in frontmatter, verify round-trip

### Integration Tests
- Parse the actual SILVER_BATON_GEN89.md file
- Verify all properties pass
- Verify all example criteria (specific schema names, antipattern names, etc.)

### Test Configuration
- Property tests: minimum 100 iterations per property
- Use `fast-check` for TypeScript property-based testing
- Tag format: **Feature: silver-baton-quine, Property N: [property description]**
