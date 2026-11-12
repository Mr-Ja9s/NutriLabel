import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Dish from '../src/models/Dish.js';
import { formatAlternativeComparison } from '../src/utils/rules.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nutrilabel';

describe('API Endpoints & Integration', () => {
  let dbAvailable = false;

  before(async () => {
    try {
      await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 2000 });
      dbAvailable = true;
    } catch {
      console.warn('MongoDB not reachable (sandbox mode or DB stopped), skipping integration queries.');
    }
  });

  after(async () => {
    if (dbAvailable) {
      await mongoose.disconnect();
    }
  });

  it('searches dishes by case-insensitive name or alias with max 10 results', async (t) => {
    if (!dbAvailable) {
      t.skip('MongoDB not reachable');
      return;
    }
    const dishes = await Dish.find({
      $or: [
        { name: { $regex: 'biryani', $options: 'i' } },
        { aliases: { $regex: 'biryani', $options: 'i' } },
      ],
    }).limit(10);

    assert.ok(dishes.length > 0, 'Should find at least 1 biryani dish');
    assert.ok(dishes[0].name.toLowerCase().includes('biryani'));
  });

  it('fetches a dish by ID', async (t) => {
    if (!dbAvailable) {
      t.skip('MongoDB not reachable');
      return;
    }
    const sample = await Dish.findOne();
    assert.ok(sample, 'Sample dish should exist in DB');

    const fetched = await Dish.findById(sample._id);
    assert.equal(fetched.name, sample.name);
  });

  it('finds same-restaurant alternatives with lower default portion kcal', async (t) => {
    if (!dbAvailable) {
      t.skip('MongoDB not reachable');
      return;
    }
    // Find Parotta or Biryani from Kongu Kitchen
    const base = await Dish.findOne({ restaurantName: 'Kongu Kitchen', name: 'Parotta' });
    if (!base) {
      t.skip('Sample dish not seeded');
      return;
    }

    const basePortion = base.portions.find(p => p.key === base.defaultPortionKey) || base.portions[0];
    const baseKcal = (base.per100g.kcal * basePortion.grams) / 100;
    const baseProtein = (base.per100g.protein * basePortion.grams) / 100;

    const alts = await Dish.find({
      restaurantName: base.restaurantName,
      _id: { $ne: base._id },
    });

    const alternatives = alts
      .map(alt => {
        const altPortion = alt.portions.find(p => p.key === alt.defaultPortionKey) || alt.portions[0];
        const altKcal = (alt.per100g.kcal * altPortion.grams) / 100;
        const altProtein = (alt.per100g.protein * altPortion.grams) / 100;
        const kcalSaved = Math.round(baseKcal - altKcal);
        return {
          dish: alt,
          kcalSaved,
          comparisonText: formatAlternativeComparison(baseKcal, baseProtein, altKcal, altProtein),
        };
      })
      .filter(item => item.kcalSaved > 0)
      .sort((a, b) => b.kcalSaved - a.kcalSaved);

    assert.ok(alternatives.length > 0, 'Should find at least 1 lighter alternative at Kongu Kitchen');
    assert.ok(alternatives[0].kcalSaved > 0);
    assert.ok(alternatives[0].comparisonText.includes('kcal less'));
  });
});
