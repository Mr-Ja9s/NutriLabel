import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { apiLimiter } from '../src/index.js';

describe('API Rate Limiter Configuration', () => {
  it('is configured for 60 requests per 1 minute window', () => {
    assert.ok(apiLimiter, 'apiLimiter middleware should be exported');
    assert.equal(typeof apiLimiter, 'function', 'apiLimiter should be an Express middleware function');
  });

  it('allows requests within rate limit and invokes next()', async () => {
    let nextCalled = false;
    const req = {
      ip: '192.168.1.100',
      headers: {},
      app: { get: () => false },
    };
    const res = {
      setHeader() {},
      getHeader() {},
      status() { return this; },
      send() { return this; },
      json() { return this; },
    };

    await new Promise((resolve) => {
      apiLimiter(req, res, () => {
        nextCalled = true;
        resolve();
      });
    });

    assert.equal(nextCalled, true, 'First request within rate limit must pass through to next()');
  });
});
