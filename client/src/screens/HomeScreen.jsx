import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp, FALLBACK_DISHES } from '../context/AppContext.jsx';

export default function HomeScreen() {
  const navigate = useNavigate();
  const {
    goalMode,
    setGoalMode,
    themeMode,
    setThemeMode,
    energyUnit,
    language,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filterVegOnly, setFilterVegOnly] = useState(false);

  // Data fetching states
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 300ms Debounce effect on search query input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch dishes from GET /api/dishes?q=
  const fetchDishes = async (queryText = '') => {
    setLoading(true);
    setError(null);
    try {
      const url = queryText.trim()
        ? `/api/dishes?q=${encodeURIComponent(queryText.trim())}`
        : '/api/dishes';
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }
      const data = await res.json();
      setDishes(data);
    } catch (err) {
      console.warn('Backend fetch failed, using fallback sample data:', err.message);
      setError(err.message);
      // Fallback to sample Coimbatore dishes so app remains usable offline
      const queryLower = queryText.toLowerCase().trim();
      const filteredFallback = queryLower
        ? FALLBACK_DISHES.filter(
            (d) =>
              d.name.toLowerCase().includes(queryLower) ||
              d.restaurantName.toLowerCase().includes(queryLower)
          )
        : FALLBACK_DISHES;
      setDishes(filteredFallback);
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch when debouncedQuery changes
  useEffect(() => {
    fetchDishes(debouncedQuery);
  }, [debouncedQuery]);

  // Client-side veg filter
  const displayedDishes = dishes.filter((d) => (!filterVegOnly ? true : d.isVeg));

  const toggleTheme = () => {
    setThemeMode(themeMode === 'night' ? 'day' : 'night');
  };

  const getLanguageLabel = () => {
    switch (language) {
      case 'ta':
        return 'தமிழ்';
      case 'hi':
        return 'हिन्दी';
      case 'es':
        return 'ES';
      case 'ar':
        return 'عربي';
      default:
        return 'EN';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 pt-3 pb-24">
      {/* Top Disclaimer Banner - Rule 7 */}
      <div className="mb-3 text-center py-1 px-3 border border-dashed border-theme-border-subtle bg-theme-surface rounded text-[10px] uppercase tracking-wider text-theme-text-secondary font-bold">
        Estimates only, not medical advice.
      </div>

      {/* Top Bar: Wordmark, Theme Toggle, Language Picker */}
      <header className="flex items-center justify-between border-b-2 border-theme-border pb-3 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-brand-yellow text-brand-black text-[11px] font-black uppercase px-2 py-0.5 tracking-wider rounded-sm">
              NutriLabel
            </span>
            <span className="text-[10px] font-mono font-bold uppercase text-theme-text-muted">
              Coimbatore
            </span>
          </div>
          <h1 className="font-heading text-2xl font-black uppercase tracking-tight text-theme-text mt-0.5">
            Food Nutrition Viewer
          </h1>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-1.5">
          <Link
            to="/language"
            aria-label="Choose Language"
            className="border border-theme-border bg-theme-surface text-theme-text text-xs font-bold px-2.5 py-1.5 min-h-[36px] rounded-sm hover:border-brand-yellow flex items-center space-x-1"
            title="Choose Language"
          >
            <span>🌐</span>
            <span className="font-mono text-[11px]">{getLanguageLabel()}</span>
          </Link>

          <button
            onClick={toggleTheme}
            aria-label={`Toggle theme (currently ${themeMode})`}
            className="border border-theme-border bg-theme-surface text-theme-text text-xs p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-sm hover:border-brand-yellow"
            title="Toggle Night / Day"
          >
            <span aria-hidden="true">{themeMode === 'night' ? '☀️' : '🌙'}</span>
          </button>
        </div>
      </header>

      {/* Search Input with 300ms Debounce Indicator */}
      <div className="relative mb-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search Coimbatore dishes"
          placeholder="Search Coimbatore dishes, messes, biryani..."
          className="w-full bg-theme-surface border-2 border-theme-border px-3 py-2.5 pl-9 pr-8 text-sm text-theme-text placeholder-theme-text-muted font-medium focus:outline-none focus:border-brand-yellow shadow-sm"
        />
        <span className="absolute left-3 top-3 text-xs text-theme-text-muted" aria-hidden="true">🔍</span>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            aria-label="Clear Search"
            className="absolute right-3 top-3 text-xs text-theme-text-muted hover:text-theme-text font-bold"
          >
            ✕
          </button>
        )}
      </div>

      {/* Goal Mode Selector (Rule 5) */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-[11px] font-bold uppercase text-theme-text-secondary mb-1.5">
          <span>Active Goal Mode</span>
          <span className="text-[10px] text-theme-text-muted">No medical claims</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { id: 'weight_loss', label: 'Weight Loss', icon: '📉' },
            { id: 'muscle_gain', label: 'Muscle Gain', icon: '💪' },
            { id: 'low_carb', label: 'Low Carb', icon: '🥗' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setGoalMode(mode.id)}
              className={`py-1.5 px-2 text-xs font-black uppercase text-center border transition flex flex-col items-center justify-center ${
                goalMode === mode.id
                  ? 'border-brand-yellow bg-brand-yellow text-brand-black shadow-sm'
                  : 'border-theme-border-subtle bg-theme-surface text-theme-text hover:border-theme-border'
              }`}
            >
              <span className="text-xs mb-0.5">{mode.icon}</span>
              <span className="leading-tight">{mode.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Subheader & Filters */}
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center space-x-2">
          <span className="font-heading uppercase font-bold text-theme-text-secondary tracking-wide">
            Dishes ({displayedDishes.length})
          </span>
          {loading && (
            <span className="text-[10px] text-brand-yellow font-mono animate-pulse">
              (Searching...)
            </span>
          )}
        </div>
        <button
          onClick={() => setFilterVegOnly(!filterVegOnly)}
          className={`px-2 py-0.5 border text-[11px] font-bold uppercase transition rounded-sm flex items-center space-x-1 ${
            filterVegOnly
              ? 'border-green-600 bg-green-900/30 text-green-400'
              : 'border-theme-border-subtle text-theme-text-secondary hover:border-theme-border'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
          <span>Veg Only</span>
        </button>
      </div>

      {/* Error State Banner */}
      {error && (
        <div className="mb-4 p-3 border border-dashed border-verdict-heavy/60 bg-verdict-heavy/10 text-xs text-theme-text flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-verdict-heavy font-black">!</span>
            <span className="text-theme-text-secondary">Backend offline. Using offline sample cache.</span>
          </div>
          <button
            onClick={() => fetchDishes(debouncedQuery)}
            className="text-[10px] font-black uppercase underline text-brand-yellow ml-2"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && dishes.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="border-2 border-theme-border-subtle bg-theme-surface p-3 animate-pulse"
            >
              <div className="h-4 bg-theme-bg w-1/3 mb-2"></div>
              <div className="h-6 bg-theme-bg w-2/3 mb-2"></div>
              <div className="h-10 bg-theme-bg w-full"></div>
            </div>
          ))}
        </div>
      ) : displayedDishes.length === 0 ? (
        /* Empty State */
        <div className="border border-dashed border-theme-border p-8 text-center bg-theme-surface">
          <span className="text-2xl mb-2 block">🍽️</span>
          <h3 className="font-heading text-lg font-black uppercase text-theme-text">
            No dishes found
          </h3>
          <p className="text-xs text-theme-text-secondary mt-1">
            Try searching for "biryani", "parotta", "idli", or "dosa".
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterVegOnly(false);
            }}
            className="mt-3 bg-brand-yellow text-brand-black px-3 py-1 font-black text-xs uppercase"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        /* Dishes Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {displayedDishes.map((dish) => {
            const portion = dish.portions?.[0] || { label: '1 serving', grams: 250 };
            const baseKcal = Math.round(((dish.per100g?.kcal || 150) * portion.grams) / 100);
            const variance = dish.variancePercent || 25;
            const lowKcal = Math.round(baseKcal * (1 - variance / 100));
            const highKcal = Math.round(baseKcal * (1 + variance / 100));

            const displayLow = energyUnit === 'kJ' ? Math.round(lowKcal * 4.184) : lowKcal;
            const displayHigh = energyUnit === 'kJ' ? Math.round(highKcal * 4.184) : highKcal;

            return (
              <div
                key={dish._id}
                onClick={() => navigate(`/dish/${dish._id}`)}
                className="border-2 border-theme-border bg-theme-surface p-3 cursor-pointer hover:border-brand-yellow hover:shadow-label-night transition-all active:scale-[0.99] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] mb-1.5">
                    <div className="flex items-center space-x-1">
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
                      <span className="text-theme-text-muted font-bold truncate max-w-[120px]">
                        {dish.restaurantName}
                      </span>
                    </div>

                    {/* Rule 2: "Sample data" badge */}
                    {dish.isSample && (
                      <span className="bg-theme-bg text-brand-yellow border border-brand-yellow/50 text-[9px] font-black uppercase px-1 py-0.2">
                        Sample Data
                      </span>
                    )}
                  </div>

                  <h3 className="font-heading text-xl font-black uppercase tracking-tight text-theme-text leading-tight mb-1">
                    {dish.name}
                  </h3>
                  <p className="text-[11px] text-theme-text-secondary mb-2">
                    Portion: {portion.label}
                  </p>

                  {/* Range Display */}
                  <div className="border-t border-b border-theme-border-subtle py-1.5 my-1.5">
                    <div className="text-[9px] font-bold uppercase text-theme-text-muted">
                      Estimated Energy (Range)
                    </div>
                    <div className="flex items-baseline space-x-1">
                      <span className="font-heading text-2xl font-black text-theme-text">
                        {displayLow} – {displayHigh}
                      </span>
                      <span className="text-xs font-black text-brand-yellow uppercase">
                        {energyUnit}
                      </span>
                    </div>
                  </div>

                  {/* Macros */}
                  <div className="flex justify-between text-[11px] text-theme-text-secondary pt-1">
                    <span>
                      P: <strong>{dish.per100g?.protein ? `${Math.round((dish.per100g.protein * portion.grams) / 100)}g` : '—'}</strong>
                    </span>
                    <span>
                      C: <strong>{dish.per100g?.carbs ? `${Math.round((dish.per100g.carbs * portion.grams) / 100)}g` : '—'}</strong>
                    </span>
                    <span>
                      F: <strong>{dish.per100g?.fat ? `${Math.round((dish.per100g.fat * portion.grams) / 100)}g` : '—'}</strong>
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-dashed border-theme-border-subtle flex items-center justify-between text-[10px]">
                  <span className="text-confidence-low font-bold uppercase">
                    Confidence: {dish.confidenceLevel}
                  </span>
                  <span className="font-bold uppercase text-brand-yellow flex items-center space-x-0.5">
                    <span>View Facts</span>
                    <span>→</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
