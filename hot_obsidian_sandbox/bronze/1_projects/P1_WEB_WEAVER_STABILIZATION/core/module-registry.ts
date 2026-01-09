/**
 * 🕸️ P1-SUB-3: MODULE REGISTRY
 * Manages the registration and discovery of HFO commander modules.
 */

export interface HfoModule {
  port: number;
  commander: string;
  entry: string;
}

export class ModuleRegistry {
  private registry: Map<number, HfoModule> = new Map();

  public register(module: HfoModule): void {
    if (this.registry.has(module.port)) {
      throw new Error(`Port ${module.port} already registered by ${this.registry.get(module.port)?.commander}`);
    }
    this.registry.set(module.port, module);
  }

  public getModule(port: number): HfoModule | undefined {
    return this.registry.get(port);
  }

  public listPorts(): number[] {
    return Array.from(this.registry.keys());
  }

  public clear(): void {
    this.registry.clear();
  }
}
