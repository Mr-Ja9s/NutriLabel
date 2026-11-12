import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateEstimate } from '../src/utils/estimateNutrition.js';

describe('NutriLabel Estimate Logic', () => {
  // Required Test 1
  it('dish with 150 kcal per 100g, 500 grams, variancePercent 10 must return value 750, low 675, high 825', () => {
    const dummyDish = {
      name: 'Test Biryani',
      variancePercent: 10,
      confidenceLevel: 'medium',
      source: 'recipe',
      isSample: true,
      per100g: {
        kcal: 150,
        protein: 10,
        carbs: 20,
        fat: 5,
        fibre: null,
      },
      portions: [
        { key: 'regular', label: 'Regular', grams: 500 },
      ],
      defaultPortionKey: 'regular',
      modifiers: [],
    };

    const result = calculateEstimate(dummyDish, { customGrams: 500 });

    assert.equal(result.nutrients.kcal.value, 750, 'Value should be 750');
    assert.equal(result.nutrients.kcal.low, 675, 'Low should be 675');
    assert.equal(result.nutrients.kcal.high, 825, 'High should be 825');
  });

  // Required Test 2
  it('modifier with kcalDelta -100 lowers the value by 100', () => {
    const dummyDish = {
      name: 'Test Biryani with Oil Mod',
      variancePercent: 10,
      confidenceLevel: 'medium',
      source: 'recipe',
      isSample: true,
      per100g: {
        kcal: 150,
        protein: 10,
        carbs: 20,
        fat: 5,
      },
      portions: [
        { key: 'regular', label: 'Regular', grams: 500 },
      ],
      defaultPortionKey: 'regular',
      modifiers: [
        {
          key: 'less_oil',
          label: 'Less oil',
          gramsDelta: 0,
          kcalDelta: -100,
          proteinDelta: 0,
          carbsDelta: 0,
          fatDelta: -11,
        },
      ],
    };

    const baseResult = calculateEstimate(dummyDish, { customGrams: 500 });
    assert.equal(baseResult.nutrients.kcal.value, 750);

    const modifiedResult = calculateEstimate(dummyDish, {
      customGrams: 500,
      modifiers: ['less_oil'],
    });

    assert.equal(modifiedResult.nutrients.kcal.value, 650, 'Value should be lowered by 100 to 650');
    assert.equal(modifiedResult.nutrients.kcal.low, 585, 'Low should be 585');
    assert.equal(modifiedResult.nutrients.kcal.high, 715, 'High should be 715');
  });

  it('correctly calculates kJ from kcal (kcal * 4.184)', () => {
    const dummyDish = {
      variancePercent: 10,
      per100g: { kcal: 100 },
      portions: [{ key: 'regular', label: 'Regular', grams: 100 }],
      defaultPortionKey: 'regular',
    };

    const result = calculateEstimate(dummyDish);
    // 100 kcal * 4.184 = 418.4 kJ
    assert.equal(result.kJ.value, 418.4);
    assert.equal(result.kJ.low, 376.56);
    assert.equal(result.kJ.high, 460.24);
  });

  it('preserves null for missing nutrient data (Rule 2: Never invent data)', () => {
    const dummyDish = {
      variancePercent: 15,
      per100g: {
        kcal: 120,
        protein: null,
        calcium: null,
        vitaminB12: null,
      },
      portions: [{ key: 'regular', label: 'Regular', grams: 200 }],
      defaultPortionKey: 'regular',
    };

    const result = calculateEstimate(dummyDish);
    assert.equal(result.nutrients.protein, null);
    assert.equal(result.nutrients.calcium, null);
    assert.equal(result.nutrients.vitaminB12, null);
    assert.notEqual(result.nutrients.kcal, null);
  });

  it('scales by portion and quantity correctly', () => {
    const dummyDish = {
      variancePercent: 20,
      per100g: { kcal: 200, protein: 10 },
      portions: [
        { key: 'piece', label: '1 Parotta', grams: 75 },
      ],
      defaultPortionKey: 'piece',
    };

    // 2 pieces = 150 grams
    const result = calculateEstimate(dummyDish, { portionKey: 'piece', quantity: 2 });
    assert.equal(result.grams, 150);
    // 200 * 150 / 100 = 300 kcal
    assert.equal(result.nutrients.kcal.value, 300);
    assert.equal(result.nutrients.protein.value, 15);
  });

  it('adjusts total grams when modifier has gramsDelta', () => {
    const dummyDish = {
      variancePercent: 20,
      per100g: { kcal: 100 },
      portions: [{ key: 'regular', label: 'Regular', grams: 200 }],
      defaultPortionKey: 'regular',
      modifiers: [
        { key: 'extra_gravy', label: 'Extra gravy', gramsDelta: 50, kcalDelta: 40 },
      ],
    };

    const result = calculateEstimate(dummyDish, { modifiers: ['extra_gravy'] });
    assert.equal(result.grams, 250);
  });

  it('validates grams limits (between 20 and 3000)', () => {
    const dummyDish = {
      variancePercent: 20,
      per100g: { kcal: 100 },
      portions: [{ key: 'tiny', label: 'Tiny', grams: 10 }],
      defaultPortionKey: 'tiny',
    };

    assert.throws(
      () => calculateEstimate(dummyDish, { customGrams: 10 }),
      /Total grams must be between 20 and 3000/
    );

    assert.throws(
      () => calculateEstimate(dummyDish, { customGrams: 3500 }),
      /Total grams must be between 20 and 3000/
    );
  });

  it('validates quantity limits (between 1 and 20)', () => {
    const dummyDish = {
      variancePercent: 20,
      per100g: { kcal: 100 },
      portions: [{ key: 'regular', label: 'Regular', grams: 100 }],
      defaultPortionKey: 'regular',
    };

    assert.throws(
      () => calculateEstimate(dummyDish, { quantity: 0 }),
      /Quantity must be an integer between 1 and 20/
    );

    assert.throws(
      () => calculateEstimate(dummyDish, { quantity: 25 }),
      /Quantity must be an integer between 1 and 20/
    );
  });
});

