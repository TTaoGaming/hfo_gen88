# Safety Tripwire - Orchestration Testing

**Created**: 2026-01-07T12:30:00Z
**Safe Commit**: `1b4edf380bd3c295c186780b890f9da956200314`
**Purpose**: Checkpoint before orchestration pattern experiments

---

## 🛡️ TRIPWIRE STATUS: ARMED

This document serves as a safety checkpoint before testing orchestration patterns.
All critical MAP-ELITE work has been committed and pushed.

### Safe State Includes:
- ✅ HLE hard benchmark (25 questions, 5 domains)
- ✅ CLI fix for HLE harness recognition
- ✅ Handoff test implementation
- ✅ Audit ledger with test results
- ✅ Progress report

---

## 🔄 Rollback Commands

If orchestration experiments corrupt the codebase:

```bash
# Hard reset to safe commit
git reset --hard 1b4edf380bd3c295c186780b890f9da956200314

# Or create a new branch from safe point
git checkout -b orchestration-recovery 1b4edf380bd3c295c186780b890f9da956200314
```

---

## 📋 Orchestration Test Checklist

Before running orchestration patterns:

- [ ] Verify safe commit is pushed: `git log -1 --oneline`
- [ ] Check no uncommitted critical work: `git status`
- [ ] Log test intent to blackboard
- [ ] Set timeout limits on experiments

### Test Patterns to Explore:

1. **Sequential Handoff** (current)
   - Model A → Model B → Model C
   - Already implemented in `handoff-test.ts`

2. **Parallel Scatter-Gather**
   - Fan out to N models, aggregate results
   - BFT consensus on answers

3. **Debate Pattern**
   - Model A proposes, Model B critiques
   - Iterate until convergence

4. **Mixture of Experts**
   - Route by domain (math→math-model, physics→physics-model)
   - Requires classifier

---

## 🚨 Abort Conditions

Stop orchestration testing if:
- Cost exceeds $1.00 per experiment
- Latency exceeds 60s per prompt
- Error rate exceeds 50%
- Models start hallucinating orchestration commands

---

## 📊 Experiment Log

| Timestamp | Pattern | Models | Harness | Result | Cost |
|-----------|---------|--------|---------|--------|------|
| 2026-01-07T12:00 | Sequential | gpt-oss-20b→gemma-3n | HLE_MATH | +10 on some | ~$0.01 |

