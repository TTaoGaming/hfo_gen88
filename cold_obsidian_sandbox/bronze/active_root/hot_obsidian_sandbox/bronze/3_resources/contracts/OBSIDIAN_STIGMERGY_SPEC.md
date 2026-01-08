# OBSIDIAN Stigmergy Format v1.0 (Gen 88)

## Overview

The OBSIDIAN Stigmergy Format is a machine-parsable event format for AI swarm coordination. It combines:

- **CloudEvents 1.0** - Industry standard event envelope (CNCF)
- **W3C Trace Context** - Distributed tracing correlation
- **HFO 8-Port OBSIDIAN Extensions** - Semantic octree structure

## The 8 Verbs of OBSIDIAN

The 8 ports spell **OBSIDIAN**, each with a distinct behavioral role:

| Port | Verb | Commander | HIVE Phase | Behavioral Role |
|------|------|-----------|------------|-----------------|
| 0 | **O**BSERVE | Lidless Legion | H (Hunt) | Sensing, perception, data acquisition |
| 1 | **B**RIDGE | Web Weaver | I (Interlock) | Protocol translation, message routing |
| 2 | **S**HAPE | Mirror Magus | V (Validate) | Data transformation, filtering |
| 3 | **I**NJECT | Spore Storm | E (Evolve) | Payload delivery, side effects |
| 4 | **D**ISRUPT | Red Regnant | E (Evolve) | Testing, mutation, chaos |
| 5 | **I**MMUNIZE | Pyre Praetorian | V (Validate) | Validation, defense |
| 6 | **A**SSIMILATE | Kraken Keeper | I (Interlock) | Storage, memory |
| 7 | **N**AVIGATE | Spider Sovereign | H (Hunt) | Decision, orchestration |

## Schema

```typescript
interface ObsidianStigmergy {
  // CloudEvents 1.0 Required
  specversion: '1.0';
  id: string;                    // UUID v4
  source: string;                // hfo://gen{N}/{layer}/port/{port}
  type: string;                  // obsidian.{verb}.{domain}.{action}
  
  // CloudEvents 1.0 Optional
  time: string;                  // ISO 8601
  datacontenttype: 'application/json';
  subject?: string;              // Target resource
  
  // W3C Trace Context
  traceparent: string;           // 00-{trace-id}-{span-id}-{flags}
  tracestate?: string;           // Vendor-specific
  
  // OBSIDIAN Extensions
  obsidianport: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
  obsidianverb: 'OBSERVE' | 'BRIDGE' | 'SHAPE' | 'INJECT' | 'DISRUPT' | 'IMMUNIZE' | 'ASSIMILATE' | 'NAVIGATE';
  obsidiangen: number;           // Generation (88, 89, ...)
  obsidianhive: string;          // HFO_GEN{N}
  obsidianphase: 'H' | 'I' | 'V' | 'E';
  obsidianlayer: 'bronze' | 'silver' | 'gold';
  
  // BDD Context
  given?: string;
  when?: string;
  then?: string;
  
  // Payload
  data: Record<string, unknown>;
}
```

## Consistency Rules

The format enforces 7 consistency properties:

1. **Port-Verb Consistency**: Port N must use verb OBSIDIAN[N]
2. **Port-Phase Consistency**: Port maps to HIVE phase (H/I/V/E)
3. **Type-Verb Consistency**: Event type verb matches obsidianverb
4. **Source-Port Consistency**: Source URI port matches obsidianport
5. **Source-Gen Consistency**: Source URI gen matches obsidiangen
6. **Source-Layer Consistency**: Source URI layer matches obsidianlayer
7. **Hive-Gen Consistency**: Hive generation matches obsidiangen

## Event Type Taxonomy

```
obsidian.{verb}.{domain}.{action}

Port 0 (OBSERVE):
  obsidian.observe.file.sensed
  obsidian.observe.agent.grounded
  obsidian.observe.context.captured

Port 1 (BRIDGE):
  obsidian.bridge.protocol.translated
  obsidian.bridge.message.routed
  obsidian.bridge.context.merged

Port 2 (SHAPE):
  obsidian.shape.data.transformed
  obsidian.shape.filter.applied
  obsidian.shape.projection.created

Port 3 (INJECT):
  obsidian.inject.payload.delivered
  obsidian.inject.mutation.applied
  obsidian.inject.artifact.promoted

Port 4 (DISRUPT):
  obsidian.disrupt.violation.detected
  obsidian.disrupt.mutation.scored
  obsidian.disrupt.demotion.executed

Port 5 (IMMUNIZE):
  obsidian.immunize.schema.validated
  obsidian.immunize.input.sanitized
  obsidian.immunize.threat.blocked

Port 6 (ASSIMILATE):
  obsidian.assimilate.knowledge.stored
  obsidian.assimilate.relationship.linked
  obsidian.assimilate.memory.recalled

Port 7 (NAVIGATE):
  obsidian.navigate.decision.made
  obsidian.navigate.mission.planned
  obsidian.navigate.phase.transitioned
```

## Example JSONL

```jsonl
{"specversion":"1.0","id":"a1b2c3d4-e5f6-7890-abcd-ef1234567890","source":"hfo://gen88/bronze/port/0","type":"obsidian.observe.file.sensed","time":"2026-01-06T19:00:00Z","datacontenttype":"application/json","subject":"bronze/W3C_GESTURE_PIPELINE_HANDOFF.md","traceparent":"00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01","obsidianport":0,"obsidianverb":"OBSERVE","obsidiangen":88,"obsidianhive":"HFO_GEN88","obsidianphase":"H","obsidianlayer":"bronze","given":"file exists","when":"scan triggered","then":"metadata extracted","data":{"para":"project","status":"active"}}
```

## Validation

Use the Zod schema in `obsidian-stigmergy.ts`:

```typescript
import { validateObsidianEvent, createObsidianEvent } from './obsidian-stigmergy';

// Create a valid event
const event = createObsidianEvent(0, 'file', 'sensed', 88, 'bronze', { status: 'active' });

// Validate any event
const result = validateObsidianEvent(event);
if (!result.valid) {
  console.error(result.errors);
}
```

## Test Coverage

The format is validated by:
- 22 unit tests (property + mutation + edge cases)
- 80 manual mutation tests (94% kill rate - Pareto optimal)

**Pareto Gaps (intentionally not validated):**
- Tracestate format (W3C parsing complexity)
- All-zero trace-id/span-id (W3C semantic rule)
- UUID version (v1 vs v4)
- Temporal bounds (year 9999)

**Gaps found and fixed during mutation testing:**
- Source URI gen must match obsidiangen (M41)
- Source URI layer must match obsidianlayer (M42)

## Why This Format?

1. **Machine Parsability**: CloudEvents SDKs in every language
2. **Distributed Tracing**: W3C traceparent links agent sessions
3. **Semantic Chunking**: 8 ports = 8 behavioral categories
4. **BDD Grounding**: given/when/then forces behavioral specification
5. **JSONL Native**: Append-only, grep-friendly, infinite history
6. **Extensible**: Add new event types without schema changes
