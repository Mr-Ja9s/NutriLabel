import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

export default function SettingsScreen() {
  const navigate = useNavigate();
  const {
    themeMode,
    setThemeMode,
    language,
    energyUnit,
    setEnergyUnit,
    weightUnit,
    setWeightUnit,
    goalMode,
    setGoalMode,
    dailyBudget,
    setDailyBudget,
  } = useApp();

  const getLanguageNative = () => {
    switch (language) {
      case 'ta':
        return 'தமிழ் (Tamil)';
      case 'hi':
        return 'हिन्दी (Hindi)';
      case 'es':
        return 'Español (Spanish)';
      case 'ar':
        return 'العربية (Arabic)';
      default:
        return 'English (US/IN)';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 pt-3 pb-28">
      {/* Top Disclaimer Banner - Rule 7 */}
      <div className="mb-3 text-center py-1 px-3 border border-dashed border-theme-border-subtle bg-theme-surface rounded text-[10px] uppercase tracking-wider text-theme-text-secondary font-bold">
        Estimates only, not medical advice.
      </div>

      {/* Header */}
      <div className="border-b-2 border-theme-border pb-3 mb-4">
        <span className="bg-brand-yellow text-brand-black text-[10px] font-black uppercase px-2 py-0.5 tracking-wider rounded-sm">
          Preferences
        </span>
        <h1 className="font-heading text-3xl font-black uppercase tracking-tight text-theme-text mt-1">
          App Settings
        </h1>
      </div>

      <div className="space-y-4">
        {/* THEME (System / Day / Night) */}
        <div className="border border-theme-border bg-theme-surface p-3.5">
          <div className="text-[11px] font-bold uppercase text-theme-text-secondary mb-2">
            Appearance / Theme
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'system', label: 'System', icon: '💻' },
              { id: 'day', label: 'Day (Light)', icon: '☀️' },
              { id: 'night', label: 'Night (Dark)', icon: '🌙' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setThemeMode(t.id)}
                className={`py-2 px-1 text-xs font-black uppercase text-center border transition flex flex-col items-center justify-center ${
                  themeMode === t.id
                    ? 'border-brand-yellow bg-brand-yellow text-brand-black'
                    : 'border-theme-border-subtle bg-theme-bg text-theme-text hover:border-theme-border'
                }`}
              >
                <span className="text-sm mb-0.5">{t.icon}</span>
                <span className="text-[11px] leading-tight">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* LANGUAGE SELECTION ROW */}
        <Link
          to="/language"
          className="border border-theme-border bg-theme-surface p-3.5 flex items-center justify-between cursor-pointer hover:border-brand-yellow transition block"
        >
          <div>
            <div className="text-[11px] font-bold uppercase text-theme-text-secondary">
              Language
            </div>
            <div className="font-heading text-lg font-black text-theme-text mt-0.5">
              {getLanguageNative()}
            </div>
            <div className="text-[10px] text-theme-text-muted mt-0.5">
              Translations are machine-generated, please report errors.
            </div>
          </div>
          <div className="flex items-center space-x-1 text-xs font-black text-theme-text dark:text-brand-yellow uppercase">
            <span>Change</span>
            <span>→</span>
          </div>
        </Link>

        {/* MEASUREMENT UNITS (Rule 6: Saved in localStorage) */}
        <div className="border border-theme-border bg-theme-surface p-3.5">
          <div className="text-[11px] font-bold uppercase text-theme-text-secondary mb-2 flex justify-between">
            <span>Measurement Units</span>
            <span className="text-[10px] text-theme-text dark:text-brand-yellow font-mono font-bold">Saved in Storage</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {/* Energy */}
            <div>
              <span className="text-xs text-theme-text-secondary block mb-1">Energy:</span>
              <div className="grid grid-cols-2 border border-theme-border p-0.5 bg-theme-bg">
                <button
                  onClick={() => setEnergyUnit('kcal')}
                  className={`py-1 text-xs font-bold uppercase text-center ${
                    energyUnit === 'kcal' ? 'bg-brand-yellow text-brand-black font-black' : 'text-theme-text-secondary'
                  }`}
                >
                  kcal
                </button>
                <button
                  onClick={() => setEnergyUnit('kJ')}
                  className={`py-1 text-xs font-bold uppercase text-center ${
                    energyUnit === 'kJ' ? 'bg-brand-yellow text-brand-black font-black' : 'text-theme-text-secondary'
                  }`}
                >
                  kJ
                </button>
              </div>
            </div>

            {/* Weight */}
            <div>
              <span className="text-xs text-theme-text-secondary block mb-1">Weight:</span>
              <div className="grid grid-cols-2 border border-theme-border p-0.5 bg-theme-bg">
                <button
                  onClick={() => setWeightUnit('g')}
                  className={`py-1 text-xs font-bold uppercase text-center ${
                    weightUnit === 'g' ? 'bg-brand-yellow text-brand-black font-black' : 'text-theme-text-secondary'
                  }`}
                >
                  g (Grams)
                </button>
                <button
                  onClick={() => setWeightUnit('oz')}
                  className={`py-1 text-xs font-bold uppercase text-center ${
                    weightUnit === 'oz' ? 'bg-brand-yellow text-brand-black font-black' : 'text-theme-text-secondary'
                  }`}
                >
                  oz (Ounces)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* GOAL MODE SELECTOR (Rule 5) */}
        <div className="border border-theme-border bg-theme-surface p-3.5">
          <div className="text-[11px] font-bold uppercase text-theme-text-secondary mb-2">
            Target Goal Mode
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'weight_loss', label: 'Weight Loss' },
              { id: 'muscle_gain', label: 'Muscle Gain' },
              { id: 'low_carb', label: 'Low Carb' },
            ].map((g) => (
              <button
                key={g.id}
                onClick={() => setGoalMode(g.id)}
                className={`py-2 px-1 text-xs font-black uppercase text-center border transition ${
                  goalMode === g.id
                    ? 'border-brand-yellow bg-brand-yellow text-brand-black'
                    : 'border-theme-border-subtle bg-theme-bg text-theme-text hover:border-theme-border'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* DAILY CALORIE LIMIT TARGET */}
        <div className="border border-theme-border bg-theme-surface p-3.5">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] font-bold uppercase text-theme-text-secondary">
              Daily Calorie Target
            </span>
            <span className="font-mono font-black text-theme-text dark:text-brand-yellow">
              {dailyBudget.targetKcal} kcal
            </span>
          </div>
          <input
            type="range"
            min="1200"
            max="3500"
            step="50"
            value={dailyBudget.targetKcal}
            onChange={(e) =>
              setDailyBudget({ ...dailyBudget, targetKcal: Number(e.target.value) })
            }
            aria-label="Daily Calorie Target Slider"
            className="w-full accent-brand-yellow cursor-pointer"
          />
        </div>

        {/* ADMIN PORTAL ACCESS */}
        <Link
          to="/admin"
          className="border border-theme-border bg-theme-surface p-3.5 flex items-center justify-between cursor-pointer hover:border-brand-yellow transition block"
        >
          <div>
            <div className="text-[11px] font-bold uppercase text-theme-text-secondary">
              Staff & Data Management
            </div>
            <div className="font-heading text-lg font-black text-theme-text mt-0.5">
              Admin Portal
            </div>
            <div className="text-[11px] text-theme-text-muted">
              Weighed nutrition input, sample audits & CSV export
            </div>
          </div>
          <div className="flex items-center space-x-1 text-xs font-black text-theme-text dark:text-brand-yellow uppercase">
            <span>Open</span>
            <span>→</span>
          </div>
        </Link>

        {/* MANDATORY DISCLAIMER CARD (Rule 7) */}
        <div className="border-2 border-theme-border bg-theme-surface p-4">
          <div className="font-heading text-lg font-black uppercase text-theme-text dark:text-brand-yellow mb-1 flex items-center space-x-1.5">
            <span>⚠️</span>
            <span>Legal Disclaimer</span>
          </div>
          <p className="text-xs text-theme-text-secondary leading-relaxed mb-2 font-medium">
            <strong>Estimates only, not medical advice.</strong> NutriLabel provides calculated nutritional ranges based on standard Coimbatore restaurant recipes, IFCT databases, and sample kitchen weighings.
          </p>
          <p className="text-[11px] text-theme-text-muted leading-relaxed">
            Actual calories may vary significantly due to cook oil usage, gravy absorption, tawa seasoning, and serving hand variance. Always consult qualified healthcare professionals for dietary prescriptions.
          </p>
        </div>
      </div>
    </div>
  );
}
