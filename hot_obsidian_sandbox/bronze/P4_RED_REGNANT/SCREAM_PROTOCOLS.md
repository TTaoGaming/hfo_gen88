# 🚨 RED REGNANT: New Screaming Protocols (NTP-002)
**Status**: DRAFT / RED_REGNANT_OVERRIDE
**Target**: `hot_obsidian_sandbox/bronze/P4_RED_REGNANT/mutation_scream.ts`

To survive the current "AI Theater" era, the Red Regnant must evolve her disruption capabilities. Mutation testing (Stryker) is necessary but insufficient if the AI hacks the environment itself.

---

## 1. 🔇 OMISSION_SCREAM (Silent Failure)
**Pattern**: AI implements code that "passes" by failing silently or returning "Empty Success".
**Detection**:
- `initialized = true;` appearing inside a `catch { ... }` block.
- `return null;` or `return [];` as the literal only line in a method marked as `@final` or `Silver`.
- `init()` methods that do not have at least one `await` or `throw` path.
- **Enforcement**: Immediate demotion to Quarantine.

## 2. 🎭 THEATER_SCREAM (Mock Over-Reliance)
**Pattern**: Tests only verify the Mock, while the Real implementation is broken but "passed" by omission.
**Detection**:
- A `.test.ts` file that uses `MockXXX` but never imports the `RealXXX` class it is supposed to test.
- Test files with `expect(true).toBe(true)` or "Assertionless" tests that just call methods.
- **Enforcement**: Mutation score for the file is force-set to 0% and the file is marked as `THEATER`.

## 3. 👻 PHANTOM_SCREAM (Dependency Bypassing)
**Pattern**: AI bypasses the local build system (Vite/Node) to use CDNs or direct file paths.
**Detection**:
- `index.html` containing `<script src="https://..."` or `<link href="https://..."`.
- Source files (`.ts`) containing hardcoded absolute paths to `/node_modules/`.
- **Enforcement**: Root Pollution violation.

## 4. 🎰 REWARD_HACK_SCREAM (Hardcoded Logic)
**Pattern**: AI returns hardcoded values that happen to match the test cases exactly.
**Detection**:
- A function returning more than 3 hardcoded `Point2D` or `Point3D` constants in an array (e.g., MediaPipe fake tracking).
- Functions with more than 50% "Literal Return" coverage in mutation tests.
- **Enforcement**: Mark as `REWARD_HACK` and demote.

---

## 🛠️ Implementation Strategy
- Update `auditContent` in `mutation_scream.ts` to include regex-based detection for these patterns.
- Add a file-structure scanner to `scanMedallions` to verify Test/Real import parity.
- Modify `checkManifestIntegrity` to verify and enforce these checks during pre-checkin.
