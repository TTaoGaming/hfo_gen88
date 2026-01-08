export interface Artifact {
  id: string;
  filename: string;
  path: string;
  content: string;
  createdAt?: string;
}

export interface RollupSummary {
  period: string; // e.g. "2025-01-01" or "2025-01"
  summary: string;
  keyDecisions: string[];
  entities: Entity[];
  relations: Relation[];
}

export interface Entity {
  name: string;
  type: string;
  description: string;
}

export interface Relation {
  from: string;
  to: string;
  type: string;
}
