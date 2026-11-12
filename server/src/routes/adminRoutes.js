import express from 'express';
import mongoose from 'mongoose';
import Dish from '../models/Dish.js';

const router = express.Router();

/**
 * Middleware: Verify Admin Password via Header
 */
export function requireAdmin(req, res, next) {
  const adminPassword = req.headers['x-admin-password'];
  const expectedPassword = process.env.ADMIN_PASSWORD || 'change_this_to_a_secure_password';

  if (!adminPassword || adminPassword !== expectedPassword) {
    return res.status(401).json({ error: 'Unauthorized: Invalid admin password' });
  }
  next();
}

// Apply admin auth to all routes in this router
router.use(requireAdmin);

/**
 * GET /api/admin/verify
 * Validate credentials
 */
router.get('/verify', (req, res) => {
  res.json({ ok: true, message: 'Admin authenticated' });
});

/**
 * GET /api/admin/dishes
 * Filterable dish list for admin dashboard
 * Query params: q, isSample, restaurantName
 */
router.get('/dishes', async (req, res) => {
  try {
    const { q, isSample, restaurantName } = req.query;
    let query = {};

    if (q && q.trim()) {
      const sanitized = q.trim();
      query.$or = [
        { name: { $regex: sanitized, $options: 'i' } },
        { aliases: { $regex: sanitized, $options: 'i' } },
        { restaurantName: { $regex: sanitized, $options: 'i' } },
      ];
    }

    if (isSample === 'true') {
      query.isSample = true;
    } else if (isSample === 'false') {
      query.isSample = false;
    }

    if (restaurantName && restaurantName.trim()) {
      query.restaurantName = restaurantName.trim();
    }

    const dishes = await Dish.find(query).sort({ updatedAt: -1 });

    // Distinct list of restaurants for filtering dropdown
    const restaurants = await Dish.distinct('restaurantName');

    res.json({ dishes, restaurants, count: dishes.length });
  } catch (error) {
    console.error('Admin fetch error:', error);
    res.status(500).json({ error: 'Failed to retrieve dishes' });
  }
});

/**
 * POST /api/admin/dishes
 * Create a new dish
 */
router.post('/dishes', async (req, res) => {
  try {
    const data = req.body;

    // Enforce Rule: When source is "weighed", confidenceLevel is high and restaurantName & weighedOn are required
    if (data.source === 'weighed') {
      data.confidenceLevel = 'high';
      if (!data.restaurantName || !data.restaurantName.trim()) {
        return res.status(400).json({ error: 'restaurantName is required when source is weighed' });
      }
      if (!data.weighedOn) {
        return res.status(400).json({ error: 'weighedOn date is required when source is weighed' });
      }
    }

    // Default portion validation
    if (!data.portions || data.portions.length === 0) {
      return res.status(400).json({ error: 'At least one portion is required' });
    }

    if (!data.defaultPortionKey) {
      data.defaultPortionKey = data.portions[0].key;
    }

    const newDish = new Dish(data);
    await newDish.save();

    res.status(201).json({ ok: true, dish: newDish });
  } catch (error) {
    console.error('Admin create dish error:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * PUT /api/admin/dishes/:id
 * Edit an existing dish
 */
router.put('/dishes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Invalid dish ID' });
    }

    const data = req.body;

    // Enforce Rule: When source is "weighed", confidenceLevel is high and restaurantName & weighedOn are required
    if (data.source === 'weighed') {
      data.confidenceLevel = 'high';
      if (!data.restaurantName || !data.restaurantName.trim()) {
        return res.status(400).json({ error: 'restaurantName is required when source is weighed' });
      }
      if (!data.weighedOn) {
        return res.status(400).json({ error: 'weighedOn date is required when source is weighed' });
      }
    }

    const updatedDish = await Dish.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!updatedDish) {
      return res.status(404).json({ error: 'Dish not found' });
    }

    res.json({ ok: true, dish: updatedDish });
  } catch (error) {
    console.error('Admin update dish error:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * DELETE /api/admin/dishes/:id
 * Remove a dish
 */
router.delete('/dishes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Invalid dish ID' });
    }

    const deleted = await Dish.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Dish not found' });
    }

    res.json({ ok: true, message: `Dish '${deleted.name}' deleted successfully` });
  } catch (error) {
    console.error('Admin delete dish error:', error);
    res.status(500).json({ error: 'Failed to delete dish' });
  }
});

/**
 * GET /api/admin/export-csv
 * Export dishes as CSV
 */
router.get('/export-csv', async (req, res) => {
  try {
    const dishes = await Dish.find().sort({ restaurantName: 1, name: 1 });

    const headers = [
      'Name',
      'Restaurant',
      'City',
      'Veg/Non-Veg',
      'Source',
      'Confidence',
      'Sample Data',
      'Verified',
      'Weighed On',
      'Default Portion',
      'kcal/100g',
      'Protein/100g',
      'Carbs/100g',
      'Fat/100g',
      'Fibre/100g',
      'Sodium/100g',
      'Portions Count',
      'Modifiers Count',
      'Notes',
    ];

    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = dishes.map((d) => [
      escapeCsv(d.name),
      escapeCsv(d.restaurantName),
      escapeCsv(d.city),
      escapeCsv(d.isVeg ? 'Veg' : 'Non-Veg'),
      escapeCsv(d.source),
      escapeCsv(d.confidenceLevel),
      escapeCsv(d.isSample ? 'Yes' : 'No'),
      escapeCsv(d.verified ? 'Yes' : 'No'),
      escapeCsv(d.weighedOn ? new Date(d.weighedOn).toISOString().slice(0, 10) : ''),
      escapeCsv(d.defaultPortionKey),
      escapeCsv(d.per100g?.kcal),
      escapeCsv(d.per100g?.protein),
      escapeCsv(d.per100g?.carbs),
      escapeCsv(d.per100g?.fat),
      escapeCsv(d.per100g?.fibre),
      escapeCsv(d.per100g?.sodium),
      escapeCsv(d.portions?.length || 0),
      escapeCsv(d.modifiers?.length || 0),
      escapeCsv(d.notes),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="nutrilabel-dishes.csv"');
    res.send(csvContent);
  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({ error: 'Failed to generate CSV' });
  }
});

export default router;

