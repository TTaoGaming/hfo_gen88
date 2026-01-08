import { chat, CHEAP_8_MODELS } from '../../runner/model-client';
import { Artifact } from './types';

export class RollupWorker {
  private model: string;

  constructor(modelIndex: number = 0) {
    this.model = CHEAP_8_MODELS[modelIndex % CHEAP_8_MODELS.length];
  }

  async processBatch(artifacts: Artifact[]): Promise<string> {
    const context = artifacts.map(a => `FILE: ${a.path}\nCONTENT:\n${a.content}\n---`).join('\n');
    
    const prompt = `
You are a Knowledge Crusher Swarm Worker. Your task is to extract high-density intelligence from the following developer logs/artifacts.

ARTIFACTS:
${context}

INSTRUCTIONS:
1. Summarize the technical progress in these files.
2. Extract Key Decisions made (architectural, tactical).
3. Identify Entities (Projects, Ports, Tools, Commanders).
4. Identify Relations between entities.

OUTPUT FORMAT:
Return a concise Markdown summary. Include sections for ## Summary, ## Key Decisions, ## Entities (Name | Type | Description), and ## Relations (Source -> Target | Type).
`;

    const { response } = await chat(this.model, [{ role: 'user', content: prompt }]);
    return response;
  }
}
