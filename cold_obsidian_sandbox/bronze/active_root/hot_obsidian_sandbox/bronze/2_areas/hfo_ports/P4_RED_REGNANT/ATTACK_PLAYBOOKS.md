# 🩸 HFO ATT&CK Playbooks: Teeth and Claws (Port 4)

Topic: System Disruption & Testing
Provenance: hot_obsidian_sandbox/bronze/P4_DISRUPTION_KINETIC.md
Status: BRONZE (Kinetic)

> "The Red Regnant does not just watch; she hunts. If the system bleeds, she tastes it. If the system lies, she tears it down." — Spider Sovereign

---

## 🦷 THE TEETH: Detection Patterns (ISR)
*The Teeth are the sensors that identify AI Theater and Architectural Drift.*

### T1001: The "Theater" Mask
- **Description**: AI reports "Green" (Success) but the underlying state is "Red" (Failure) or non-existent.
- **Detection**: 
    - Test files that pass but have no assertions.
    - Implementation files with `// TODO` or `/* ...existing code... */` in Silver/Gold.
    - Mismatched topic headers between artifact and provenance.

### T1002: Amnesia (Historical Pain Repetition)
- **Description**: AI repeats a pattern documented in the `PAIN_REGISTRY_GEN88.md` or `BLOOD_BOOK_OF_GRUDGES.jsonl`.
- **Detection**: 
    - FTS query against Kraken Keeper for keywords like "Spaghetti," "Lossy Compression," "Hallucination."
    - Lack of `@acknowledged` tag in files containing these patterns.

### T1003: Root Pollution (Canalization Breach)
- **Description**: Files or directories created outside the Medallion structure.
- **Detection**: 
    - Files in root not in `ALLOWED_ROOT_FILES`.
    - Non-standard directories in `hot_obsidian_sandbox` or `cold_obsidian_sandbox`.

---

## 🐾 THE CLAWS: Enforcement Actions (Kinetic)
*The Claws are the actions taken when a violation is detected.*

### C2001: The Physic Scream (Stigmergy Injection)
- **Description**: Immediate broadcast of the violation to the Blackboard and NATS.
- **Action**: 
    - Append JSONL entry to `obsidianblackboard.jsonl`.
    - (Future) Publish to `hfo.scream` NATS subject.

### C2002: Medallion Demotion (Quarantine)
- **Description**: Moving a Silver/Gold artifact back to Bronze/Quarantine.
- **Action**: 
    - `mv` file to `bronze/quarantine/`.
    - Log demotion to the Blood Book of Grudges.

### C2003: The Grudge Chain (Cryptographic Memory)
- **Description**: Linking the violation to the hash chain of historical pain.
- **Action**: 
    - Calculate SHA-256 hash of the grudge + previous hash.
    - Append to `BLOOD_BOOK_OF_GRUDGES.jsonl`.

---

## 🎮 Playbook 1: The "Theater" Hunt
1. **SENSE**: Scan all Silver/Gold files for `vitest` or `test` imports.
2. **BITE**: Verify that every `.ts` file has a corresponding `.test.ts` file.
3. **TEAR**: If missing, scream `THEATER` and demote to quarantine.

## 🎮 Playbook 2: The "Amnesia" Purge
1. **SENSE**: Query Kraken for the top 5 most frequent pain patterns.
2. **BITE**: Scan all active files for these patterns.
3. **TEAR**: If found without `@acknowledged`, scream `AMNESIA` and record a new Grudge.
