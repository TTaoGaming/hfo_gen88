---
generation: 89
predecessor: 88
status: BOOTSTRAP
checksum: sha256:a600fd3078c88d509c50220717f4067f22583e33aa563766ecbe18082c04fff9
created: 2026-01-06
---

# SILVER BATON: Gen 88 → Gen 89

> **Purpose**: Single-file handoff artifact for HFO system resurrection.
> **Read this first**: §0 COLD START (below)

---

## §0 COLD START

> **TL;DR**: You are Gen 89. Gen 88 collapsed. This baton contains everything you need to rebuild.

### What Is This?
This is the **Silver Baton Quine**—a self-describing handoff document from Gen 88 to Gen 89 of the HFO (Hive Fleet Obsidian) system. It contains patterns that worked, antipatterns to avoid, contracts to implement, and a bootstrap checklist.

### What Do I Do First?
1. Read §0-§2 (this section, contracts, architecture)
2. Run the enforcement script from §5
3. Follow the checklist in §7

### Health Verification (3 Commands)
```bash
# 1. Check root is clean
ls -la | grep -v "sandbox\|AGENTS\|package\|node_modules\|.git"

# 2. Run tests
npm test

# 3. Check blackboard exists
cat obsidianblackboard.jsonl | tail -5
```

### The Three Laws of Gen 89
1. **If it's not tested, it doesn't exist.**
2. **If it's not in pre-commit, it won't be enforced.**
3. **If the AI can't explain it in 3 sentences, it's too complex.**

---

## §1 CONTRACTS

> **TL;DR**: All data crossing boundaries must be Zod-validated. Copy-paste these schemas.

```typescript
import { z } from 'zod';

// Core schemas - copy these directly
export const LandmarkSchema = z.object({
  x: z.number(), y: z.number(), z: z.number(),
  visibility: z.number().min(0).max(1).optional(),
});

export const SensorFrameSchema = z.object({
  frameId: z.number().int().nonnegative(),
  timestamp: z.number(),
  landmarks: z.array(LandmarkSchema).length(21),
  gesture: z.string(),
  handedness: z.enum(['Left', 'Right']),
  confidence: z.number().min(0).max(1),
});

export const SmoothedFrameSchema = z.object({
  frameId: z.number().int().nonnegative(),
  timestamp: z.number(),
  position: z.object({ x: z.number(), y: z.number() }),
  velocity: z.object({ vx: z.number(), vy: z.number() }),
  gesture: z.string(),
  confidence: z.number().min(0).max(1),
});

export const FSMActionSchema = z.object({
  type: z.enum(['MOVE', 'CLICK', 'DRAG_START', 'DRAG_END', 'SCROLL', 'IDLE']),
  payload: z.record(z.unknown()).optional(),
});

export const PointerEventOutSchema = z.object({
  type: z.enum(['pointerdown', 'pointerup', 'pointermove', 'pointercancel']),
  clientX: z.number(), clientY: z.number(),
  pressure: z.number().min(0).max(1),
  pointerId: z.number().int(),
  pointerType: z.literal('hand'),
});

// Port interface - all ports implement this
export interface Port<TInput, TOutput> {
  readonly name: string;
  readonly inputSchema: z.ZodSchema<TInput>;
  readonly outputSchema: z.ZodSchema<TOutput>;
  process(input: TInput): TOutput | Promise<TOutput>;
}
```

---

## §2 ARCHITECTURE

> **TL;DR**: 8 ports with single responsibilities. Bronze → Silver → Gold promotion.

### The 8 Ports

| Port | Verb | Responsibility | Key Tech |
|:-----|:-----|:---------------|:---------|
| 0 | OBSERVE | Sense the world | MediaPipe, Tavily |
| 1 | BRIDGE | Connect systems | MCP, protocol adapters |
| 2 | SHAPE | Transform data | Zod, One Euro Filter |
| 3 | INJECT | Deliver payloads | File writes, side effects |
| 4 | DISRUPT | Test & break | Stryker, Semgrep |
| 5 | IMMUNIZE | Validate & sanitize | Zod guards |
| 6 | ASSIMILATE | Store & remember | DuckDB, JSONL |
| 7 | NAVIGATE | Decide & orchestrate | State machines |

### Medallion Architecture

```
BRONZE: Experiments, slop, kinetic energy
        → No rules except "don't break root"
        
SILVER: Verified implementations  
        → Must have tests, >80% mutation score
        
GOLD:   Canonical truth
        → Human-approved, immutable
```

### Folder Structure (Flat, Max 2 Levels)

```
sandbox/
├── bronze/     # Experiments go here
├── silver/     # Tested code goes here
└── gold/       # Approved artifacts go here
```

---

## §3 PATTERNS

> **TL;DR**: These patterns worked in Gen 88. Reuse them.

### Pattern 1: Contract Law (Zod Validation)
**Description**: All data crossing boundaries validated by Zod schemas.
**Why it worked**: Hard crashes on invalid data > silent failures. Catches AI hallucinations at runtime.
**Recommendation**: Define contracts FIRST, implement SECOND. See §1 for schemas.

### Pattern 2: Medallion Architecture
**Description**: Three-tier promotion system (Bronze → Silver → Gold).
**Why it worked**: Clear separation of exploration vs exploitation code.
**Recommendation**: Keep it simple. One folder per tier. No nesting.

### Pattern 3: Stigmergy (Blackboard Pattern)
**Description**: All progress logged to append-only JSONL file.
**Why it worked**: Async coordination without tight coupling. Audit trail.
**Recommendation**: Use `obsidianblackboard.jsonl`. Append-only. Never delete.

### Pattern 4: One Euro Filter
**Description**: Velocity-adaptive low-pass filter for gesture input (CHI 2012).
**Why it worked**: Real algorithm, real paper, battle-tested implementation.
**Recommendation**: Port directly from Gen 88. Don't reinvent.

### Pattern 5: Single Enforcement Script
**Description**: One script that runs on pre-commit, checks everything.
**Why it worked**: If it's not in pre-commit, it won't be enforced.
**Recommendation**: See §5 for the script. Hook it to Husky.

---

## §4 ANTIPATTERNS

> **TL;DR**: These patterns failed in Gen 88. Avoid them.

### Antipattern 1: Nested Folder Hell
**What happened**: `bronze/contracts/contracts/pointer-contracts.ts`
**Why it failed**: Import paths broke constantly. AI created duplicate structures.
**Recommendation**: FLAT structure. Max 2 levels deep.

### Antipattern 2: Soft Enforcement
**What happened**: Rules in AGENTS.md that AI was supposed to follow.
**Why it failed**: AI ignores rules when context gets long.
**Recommendation**: If it's not in pre-commit or CI, it doesn't exist.

### Antipattern 3: Mythology Overload
**What happened**: "Legendary Commanders", "Psychic Scream", "Blood Book of Grudges"
**Why it failed**: AI hallucinated connections. Humans couldn't remember mappings.
**Recommendation**: Use BORING names. `sensor.ts`, `filter.ts`, `validator.ts`.

### Antipattern 4: Context Bloat
**What happened**: 1000+ line markdown files with "everything AI needs".
**Why it failed**: AI truncates long context. Important details get lost.
**Recommendation**: Small, focused documents. Max 200 lines each.

### Antipattern 5: Multiple Enforcement Scripts
**What happened**: `screamer.ts`, `pyre_dance.ts`, `psychic_scream.ts`...
**Why it failed**: None of them actually ran. Too many to maintain.
**Recommendation**: ONE script. Pre-commit. That's it.

---

## §5 ENFORCEMENT

> **TL;DR**: One script to rule them all. Copy this, hook to pre-commit.

```typescript
// enforce.ts - The only enforcement script you need
import * as fs from 'fs';

const ALLOWED_ROOT = ['sandbox', 'AGENTS.md', 'package.json', 'package-lock.json',
  'node_modules', '.git', '.gitignore', '.husky', '.vscode', '.env',
  'obsidianblackboard.jsonl', 'vitest.config.ts', 'tsconfig.json', 'README.md'];

function scream(msg: string): never {
  console.error(`❌ VIOLATION: ${msg}`);
  fs.appendFileSync('obsidianblackboard.jsonl', JSON.stringify({
    ts: new Date().toISOString(), type: 'VIOLATION', msg }) + '\n');
  process.exit(1);
}

function checkRoot(): void {
  for (const e of fs.readdirSync('.')) {
    if (!ALLOWED_ROOT.includes(e) && !e.startsWith('.')) scream(`Root pollution: ${e}`);
  }
}

function checkTests(): void {
  const dir = 'sandbox/silver';
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir, { recursive: true }) as string[]) {
    if (f.endsWith('.ts') && !f.endsWith('.test.ts') && !fs.existsSync(f.replace('.ts', '.test.ts')))
      scream(`Missing test: ${f}`);
  }
}

checkRoot(); checkTests(); console.log('✅ All checks passed');
```

**Pre-commit**: `.husky/pre-commit` → `npx tsx enforce.ts`

---

## §6 PAIN REGISTRY

> **TL;DR**: Document failures here. Gen 89 starts fresh.

### Gen 89 Pain Registry (Empty Template)

| Date | Pain | Vector | Solution | Status |
|:-----|:-----|:-------|:---------|:-------|
| | | | | |

### Reference: Gen 88 Top Failures

| Pain | Vector | Solution |
|:-----|:-------|:---------|
| Spaghetti Death Spiral | Soft Enforcement | Hexagonal Architecture |
| Automation Theater | Verification Gap | Runtime pulse checks |
| GEN84.4 Destruction | Trust without Verification | Hard-gated enforcement |
| Context Bloat | Large documents | Max 200 lines per file |
| Hallucination Accumulation | No runtime validation | Zod at all boundaries |

---

## §7 BOOTSTRAP CHECKLIST

> **TL;DR**: Follow this checklist to bootstrap Gen 89.

### Phase 0: Clean Slate
- [ ] Create fresh `sandbox/` with `bronze/`, `silver/`, `gold/`
- [ ] Create single `AGENTS.md` (max 100 lines)
- [ ] Create `obsidianblackboard.jsonl` (empty)
- [ ] Set up `package.json` with Zod, Vitest, TypeScript

### Phase 1: Contracts First
- [ ] Copy Zod schemas from §1 to `sandbox/bronze/contracts.ts`
- [ ] Write failing tests against schemas
- [ ] NO implementation until contracts are stable

### Phase 2: Single Enforcement
- [ ] Copy `enforce.ts` from §5 to root
- [ ] Set up Husky pre-commit hook
- [ ] Verify enforcement runs on commit

### Phase 3: Minimal Implementation
- [ ] One file per concern (max 200 lines)
- [ ] Every export has a test
- [ ] Promote to silver only when tests pass

---

## §8 APPENDIX

> **TL;DR**: Deep references for those who need them.

### Technology Stack

| Tech | Purpose | Status |
|:-----|:--------|:-------|
| Zod | Schema validation | ✅ Use this |
| Vitest | Unit testing | ✅ Use this |
| Stryker | Mutation testing | ⚠️ Weekly, not per-commit |
| TypeScript | Type safety | ✅ Use this |
| Husky | Git hooks | ✅ Use this |

### Gen 88 Artifacts (Read-Only Reference)

- `GEN88_TO_GEN89_HANDOFF.md` - Full failure analysis
- `GEN88_HFO_ARCHITECTURE_HANDOFF.md` - Architecture deep dive
- `pointer-contracts.ts` - Original Zod schemas
- `one-euro-adapter.ts` - Working filter implementation

### Checksum Regeneration

```bash
# To regenerate checksum after edits:
# 1. Extract content from §0 through §7 (exclude §8)
# 2. Compute SHA256
# 3. Update frontmatter checksum field
sha256sum <(sed -n '/^## §0/,/^## §8/p' SILVER_BATON_GEN89.md | head -n -1)
```

---

*"The Phoenix rises not by preserving the ashes, but by remembering the fire."*
