/**
 * 🕸️ P1-SUB-7: API GATEWAY
 * Mocks an API gateway for routing external requests to Port commanders.
 */

export interface Request {
  port: number;
  verb: string;
  payload: any;
}

export interface Response {
  status: 'SUCCESS' | 'FAILURE';
  data?: any;
  error?: string;
}

export class ApiGateway {
  private routes: Map<number, (req: Request) => Response> = new Map();

  public addRoute(port: number, handler: (req: Request) => Response): void {
    this.routes.set(port, handler);
  }

  public handle(request: Request): Response {
    const handler = this.routes.get(request.port);
    if (!handler) {
      return { status: 'FAILURE', error: `No handler registered for port ${request.port}` };
    }
    return handler(request);
  }
}
