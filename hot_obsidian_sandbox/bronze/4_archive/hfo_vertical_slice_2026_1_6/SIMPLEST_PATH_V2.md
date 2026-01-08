# Simplest Path to HFO Online (V2)

**Principle**: What's the EASIEST thing an AI can code that gives the MOST value?

---

## The Two Wins

### Win 1: W3C Pointer Demo (ALREADY DONE)

You have working code. Just deploy it.

```bash
cd hot_obsidian_sandbox/bronze/P0_GESTURE_MONOLITH
npm run build
npx vercel deploy --prod
```

**Time**: 10 minutes
**Benefit**: Shareable proof of concept

---

### Win 2: JSONL Append-Only State (30 minutes)

The simplest possible "memory" for AI agents: append JSON lines to a file.

**Why this is the easiest**:
- No database setup
- No server to run
- Works with existing `obsidianblackboard.jsonl`
- AI can read/write with basic file operations
- Human-readable, git-trackable

---

## Implementation: JSONL State Manager

**File**: `hot_obsidian_sandbox/bronze/hfo-state.ts`

```typescript
import { readFileSync, appendFileSync, existsSync } from 'fs';

const STATE_FILE = 'obsidianblackboard.jsonl';

interface HFOEvent {
  timestamp: string;
  type: string;
  generation: number;
  phase: 'HUNT' | 'INTERLOCK' | 'VALIDATE' | 'EVOLVE';
  data: Record<string, unknown>;
}

// Log an event (append-only)
export function logEvent(event: Omit<HFOEvent, 'timestamp'>): void {
  const line = JSON.stringify({
    timestamp: new Date().toISOString(),
    ...event,
  });
  appendFileSync(STATE_FILE, line + '\n');
}

// Get last N events
export function getRecentEvents(n: number = 10): HFOEvent[] {
  if (!existsSync(STATE_FILE)) return [];
  const lines = readFileSync(STATE_FILE, 'utf-8').trim().split('\n');
  return lines.slice(-n).map(line => JSON.parse(line));
}

// Get events by type
export function getEventsByType(type: string, limit: number = 10): HFOEvent[] {
  if (!existsSync(STATE_FILE)) return [];
  const lines = readFileSync(STATE_FILE, 'utf-8').trim().split('\n');
  return lines
    .map(line => JSON.parse(line) as HFOEvent)
    .filter(e => e.type === type)
    .slice(-limit);
}

// Get current generation
export function getCurrentGeneration(): number {
  const events = getRecentEvents(100);
  const gens = events.map(e => e.generation).filter(Boolean);
  return gens.length > 0 ? Math.max(...gens) : 88;
}
```

**Usage by AI**:
```typescript
import { logEvent, getRecentEvents, getCurrentGeneration } from './hfo-state';

// At start of session: recall context
const context = getRecentEvents(5);
console.log('Last 5 events:', context);

// During work: log progress
logEvent({
  type: 'task_complete',
  generation: getCurrentGeneration(),
  phase: 'VALIDATE',
  data: { task: 'Deploy W3C demo', outcome: 'success' },
});

// Before decisions: check history
const gen = getCurrentGeneration();
console.log(`Current generation: ${gen}`);
```

---

## Kiro Steering Rule (Even Simpler)

Instead of MCP servers, just add a steering rule that tells the AI to use the JSONL file.

**File**: `.kiro/steering/hfo-state.md`

```markdown
# HFO State Management

## Context Recall
At the start of every session, read the last 10 lines of `obsidianblackboard.jsonl` to understand recent context.

## Event Logging
After completing any significant action, append a JSON line to `obsidianblackboard.jsonl`:
- timestamp: ISO string
- type: what happened (task_complete, decision_made, error_encountered)
- generation: current generation number (check last event)
- phase: HUNT, INTERLOCK, VALIDATE, or EVOLVE
- data: relevant details

## Example
```json
{"timestamp":"2026-01-06T15:30:00Z","type":"task_complete","generation":89,"phase":"VALIDATE","data":{"task":"Deploy demo","url":"https://..."}}
```
```

---

## Why This Is The Simplest

| Approach | Setup Time | Dependencies | AI Complexity |
|----------|------------|--------------|---------------|
| JSONL + Steering | 5 min | None | Read/write file |
| MCP Server | 30 min | SDK, server process | Tool calls |
| DuckDB | 1 hour | DuckDB, queries | SQL |
| Temporal | 4 hours | Server, workers | Workflow concepts |

**JSONL wins** because:
1. AI already knows how to read/write files
2. No new concepts to learn
3. Human can inspect state with `cat` or text editor
4. Git tracks all changes automatically
5. Works offline, no servers

---

## The 3-Step Plan

### Step 1: Deploy W3C Demo (10 min)
```bash
cd hot_obsidian_sandbox/bronze/P0_GESTURE_MONOLITH
npm run build && npx vercel deploy
```

### Step 2: Add State Manager (15 min)
Create `hot_obsidian_sandbox/bronze/hfo-state.ts` with the code above.

### Step 3: Add Steering Rule (5 min)
Create `.kiro/steering/hfo-state.md` with the steering rule above.

---

## What You Get

After 30 minutes:
- ✅ Deployed gesture demo (shareable URL)
- ✅ Persistent state across sessions (JSONL)
- ✅ AI knows to read/write state (steering rule)
- ✅ Human-readable history (git-tracked)

---

## Upgrade Path (Later)

When JSONL becomes limiting:
1. **Week 2**: Add DuckDB for queries (`SELECT * FROM events WHERE type = 'error'`)
2. **Month 2**: Add MCP server for tool-based access
3. **Month 3**: Add Temporal for long-running workflows

But start with JSONL. It's enough for 90% of use cases.

---

## Anti-Pattern Warning

**DON'T**:
- Build MCP server before you need it
- Set up Temporal before workflows take > 5 minutes
- Add DuckDB before you need SQL queries
- Create complex abstractions before simple ones fail

**DO**:
- Ship the demo
- Log to JSONL
- Read JSONL at session start
- Upgrade only when you hit limits
