# P0: Lidless Legion
**Verb**: SENSE
**HIVE Phase**: H (Hunt)
**JADC2 Role**: ISR Sensor Tile

---

## MTG Anchors

| Tier | Card | Mechanic |
|:---|:---|:---|
| Primary | Urza, Lord High Artificer | Artifact mastery, resource generation |
| Secondary | Thrasios, Triton Hero | Card draw, seeking next frame |
| Sliver | Synapse Sliver | Draw on combat damage |

---

## Function

> As the **ISR Node**, I maintain constant multi-modal observation
> so that the Mission Thread is anchored to real-time ground-truth.

---

## V10 Role (Physics Cursor)

- Raw MediaPipeline acquisition
- Index fingertip tracking (Landmark 8)
- Confidence gating (> 0.8)
- Frame timestamping & bundling

---

## Sliver Mechanic

**Synapse Sliver**: "Whenever a Sliver deals combat damage to a player, draw a card."

→ Every "touch" in the environment returns data to the hive.
→ The synapse is the entry point of truth.

---

## Mission Thread

```gherkin
Given the Signal Observer is acquiring MediaPipeline stream
And the Telemetry Guard is aligning to Master Clock
When a raw observation packet is ingested
Then transform into standardized Target Folder (Zod)
And certify frame-sync for downstream fusion
```

---

*[[index|← Back to Commanders]]*
