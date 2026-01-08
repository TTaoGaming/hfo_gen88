# 🥈 Silver Tier Promotion Manifesto (Gen 88)

> Validates: AGENTS.md Canalization Rules #2, #3, #8
> @provenance: AGENTS.md

The Silver tier is a **Hard-Gated Enforcement Zone**. No artifact resides here without absolute, auditable proof of its integrity. To move code from Bronze to Silver, the following "Silver Standard" must be met.

## 🎯 The Promotion Criteria

### 1. Mutation Goldilocks (The "Just Right" Zone)
Code must achieve a mutation score that is high enough for reliability but low enough to avoid "AI Theater."
- **Minimum**: **80.00%** (Hard Floor).
- **Maximum**: **98.99%**. 
- *Note: Any score of 99% or higher is flagged as **THEATER** by Port 4 (Red Regnant) and is subject to immediate demotion.*

### 2. Auditable Receipts (No Receipt = Purge)
Promotion requires a dedicated `stryker.{artifact}.config.mjs` that produces a unique, verified JSON receipt.
- Receipts must be stored in standardized paths.
- Collisions (overwriting other receipts) result in a **VIOLATION**.

### 3. Property-Based Testing
Standard unit tests are insufficient. 
- All logic-heavy artifacts must utilize **Property Tests** (e.g., `fast-check`) to define invariants and kill edge-case mutants.

### 4. Red Regnant Compliance (Port 4)
The artifact must pass the `RED_REGNANT` audit:
- **No Debt**: Zero technical debt markers or `any` types (unless marked `@bespoke`).
- **Standardized Provenance**: Valid `@provenance` and `Validates:` headers in all files.
- **No Amnesia**: No unauthorized logging or debug statements.

### 5. Pyre Praetorian Immunity (Port 5)
Survive the **Dance of Shiva**. The test suite must demonstrate "Killing Capability" against mutation-injected logic flaws. 

### 6. PARA Compliance
Artifacts must be placed in the correct hierarchy:
- Active promotion logic in `1_projects`.
- Port components in `2_areas`.
- Shared constants/schemas in `3_resources`.
- Old versions moved to `4_archive`.

---

## 🏗️ Current Status
- **Directory**: Purged and Reset (2026-01-07).
- **Governance**: Hard-Gated. 
- **Structure**: PARA Enforced.
- **Commanders**: Lidless Legion (P0), Web Weaver (P1), Red Regnant (P4).

> *"Silver code is code that has earned its right to exist in the fire."*
