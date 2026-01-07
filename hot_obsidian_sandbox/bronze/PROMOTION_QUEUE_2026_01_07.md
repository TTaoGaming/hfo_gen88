# 🏛️ HFO Legendary Commander Promotion Queue (Gen 88)

**Date**: 2026-01-07
**Status**: INITIALIZING (8x8 Lattice Grid)
**Target Tier**: SILVER

This manifest tracks the **Conceptual Incarnation** of the 8 Legendary Commanders. These commanders represent the functional archetypes of the HFO swarm. All are currently in **Bronze Draft** status until they pass the **Silver Standard** (80-98.99% Mutation Coverage + JSON Receipts).

---

## 🌩️ [P4] Red Regnant (DISRUPT/TEST)
**Incarnation**: The Red Queen.
**Verb**: SING / SCREAM.
**Scope**: Red Team operations, mutation testing, architectural enforcement, and behavioral auditing. She aggressively demotes suspicious behavior with zero escape hatches.
**Files**: `hot_obsidian_sandbox/bronze/P4_RED_REGNANT/RED_REGNANT.ts`
**Blocker**: Mutation Score **36.15%** (Gate: 80%).

## 🛡️ [P5] Pyre Praetorian (IMMUNIZE/DEFEND)
**Incarnation**: The Blue Phoenix (Cobalt Armor/Blue Flames).
**Verb**: DANCE / DIE / REBORN.
**Scope**: Blue Team operations, immune memory, Phoenix Protocol, and defense-in-depth. She performs the **Dance of Shiva**—immolating what Red Regnant culls so it may be reborn stronger.
**Files**: `hot_obsidian_sandbox/bronze/P5_PYRE_PRAETORIAN/PYRE_PRAETORIAN.ts`
**Blocker**: Missing JSON Receipt (Config Collision).

## 🕷️ [P7] Spider Sovereign (DECIDE/C2/NAVIGATE)
**Incarnation**: The Grand Weaver of Decisions.
**Verb**: DECIDE / NAVIGATE.
**Scope**: Command & Control (C2), Eval Harness (MAP-ELITE), and Swarm Orchestration. She is to Swarm Orchestration what Red Regnant is to Testing.
**Files**: `hot_obsidian_sandbox/bronze/map-elite/`, `hot_obsidian_sandbox/bronze/P7_DECISION_KINETIC.md`
**Blocker**: Implementation is in flux; requires integration of "Martial Arts Swarm" logic.

## 🕸️ [P1] Web Weaver (BRIDGE/FUSE)
**Incarnation**: The Stigmergic Thread.
**Verb**: BRIDGE / FUSE.
**Scope**: Contracts (Zod), Stigmergy schemas (JSONL), Silver promotion gates, and NATS JetStream bridges.
**Files**: `hot_obsidian_sandbox/bronze/contracts/obsidian-stigmergy.ts`
**Blocker**: Zero Mutation Proof (Missing config).

---

## 🏛️ Remaining Commanders (Entry Pending)

| Port | Commander | Verb | Scope |
| :--- | :--- | :--- | :--- |
| **P0** | Lidless Legion | SENSE | Perception, Gesture Monolith, Observation. |
| **P2** | Mirror Magus | SHAPE | Transformations, Camera Filters, Adaptive UI. |
| **P3** | Spore Storm | DELIVER | Deployment, Injection, Effect Delivery. |
| **P6** | Kraken Keeper | STORE | Assimilation, Storage, Hexagonal Data Lakes. |

---

## 📅 The Co-Evolutionary Dance (P4 x P5)
Promotion requires these two to "dance" together. Red Regnant must **Scream** (Fail) and Pyre Praetorian must **Immunize** (Pass) the entire attack vector before either can enter Silver.
