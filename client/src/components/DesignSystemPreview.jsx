import React, { useState } from 'react';

export default function DesignSystemPreview() {
  // Theme state: night (default) or day
  const [themeMode, setThemeMode] = useState('night');
  // Unit states
  const [energyUnit, setEnergyUnit] = useState('kcal'); // 'kcal' | 'kJ'
  const [weightUnit, setWeightUnit] = useState('g'); // 'g' | 'oz'
  // Slider state
  const [gramValue, setGramValue] = useState(350);
  // Input state
  const [searchText, setSearchText] = useState('Chicken Biryani');
  // Active chips
  const [selectedPortion, setSelectedPortion] = useState('regular');
  const [selectedModifiers, setSelectedModifiers] = useState(['less_oil']);
  // Goal mode
  const [goalMode, setGoalMode] = useState('weight_loss'); // 'weight_loss' | 'muscle_gain' | 'low_carb'
  // Active nav tab
  const [activeNav, setActiveNav] = useState('dish');

  const toggleTheme = () => {
    const next = themeMode === 'night' ? 'day' : 'night';
    setThemeMode(next);
    document.body.className = `theme-${next} min-h-screen antialiased selection:bg-brand-yellow selection:text-brand-black`;
  };

  const toggleModifier = (key) => {
    setSelectedModifiers((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  return (
    <div className={`w-full max-w-lg mx-auto pb-28 pt-4 px-4 transition-colors duration-200 theme-${themeMode}`}>
      {/* Top Disclaimer Banner - Rule 7 */}
      <div className="mb-4 text-center py-1.5 px-3 border border-dashed border-theme-border-subtle bg-theme-surface rounded text-[11px] uppercase tracking-wider text-theme-text-secondary font-bold">
        Estimates only, not medical advice.
      </div>

      {/* Header & Mode Switches */}
      <div className="flex items-center justify-between border-b-2 border-theme-border pb-3 mb-6">
        <div>
          <span className="bg-brand-yellow text-brand-black text-[10px] font-black uppercase px-2 py-0.5 tracking-wider rounded-sm">
            NutriLabel UI
          </span>
          <h1 className="font-heading text-3xl font-black uppercase tracking-tight text-theme-text mt-1">
            Design System
          </h1>
          <p className="text-xs text-theme-text-secondary">Packaged Food Nutrition Label Identity</p>
        </div>

        {/* Night / Day Toggle */}
        <button
          onClick={toggleTheme}
          className="border-2 border-theme-border bg-theme-surface text-theme-text font-bold text-xs uppercase px-3 py-1.5 rounded-sm hover:border-brand-yellow flex items-center space-x-1.5 shadow-sm active:translate-y-0.5"
        >
          <span>{themeMode === 'night' ? '☀️ Day' : '🌙 Night'}</span>
        </button>
      </div>

      {/* SECTION 1: GLOBAL TOGGLES & CHIPS */}
      <section className="mb-8">
        <h2 className="font-heading text-lg font-black uppercase text-theme-text mb-3 flex items-center space-x-2">
          <span>01. Controls & Toggles</span>
        </h2>

        {/* Unit & Goal Toggles */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {/* Energy Switch */}
          <div className="border border-theme-border bg-theme-surface p-2 rounded-sm flex items-center justify-between">
            <span className="text-xs font-bold text-theme-text-secondary uppercase">Energy</span>
            <div className="inline-flex border border-theme-border-subtle p-0.5 bg-theme-bg rounded-sm">
              <button
                onClick={() => setEnergyUnit('kcal')}
                className={`px-2.5 py-0.5 text-xs font-bold uppercase transition ${
                  energyUnit === 'kcal' ? 'bg-brand-yellow text-brand-black' : 'text-theme-text-secondary'
                }`}
              >
                kcal
              </button>
              <button
                onClick={() => setEnergyUnit('kJ')}
                className={`px-2.5 py-0.5 text-xs font-bold uppercase transition ${
                  energyUnit === 'kJ' ? 'bg-brand-yellow text-brand-black' : 'text-theme-text-secondary'
                }`}
              >
                kJ
              </button>
            </div>
          </div>

          {/* Weight Switch */}
          <div className="border border-theme-border bg-theme-surface p-2 rounded-sm flex items-center justify-between">
            <span className="text-xs font-bold text-theme-text-secondary uppercase">Weight</span>
            <div className="inline-flex border border-theme-border-subtle p-0.5 bg-theme-bg rounded-sm">
              <button
                onClick={() => setWeightUnit('g')}
                className={`px-2.5 py-0.5 text-xs font-bold uppercase transition ${
                  weightUnit === 'g' ? 'bg-brand-yellow text-brand-black' : 'text-theme-text-secondary'
                }`}
              >
                g
              </button>
              <button
                onClick={() => setWeightUnit('oz')}
                className={`px-2.5 py-0.5 text-xs font-bold uppercase transition ${
                  weightUnit === 'oz' ? 'bg-brand-yellow text-brand-black' : 'text-theme-text-secondary'
                }`}
              >
                oz
              </button>
            </div>
          </div>
        </div>

        {/* Goal Mode Selector */}
        <div className="border border-theme-border bg-theme-surface p-2.5 rounded-sm mb-3">
          <div className="text-[11px] font-bold uppercase text-theme-text-secondary mb-1.5">
            Active Goal Mode (Rule 5: No medical claims)
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'weight_loss', label: 'Weight Loss' },
              { id: 'muscle_gain', label: 'Muscle Gain' },
              { id: 'low_carb', label: 'Low Carb' },
            ].map((g) => (
              <button
                key={g.id}
                onClick={() => setGoalMode(g.id)}
                className={`py-1.5 px-2 text-xs font-black uppercase text-center border transition ${
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

        {/* Portion Chips (Rule 3: Pieces or sizes first) */}
        <div className="border border-theme-border bg-theme-surface p-2.5 rounded-sm">
          <div className="text-[11px] font-bold uppercase text-theme-text-secondary mb-1.5">
            Portion Selection (Pieces & Sizes)
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'single', label: '1 Parotta (75g)' },
              { key: 'regular', label: '2 Parottas (150g)' },
              { key: 'large', label: '3 Parottas (225g)' },
            ].map((p) => (
              <button
                key={p.key}
                onClick={() => setSelectedPortion(p.key)}
                className={`px-3 py-1.5 text-xs font-bold uppercase border transition ${
                  selectedPortion === p.key
                    ? 'bg-theme-border text-theme-bg border-theme-border font-black'
                    : 'bg-theme-bg text-theme-text border-theme-border-subtle hover:border-theme-border'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Modifier Chips (Rule 4: Hidden calories matter most) */}
        <div className="border border-theme-border bg-theme-surface p-2.5 rounded-sm mt-3">
          <div className="text-[11px] font-bold uppercase text-theme-text-secondary mb-1.5">
            Hidden Calorie Modifiers
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'less_oil', label: 'Less Oil (-65 kcal)', delta: '-65' },
              { key: 'extra_salna', label: 'Extra Salna (+95 kcal)', delta: '+95' },
              { key: 'no_rice', label: 'No Rice (-180 kcal)', delta: '-180' },
              { key: 'with_raita', label: 'With Raita (+45 kcal)', delta: '+45' },
            ].map((m) => {
              const isSelected = selectedModifiers.includes(m.key);
              return (
                <button
                  key={m.key}
                  onClick={() => toggleModifier(m.key)}
                  className={`px-3 py-1 text-xs font-bold uppercase border transition flex items-center space-x-1 ${
                    isSelected
                      ? 'border-brand-yellow bg-brand-yellow text-brand-black font-black'
                      : 'border-theme-border-subtle bg-theme-bg text-theme-text hover:border-theme-border'
                  }`}
                >
                  <span>{isSelected ? '✓' : '+'}</span>
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 2: INPUTS & SLIDER */}
      <section className="mb-8">
        <h2 className="font-heading text-lg font-black uppercase text-theme-text mb-3">
          02. Search Input & Gram Slider
        </h2>

        {/* Search Input */}
        <div className="mb-4">
          <label className="block text-[11px] font-bold uppercase text-theme-text-secondary mb-1">
            Dish Search Input
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search Coimbatore dishes (e.g. Kothu Parotta)..."
              className="w-full bg-theme-surface border-2 border-theme-border px-3 py-2 text-sm text-theme-text placeholder-theme-text-muted focus:outline-none focus:border-brand-yellow font-medium"
            />
            <span className="absolute right-3 top-2.5 text-xs text-theme-text-secondary">🔍</span>
          </div>
        </div>

        {/* Gram Slider (Advanced Option) */}
        <div className="border border-theme-border bg-theme-surface p-3 rounded-sm">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] font-bold uppercase text-theme-text-secondary">
              Advanced: Custom Gram Slider (20g - 3000g)
            </span>
            <span className="font-heading text-lg font-black text-brand-yellow">
              {gramValue} {weightUnit}
            </span>
          </div>
          <input
            type="range"
            min="20"
            max="1000"
            value={gramValue}
            onChange={(e) => setGramValue(Number(e.target.value))}
            className="w-full accent-brand-yellow cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-theme-text-muted font-mono mt-1">
            <span>20g (Min)</span>
            <span>Serving: {gramValue}g</span>
            <span>1000g (Max)</span>
          </div>
        </div>
      </section>

      {/* SECTION 3: THE NUTRITION FACTS CARD (CORE COMPONENT) */}
      <section className="mb-8">
        <h2 className="font-heading text-lg font-black uppercase text-theme-text mb-3">
          03. Packaged Nutrition Label Card
        </h2>

        {/* THE OFFICIAL PACKAGED FOOD LABEL CARD */}
        <div className="border-[3px] border-theme-border bg-theme-surface p-4 rounded-none shadow-md">
          {/* Card Top: Badges & Tags */}
          <div className="flex items-center justify-between border-b border-theme-border-subtle pb-2 mb-2">
            {/* Rule 2: "Sample data" badge */}
            <span className="inline-block bg-[#262626] text-brand-yellow border border-brand-yellow text-[10px] font-black uppercase px-2 py-0.5 tracking-wider">
              Sample Data
            </span>

            {/* Rule 1: Confidence Badge */}
            <span className="inline-block bg-confidence-low/20 text-confidence-low border border-confidence-low text-[10px] font-black uppercase px-2 py-0.5 tracking-wider">
              Confidence: Low (Recipe Estimate)
            </span>

            {/* Rule 5: Verdict Badge */}
            <span className="inline-block bg-verdict-good text-white text-[10px] font-black uppercase px-2.5 py-0.5 tracking-wider">
              Verdict: Good
            </span>
          </div>

          {/* Dish Header */}
          <div className="mb-2">
            <h3 className="font-heading text-3xl font-black uppercase tracking-tight text-theme-text leading-none">
              Chicken Biryani
            </h3>
            <p className="text-xs text-theme-text-secondary mt-0.5">
              Kongu Kitchen &bull; Coimbatore
            </p>
          </div>

          {/* Official Label Heading */}
          <div className="border-t-[6px] border-theme-border pt-1">
            <div className="font-heading text-2xl font-black tracking-tighter uppercase text-theme-text leading-tight">
              Nutrition Facts
            </div>
            <div className="flex justify-between text-xs text-theme-text-secondary border-b-2 border-theme-border pb-1">
              <span>Serving size: <strong>Regular plate (350g)</strong></span>
              <span>1 serving per box</span>
            </div>
          </div>

          {/* ICONIC CALORIE BLOCK WITH 8PX HEAVY RULE */}
          <div className="py-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-theme-text-secondary">
              Estimated Energy (Range)
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-heading text-4xl sm:text-5xl font-black tracking-tight text-theme-text">
                480 – 620
              </span>
              <span className="font-heading text-2xl font-black text-brand-yellow uppercase">
                {energyUnit}
              </span>
            </div>
            <div className="text-[11px] text-theme-text-muted">
              Equivalent to 2,008 – 2,594 kJ
            </div>
          </div>

          {/* THE 8PX HEAVY RULE LINE */}
          <div className="label-heavy-rule my-1"></div>

          {/* Macro Breakdown Rows (Range Format: Never single exact numbers - Rule 1) */}
          <div className="divide-y divide-theme-border-subtle text-xs">
            {/* Protein */}
            <div className="py-1.5 flex justify-between items-center">
              <div>
                <strong className="text-theme-text uppercase">Protein</strong>
                <span className="text-theme-text-secondary ml-1">(Chicken breast & eggs)</span>
              </div>
              <span className="font-mono font-bold text-theme-text">22.5 – 37.5 g</span>
            </div>

            {/* Total Fat */}
            <div className="py-1.5 flex justify-between items-center">
              <div>
                <strong className="text-theme-text uppercase">Total Fat</strong>
                <span className="text-theme-text-secondary ml-1">(Ghee & oil)</span>
              </div>
              <span className="font-mono font-bold text-theme-text">18.9 – 31.5 g</span>
            </div>

            {/* Total Carbs */}
            <div className="py-1.5 flex justify-between items-center">
              <div>
                <strong className="text-theme-text uppercase">Carbohydrates</strong>
                <span className="text-theme-text-secondary ml-1">(Seeraga samba rice)</span>
              </div>
              <span className="font-mono font-bold text-theme-text">57.7 – 96.2 g</span>
            </div>

            {/* Dietary Fibre */}
            <div className="py-1.5 flex justify-between items-center">
              <span className="text-theme-text-secondary pl-3">Dietary Fibre</span>
              <span className="font-mono text-theme-text-secondary">2.8 – 4.8 g</span>
            </div>

            {/* Sodium */}
            <div className="py-1.5 flex justify-between items-center">
              <span className="text-theme-text-secondary pl-3">Sodium</span>
              <span className="font-mono text-theme-text-secondary">990 – 1,650 mg</span>
            </div>

            {/* Missing Data test (Rule 2: Missing data stays null) */}
            <div className="py-1.5 flex justify-between items-center text-theme-text-muted italic">
              <span className="pl-3">Vitamin B12</span>
              <span>Not available (null)</span>
            </div>
          </div>

          {/* Macro Split Progress Bar */}
          <div className="mt-4 pt-3 border-t-2 border-theme-border">
            <div className="text-[10px] font-bold uppercase text-theme-text-secondary mb-1 flex justify-between">
              <span>Macro Split (Protein / Fat / Carbs)</span>
              <span>25% / 30% / 45%</span>
            </div>
            <div className="w-full h-3 bg-theme-bg border border-theme-border flex overflow-hidden">
              <div className="bg-brand-yellow h-full" style={{ width: '25%' }} title="Protein 25%"></div>
              <div className="bg-[#737373] h-full" style={{ width: '30%' }} title="Fat 30%"></div>
              <div className="bg-theme-border h-full" style={{ width: '45%' }} title="Carbs 45%"></div>
            </div>
          </div>

          {/* Footer Footnote */}
          <div className="mt-3 pt-2 border-t border-theme-border-subtle text-[10px] text-theme-text-muted leading-tight">
            * The % Daily Value (DV) tells you how much a nutrient in a serving contributes to a daily diet. Ranges reflect standard kitchen prep variance.
          </div>
        </div>
      </section>

      {/* SECTION 4: BUTTONS & BADGES GALLERY */}
      <section className="mb-8">
        <h2 className="font-heading text-lg font-black uppercase text-theme-text mb-3">
          04. Buttons & Badges
        </h2>

        {/* Buttons Gallery */}
        <div className="space-y-2 mb-4">
          {/* Primary Button */}
          <button className="w-full bg-brand-yellow text-brand-black font-heading font-black text-base uppercase py-2.5 px-4 rounded-none border-2 border-brand-yellow hover:bg-[#E5C000] active:scale-[0.99] transition">
            Primary Button (Always Black On Yellow)
          </button>

          {/* Secondary Button */}
          <button className="w-full bg-theme-surface text-theme-text font-heading font-black text-base uppercase py-2.5 px-4 rounded-none border-2 border-theme-border hover:border-brand-yellow active:scale-[0.99] transition">
            Secondary Outlined Button
          </button>

          {/* Danger / Verdict Badge Row */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="text-center p-2 bg-verdict-good/15 border border-verdict-good text-verdict-good font-black text-xs uppercase">
              Good
            </div>
            <div className="text-center p-2 bg-verdict-okay/15 border border-verdict-okay text-verdict-okay font-black text-xs uppercase">
              Okay
            </div>
            <div className="text-center p-2 bg-verdict-heavy/15 border border-verdict-heavy text-verdict-heavy font-black text-xs uppercase">
              Heavy
            </div>
          </div>

          {/* Confidence Badges Row */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="text-center p-1.5 border border-confidence-high text-confidence-high font-bold text-[10px] uppercase">
              High: Weighed By Us
            </div>
            <div className="text-center p-1.5 border border-confidence-medium text-confidence-medium font-bold text-[10px] uppercase">
              Medium: IFCT / Recipe
            </div>
            <div className="text-center p-1.5 border border-confidence-low text-confidence-low font-bold text-[10px] uppercase">
              Low: Estimate
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: MOBILE BOTTOM NAV BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-theme-surface border-t-2 border-theme-border shadow-2xl">
        <div className="max-w-lg mx-auto flex items-center justify-around py-2">
          {[
            { id: 'search', label: 'Search', icon: '🔍' },
            { id: 'dish', label: 'Nutrition', icon: '🏷️' },
            { id: 'compare', label: 'Compare', icon: '⚖️' },
            { id: 'goals', label: 'Goals', icon: '🎯' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveNav(tab.id)}
              className={`flex flex-col items-center py-1 px-3 transition ${
                activeNav === tab.id
                  ? 'text-brand-yellow font-black'
                  : 'text-theme-text-secondary hover:text-theme-text'
              }`}
            >
              <span className="text-base leading-none mb-1">{tab.icon}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider">{tab.label}</span>
              {activeNav === tab.id && (
                <div className="w-4 h-0.5 bg-brand-yellow mt-0.5"></div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

