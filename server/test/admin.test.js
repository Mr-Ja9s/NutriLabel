import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { requireAdmin } from '../src/routes/adminRoutes.js';

describe('Admin Authentication & Validation Logic', () => {
  it('rejects requests missing x-admin-password header', () => {
    let statusCode = null;
    let jsonBody = null;
    const req = { headers: {} };
    const res = {
      status(code) {
        statusCode = code;
        return {
          json(body) {
            jsonBody = body;
          },
        };
      },
    };
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    requireAdmin(req, res, next);
    assert.equal(statusCode, 401);
    assert.equal(nextCalled, false);
    assert.ok(jsonBody?.error?.includes('Unauthorized'));
  });

  it('rejects requests with incorrect x-admin-password', () => {
    process.env.ADMIN_PASSWORD = 'supersecretadmin123';
    let statusCode = null;
    let jsonBody = null;
    const req = { headers: { 'x-admin-password': 'wrongpassword' } };
    const res = {
      status(code) {
        statusCode = code;
        return {
          json(body) {
            jsonBody = body;
          },
        };
      },
    };
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    requireAdmin(req, res, next);
    assert.equal(statusCode, 401);
    assert.equal(nextCalled, false);
    assert.ok(jsonBody?.error?.includes('Unauthorized'));
  });

  it('allows requests with valid x-admin-password', () => {
    process.env.ADMIN_PASSWORD = 'supersecretadmin123';
    const req = { headers: { 'x-admin-password': 'supersecretadmin123' } };
    const res = {};
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    requireAdmin(req, res, next);
    assert.equal(nextCalled, true);
  });

  it('enforces rules for source: "weighed" - confidenceLevel is high, restaurantName and weighedOn are required', () => {
    // Helper replicating route validation logic
    function validateDishData(data) {
      if (data.source === 'weighed') {
        data.confidenceLevel = 'high';
        if (!data.restaurantName || !data.restaurantName.trim()) {
          throw new Error('restaurantName is required when source is weighed');
        }
        if (!data.weighedOn) {
          throw new Error('weighedOn date is required when source is weighed');
        }
      }
      return data;
    }

    // 1. Missing restaurantName throws
    assert.throws(
      () => validateDishData({ source: 'weighed', weighedOn: '2026-11-12' }),
      /restaurantName is required/
    );

    // 2. Missing weighedOn throws
    assert.throws(
      () => validateDishData({ source: 'weighed', restaurantName: 'Kongu Kitchen' }),
      /weighedOn date is required/
    );

    // 3. Complete weighed data sets confidenceLevel to high
    const valid = validateDishData({
      source: 'weighed',
      restaurantName: 'Kongu Kitchen',
      weighedOn: '2026-11-12',
      confidenceLevel: 'low', // was initially low
    });
    assert.equal(valid.confidenceLevel, 'high');
  });

  it('correctly calculates per100g preview from weighed total nutrition', () => {
    const weighedGrams = 350;
    const weighedTotal = {
      kcal: 525,
      protein: 17.5,
      carbs: 70,
      fat: 14,
      sodium: 700,
    };

    // per100g = total / grams * 100
    const per100g = {};
    for (const [key, val] of Object.entries(weighedTotal)) {
      per100g[key] = val != null ? Math.round(((val / weighedGrams) * 100) * 10) / 10 : null;
    }

    assert.equal(per100g.kcal, 150);
    assert.equal(per100g.protein, 5);
    assert.equal(per100g.carbs, 20);
    assert.equal(per100g.fat, 4);
    assert.equal(per100g.sodium, 200);
  });
});

