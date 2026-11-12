import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

export default function DailyBudgetScreen() {
  const navigate = useNavigate();
  const {
    dailyBudget,
    setDailyBudget,
    loggedDishes,
    removeDishFromToday,
    energyUnit,
  } = useApp();

  const [isEditingTargets, setIsEditingTargets] = useState(false);
  const [editKcal, setEditKcal] = useState(dailyBudget.targetKcal);
  const [editProtein, setEditProtein] = useState(dailyBudget.targetProtein);

  // 2. Sum low, high, and protein separately
  const totalConsumedLow = loggedDishes.reduce((acc, d) => acc + (d.kcalLow || 0), 0);
  const totalConsumedHigh = loggedDishes.reduce((acc, d) => acc + (d.kcalHigh || 0), 0);
  const totalProtein = loggedDishes.reduce((acc, d) => acc + (d.protein || 0), 0);

  // 2. Remaining calories are based on the HIGH value
  const remainingKcalBasedOnHigh = Math.max(0, dailyBudget.targetKcal - totalConsumedHigh);

  // Unit conversions
  const displayTarget =
    energyUnit === 'kJ' ? Math.round(dailyBudget.targetKcal * 4.184) : dailyBudget.targetKcal;
  const displayConsumedLow =
    energyUnit === 'kJ' ? Math.round(totalConsumedLow * 4.184) : totalConsumedLow;
  const displayConsumedHigh =
    energyUnit === 'kJ' ? Math.round(totalConsumedHigh * 4.184) : totalConsumedHigh;
  const displayRemaining =
    energyUnit === 'kJ'
      ? Math.round(remainingKcalBasedOnHigh * 4.184)
      : remainingKcalBasedOnHigh;

  const progressPercent = Math.min(
    100,
    Math.round((totalConsumedHigh / dailyBudget.targetKcal) * 100)
  );

  const handleSaveTargets = () => {
    setDailyBudget({
      targetKcal: Number(editKcal) || 2000,
      targetProtein: Number(editProtein) || 120,
    });
    setIsEditingTargets(false);
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 pt-3 pb-28">
      {/* Top Disclaimer Banner - Rule 7 */}
      <div className="mb-3 text-center py-1 px-3 border border-dashed border-theme-border-subtle bg-theme-surface rounded text-[10px] uppercase tracking-wider text-theme-text-secondary font-bold">
        Estimates only, not medical advice.
      </div>

      {/* Header */}
      <div className="border-b-2 border-theme-border pb-3 mb-4 flex items-center justify-between">
        <div>
          <span className="bg-brand-yellow text-brand-black text-[10px] font-black uppercase px-2 py-0.5 tracking-wider rounded-sm">
            Daily Budget
          </span>
          <h1 className="font-heading text-3xl font-black uppercase tracking-tight text-theme-text mt-1">
            Nutrition Tracker
          </h1>
        </div>
        <button
          onClick={() => navigate('/')}
          className="border border-theme-border bg-theme-surface text-theme-text text-xs font-bold px-2.5 py-1.5 uppercase hover:border-brand-yellow"
        >
          + Add Food
        </button>
      </div>

      {/* TARGET & PROGRESS CARD */}
      <div className="border-2 border-theme-border bg-theme-surface p-4 mb-4">
        {/* Remaining (Based strictly on HIGH value) */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="text-[10px] font-bold uppercase text-theme-text-secondary tracking-wider">
              Remaining Calories (Based on High Estimate)
            </div>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="font-heading text-4xl sm:text-5xl font-black text-theme-text">
                {displayRemaining.toLocaleString()}
              </span>
              <span className="font-heading text-xl font-black text-theme-text dark:text-brand-yellow uppercase">
                {energyUnit}
              </span>
            </div>
            <p className="text-[11px] text-theme-text-muted mt-0.5">
              Target: {displayTarget.toLocaleString()} {energyUnit}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsEditingTargets(!isEditingTargets)}
            className="text-[10px] font-black uppercase bg-theme-bg text-theme-text border border-theme-border px-2.5 py-1.5 hover:border-brand-yellow transition"
          >
            {isEditingTargets ? 'Cancel' : 'Edit Targets'}
          </button>
        </div>

        {/* Editable Targets Drawer */}
        {isEditingTargets && (
          <div className="mb-4 p-3 border border-dashed border-theme-border bg-theme-bg">
            <h4 className="font-heading text-xs font-black uppercase text-theme-text mb-2">
              Edit Daily Nutrition Targets
            </h4>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="text-[10px] text-theme-text-secondary uppercase block mb-1">
                  Calorie Target (kcal)
                </label>
                <input
                  type="number"
                  min="1000"
                  max="4000"
                  step="50"
                  value={editKcal}
                  onChange={(e) => setEditKcal(e.target.value)}
                  className="w-full bg-theme-surface border border-theme-border px-2 py-1 text-xs text-theme-text font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-theme-text-secondary uppercase block mb-1">
                  Protein Target (g)
                </label>
                <input
                  type="number"
                  min="30"
                  max="300"
                  step="5"
                  value={editProtein}
                  onChange={(e) => setEditProtein(e.target.value)}
                  className="w-full bg-theme-surface border border-theme-border px-2 py-1 text-xs text-theme-text font-mono"
                />
              </div>
            </div>
            <button
              onClick={handleSaveTargets}
              className="w-full bg-brand-yellow text-brand-black font-black uppercase text-xs py-1.5"
            >
              Save Targets
            </button>
          </div>
        )}

        {/* Separate Total Low and Total High Display */}
        <div className="border-t border-theme-border-subtle pt-2.5 mt-2">
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="font-bold uppercase text-theme-text-secondary">
              Total Consumed Range:
            </span>
            <div className="font-mono font-bold text-theme-text text-sm">
              <span className="text-theme-text-secondary">Low: {displayConsumedLow.toLocaleString()}</span>
              <span className="mx-1.5 text-theme-text-muted">|</span>
              <span className="text-theme-text dark:text-brand-yellow font-black">High: {displayConsumedHigh.toLocaleString()} {energyUnit}</span>
            </div>
          </div>

          {/* Progress Bar (Based on High) */}
          <div className="w-full h-3 bg-theme-bg border border-theme-border overflow-hidden mt-1.5">
            <div
              className={`h-full transition-all duration-500 ${
                progressPercent >= 100 ? 'bg-verdict-heavy' : 'bg-brand-yellow'
              }`}
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[10px] text-theme-text-muted font-mono mt-1">
            <span>0 {energyUnit}</span>
            <span>{progressPercent}% of target limit consumed</span>
            <span>{displayTarget.toLocaleString()} {energyUnit}</span>
          </div>
        </div>

        {/* Protein Progress */}
        <div className="mt-3 pt-2.5 border-t border-theme-border-subtle">
          <div className="flex justify-between text-xs font-bold text-theme-text-secondary mb-1">
            <span>Protein Target: {dailyBudget.targetProtein}g</span>
            <span className="font-mono text-theme-text">
              {Math.round(totalProtein)}g ({Math.round((totalProtein / dailyBudget.targetProtein) * 100)}%)
            </span>
          </div>
          <div className="w-full h-2 bg-theme-bg border border-theme-border overflow-hidden">
            <div
              className="bg-theme-border h-full transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.round((totalProtein / dailyBudget.targetProtein) * 100))}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* LOGGED DISHES LIST */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-heading text-lg font-black uppercase text-theme-text tracking-wide">
            Today's Logged Items ({loggedDishes.length})
          </h3>
          <span className="text-[10px] text-theme-text-muted font-mono">
            Auto-resets each midnight
          </span>
        </div>

        {loggedDishes.length === 0 ? (
          <div className="border border-dashed border-theme-border p-6 text-center bg-theme-surface">
            <p className="text-xs text-theme-text-secondary">No dishes logged for today yet.</p>
            <button
              onClick={() => navigate('/')}
              className="mt-3 bg-brand-yellow text-brand-black px-4 py-1.5 text-xs font-black uppercase"
            >
              Search & Add Dishes
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {loggedDishes.map((item) => (
              <div
                key={item.id}
                className="border border-theme-border bg-theme-surface p-3 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-heading text-lg font-black uppercase text-theme-text leading-tight">
                      {item.dishName}
                    </span>
                    <span className="text-[10px] text-theme-text-muted font-mono">({item.time})</span>
                  </div>
                  <p className="text-[11px] text-theme-text-secondary">
                    {item.restaurantName} &bull; {item.portionLabel}
                  </p>
                  <p className="text-xs font-mono font-bold text-theme-text mt-0.5">
                    <span className="text-theme-text-secondary">
                      {energyUnit === 'kJ' ? Math.round(item.kcalLow * 4.184) : item.kcalLow}
                    </span>
                    <span className="mx-1 text-theme-text-muted">–</span>
                    <span className="text-brand-yellow">
                      {energyUnit === 'kJ' ? Math.round(item.kcalHigh * 4.184) : item.kcalHigh} {energyUnit}
                    </span>
                    <span className="ml-2 text-theme-text-secondary text-[11px]">
                      ({Math.round(item.protein || 0)}g P)
                    </span>
                  </p>
                </div>

                <button
                  onClick={() => removeDishFromToday(item.id)}
                  className="text-theme-text-muted hover:text-verdict-heavy text-sm p-2 hover:bg-theme-bg"
                  title="Remove item"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
