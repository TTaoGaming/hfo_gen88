/**
 * Knowledge Rollup Eval Harness (Gen 88)
 * @port 7
 * @commander Spider Sovereign
 */

import 'dotenv/config';
import { RollupOrchestrator } from './orchestrator';
import { Artifact } from './types';
import { chat, CHEAP_PAID_MODELS } from '../../runner/model-client';
import * as fs from 'fs';
import * as path from 'path';

async function runEval() {
  const orchestrator = new RollupOrchestrator(8);

  // 1. SELECT DOCUMENTS
  const files = [
    'hot_obsidian_sandbox/bronze/3_resources/ABC_COMPARISON_RESULTS.md',
    'hot_obsidian_sandbox/bronze/3_resources/GEN88_WORKSPACE_GOVERNANCE_MANIFEST.md',
    'hot_obsidian_sandbox/bronze/3_resources/MASTRA_POC_HANDOFF_2026_01_08.md'
  ];

  console.log(`[EVAL] Loading ${files.length} documents...`);
  const artifacts: Artifact[] = files.map(f => ({
    id: f,
    filename: path.basename(f),
    path: f,
    content: fs.readFileSync(path.join(process.cwd(), f), 'utf-8')
  }));

  // 2. RUN ROLLUP
  console.log(`[EVAL] Triggering Knowledge Rollup...`);
  const rollupResult = await orchestrator.rollupDay('2026-01-08-EVAL', artifacts);

  console.log('\n--- ROLLUP RESULT ---\n');
  console.log(rollupResult);
  console.log('\n---------------------\n');

  // 3. RUN EVALUATION (Faithfulness & Information Loss)
  console.log(`[EVAL] Running Self-Evaluation Harness...`);

  const evalPrompt = `
You are the Spider Sovereign Auditor. Evaluate the following Knowledge Rollup against its source documents.

SOURCE DOCUMENTS:
${artifacts.map(a => `## ${a.filename}\n${a.content}`).join('\n\n')}

KNOWLEDGE ROLLUP:
${rollupResult}

EVALUATION CRITERIA:
1. **Faithfulness**: Are there any claims in the Rollup that are NOT supported by the source? (Hallucinations)
2. **Information Loss (Recall)**: Did the Rollup miss critical entities (Ports, Commanders, Frameworks)? List the top 5 missing pieces.
3. **Logic Integrity**: Did it correctly capture the "Method B (Sequential Pulse)" winning the A/B test?
4. **Structural Alignment**: Did it mention the PARA Medallion Governance target state?

OUTPUT FORMAT:
Provide a report with:
- Faithfulness Score: (0-100)
- Recall Score: (0-100)
- Information Loss Report: (List of missing facts)
- Final Verdict: (GOLD/SILVER/BRONZE)
`;

  const { response: evalResponse } = await chat(CHEAP_PAID_MODELS.GEMINI_3_FLASH, [
    { role: 'system', content: 'You are a high-fidelity architectural auditor.' },
    { role: 'user', content: evalPrompt }
  ]);

  console.log('\n--- EVALUATION REPORT ---\n');
  console.log(evalResponse);
  console.log('\n-------------------------\n');
}

runEval().catch(err => {
  console.error(err);
  process.exit(1);
});
