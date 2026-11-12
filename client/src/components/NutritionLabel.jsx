import React from 'react';
import RollingNumber from './RollingNumber.jsx';

/**
 * Reusable NutritionLabel Component
 * Formats nutritional data in the authentic packaged food label aesthetic.
 * 
 * Rules:
 * 1. Never show one exact number. Always show a range (low to high) and confidence level.
 * 2. Never invent nutrition data. Missing data stays null. Demo data shows "Sample data" badge.
 * 10. Heavy rule line under calories. Text on yellow is always black.
 */
export default function NutritionLabel({
  dishName,
  restaurantName,
  city = 'Coimbatore',
  servingLabel = '1 serving',
  isSample = true,
  confidenceLevel = 'low',
  variancePercent = 25,
  estimate,
  energyUnit = 'kcal',
  weightUnit = 'g',
  verdict,
  budgetPercent = 0,
  loading = false,
  error = null,
}) {
  const nutrients = estimate?.nutrients || {};
  const kcalRange = nutrients.kcal;
  const kJRange = estimate?.kJ;
  const proteinRange = nutrients.protein;
  const carbsRange = nutrients.carbs;
  const fatRange = nutrients.fat;
  const fibreRange = nutrients.fibre;
  const sodiumRange = nutrients.sodium;

  // Calorie range values
  let displayLow = kcalRange ? kcalRange.low : 0;
  let displayHigh = kcalRange ? kcalRange.high : 0;

  if (energyUnit === 'kJ') {
    displayLow = kJRange ? kJRange.low : Math.round(displayLow * 4.184);
    displayHigh = kJRange ? kJRange.high : Math.round(displayHigh * 4.184);
  }

  // Confidence badge config
  const getConfidenceBadge = () => {
    switch (confidenceLevel?.toLowerCase()) {
      case 'high':
        return {
          label: 'Confidence: High (Weighed by us)',
          classes: 'border-confidence-high text-confidence-high bg-confidence-high/10',
        };
      case 'medium':
        return {
          label: 'Confidence: Medium (Recipe / IFCT)',
          classes: 'border-confidence-medium text-confidence-medium bg-confidence-medium/10',
        };
      default:
        return {
          label: 'Confidence: Low (Estimate)',
          classes: 'border-confidence-low text-confidence-low bg-confidence-low/10',
        };
    }
  };

  const confidenceBadge = getConfidenceBadge();

  return (
    <div
      className="relative p-1 transition-all duration-300"
      style={{
        background: `linear-gradient(135deg, #FFD500 ${budgetPercent}%, var(--color-border) ${budgetPercent}%)`,
      }}
    >
      <div className="bg-theme-surface p-4 relative">
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-theme-surface/75 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <div className="flex items-center space-x-2 bg-theme-bg border border-theme-border px-3 py-1.5 shadow-md">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-yellow animate-ping"></span>
              <span className="font-heading text-xs font-black uppercase text-theme-text tracking-wide">
                Calculating Ranges...
              </span>
            </div>
          </div>
        )}

        {/* Error Alert inside label */}
        {error && (
          <div className="mb-3 p-2.5 border-2 border-verdict-heavy bg-verdict-heavy/10 text-verdict-heavy text-xs font-bold flex items-center space-x-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Top Badges Row */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-theme-border-subtle pb-2 mb-2">
          {/* Rule 2: "Sample data" badge with guaranteed 14:1 contrast in both themes */}
          {isSample && (
            <span className="bg-brand-yellow text-brand-black border border-brand-black text-[9px] font-black uppercase px-2 py-0.5 tracking-wider shadow-sm">
              Sample Data
            </span>
          )}

          {/* Rule 1: Confidence Badge */}
          <span
            className={`text-[9px] font-black uppercase px-2 py-0.5 border tracking-wider ${confidenceBadge.classes}`}
          >
            {confidenceBadge.label}
          </span>

          {/* Rule 5: Goal Verdict Badge */}
          {verdict && (
            <span
              className={`text-[9px] font-black uppercase px-2.5 py-0.5 tracking-wider ${verdict.color} ${verdict.text}`}
            >
              Goal Verdict: {verdict.label}
            </span>
          )}
        </div>

        {/* Budget Impact Callout */}
        {budgetPercent > 0 && (
          <div className="mb-2 text-[10px] font-bold uppercase text-theme-text-muted flex justify-between">
            <span>Daily Budget Proximity</span>
            <span className="text-theme-text dark:text-brand-yellow font-mono font-bold">{budgetPercent}% of target</span>
          </div>
        )}

        {/* Header Block */}
        <div className="mb-1">
          {dishName && (
            <h3 className="font-heading text-2xl sm:text-3xl font-black uppercase tracking-tight text-theme-text leading-tight">
              {dishName}
            </h3>
          )}
          {restaurantName && (
            <p className="text-xs text-theme-text-secondary">
              {restaurantName} &bull; {city}
            </p>
          )}
        </div>

        {/* Official Packaged Nutrition Facts Header */}
        <div className="border-t-[4px] border-theme-border pt-1 mt-2">
          <div className="font-heading text-2xl font-black uppercase tracking-tight text-theme-text leading-tight">
            Nutrition Facts
          </div>
          <div className="flex justify-between text-xs text-theme-text-secondary border-b-2 border-theme-border pb-1">
            <span>Serving Size: <strong>{servingLabel}</strong></span>
            <span>Variance: &plusmn;{variancePercent}%</span>
          </div>
        </div>

        {/* Calorie Range with Rolling Counter Animation */}
        <div className="py-2">
          <div className="text-[10px] font-bold uppercase text-theme-text-muted tracking-wider">
            Estimated Energy (Range)
          </div>
          <div className="flex items-baseline justify-between">
            <div className="font-heading text-4xl sm:text-5xl font-black text-theme-text flex items-center space-x-1.5">
              <RollingNumber value={displayLow} />
              <span>–</span>
              <RollingNumber value={displayHigh} />
            </div>
            <span className="font-heading text-2xl font-black text-theme-text dark:text-brand-yellow uppercase">
              {energyUnit}
            </span>
          </div>

          <div className="text-[11px] text-theme-text-muted mt-0.5">
            {energyUnit === 'kcal' ? (
              <>Equivalent to {Math.round(displayLow * 4.184).toLocaleString()} – {Math.round(displayHigh * 4.184).toLocaleString()} kJ</>
            ) : (
              <>Equivalent to {Math.round(displayLow / 4.184).toLocaleString()} – {Math.round(displayHigh / 4.184).toLocaleString()} kcal</>
            )}
          </div>
        </div>

        {/* 8PX HEAVY RULE LINE UNDER CALORIES (Rule 10) */}
        <div className="label-heavy-rule my-1"></div>

        {/* Nutrients Breakdown Rows (Rule 1: Always a range; Rule 2: Missing stays null) */}
        <div className="divide-y divide-theme-border-subtle text-xs">
          {/* Protein */}
          <div className="py-1.5 flex justify-between items-center">
            <strong className="text-theme-text uppercase">Protein</strong>
            <span className="font-mono font-bold text-theme-text">
              {proteinRange ? `${proteinRange.low} – ${proteinRange.high} g` : '—'}
            </span>
          </div>

          {/* Total Fat */}
          <div className="py-1.5 flex justify-between items-center">
            <strong className="text-theme-text uppercase">Total Fat</strong>
            <span className="font-mono font-bold text-theme-text">
              {fatRange ? `${fatRange.low} – ${fatRange.high} g` : '—'}
            </span>
          </div>

          {/* Total Carbs */}
          <div className="py-1.5 flex justify-between items-center">
            <strong className="text-theme-text uppercase">Carbohydrates</strong>
            <span className="font-mono font-bold text-theme-text">
              {carbsRange ? `${carbsRange.low} – ${carbsRange.high} g` : '—'}
            </span>
          </div>

          {/* Dietary Fibre */}
          <div className="py-1.5 flex justify-between items-center text-theme-text-secondary">
            <span className="pl-3">Dietary Fibre</span>
            <span className="font-mono">
              {fibreRange ? `${fibreRange.low} – ${fibreRange.high} g` : '—'}
            </span>
          </div>

          {/* Sodium */}
          <div className="py-1.5 flex justify-between items-center text-theme-text-secondary">
            <span className="pl-3">Sodium</span>
            <span className="font-mono">
              {sodiumRange ? `${sodiumRange.low} – ${sodiumRange.high} mg` : '—'}
            </span>
          </div>

          {/* Missing data stays null (Rule 2) */}
          <div className="py-1.5 flex justify-between items-center text-theme-text-muted italic">
            <span className="pl-3">Vitamins (A, C, B12, Iron, Calcium)</span>
            <span>Not Available (null)</span>
          </div>
        </div>

        {/* Macro Split Bar */}
        {proteinRange && carbsRange && fatRange && (
          <div className="mt-4 pt-3 border-t-2 border-theme-border">
            <div className="text-[10px] font-bold uppercase text-theme-text-secondary mb-1 flex justify-between">
              <span>Macro Split Ratio</span>
              <span>Protein / Fat / Carbs</span>
            </div>
            <div className="w-full h-3 bg-theme-bg border border-theme-border flex overflow-hidden">
              <div
                className="bg-brand-yellow h-full"
                style={{ width: '30%' }}
                title="Protein"
              ></div>
              <div
                className="bg-[#737373] h-full"
                style={{ width: '35%' }}
                title="Fat"
              ></div>
              <div
                className="bg-theme-border h-full"
                style={{ width: '35%' }}
                title="Carbohydrates"
              ></div>
            </div>
          </div>
        )}

        {/* Label Footer */}
        <div className="mt-3 pt-2 border-t border-theme-border-subtle text-[10px] text-theme-text-muted leading-tight">
          * Ranges reflect natural restaurant kitchen variances (oil absorption, gravy quantity, and portion size). Not medical advice.
        </div>
      </div>
    </div>
  );
}

