/**
 * P0_RUN_SENSE_SUITE.ts
 * 
 * @port 0
 * @commander LIDLESS_LEGION
 * @gen 88
 * @status BRONZE
 * @provenance LEGENDARY_COMMANDERS_V9.md
 * @verb SENSE
 * Purpose: Runtime verification (Smoke Test) of the Port 0 sensing suite.
 */

import { Observer } from '../hfo_ports/P0_LIDLESS_LEGION/LIDLESS_OBSERVER';
import * as fs from 'fs';
import * as path from 'path';

async function runSmokeTest() {
  console.log("👁️ LIDLESS LEGION: Initiating Global Sense...");
  
  const query = "Analyze workspace disruption levels and library documentation integrity.";
  
  try {
    const batch = await Observer.observeAll(query);
    
    console.log(`✅ Observation Batch Generated: ${batch.id}`);
    console.log(`📡 Sources Responding: ${batch.observations.length}`);
    
    batch.observations.forEach(obs => {
      console.log(`   - [${obs.source}] Confidence: ${obs.confidence}`);
    });

    console.log(`\n📄 Receipt generated: ${batch.id}`);
    
  } catch (error) {
    console.error("💀 SENSE FAILURE:", error);
    process.exit(1);
  }
}

runSmokeTest();
