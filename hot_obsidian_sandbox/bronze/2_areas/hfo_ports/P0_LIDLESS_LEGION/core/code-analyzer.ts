/**
 * 👁️ P0-SUB-4: CODE ANALYZER
 * Senses code patterns and provides structural metrics.
 */

export interface CodeMetrics {
  lineCount: number;
  hasTheater: boolean;
  density: number;
}

export class CodeAnalyzer {
  /**
   * Senses metrics for a given code block.
   */
  public analyze(code: string): CodeMetrics {
    const lines = code.split('\n');
    const hasTheater = code.includes('AI Theater') || code.includes('// ...existing code...');
    
    return {
      lineCount: lines.length,
      hasTheater,
      density: lines.filter(l => l.trim().length > 0).length / lines.length || 0,
    };
  }
}
