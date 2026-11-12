import mongoose from 'mongoose';

/**
 * Dish Schema for NutriLabel
 * Represents nutritional profiles, portions, and modifiers for Coimbatore dishes.
 * Adheres strictly to the rule: missing nutrition stays null (never invent data).
 */
const dishSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    aliases: {
      type: [String],
      default: [],
    },
    cuisine: {
      type: String,
      trim: true,
      default: 'South Indian',
    },
    region: {
      type: String,
      trim: true,
      default: 'Kongu Nadu',
    },
    isVeg: {
      type: Boolean,
      required: true,
    },
    restaurantName: {
      type: String,
      trim: true,
      required: true,
    },
    city: {
      type: String,
      default: 'Coimbatore',
      trim: true,
    },
    // Nutritional values per 100 grams. Null if unverified/unavailable.
    per100g: {
      kcal: { type: Number, default: null },
      protein: { type: Number, default: null },
      carbs: { type: Number, default: null },
      fat: { type: Number, default: null },
      fibre: { type: Number, default: null },
      sugar: { type: Number, default: null },
      sodium: { type: Number, default: null },
      iron: { type: Number, default: null },
      calcium: { type: Number, default: null },
      vitaminA: { type: Number, default: null },
      vitaminC: { type: Number, default: null },
      vitaminB12: { type: Number, default: null },
    },
    // Discrete portion options (e.g., pieces or plate sizes) mapped to grams
    portions: [
      {
        _id: false,
        key: { type: String, required: true },
        label: { type: String, required: true },
        grams: { type: Number, required: true },
      },
    ],
    defaultPortionKey: {
      type: String,
      required: true,
    },
    // Modifiers reflecting hidden calorie deltas per serving (e.g., less oil, extra gravy)
    modifiers: [
      {
        _id: false,
        key: { type: String, required: true },
        label: { type: String, required: true },
        gramsDelta: { type: Number, default: null },
        kcalDelta: { type: Number, default: null },
        proteinDelta: { type: Number, default: null },
        carbsDelta: { type: Number, default: null },
        fatDelta: { type: Number, default: null },
      },
    ],
    // Source of nutrition data
    source: {
      type: String,
      enum: ['weighed', 'ifct', 'recipe', 'estimate'],
      required: true,
    },
    // Confidence rating
    confidenceLevel: {
      type: String,
      enum: ['high', 'medium', 'low'],
      required: true,
    },
    // Plus/minus variance percentage (e.g. 25 for ±25% range)
    variancePercent: {
      type: Number,
      required: true,
    },
    // Verification flag
    verified: {
      type: Boolean,
      default: false,
    },
    // Demo/sample flag: UI shows "Sample data" badge when true
    isSample: {
      type: Boolean,
      default: false,
    },
    weighedOn: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Text index on name and aliases for fast search
dishSchema.index({ name: 'text', aliases: 'text' });

const Dish = mongoose.model('Dish', dishSchema);

export default Dish;

