import { execSync } from 'child_process';
import { Artifact } from './types';

export class DbReader {
  private dbPath: string;

  constructor(dbPath: string) {
    this.dbPath = dbPath;
  }

  getArtifactsByDate(date: string): Artifact[] {
    const pythonCode = `
import duckdb
import json
import sys

db_path = '${this.dbPath}'
target_date = '${date}'

con = duckdb.connect(db_path)
try:
    results = con.execute("SELECT id, filename, path, content, createdAt FROM artifacts WHERE createdAt LIKE ? || '%'", (target_date,)).fetchall()
    artifacts = []
    for r in results:
        artifacts.append({
            'id': r[0],
            'filename': r[1],
            'path': r[2],
            'content': r[3],
            'createdAt': r[4]
        })
    print(json.dumps(artifacts))
except Exception as e:
    results = con.execute("SELECT id, filename, path, content FROM artifacts WHERE path LIKE '%' || ? || '%'", (target_date,)).fetchall()
    artifacts = []
    for r in results:
        artifacts.append({
            'id': r[0],
            'filename': r[1],
            'path': r[2],
            'content': r[3],
            'createdAt': ''
        })
    print(json.dumps(artifacts))
con.close()
`;

    try {
      const output = execSync(`python -c "${pythonCode.replace(/"/g, '\\"')}"`, { encoding: 'utf-8' });
      return JSON.parse(output);
    } catch (err) {
      console.error('Error reading from DuckDB:', err);
      return [];
    }
  }
}
