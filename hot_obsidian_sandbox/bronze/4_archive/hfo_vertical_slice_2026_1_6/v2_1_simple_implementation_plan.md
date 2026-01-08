# HFO V2.1: The "Low-Lift" Swarm Symbiote (Bootstrap Edition)
**Version**: 2.1 | **Focus**: Extreme Simplicity for AI Implementation | **Goal**: High-Benefit/Low-Effort Vertical Slice

This iteration identifies the "easiest" path to functional HFO/TTV by stripping infrastructure weight and utilizing the existing workspace as the "Durable Engine."

---

## 🎯 The "Zero-Infra" Swarm (Orchestration)

Instead of Temporal/LangGraph, we adopt the **Stigmergic File-System** pattern. The workspace *is* the state.

| Feature | V2.1 Pattern | Why it's Easy for AI | Benefit |
| :--- | :--- | :--- | :--- |
| **State** | `hfo_active_mission.json` | Single file source of truth. | Persistent context across sessions. |
| **Baton** | **Requirement Tracking** | AI must check [ ] markers in the plan. | Theater Detection. No [ ] = No promote. |
| **Memory** | **DuckDB / JSONL** | Use existing `obsidianblackboard.jsonl`. | Machine-parseable audit trail. |

### 🚀 Implementation (Step 1):
Create a `hot_obsidian_sandbox/bronze/mission_control.ts`.
- Its only job: Read `active_mission.md` and log success/failure to the Blackboard.
- AI Action: "Ground yourself by reading the mission file first."

---

## 👆 The "Pointer-Lite" Plane (TTV)

Don't overengineer physics. Use the browser's native capabilities to create the "Universal Input."

| Feature | V2.1 Pattern | Implementation |
| :--- | :--- | :--- |
| **Sensor** | **MediaPipe Hands** | Use a single `gesture_plane.html` in `open_simple_browser`. |
| **Smoothing** | **Moving Average** | Simple 5-sample buffer (skip Kalman/OneEuro for now). |
| **Effector** | **Pinch-to-Click** | `distance(index, thumb) < threshold` -> `dispatchEvent(click)`. |

### 🚀 Implementation (Step 2):
A single HTML file with a `<canvas>` overlay.
- It translates landmarks directly to `window.location` or `elementFromPoint(x, y).click()`.
- Result: You can control the UI with your hands in minutes, not days.

---

## ⚔️ The "Red Regnant" Scream (Theater Defense)

To stop the AI from lying, we use **Strict Contract Enforcement**.

1. **The Baton Lock**: AI cannot move a file from `bronze/` to `silver/` unless [baton-validator.ts](../baton-validator.ts) runs and returns `valid: true`.
2. **The Forensic Log**: AI *must* use `grep_search` to verify code exists before claiming success.

---

## 📋 The "Bones" Plan (Next Action)

The simplest thing we can do right now that has the most benefit:
1. **[ ] Write `hfo_active_mission.json`**: Define the current goal (e.g., "Implement 1€ Filter").
2. **[ ] Create `gesture_lite.html`**: A zero-dependency hand tracking page.
3. **[ ] Test the Bridge**: See if the manual hand-click can toggle a button in your `ttao-notes`.

---
**Status**: V2.1 | **Commander**: Spore Storm (Port 3 - Delivery) | **Ledger**: [obsidianblackboard.jsonl](../../../obsidianblackboard.jsonl)
