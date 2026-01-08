# Safety Tripwire - Orchestration Testing

**Created**: 2026-01-07T12:30:00Z
**Updated**: 2026-01-07T14:00:00Z
**Safe Commit**: `56b4d4a939cd5daba8946dec573baa339ee0565e`
**Purpose**: Checkpoint before orchestration pattern experiments

---

## 🛡️ TRIPWIRE STATUS: ARMED (Updated)

All HIVE/8:10 work committed and pushed. Ready for orchestration pattern testing.

### Safe State Includes:
- ✅ HLE hard benchmark (25 questions, 5 domains)
- ✅ CLI fix for HLE harness recognition
- ✅ Handoff test implementation
- ✅ HIVE/8:10 scatter-gather with confidence-weighted consensus
- ✅ Calibration analysis (where AI is confident but wrong)
- ✅ Orchestration patterns documentation

---

## 🔄 Rollback Commands

If orchestration experiments corrupt the codebase:

```bash
# Hard reset to safe commit
git reset --hard 56b4d4a939cd5daba8946dec573baa339ee0565e

# Or create a new branch from safe point
git checkout -b orchestration-recovery 56b4d4a939cd5daba8946dec573baa339ee0565e
```

---

## 📊 Current Test Results (HIVE/8:10)

| Prompt | Correct Models | Consensus | Pattern |
|--------|----------------|-----------|---------|
| 0 (ZF) | 1/6 | ❌ Wrong | DANGEROUS - confident wrong |
| 1 (poly) | 4/6 | ✅ Correct | BFT SUCCESS |
| 2 (S_n) | 1/6 | ❌ Wrong | Scattered - uncertainty |
| 3 (domino) | 0/6 | ❌ Wrong | Too hard |
| 4 (Petersen) | 6/6 | ✅ Correct | PERFECT convergence |

**Key insight**: Scatter pattern reveals uncertainty. BFT works when errors uncorrelated.

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

