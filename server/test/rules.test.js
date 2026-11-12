import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateVerdict,
  suggestPortionSwap,
  formatAlternativeComparison,
  VERDICT_THRESHOLDS,
  PORTION_SWAP_THRESHOLD_PCT,
} from '../src/utils/rules.js';

describe('NutriLabel Core Rules Engine (rules.js)', () => {
  // 1. Verdict per dish tests
  describe('Verdict per dish (uses HIGH value of estimate)', () => {
    describe('Weight loss mode', () => {
      const dailyTargetKcal = 2000;
      // Good <= 25% (500 kcal), Okay <= 40% (800 kcal), Heavy > 40%

      it('returns Good when kcal.high is <= 25% of daily target', () => {
        const estimate = {
          nutrients: {
            kcal: { value: 400, low: 350, high: 450 }, // 450 <= 500
          },
        };
        const verdict = calculateVerdict(estimate, 'weight_loss', dailyTargetKcal);
        assert.equal(verdict, 'Good');
      });

      it('returns Okay when kcal.high is > 25% and <= 40% of daily target', () => {
        const estimate = {
          nutrients: {
            kcal: { value: 600, low: 520, high: 700 }, // 700 > 500 and <= 800
          },
        };
        const verdict = calculateVerdict(estimate, 'weight_loss', dailyTargetKcal);
        assert.equal(verdict, 'Okay');
      });

      it('returns Heavy when kcal.high is > 40% of daily target', () => {
        const estimate = {
          nutrients: {
            kcal: { value: 750, low: 650, high: 850 }, // 850 > 800
          },
        };
        const verdict = calculateVerdict(estimate, 'weight_loss', dailyTargetKcal);
        assert.equal(verdict, 'Heavy');
      });

      it('respects custom daily targets (e.g. 1500 kcal)', () => {
        const customTarget = 1500; // 25% is 375, 40% is 600
        const estimate = {
          nutrients: {
            kcal: { value: 340, low: 300, high: 370 }, // <= 375 -> Good
          },
        };
        assert.equal(calculateVerdict(estimate, 'weight_loss', customTarget), 'Good');

        const estimateHeavy = {
          nutrients: {
            kcal: { value: 550, low: 480, high: 620 }, // > 600 -> Heavy
          },
        };
        assert.equal(calculateVerdict(estimateHeavy, 'weight_loss', customTarget), 'Heavy');
      });
    });

    describe('Muscle gain mode', () => {
      // Good >= 30g, Okay >= 15g, Heavy < 15g
      it('returns Good when protein.high >= 30 g', () => {
        const estimate = {
          nutrients: {
            protein: { value: 28, low: 24, high: 32 },
          },
        };
        assert.equal(calculateVerdict(estimate, 'muscle_gain'), 'Good');
      });

      it('returns Okay when protein.high is between 15 g and 29.9 g', () => {
        const estimate = {
          nutrients: {
            protein: { value: 16, low: 14, high: 18 },
          },
        };
        assert.equal(calculateVerdict(estimate, 'muscle_gain'), 'Okay');
      });

      it('returns Heavy when protein.high < 15 g', () => {
        const estimate = {
          nutrients: {
            protein: { value: 10, low: 8, high: 12 },
          },
        };
        assert.equal(calculateVerdict(estimate, 'muscle_gain'), 'Heavy');
      });
    });

    describe('Low carb mode', () => {
      // Good <= 30g, Okay <= 60g, Heavy > 60g
      it('returns Good when carbs.high <= 30 g', () => {
        const estimate = {
          nutrients: {
            carbs: { value: 22, low: 18, high: 26 },
          },
        };
        assert.equal(calculateVerdict(estimate, 'low_carb'), 'Good');
      });

      it('returns Okay when carbs.high is between 31 g and 60 g', () => {
        const estimate = {
          nutrients: {
            carbs: { value: 45, low: 38, high: 52 },
          },
        };
        assert.equal(calculateVerdict(estimate, 'low_carb'), 'Okay');
      });

      it('returns Heavy when carbs.high > 60 g', () => {
        const estimate = {
          nutrients: {
            carbs: { value: 70, low: 62, high: 78 },
          },
        };
        assert.equal(calculateVerdict(estimate, 'low_carb'), 'Heavy');
      });
    });
  });

  // 4. Portion swap tests
  describe('Portion swap rule (plain rule, no AI)', () => {
    const mockDish = {
      name: 'Kongu Chicken Biryani',
      restaurantName: 'Kongu Kitchen',
      variancePercent: 20,
      per100g: {
        kcal: 180,
        protein: 9,
        carbs: 22,
        fat: 7,
      },
      portions: [
        { key: 'small', label: 'Small Box', grams: 250 },
        { key: 'regular', label: 'Regular Plate', grams: 400 },
        { key: 'large', label: 'Large Box', grams: 650 },
      ],
      defaultPortionKey: 'regular',
      modifiers: [],
    };

    it('returns null when high calories <= 40% of daily target', () => {
      // Small portion = 250g * 1.8 = 450 kcal, high = 540 kcal <= 800 kcal limit
      const currentEstimate = {
        grams: 250,
        nutrients: {
          kcal: { value: 450, low: 360, high: 540 },
        },
      };

      const suggestion = suggestPortionSwap(
        mockDish,
        { portionKey: 'small', quantity: 1 },
        currentEstimate,
        2000
      );

      assert.equal(suggestion, null, 'No swap should be suggested when within limits');
    });

    it('suggests a smaller portion size when high calories > 40% of daily target (single serving)', () => {
      // Large portion = 650g * 1.8 = 1170 kcal, high = 1404 kcal > 800 kcal limit (40% of 2000)
      const currentEstimate = {
        grams: 650,
        nutrients: {
          kcal: { value: 1170, low: 936, high: 1404 },
        },
      };

      const suggestion = suggestPortionSwap(
        mockDish,
        { portionKey: 'large', quantity: 1 },
        currentEstimate,
        2000
      );

      assert.ok(suggestion, 'Should provide a portion swap suggestion');
      assert.equal(suggestion.type, 'smaller_portion');
      assert.equal(suggestion.suggestedPortionKey, 'regular');
      assert.equal(suggestion.suggestedLabel, 'Regular Plate');
      assert.ok(suggestion.newEstimate.nutrients.kcal.value < currentEstimate.nutrients.kcal.value);
      assert.ok(suggestion.kcalSaved > 0);
      assert.ok(suggestion.comparisonText.includes('kcal less'));
    });

    it('suggests reducing quantity when user selected multiple servings (> 1)', () => {
      // 2x Regular portion = 2 * 400g * 1.8 = 1440 kcal, high = 1728 kcal > 800 kcal
      const currentEstimate = {
        grams: 800,
        nutrients: {
          kcal: { value: 1440, low: 1152, high: 1728 },
        },
      };

      const suggestion = suggestPortionSwap(
        mockDish,
        { portionKey: 'regular', quantity: 2 },
        currentEstimate,
        2000
      );

      assert.ok(suggestion);
      assert.equal(suggestion.type, 'quantity_stepdown');
      assert.equal(suggestion.suggestedQuantity, 1);
      assert.equal(suggestion.grams, 400);
      assert.ok(suggestion.kcalSaved > 0);
    });

    it('suggests downscaling when custom grams are excessively large', () => {
      // Custom grams: 700g
      const currentEstimate = {
        grams: 700,
        nutrients: {
          kcal: { value: 1260, low: 1008, high: 1512 },
        },
      };

      const suggestion = suggestPortionSwap(
        mockDish,
        { customGrams: 700, portionKey: 'custom' },
        currentEstimate,
        2000
      );

      assert.ok(suggestion);
      assert.ok(suggestion.suggestedCustomGrams < 700);
      assert.ok(suggestion.kcalSaved > 0);
    });
  });

  // 3. Alternative comparison formatter
  describe('formatAlternativeComparison helper', () => {
    it('formats comparison text with both kcal savings and protein delta', () => {
      const text = formatAlternativeComparison(650, 18, 350, 30);
      assert.equal(text, '300 kcal less, +12 g protein');
    });

    it('formats comparison text when protein is less', () => {
      const text = formatAlternativeComparison(500, 20, 350, 15);
      assert.equal(text, '150 kcal less, -5 g protein');
    });

    it('formats comparison text when protein is identical', () => {
      const text = formatAlternativeComparison(500, 20, 300, 20);
      assert.equal(text, '200 kcal less');
    });
  });
});

