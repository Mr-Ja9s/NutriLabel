import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp, FALLBACK_DISHES } from '../context/AppContext.jsx';
import NutritionLabel from '../components/NutritionLabel.jsx';
import { calculateVerdict, suggestPortionSwap } from '../../../server/src/utils/rules.js';

export default function DishResultScreen() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    energyUnit,
    setEnergyUnit,
    weightUnit,
    goalMode,
    dailyBudget,
    addDishToToday,
    loggedDishes,
  } = useApp();

  // Dish loading state
  const [dish, setDish] = useState(null);
  const [dishLoading, setDishLoading] = useState(true);
  const [dishError, setDishError] = useState(null);

  // Estimation parameters
  const [portionKey, setPortionKey] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [useCustomGrams, setUseCustomGrams] = useState(false);
  const [customGrams, setCustomGrams] = useState(350);
  const [selectedModifiers, setSelectedModifiers] = useState([]);

  // Estimate API response state
  const [estimate, setEstimate] = useState(null);
  const [estimateLoading, setEstimateLoading] = useState(false);
  const [estimateError, setEstimateError] = useState(null);

  // 3. Same-restaurant alternatives
  const [alternatives, setAlternatives] = useState([]);
  const [alternativesLoading, setAlternativesLoading] = useState(false);

  // Added toast feedback
  const [addedToast, setAddedToast] = useState(false);

  // 1. Fetch Dish details by ID & Same-restaurant alternatives
  useEffect(() => {
    let isMounted = true;
    setDishLoading(true);
    setDishError(null);

    const loadDish = async () => {
      try {
        const res = await fetch(`/api/dishes/${id}`);
        if (!res.ok) {
          throw new Error(`Dish not found (HTTP ${res.status})`);
        }
        const data = await res.json();
        if (isMounted) {
          setDish(data);
          setPortionKey(data.defaultPortionKey || data.portions?.[0]?.key || 'regular');
          setCustomGrams(data.portions?.[0]?.grams || 350);
        }
      } catch (err) {
        // Fallback to sample dish so offline demo always works
        const fallback =
          FALLBACK_DISHES.find((d) => d._id === id) ||
          FALLBACK_DISHES.find((d) => d.name.toLowerCase().includes('biryani')) ||
          FALLBACK_DISHES[0];

        if (isMounted) {
          setDish(fallback);
          setPortionKey(fallback.defaultPortionKey || fallback.portions?.[0]?.key || 'regular');
          setCustomGrams(fallback.portions?.[0]?.grams || 350);
          setDishError(err.message);
        }
      } finally {
        if (isMounted) setDishLoading(false);
      }
    };

    if (id) {
      loadDish();
      loadAlternatives();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Load same-restaurant alternatives from GET /api/dishes/:id/alternatives
  const loadAlternatives = async () => {
    setAlternativesLoading(true);
    try {
      const res = await fetch(`/api/dishes/${id}/alternatives`);
      if (res.ok) {
        const data = await res.json();
        setAlternatives(data);
      }
    } catch {
      // Fallback alternatives
    } finally {
      setAlternativesLoading(false);
    }
  };

  // 2. Debounced call to POST /api/estimate
  useEffect(() => {
    if (!dish) return;

    let isMounted = true;
    setEstimateLoading(true);
    setEstimateError(null);

    const timer = setTimeout(async () => {
      try {
        const bodyPayload = {
          dishId: dish._id,
          portionKey,
          quantity,
          customGrams: useCustomGrams ? customGrams : undefined,
          modifiers: selectedModifiers,
        };

        const res = await fetch('/api/estimate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyPayload),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Estimation error (HTTP ${res.status})`);
        }

        const data = await res.json();
        if (isMounted) {
          setEstimate(data);
        }
      } catch (err) {
        if (isMounted) {
          setEstimateError(err.message);
          calculateFallbackEstimate();
        }
      } finally {
        if (isMounted) setEstimateLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      isMounted = false;
    };
  }, [dish, portionKey, quantity, useCustomGrams, customGrams, selectedModifiers]);

  // Local fallback calculation if backend unreachable
  const calculateFallbackEstimate = () => {
    if (!dish) return;
    const currentPortion =
      dish.portions?.find((p) => p.key === portionKey) || dish.portions?.[0] || { grams: 250 };
    const baseGrams = useCustomGrams ? customGrams : currentPortion.grams * quantity;
    const activeMods = (dish.modifiers || []).filter((m) => selectedModifiers.includes(m.key));
    const modGrams = activeMods.reduce((sum, m) => sum + (m.gramsDelta || 0), 0);
    const totalGrams = Math.max(20, Math.min(3000, baseGrams + modGrams));
    const variance = dish.variancePercent || 25;

    const calcMacro = (key, deltaKey) => {
      const per100 = dish.per100g?.[key];
      if (per100 === null || per100 === undefined) return null;
      let val = (per100 * totalGrams) / 100;
      if (deltaKey) {
        val += activeMods.reduce((sum, m) => sum + (m[deltaKey] || 0), 0);
      }
      val = Math.max(0, val);
      return {
        value: Math.round(val),
        low: Math.round(val * (1 - variance / 100)),
        high: Math.round(val * (1 + variance / 100)),
      };
    };

    const kcal = calcMacro('kcal', 'kcalDelta') || { value: 300, low: 225, high: 375 };
    const kJ = {
      value: Math.round(kcal.value * 4.184),
      low: Math.round(kcal.low * 4.184),
      high: Math.round(kcal.high * 4.184),
    };

    setEstimate({
      grams: totalGrams,
      nutrients: {
        kcal,
        protein: calcMacro('protein', 'proteinDelta'),
        carbs: calcMacro('carbs', 'carbsDelta'),
        fat: calcMacro('fat', 'fatDelta'),
        fibre: calcMacro('fibre', null),
        sodium: calcMacro('sodium', null),
      },
      kJ,
      confidenceLevel: dish.confidenceLevel,
      source: dish.source,
      isSample: dish.isSample,
      variancePercent: variance,
    });
  };

  // Active portion
  const currentPortion =
    dish?.portions?.find((p) => p.key === portionKey) ||
    dish?.portions?.[0] || { grams: 250, label: '1 serving' };

  // 1. Verdict per dish (uses HIGH value of estimate, strictly following rules.js)
  const verdictResult = useMemo(() => {
    if (!estimate) return { label: 'Okay', color: 'bg-verdict-okay', text: 'text-black' };

    const verdictString = calculateVerdict(estimate, goalMode, dailyBudget.targetKcal || 2000);

    if (verdictString === 'Good') {
      return { label: 'Good', color: 'bg-verdict-good', text: 'text-white' };
    }
    if (verdictString === 'Heavy') {
      return { label: 'Heavy', color: 'bg-verdict-heavy', text: 'text-white' };
    }
    return { label: 'Okay', color: 'bg-verdict-okay', text: 'text-black' };
  }, [estimate, goalMode, dailyBudget.targetKcal]);

  // Remaining budget
  const totalConsumedHigh = loggedDishes.reduce((acc, d) => acc + (d.kcalHigh || 0), 0);
  const remainingBudgetKcal = Math.max(0, dailyBudget.targetKcal - totalConsumedHigh);

  // 4. Portion swap (plain rule, no AI)
  // If one item's high calories is more than 40% of the daily target, suggest a smaller portion that fits
  const portionSwapSuggestion = useMemo(() => {
    if (!dish || !estimate) return null;

    return suggestPortionSwap(
      dish,
      {
        portionKey,
        quantity,
        customGrams: useCustomGrams ? customGrams : undefined,
        modifiers: selectedModifiers,
      },
      estimate,
      dailyBudget.targetKcal || 2000,
      remainingBudgetKcal
    );
  }, [dish, portionKey, quantity, useCustomGrams, customGrams, selectedModifiers, estimate, dailyBudget.targetKcal, remainingBudgetKcal]);

  // Apply portion swap suggestion
  const handleApplyPortionSwap = () => {
    if (!portionSwapSuggestion) return;

    if (portionSwapSuggestion.type === 'quantity_stepdown') {
      setQuantity(portionSwapSuggestion.suggestedQuantity);
    } else if (portionSwapSuggestion.type === 'smaller_portion') {
      setPortionKey(portionSwapSuggestion.suggestedPortionKey);
      setQuantity(1);
      setUseCustomGrams(false);
    } else if (portionSwapSuggestion.type === 'custom_grams_reduction') {
      setCustomGrams(portionSwapSuggestion.suggestedCustomGrams);
      setUseCustomGrams(true);
    }
  };

  // Budget impact percentage
  const midKcal = estimate?.nutrients?.kcal?.value || 350;
  const budgetRatio = Math.min(1, midKcal / (dailyBudget.targetKcal || 2000));
  const budgetPercent = Math.round(budgetRatio * 100);

  const toggleModifier = (key) => {
    setSelectedModifiers((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleAddToToday = () => {
    if (!dish || !estimate?.nutrients?.kcal) return;
    addDishToToday({
      dishName: dish.name,
      restaurantName: dish.restaurantName,
      portionLabel: useCustomGrams
        ? `${customGrams}g custom`
        : `${quantity}x ${currentPortion.label}`,
      kcalLow: estimate.nutrients.kcal.low,
      kcalHigh: estimate.nutrients.kcal.high,
      kcalMid: estimate.nutrients.kcal.value,
      protein: estimate.nutrients.protein?.value || 0,
    });
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2200);
  };

  if (dishLoading) {
    return (
      <div className="w-full max-w-md mx-auto px-4 pt-6 pb-28">
        <div className="border border-theme-border bg-theme-surface p-6 text-center animate-pulse">
          <div className="w-10 h-10 border-2 border-brand-yellow border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <h2 className="font-heading text-lg font-black uppercase text-theme-text">
            Loading Dish Profile...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto px-4 pt-3 pb-28">
      {/* Top Disclaimer Banner - Rule 7 */}
      <div className="mb-3 text-center py-1 px-3 border border-dashed border-theme-border-subtle bg-theme-surface rounded text-[10px] uppercase tracking-wider text-theme-text-secondary font-bold">
        Estimates only, not medical advice.
      </div>

      {/* Header Bar */}
      <div className="flex items-center justify-between mb-3 border-b-2 border-theme-border pb-2">
        <button
          onClick={() => navigate('/')}
          className="text-xs font-bold uppercase text-theme-text-secondary hover:text-theme-text flex items-center space-x-1"
        >
          <span>←</span>
          <span>Back to Dishes</span>
        </button>

        <div className="inline-flex border border-theme-border p-0.5 bg-theme-surface rounded-sm">
          <button
            onClick={() => setEnergyUnit('kcal')}
            className={`px-2 py-0.5 text-[10px] font-black uppercase transition ${
              energyUnit === 'kcal' ? 'bg-brand-yellow text-brand-black' : 'text-theme-text-muted'
            }`}
          >
            kcal
          </button>
          <button
            onClick={() => setEnergyUnit('kJ')}
            className={`px-2 py-0.5 text-[10px] font-black uppercase transition ${
              energyUnit === 'kJ' ? 'bg-brand-yellow text-brand-black' : 'text-theme-text-muted'
            }`}
          >
            kJ
          </button>
        </div>
      </div>

      {/* Dish Header */}
      <div className="mb-3">
        <div className="flex items-center space-x-1.5 text-xs text-theme-text-secondary mb-0.5">
          <span
            className={`w-2.5 h-2.5 border flex items-center justify-center ${
              dish.isVeg ? 'border-green-500' : 'border-red-500'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                dish.isVeg ? 'bg-green-500' : 'bg-red-500'
              }`}
            ></span>
          </span>
          <span className="font-bold text-theme-text">{dish.restaurantName}</span>
          <span>&bull;</span>
          <span>{dish.city || 'Coimbatore'}</span>
        </div>
        <h1 className="font-heading text-3xl font-black uppercase tracking-tight text-theme-text leading-tight">
          {dish.name}
        </h1>
      </div>

      {/* 4. PORTION SWAP BANNER (Plain rule, no AI) */}
      {portionSwapSuggestion && (
        <div className="mb-3 p-3 border-2 border-brand-yellow bg-brand-yellow/15 text-theme-text animate-pulse-once">
          <div className="flex items-start space-x-2">
            <span className="text-lg leading-none">⚖️</span>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-heading text-xs font-black uppercase text-theme-text dark:text-brand-yellow tracking-wide">
                  Portion Swap Recommendation
                </span>
                <span className="text-[10px] font-mono font-bold text-theme-text dark:text-brand-yellow">
                  {portionSwapSuggestion.comparisonText}
                </span>
              </div>
              <p className="text-xs text-theme-text mt-0.5 leading-snug">
                {portionSwapSuggestion.reason}
              </p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-brand-yellow/30">
                <div className="text-[11px] font-mono">
                  New: <strong>{portionSwapSuggestion.suggestedLabel}</strong> (
                  {portionSwapSuggestion.newEstimate?.nutrients?.kcal?.low} –{' '}
                  {portionSwapSuggestion.newEstimate?.nutrients?.kcal?.high} kcal)
                </div>
                <button
                  onClick={handleApplyPortionSwap}
                  className="bg-brand-yellow text-brand-black px-2.5 py-1 text-[11px] font-black uppercase hover:bg-[#E5C000] active:scale-95"
                >
                  Apply Swap
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1. PORTION CHIPS & QUANTITY STEPPER (Rule 3) */}
      <div className="border border-theme-border bg-theme-surface p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase text-theme-text-secondary">
            1. Portion Selection
          </span>
          <span className="text-[11px] font-mono text-brand-yellow font-bold">
            {estimate?.grams || currentPortion.grams} {weightUnit}
          </span>
        </div>

        {/* Portion Chips */}
        <div className="flex flex-wrap gap-2 mb-3">
          {(dish.portions || []).map((p) => (
            <button
              key={p.key}
              onClick={() => {
                setPortionKey(p.key);
                setUseCustomGrams(false);
              }}
              className={`px-3 py-1.5 text-xs font-bold uppercase border transition ${
                !useCustomGrams && portionKey === p.key
                  ? 'border-brand-yellow bg-brand-yellow text-brand-black font-black'
                  : 'border-theme-border-subtle bg-theme-bg text-theme-text hover:border-theme-border'
              }`}
            >
              {p.label} ({p.grams}g)
            </button>
          ))}
        </div>

        {/* Quantity Stepper */}
        {!useCustomGrams && (
          <div className="flex items-center justify-between pt-2 border-t border-theme-border-subtle">
            <span className="text-xs text-theme-text-secondary font-medium">Quantity</span>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                aria-label="Decrease quantity"
                className="w-9 h-9 border border-theme-border bg-theme-bg font-black text-theme-text text-base hover:border-brand-yellow flex items-center justify-center active:scale-95"
              >
                -
              </button>
              <span className="font-mono font-bold text-base w-6 text-center text-theme-text" aria-live="polite">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(Math.min(20, quantity + 1))}
                aria-label="Increase quantity"
                className="w-9 h-9 border border-theme-border bg-theme-bg font-black text-theme-text text-base hover:border-brand-yellow flex items-center justify-center active:scale-95"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Advanced Grams Slider (Rule 3) */}
        <div className="mt-3 pt-2 border-t border-theme-border-subtle">
          <button
            onClick={() => setUseCustomGrams(!useCustomGrams)}
            className="text-[11px] font-bold uppercase text-theme-text-muted hover:text-brand-yellow flex items-center space-x-1"
          >
            <span>{useCustomGrams ? '▼' : '▶'}</span>
            <span>Advanced Option: Gram Slider (50g – 1000g)</span>
          </button>

          {useCustomGrams && (
            <div className="mt-2.5 pt-2 border-t border-dashed border-theme-border-subtle">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-theme-text-secondary">Custom Serving Grams:</span>
                <span className="font-mono font-black text-brand-yellow">{customGrams}g</span>
              </div>
              <input
                type="range"
                min="50"
                max="1000"
                step="25"
                value={customGrams}
                onChange={(e) => setCustomGrams(Number(e.target.value))}
                className="w-full accent-brand-yellow cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-theme-text-muted font-mono mt-1">
                <span>50g</span>
                <span>500g</span>
                <span>1000g</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. HIDDEN CALORIE MODIFIERS (Rule 4) */}
      <div className="border border-theme-border bg-theme-surface p-3 mb-4">
        <div className="text-[11px] font-bold uppercase text-theme-text-secondary mb-2">
          2. Hidden Calorie Modifiers
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {(dish.modifiers || []).map((m) => {
            const isSelected = selectedModifiers.includes(m.key);
            const deltaSign = m.kcalDelta > 0 ? `+${m.kcalDelta}` : m.kcalDelta;
            return (
              <button
                key={m.key}
                onClick={() => toggleModifier(m.key)}
                className={`p-2 border text-left flex items-center justify-between text-xs transition ${
                  isSelected
                    ? 'border-brand-yellow bg-brand-yellow text-brand-black font-black'
                    : 'border-theme-border-subtle bg-theme-bg text-theme-text hover:border-theme-border'
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <span className="font-mono font-bold">{isSelected ? '☑' : '☐'}</span>
                  <span>{m.label}</span>
                </div>
                <span className="font-mono text-[11px] font-bold">
                  {deltaSign} kcal
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. REUSABLE NUTRITION LABEL COMPONENT */}
      <div className="mb-4">
        <NutritionLabel
          dishName={dish.name}
          restaurantName={dish.restaurantName}
          city={dish.city}
          servingLabel={useCustomGrams ? `${customGrams}g Custom` : `${quantity}x ${currentPortion.label}`}
          isSample={dish.isSample}
          confidenceLevel={dish.confidenceLevel}
          variancePercent={dish.variancePercent}
          estimate={estimate}
          energyUnit={energyUnit}
          weightUnit={weightUnit}
          verdict={verdictResult}
          budgetPercent={budgetPercent}
          loading={estimateLoading}
          error={estimateError}
        />
      </div>

      {/* ADD TO TODAY BUTTON */}
      <button
        onClick={handleAddToToday}
        className="w-full bg-brand-yellow text-brand-black font-heading font-black text-lg uppercase py-3 px-4 rounded-none border-2 border-brand-yellow shadow-md hover:bg-[#E5C000] active:scale-[0.98] transition mb-4 flex items-center justify-center space-x-2"
      >
        <span>+</span>
        <span>Add To Today's Budget</span>
        {addedToast && <span className="text-xs bg-black text-white px-2 py-0.5 ml-2">✓ Added!</span>}
      </button>

      {/* 3. SAME-RESTAURANT SWAP (GET /api/dishes/:id/alternatives) */}
      <div className="border-2 border-dashed border-theme-border bg-theme-surface p-3 mb-4">
        <div className="flex items-center space-x-1.5 text-[11px] font-black uppercase text-theme-text dark:text-brand-yellow mb-2">
          <span>💡</span>
          <span>Better Choices At {dish.restaurantName}</span>
        </div>

        {alternativesLoading ? (
          <div className="py-3 text-center text-xs text-theme-text-muted font-mono animate-pulse">
            Finding same-restaurant swaps...
          </div>
        ) : alternatives.length > 0 ? (
          <div className="space-y-2">
            {alternatives.map((altItem) => (
              <div
                key={altItem.dish._id}
                className="border border-theme-border-subtle bg-theme-bg p-2.5 flex items-center justify-between"
              >
                <div>
                  <h4 className="font-heading text-base font-black uppercase text-theme-text leading-tight">
                    {altItem.dish.name}
                  </h4>
                  <p className="text-[11px] font-mono font-bold text-theme-text dark:text-brand-yellow mt-0.5">
                    {altItem.comparisonText}
                  </p>
                  <p className="text-[10px] text-theme-text-secondary">
                    Portion: {altItem.defaultPortion.label} ({altItem.altKcal} kcal)
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/dish/${altItem.dish._id}`)}
                  className="border border-theme-border bg-theme-surface text-theme-text text-xs font-black uppercase px-3 py-1.5 hover:border-brand-yellow active:scale-95"
                >
                  Swap →
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-theme-text-secondary py-1">
            This is already the lowest calorie option at {dish.restaurantName}!
          </div>
        )}
      </div>
    </div>
  );
}
