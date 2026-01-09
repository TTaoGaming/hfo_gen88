/**
 * 👁️ P0-SUB-2: FILE WATCHER
 * Senses file system activity and structural integrity.
 */

export interface FileChange {
  path: string;
  type: 'CREATE' | 'DELETE' | 'MODIFY';
}

export class FileWatcher {
  private log: FileChange[] = [];

  public notify(change: FileChange): void {
    this.log.push(change);
  }

  /**
   * Senses if any files were added to forbidden root locations.
   */
  public getViolations(forbiddenPaths: string[]): FileChange[] {
    return this.log.filter(c => 
      forbiddenPaths.some(p => c.path.startsWith(p))
    );
  }
}
