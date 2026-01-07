# 🥉 TTV Vertical Slice: The Ghost Pointer
**Mission**: achieve "Total Tool Virtualization" (TTV) via W3C Pointer Events.
**HIVE Phase**: HUNT (H)

## 🎯 Objective
Create a 시스템 where a hand tracking input (MediaPipe) is smoothed (1€) and converted into a W3C Pointer Event that interacts with standard web UI.

## 🏗️ Architecture (Port-Based)
| Port | Role | Implementation |
|---|---|---|
| **0** | Observer | `MediaPipeAdapter` (Camera -> Landmarks) |
| **2** | Shaper | `OneEuroAdapter` (Landmarks -> SmoothedLandmarks) |
| **3** | Navigator | `PinchFSM` (Logic: index_tip + pinch = down) |
| **5** | Emitter | `W3CPointerAdapter` (SmoothedLandmarks -> `PointerEvent`) |
| **7** | Target | `CanvasToolAdapter` (The virtual drawing board) |

## 🧪 Vertical Slice Scenario
1. Hand enters camera view.
2. System "Arms" (Recognizes hand).
3. Index finger movement drives a "Ghost Pointer" on screen.
4. "Pinch" gesture draws a line on a `<canvas>`.
5. Visuals: A 3D "Pen" model follows the index finger.

## 🛠️ Technology Stack
- **Framework**: Three.js (Visuals)
- **Tracking**: MediaPipe Hands
- **Smoothing**: 1€ Filter
- **Events**: W3C Pointer Events Level 3
