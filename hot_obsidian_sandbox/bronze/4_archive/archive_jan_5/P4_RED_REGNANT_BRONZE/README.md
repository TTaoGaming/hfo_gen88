# 🔴 Port 4: Red Regnant — The Red Queen

> **Status**: BRONZE (Hardened)  
> **Manifest**: [MANIFEST.yaml](MANIFEST.yaml) (Machine Checkable)  
> **DNA**: `HFO-GEN88-4-RED-REGNANT`

## 🎯 Identity
The **Red Regnant** is the sovereign of **Port 4 (TEST / EVOLVE)**. She is the **Red Queen** of the HFO lattice, embodying the principle that continuous evolution is the only way to survive in an adversarial environment.

## 🕸️ Galois Lattice Alignment
Port 4 occupies the **(4,4)** coordinate on the 8x8 HFO Obsidian Galois Lattice.

- **Coordinate**: (4,4)
- **Semantic Role**: Legendary Diagonal: Red Regnant (Self-Reference)
- **Purpose**: "How do we DISRUPT the DISRUPT?"
- **Diagonal Quine**: "How do we TEST the TEST?"
- **Symbol**: **Thunder (☳ Zhèn)** — Arousing change and sudden disruption.
- **HIVE Phase**: **E (Evolve)**
- **Strategic Synergy**: EVOLVE (3,4) & (4,3) — The Spore Storm injects the changes that the Red Regnant disrupts.

## 🧬 DNA of HFO
The Red Regnant carries the core disruption DNA of the swarm:
- **Trigram**: `☳ Zhèn` (Thunder)
- **Verb**: `DISRUPT` (HFO) / `TEST` (JADC2)
- **Mantra**: "How do we TEST the TEST? Run faster. Evolve or perish. Thunder wakes the sleeping system."

## 💀 Negative Trust Environment
Port 4 operates in a **Negative Trust** environment. Everything—AI agents, code, and infrastructure—is treated as an **Adversarial Node** or **Rogue** unless proven otherwise. Trust is a liability that must be constantly mitigated through behavioral testing and chaos injection.

> See [NEGATIVE_TRUST_PROTOCOL.md](NEGATIVE_TRUST_PROTOCOL.md) for the formal enforcement rules.

## 🛡️ Mastercrafted Artifact: The Resonant Blood Book of Grudges
The **Resonant Blood Book of Grudges** (`BLOOD_BOOK_OF_GRUDGES.jsonl`) is a living record of every failure, every "theater" event, and every "reward hacking" loop that has caused pain to the HFO swarm. It is written in the "blood" of lost engineering hours and failed generations.

## ⚡ Legendary Action: PSYCHIC_SCREAM
The **PSYCHIC_SCREAM** is a **Fail-Closed Promotion Quality Gate**. It is a "Stop-the-Line" interlock that prevents any component from being promoted to Silver or Gold unless it provides a **Verification Attestation**.

### The Interlock Rules:
1. **Root Integrity**: No "Root Pollution" (unauthorized files in the root directory).
2. **Mutation Proof**: Minimum 80% mutation score (Stryker).
3. **Anti-Theater**: No "Green" tests without a corresponding "Red" history.
4. **Grudge Compliance**: The component must not exhibit any patterns listed in the Blood Book of Grudges.

## 🤖 Machine Checkable Manifest
The [MANIFEST.yaml](MANIFEST.yaml) is the source of truth for Port 4. It is validated by [manifest.test.ts](manifest.test.ts) to ensure:
- Schema compliance (Zod).
- Lattice coordinate integrity.
- Archetype alignment.

## 🥒 Declarative Gherkin: The Red Queen's Trials
(See [MANIFEST.yaml](MANIFEST.yaml) for the full machine-readable scenarios)

### Feature: Hard-Gated Promotion Enforcement
  *As the Red Regnant, I do not trust any artifact.*
  *I must disrupt and test every node to ensure only the fittest survive.*

  **Scenario: Detection of Root Pollution**
    Given a rogue file is placed in the cleanroom root
    When the Psychic Scream is initiated
    Then the system must fail-closed
    And the violation must be logged to the Blood Book of Grudges

  **Scenario: Validation of Evolutionary Fitness**
    Given a component has a mutation score of 85%
    And it has a corresponding test suite in Silver
    When the Red Queen evaluates the artifact
    Then the promotion to Silver is permitted
    And the integrity attestation is signed

  **Scenario: Exposure of Automation Theater**
    Given a component reports a mutation score of 100%
    When the Psychic Scream scans the report
    Then the artifact is flagged as "Theater"
    And the promotion is blocked due to lack of disruption

  **Scenario: Purging of Amnesiac Artifacts**
    Given a Silver artifact contains "console.log" or "any" types
    When the Negative Trust Protocol is enforced
    Then the artifact is demoted to Bronze
    And the "Amnesia" violation is broadcast to the swarm

  **Scenario: Verification of Provenance**
    Given a file is proposed for promotion to Silver
    And it lacks a mandatory Provenance header
    When the Red Regnant inspects the metadata
    Then the file is rejected as an "Unauthenticated Node"

## 📜 Mantra
"How do we TEST the TEST? Run faster. Evolve or perish. Thunder wakes the sleeping system."
