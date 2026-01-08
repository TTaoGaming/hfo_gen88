import { describe, it, expect } from 'vitest';
import { ApiGateway } from './api-gateway';

describe('P1_WEB_WEAVER Sub 7: API Gateway', () => {
  const gateway = new ApiGateway();

  it('should route request to registered handler', () => {
    gateway.addRoute(0, (req) => ({ status: 'SUCCESS', data: { echo: req.payload } }));
    
    const resp = gateway.handle({ port: 0, verb: 'SENSE', payload: 'hello' });
    expect(resp.status).toBe('SUCCESS');
    expect(resp.data.echo).toBe('hello');
  });

  it('should return failure for unknown port', () => {
    const resp = gateway.handle({ port: 99, verb: 'VOOR', payload: {} });
    expect(resp.status).toBe('FAILURE');
    expect(resp.error).toContain('No handler registered');
  });
});
