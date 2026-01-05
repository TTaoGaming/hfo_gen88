# HFO Exemplar: Medallion Flow
@topic Medallion Flow
@provenance hot_obsidian_sandbox/bronze/COLD_START_PROTOCOL_GEN88.md

## Definition
The Medallion Flow is the lifecycle of an artifact in the HFO Gen 88 environment.

1. **Bronze (Draft/Kinetic)**: Experimental code, slop, and kinetic energy. No tests required.
2. **Silver (Validated)**: Tested and verified implementations. Must have a corresponding `.test.ts` file.
3. **Gold (Canonical)**: The source of truth. Immutable and highly optimized.

## Enforcement
The Red Regnant (Port 4) enforces this flow by demoting any Silver artifact that lacks a test or violates architectural constraints.
