/**
 * 🦑 P6-SUB-1: L2 LOCALSTORE
 * Semi-persistent local dictionary storage.
 */

export class L2LocalStore {
  private store: Record<string, any> = {};

  public save(key: string, data: any): void {
    this.store[key] = data;
  }

  public fetch(key: string): any {
    return this.store[key];
  }

  public delete(key: string): void {
    delete this.store[key];
  }

  public export(): string {
    return JSON.stringify(this.store);
  }
}
