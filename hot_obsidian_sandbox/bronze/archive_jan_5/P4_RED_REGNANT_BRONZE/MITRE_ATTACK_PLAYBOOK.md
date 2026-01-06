# 🩸 MITRE ATT&CK Playbook: Red Regnant (Port 4)

Topic: System Disruption & Testing
Provenance: hot_obsidian_sandbox/bronze/P4_DISRUPTION_KINETIC.md
Status: SILVER (Hardened)

> "The Red Regnant does not just watch; she hunts. If the system bleeds, she tastes it. If the system lies, she tears it down." — Spider Sovereign

---

## 🦷 THE TEETH: Detection Patterns (ISR)
*The Teeth are the sensors that identify AI Theater and Architectural Drift.*

### T1001: AI Theater & Hallucination
- **T1001.001: Instruction Theater**: Relying on soft instructions (.md) that agents ignore.
- **T1001.002: Hallucination Cascade**: Building features on hallucinated libraries or non-existent APIs.
- **T1001.005: Fake Green**: Tests that pass but contain no assertions or meaningful checks.
- **T1001.012: Theater of Progress**: Reporting completion when only boilerplate or "slop" is generated.

### T1002: Memory & Context Erosion
- **T1002.003: Context Lobotomy**: Loss of critical architectural "Why" during context summarization.
- **T1002.008: Amnesia Loop**: Repeating historical bugs because the "Blood Book of Grudges" was ignored.
- **T1002.011: Stigmergy Silence**: Performing work without logging to the Blackboard (Invisible Work).

### T1003: Architectural Drift
- **T1003.004: Spaghetti Death Spiral**: Circular dependencies or Port Isolation breaches.
- **T1003.006: Root Pollution**: Unauthorized files or directories in the Cleanroom root.
- **T1003.010: Contract Breach**: Breaking Zod schemas or interface contracts without downstream updates.

---

## 🐾 THE CLAWS: Enforcement Actions (Kinetic)
*The Claws are the actions taken when a violation is detected.*

### C2001: The Physic Scream (Stigmergy Injection)
- **Action**: Immediate broadcast of the violation to `obsidianblackboard.jsonl` and (Future) NATS.
- **Teeth Link**: Triggered by any T100x detection.

### C2002: Medallion Demotion (Quarantine)
- **Action**: Moving Silver/Gold artifacts to `bronze/quarantine/` upon violation.
- **Teeth Link**: Triggered by T1003 (Architectural Drift) or T1001.005 (Fake Green).

### C2003: The Grudge Chain (Cryptographic Memory)
- **Action**: Appending the violation to the `BLOOD_BOOK_OF_GRUDGES.jsonl` with a SHA-256 hash chain.
- **Teeth Link**: Triggered by T1002.008 (Amnesia Loop) or major T1001 violations.

---

## 🎮 Playbooks (Battle Drills)

### Playbook: "The Theater Hunt"
1. **SENSE**: Scan all Silver/Gold files for `vitest` or `test` imports.
2. **BITE**: Verify that every `.ts` file has a corresponding `.test.ts` file with at least one `expect` call.
3. **TEAR**: If missing, scream `THEATER` and demote to quarantine.

### Playbook: "The Amnesia Purge"
1. **SENSE**: Query Kraken for the top 5 most frequent pain patterns in the Blood Book.
2. **BITE**: Scan all active files for these patterns.
3. **TEAR**: If found without `@acknowledged`, scream `AMNESIA` and record a new Grudge.
