import { RollupWorker } from './worker';
import { Artifact } from './types';
import { chat, CHEAP_PAID_MODELS } from '../../runner/model-client';

export class RollupOrchestrator {
  private workers: RollupWorker[];

  constructor(workerCount: number = 8) {
    this.workers = Array.from({ length: workerCount }, (_, i) => new RollupWorker(i));
  }

  async rollupDay(date: string, artifacts: Artifact[]): Promise<string> {
    if (artifacts.length === 0) return `No data for ${date}`;

    // 1. SCATTER: Batch artifacts (max 10 per worker for density)
    const batches: Artifact[][] = [];
    const batchSize = 10;
    for (let i = 0; i < artifacts.length; i += batchSize) {
      batches.push(artifacts.slice(i, i + batchSize));
    }

    console.log(`[P7:SWARM] Distributing ${batches.length} batches across ${this.workers.length} workers...`);

    // 2. SWARM: Process in parallel
    const workerPromises = batches.map((batch, i) => {
      const worker = this.workers[i % this.workers.length];
      return worker.processBatch(batch);
    });

    const results = await Promise.all(workerPromises);

    // 3. GATHER: Consolidate with a specific aggregator agent
    console.log(`[P7:GATHER] Consolidating results for ${date}...`);
    const finalAggregationPrompt = `
You are the Knowledge Crusher Sovereign (Gatherer). You have received multiple partial summaries of developer logs for the day: ${date}.
Your task is to merge them into a single, high-fidelity ARCHIVE MANIFEST.

PARTIAL SUMMARIES:
${results.join('\n\n--- NEXT BATCH ---\n\n')}

INSTRUCTIONS:
1. Merge all events into a cohesive timeline.
2. Consolidate Entities and Relations (deduplicate).
3. Identify the "Striding Motion" of the day (the most important achievement).
4. Land the output in a structured Markdown format for Cold Bronze PARA.
`;

    const { response } = await chat(CHEAP_PAID_MODELS.GEMINI_3_FLASH, [
      { role: 'system', content: 'You are an expert technical archivist.' },
      { role: 'user', content: finalAggregationPrompt }
    ]);

    return response;
  }
}
