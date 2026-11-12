import express from 'express';
import mongoose from 'mongoose';
import Dish from '../models/Dish.js';
import { calculateEstimate } from '../utils/estimateNutrition.js';
import { formatAlternativeComparison } from '../utils/rules.js';

const router = express.Router();

/**
 * GET /api/dishes?q=
 * Search dishes by name or aliases (case-insensitive), returns maximum 10 results.
 */
router.get('/dishes', async (req, res) => {
  try {
    const { q } = req.query;
    let query = {};

    if (q && q.trim()) {
      const sanitized = q.trim();
      query = {
        $or: [
          { name: { $regex: sanitized, $options: 'i' } },
          { aliases: { $regex: sanitized, $options: 'i' } },
        ],
      };
    }

    const dishes = await Dish.find(query).limit(10);
    res.json(dishes);
  } catch (error) {
    console.error('Error fetching dishes:', error);
    res.status(500).json({ error: 'Internal server error while searching dishes' });
  }
});

/**
 * GET /api/dishes/:id/alternatives
 * Returns up to 3 dishes with the same restaurantName and lower default-portion kcal,
 * sorted by kcal saved. Shows "300 kcal less, +12 g protein" style text.
 */
router.get('/dishes/:id/alternatives', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Dish not found' });
    }

    const baseDish = await Dish.findById(id);
    if (!baseDish) {
      return res.status(404).json({ error: 'Dish not found' });
    }

    const basePortion =
      baseDish.portions?.find((p) => p.key === baseDish.defaultPortionKey) ||
      baseDish.portions?.[0] || { grams: 250, label: 'Standard portion' };

    const baseKcal = ((baseDish.per100g?.kcal || 0) * basePortion.grams) / 100;
    const baseProtein = ((baseDish.per100g?.protein || 0) * basePortion.grams) / 100;

    // Find other dishes from the same restaurant
    const candidates = await Dish.find({
      restaurantName: baseDish.restaurantName,
      _id: { $ne: baseDish._id },
    });

    const alternatives = candidates
      .map((alt) => {
        const altPortion =
          alt.portions?.find((p) => p.key === alt.defaultPortionKey) ||
          alt.portions?.[0] || { grams: 250, label: 'Standard portion' };

        const altKcal = ((alt.per100g?.kcal || 0) * altPortion.grams) / 100;
        const altProtein = ((alt.per100g?.protein || 0) * altPortion.grams) / 100;
        const kcalSaved = Math.round(baseKcal - altKcal);
        const proteinDiff = Math.round(altProtein - baseProtein);

        return {
          dish: alt,
          defaultPortion: altPortion,
          altKcal: Math.round(altKcal),
          altProtein: Math.round(altProtein),
          kcalSaved,
          proteinDiff,
          comparisonText: formatAlternativeComparison(baseKcal, baseProtein, altKcal, altProtein),
        };
      })
      .filter((item) => item.kcalSaved > 0)
      .sort((a, b) => b.kcalSaved - a.kcalSaved)
      .slice(0, 3);

    res.json(alternatives);
  } catch (error) {
    console.error('Error fetching alternatives:', error);
    res.status(500).json({ error: 'Internal server error while fetching alternatives' });
  }
});

/**
 * GET /api/dishes/:id
 * Retrieve a single dish by MongoDB ID.
 */
router.get('/dishes/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Dish not found' });
    }

    const dish = await Dish.findById(id);
    if (!dish) {
      return res.status(404).json({ error: 'Dish not found' });
    }

    res.json(dish);
  } catch (error) {
    console.error('Error fetching dish by ID:', error);
    res.status(500).json({ error: 'Internal server error while retrieving dish' });
  }
});

/**
 * POST /api/estimate
 * Calculates low-to-high nutritional ranges based on portion, modifiers, or custom gram weights.
 * Body: { dishId, portionKey, quantity, customGrams, modifiers: [keys] }
 */
router.post('/estimate', async (req, res) => {
  try {
    const { dishId, portionKey, quantity, customGrams, modifiers } = req.body;

    if (!dishId) {
      return res.status(400).json({ error: 'dishId is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(dishId)) {
      return res.status(404).json({ error: 'Dish not found' });
    }

    const dish = await Dish.findById(dishId);
    if (!dish) {
      return res.status(404).json({ error: 'Dish not found' });
    }

    const estimate = calculateEstimate(dish, {
      portionKey,
      quantity,
      customGrams,
      modifiers,
    });

    res.json(estimate);
  } catch (error) {
    // Return 400 for validation rules (quantity 1-20, grams 20-3000, invalid portion, etc.)
    res.status(400).json({ error: error.message });
  }
});

export default router;

