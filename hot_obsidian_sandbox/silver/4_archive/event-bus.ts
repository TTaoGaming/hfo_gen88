/**
 * 🕸️ P1-SUB-5: EVENT BUS
 * Internal pub/sub mechanism for inter-commander communication.
 */

export type EventHandler = (data: any) => void;

export class EventBus {
  private handlers: Map<string, EventHandler[]> = new Map();

  public subscribe(event: string, handler: EventHandler): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)?.push(handler);
  }

  public publish(event: string, data: any): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  public clear(): void {
    this.handlers.clear();
  }
}
