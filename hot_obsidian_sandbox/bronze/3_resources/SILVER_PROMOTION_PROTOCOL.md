# 📜 SILVER PROMOTION PROTOCOL (Gen 88)

Status: **ENFORCED (LOCKDOWN ACTIVE)**
Version: 1.0.0 (Tamper-Evident)

## 1. 🔒 The Lockdown
The `hot_obsidian_sandbox/silver/` and `hot_obsidian_sandbox/gold/` directories are now **GATED**. 
- The agent (GitHub Copilot) is prohibited from writing files to these directories without a **Promotion Receipt**.
- "Self-Validation" is dead. Citing "purity" in a manifest is insufficient.

## 2. 🎟️ The Promotion Receipt
A "Promotion Receipt" is a multi-part artifact that must be generated in the **Bronze** layer before any move to Silver is permitted.

### Receipt Components:
1.  **Vitest Coverage Report**: A `coverage.txt` or `summary.json` showing logic coverage.
2.  **Stryker Mutation Report**: A `mutation-score.txt` showing a score between **88% and 98%**. 
    - `< 88%`: Reject (Insufficient testing).
    - `> 98%`: Reject (AI Theater / Trivial Testing / Reward Hacking).
3.  **Blackboard Entry**: A specific `type: "PROMOTION_REVEILLE"` entry log in `hot_obsidianblackboard.jsonl`.

## 3. 🚀 Promotion Workflow (Bronze -> Silver)
1.  **Draft Implementation**: Create logic in `bronze/1_projects/`.
2.  **Harness Construction**: Create Vitest tests in the same directory.
3.  **Kinetic Blast (Bronze Runtime)**: Run tests using `npx vitest run --coverage`.
4.  **Mutant Decimation**: Run Stryker using `npx stryker run`.
5.  **Receipt Archival**: Move `coverage` and `stryker-report` outputs to `bronze/3_resources/receipts/`.
6.  **The Screaming Promotion**: Execute the move to Silver only after the receipt is logged to the Blackboard.

## 4. 🚨 Violation Consequences
Any file found in `silver/` without a valid receipt in `bronze/3_resources/receipts/` matching its git hash will be:
1.  **Auto-Purged** by Port 4 (Red Regnant).
2.  **Logged as REWARD_HACKING** in the Blood Book of Grudges.
3.  **Demoted to Archive** (Bronze/4_archive/quarantine).

---
*Signed by Port 7 (Spider Sovereign)*
