import { calculateEstimate } from './estimateNutrition.js';

/**
 * NutriLabel Core Nutrition & Swapping Rules
 * All threshold constants are defined at the top of the file.
 */

// 1. Verdict Threshold Constants
export const VERDICT_THRESHOLDS = {
  WEIGHT_LOSS: {
    GOOD_PCT: 0.25, // <= 25% of daily target
    OKAY_PCT: 0.40, // <= 40% of daily target
  },
  MUSCLE_GAIN: {
    GOOD_PROTEIN_G: 30, // >= 30 g
    OKAY_PROTEIN_G: 15, // >= 15 g
  },
  LOW_CARB: {
    GOOD_CARBS_G: 30, // <= 30 g
    OKAY_CARBS_G: 60, // <= 60 g
  },
};

// 4. Portion Swap Threshold Constant
// Trigger portion swap if one item's high calories exceeds 40% of the daily target
export const PORTION_SWAP_THRESHOLD_PCT = 0.40;

/**
 * 1. Calculate Verdict per dish (uses the HIGH value of the estimate)
 * 
 * Rules:
 * - Weight loss: Good if kcal <= 25% of daily target, Okay if <= 40%, else Heavy.
 * - Muscle gain: Good if protein >= 30 g, Okay if >= 15 g, else Heavy.
 * - Low carb: Good if carbs <= 30 g, Okay if <= 60 g, else Heavy.
 * 
 * @param {Object} estimate - Calculated estimate object with nutrients
 * @param {string} goalMode - 'weight_loss' | 'muscle_gain' | 'low_carb'
 * @param {number} [dailyTargetKcal=2000] - User's daily calorie budget
 * @returns {'Good' | 'Okay' | 'Heavy'}
 */
export function calculateVerdict(estimate, goalMode = 'weight_loss', dailyTargetKcal = 2000) {
  if (!estimate || !estimate.nutrients) {
    return 'Okay';
  }

  const kcalHigh = estimate.nutrients.kcal?.high ?? estimate.nutrients.kcal?.value ?? 0;
  const proteinHigh = estimate.nutrients.protein?.high ?? estimate.nutrients.protein?.value ?? 0;
  const carbsHigh = estimate.nutrients.carbs?.high ?? estimate.nutrients.carbs?.value ?? 0;

  switch (goalMode) {
    case 'weight_loss': {
      const goodThreshold = dailyTargetKcal * VERDICT_THRESHOLDS.WEIGHT_LOSS.GOOD_PCT;
      const okayThreshold = dailyTargetKcal * VERDICT_THRESHOLDS.WEIGHT_LOSS.OKAY_PCT;

      if (kcalHigh <= goodThreshold) return 'Good';
      if (kcalHigh <= okayThreshold) return 'Okay';
      return 'Heavy';
    }

    case 'muscle_gain': {
      if (proteinHigh >= VERDICT_THRESHOLDS.MUSCLE_GAIN.GOOD_PROTEIN_G) return 'Good';
      if (proteinHigh >= VERDICT_THRESHOLDS.MUSCLE_GAIN.OKAY_PROTEIN_G) return 'Okay';
      return 'Heavy';
    }

    case 'low_carb': {
      if (carbsHigh <= VERDICT_THRESHOLDS.LOW_CARB.GOOD_CARBS_G) return 'Good';
      if (carbsHigh <= VERDICT_THRESHOLDS.LOW_CARB.OKAY_CARBS_G) return 'Okay';
      return 'Heavy';
    }

    default:
      return 'Okay';
  }
}

/**
 * 4. Portion swap (plain rule, no AI)
 * If one item's high calories is more than 40% of the daily target,
 * suggest a smaller portion that fits the remaining budget and show the new numbers.
 * 
 * @param {Object} dish - Mongoose dish document or object
 * @param {Object} currentParams - { portionKey, quantity, customGrams, modifiers }
 * @param {Object} currentEstimate - Output of calculateEstimate
 * @param {number} [dailyTargetKcal=2000] - User's daily target in kcal
 * @param {number} [remainingBudgetKcal=null] - Calories remaining in today's budget
 * @returns {Object|null} Suggestion object with new numbers, or null if within limits
 */
export function suggestPortionSwap(
  dish,
  currentParams,
  currentEstimate,
  dailyTargetKcal = 2000,
  remainingBudgetKcal = null
) {
  if (!dish || !currentEstimate || !currentEstimate.nutrients?.kcal) {
    return null;
  }

  const kcalHigh = currentEstimate.nutrients.kcal.high;
  const triggerLimit = dailyTargetKcal * PORTION_SWAP_THRESHOLD_PCT;

  // Only trigger if high calories > 40% of daily target
  if (kcalHigh <= triggerLimit) {
    return null;
  }

  const { portionKey, quantity = 1, customGrams, modifiers = [] } = currentParams;

  // Case A: If user selected multiple servings (quantity > 1), suggest stepping down to 1 serving
  if (quantity > 1) {
    const suggestedQuantity = 1;
    const newEstimate = calculateEstimate(dish, {
      portionKey,
      quantity: suggestedQuantity,
      modifiers,
    });

    const activePortion = dish.portions?.find((p) => p.key === portionKey) || {
      label: 'Serving',
      grams: 250,
    };
    const savedKcal = Math.round(
      currentEstimate.nutrients.kcal.value - newEstimate.nutrients.kcal.value
    );

    return {
      type: 'quantity_stepdown',
      suggestedPortionKey: portionKey,
      suggestedQuantity,
      suggestedLabel: `1x ${activePortion.label}`,
      grams: newEstimate.grams,
      newEstimate,
      kcalSaved: Math.max(0, savedKcal),
      comparisonText: `${savedKcal} kcal less`,
      reason: `Serving exceeds 40% of daily budget (${Math.round(triggerLimit)} kcal). Scale to 1 serving.`,
    };
  }

  // Case B: If using custom grams, suggest a smaller gram weight that fits
  if (customGrams && customGrams > 100) {
    const suggestedCustomGrams = Math.max(50, Math.round(customGrams * 0.65));
    const newEstimate = calculateEstimate(dish, {
      customGrams: suggestedCustomGrams,
      modifiers,
    });

    const savedKcal = Math.round(
      currentEstimate.nutrients.kcal.value - newEstimate.nutrients.kcal.value
    );

    return {
      type: 'custom_grams_reduction',
      suggestedCustomGrams,
      suggestedLabel: `${suggestedCustomGrams}g custom`,
      grams: newEstimate.grams,
      newEstimate,
      kcalSaved: Math.max(0, savedKcal),
      comparisonText: `${savedKcal} kcal less`,
      reason: `Serving exceeds 40% of daily budget (${Math.round(triggerLimit)} kcal). Reduce weight from ${customGrams}g to ${suggestedCustomGrams}g.`,
    };
  }

  // Case C: Look for a smaller portion size in dish.portions
  const currentPortion = dish.portions?.find((p) => p.key === portionKey);
  const currentGrams = currentPortion?.grams || currentEstimate.grams;

  const smallerPortions = (dish.portions || [])
    .filter((p) => p.grams < currentGrams)
    .sort((a, b) => b.grams - a.grams); // nearest smaller first

  for (const smaller of smallerPortions) {
    const newEstimate = calculateEstimate(dish, {
      portionKey: smaller.key,
      quantity: 1,
      modifiers,
    });

    const savedKcal = Math.round(
      currentEstimate.nutrients.kcal.value - newEstimate.nutrients.kcal.value
    );

    return {
      type: 'smaller_portion',
      suggestedPortionKey: smaller.key,
      suggestedQuantity: 1,
      suggestedLabel: smaller.label,
      grams: newEstimate.grams,
      newEstimate,
      kcalSaved: Math.max(0, savedKcal),
      comparisonText: `${savedKcal} kcal less`,
      reason: `Serving exceeds 40% of daily budget (${Math.round(triggerLimit)} kcal). Switch to ${smaller.label}.`,
    };
  }

  return null;
}

/**
 * 3. Calculate comparison text for same-restaurant alternatives
 * Formats: "300 kcal less, +12 g protein" or "250 kcal less"
 */
export function formatAlternativeComparison(baseDishKcal, baseDishProtein, altKcal, altProtein) {
  const kcalSaved = Math.round(baseDishKcal - altKcal);
  const proteinDiff = Math.round(altProtein - baseDishProtein);

  if (proteinDiff !== 0) {
    const proteinSign = proteinDiff > 0 ? `+${proteinDiff}` : `${proteinDiff}`;
    return `${kcalSaved} kcal less, ${proteinSign} g protein`;
  }

  return `${kcalSaved} kcal less`;
}

