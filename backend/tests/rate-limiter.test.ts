import { describe, it, expect } from 'vitest';
import { createRateLimiter } from '../src/middleware/rate-limiter.middleware';
import { Request, Response } from 'express';

describe('Rate Limiter Middleware', () => {
  function mockReqRes(ip = '127.0.0.1') {
    const req = {
      headers: {},
      ip,
      socket: { remoteAddress: ip }
    } as unknown as Request;

    const headers: Record<string, any> = {};
    let statusCode = 200;
    let jsonBody: any = null;

    const res = {
      setHeader: (name: string, value: any) => {
        headers[name.toLowerCase()] = value;
      },
      getHeader: (name: string) => headers[name.toLowerCase()],
      status: (code: number) => {
        statusCode = code;
        return res;
      },
      json: (body: any) => {
        jsonBody = body;
        return res;
      }
    } as unknown as Response;

    return { req, res, headers, getStatusCode: () => statusCode, getJson: () => jsonBody };
  }

  it('allows requests within the limit and sets rate limit headers', () => {
    const limiter = createRateLimiter({ windowMs: 10000, max: 3 });
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    const { req, res, headers } = mockReqRes('10.0.0.1');

    limiter(req, res, next);
    expect(nextCalled).toBe(true);
    expect(headers['x-ratelimit-limit']).toBe(3);
    expect(headers['x-ratelimit-remaining']).toBe(2);
  });

  it('blocks requests that exceed the limit with 429 status and retry-after header', () => {
    const limiter = createRateLimiter({ windowMs: 10000, max: 2, message: 'Too many attempts' });
    const next = () => {};

    const { req: req1, res: res1 } = mockReqRes('10.0.0.2');
    limiter(req1, res1, next);

    const { req: req2, res: res2 } = mockReqRes('10.0.0.2');
    limiter(req2, res2, next);

    const { req: req3, res: res3, headers: h3, getStatusCode, getJson } = mockReqRes('10.0.0.2');
    limiter(req3, res3, next);

    expect(getStatusCode()).toBe(429);
    expect(h3['retry-after']).toBeGreaterThan(0);
    expect(getJson().success).toBe(false);
    expect(getJson().error).toBe('Too many attempts');
  });

  it('tracks distinct IP addresses independently', () => {
    const limiter = createRateLimiter({ windowMs: 10000, max: 1 });
    const next = () => {};

    const { req: req1, res: res1 } = mockReqRes('192.168.1.1');
    limiter(req1, res1, next);

    // Different IP should still have remaining allowance
    const { req: req2, res: res2, getStatusCode } = mockReqRes('192.168.1.2');
    limiter(req2, res2, next);
    expect(getStatusCode()).toBe(200);
  });
});
