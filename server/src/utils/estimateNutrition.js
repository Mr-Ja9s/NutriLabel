/**
 * NutriLabel Estimation Engine
 * 
 * Rules:
 * 1. Never show one exact number. Always show a range (low to high).
 * 2. Never invent nutrition data. Missing data stays null.
 * 3. Supports portion units or custom gram overrides.
 * 4. Modifiers reflect hidden calorie adjustments.
 */

const NUTRITION_KEYS = [
  'kcal',
  'protein',
  'carbs',
  'fat',
  'fibre',
  'sugar',
  'sodium',
  'iron',
  'calcium',
  'vitaminA',
  'vitaminC',
  'vitaminB12',
];

/**
 * Helper to round to 2 decimal places to avoid floating point anomalies.
 */
export function roundToTwo(num) {
  if (num === null || num === undefined) return null;
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Calculate estimated nutritional ranges for a dish.
 * 
 * @param {Object} dish - The dish document or object
 * @param {Object} options
 * @param {string} [options.portionKey] - Key of the selected portion
 * @param {number} [options.quantity=1] - Portion multiplier (1 - 20)
 * @param {number} [options.customGrams] - Optional manual gram weight (20 - 3000)
 * @param {string[]} [options.modifiers=[]] - Array of modifier keys selected
 * @returns {Object} Estimated ranges, kJ, metadata, and applied weight
 */
export function calculateEstimate(dish, { portionKey, quantity = 1, customGrams, modifiers = [] } = {}) {
  if (!dish) {
    throw new Error('Dish is required for calculation');
  }

  // Validate quantity (Rule 6: between 1 and 20)
  const qty = quantity === undefined || quantity === null ? 1 : Number(quantity);
  if (isNaN(qty) || !Number.isInteger(qty) || qty < 1 || qty > 20) {
    throw new Error('Quantity must be an integer between 1 and 20');
  }

  // 1. Determine base grams
  let baseGrams = 0;
  if (customGrams !== undefined && customGrams !== null && customGrams !== '') {
    baseGrams = Number(customGrams);
    if (isNaN(baseGrams)) {
      throw new Error('Custom grams must be a valid number');
    }
  } else {
    const selectedKey = portionKey || dish.defaultPortionKey;
    const portion = dish.portions?.find((p) => p.key === selectedKey);
    if (!portion) {
      throw new Error(`Portion '${selectedKey}' not found on dish`);
    }
    baseGrams = portion.grams * qty;
  }

  // Find active modifiers
  const selectedKeys = Array.isArray(modifiers) ? modifiers : [];
  const activeModifiers = (dish.modifiers || []).filter((m) => selectedKeys.includes(m.key));

  // Add gramsDelta of selected modifiers
  const modifierGramsDelta = activeModifiers.reduce(
    (sum, m) => sum + (m.gramsDelta !== null && m.gramsDelta !== undefined ? m.gramsDelta : 0),
    0
  );

  const totalGrams = baseGrams + modifierGramsDelta;

  // Validate total grams (Rule 6: between 20 and 3000)
  if (totalGrams < 20 || totalGrams > 3000) {
    throw new Error('Total grams must be between 20 and 3000');
  }

  // 2. Each nutrient = per100g value * grams / 100
  // 3. Add modifier deltas for kcal, protein, carbs and fat (skip nulls)
  // 4. For every nutrient return { value, low, high } with variancePercent
  const variancePercent =
    dish.variancePercent !== undefined && dish.variancePercent !== null
      ? dish.variancePercent
      : 25;

  const nutrients = {};

  for (const key of NUTRITION_KEYS) {
    const per100 = dish.per100g?.[key];

    // Rule 2: Never invent nutrition data. Missing data stays null.
    if (per100 === null || per100 === undefined) {
      nutrients[key] = null;
      continue;
    }

    let baseVal = (per100 * totalGrams) / 100;

    // Apply modifier deltas for macros and calories
    if (['kcal', 'protein', 'carbs', 'fat'].includes(key)) {
      const deltaKey = `${key}Delta`;
      const modDelta = activeModifiers.reduce((sum, m) => {
        const val = m[deltaKey];
        return sum + (val !== null && val !== undefined ? val : 0);
      }, 0);
      baseVal += modDelta;
    }

    // Floor at zero to prevent negative nutrients
    const finalVal = Math.max(0, baseVal);
    const low = Math.max(0, finalVal * (1 - variancePercent / 100));
    const high = finalVal * (1 + variancePercent / 100);

    nutrients[key] = {
      value: roundToTwo(finalVal),
      low: roundToTwo(low),
      high: roundToTwo(high),
    };
  }

  // 5. Return kJ (kcal * 4.184), grams used, confidenceLevel, source, isSample.
  let kJ = null;
  if (nutrients.kcal !== null) {
    kJ = {
      value: roundToTwo(nutrients.kcal.value * 4.184),
      low: roundToTwo(nutrients.kcal.low * 4.184),
      high: roundToTwo(nutrients.kcal.high * 4.184),
    };
  }

  return {
    grams: roundToTwo(totalGrams),
    nutrients,
    kJ,
    confidenceLevel: dish.confidenceLevel || 'low',
    source: dish.source || 'estimate',
    isSample: Boolean(dish.isSample),
    variancePercent,
  };
}

