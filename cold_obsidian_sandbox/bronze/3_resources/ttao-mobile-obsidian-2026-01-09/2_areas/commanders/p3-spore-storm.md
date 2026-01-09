# P3: Spore Storm
**Verb**: DELIVER
**HIVE Phase**: E (Evolve)
**JADC2 Role**: Kill-Web Disseminator

---

## MTG Anchors

| Tier | Card | Mechanic |
|:---|:---|:---|
| Primary | Ghave, Guru of Spores | Token generation, sacrifice loops |
| Secondary | The Locust God | Insect swarm on draw |
| Sliver | The First Sliver | Cascade |

---

## Function

> As the **Kill-Web Disseminator**, I route tactical events
> with sub-millisecond latency for high-velocity engagement.

---

## V10 Role (Physics Cursor)

- XState / Custom FSM
- Gesture state machine
- W3C PointerEvent generation
- Sub-millisecond dispatch
- Event injection into target app

---

## Sliver Mechanic

**The First Sliver**: "Cascade (When you cast this spell, exile cards from the top of your library until you exile a nonland card that costs less. You may cast it without paying its mana cost.)"

→ One action triggers recursive sequence of injections.
→ When Spore Storm fires, the entire ordnance manifold follows.

---

## Gesture FSM States

```
Idle → Arming → Acquiring → Committed → [Success]
         ↓          ↓
      Cancelled ← Cancelled
         ↓
       Idle
```

---

## Mission Thread

```gherkin
Given the Fabric Router manages W3C Pointer delivery
And the Injection Assembly prepares tactical packet swarm
When a simulated COA is approved
Then convert mission transform into PointerEvent primitives
And dispatch effects with sub-millisecond precision
```

---

*[[index|← Back to Commanders]]*
