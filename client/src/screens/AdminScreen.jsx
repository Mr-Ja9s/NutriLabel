import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const DEFAULT_DISH_FORM = {
  name: '',
  aliases: '',
  cuisine: 'South Indian',
  region: 'Kongu Nadu',
  isVeg: true,
  restaurantName: '',
  city: 'Coimbatore',
  source: 'recipe',
  confidenceLevel: 'low',
  variancePercent: 25,
  verified: false,
  isSample: true,
  weighedOn: '',
  notes: '',
  per100g: {
    kcal: '',
    protein: '',
    carbs: '',
    fat: '',
    fibre: '',
    sugar: '',
    sodium: '',
    iron: '',
    calcium: '',
    vitaminA: '',
    vitaminC: '',
    vitaminB12: '',
  },
  portions: [
    { key: 'regular', label: 'Regular plate', grams: 350 },
  ],
  defaultPortionKey: 'regular',
  modifiers: [
    { key: 'less_oil', label: 'Less oil', gramsDelta: 0, kcalDelta: -50, proteinDelta: 0, carbsDelta: 0, fatDelta: -5.5 },
    { key: 'extra_gravy', label: 'Extra gravy', gramsDelta: 80, kcalDelta: 90, proteinDelta: 1.5, carbsDelta: 4, fatDelta: 7.5 },
  ],
};

export default function AdminScreen() {
  const navigate = useNavigate();

  // Admin authentication state
  const [adminPassword, setAdminPassword] = useState(() => {
    return sessionStorage.getItem('nutrilabel_admin_pwd') || '';
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginInput, setLoginInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Dashboard view: 'list' | 'form'
  const [activeTab, setActiveTab] = useState('list');
  const [editingId, setEditingId] = useState(null);

  // List & Filters
  const [dishes, setDishes] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOnlySample, setFilterOnlySample] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState('');

  // Form State
  const [formData, setFormData] = useState(DEFAULT_DISH_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Weighed Calculator state
  const [weighedGrams, setWeighedGrams] = useState(350);
  const [weighedNutrition, setWeighedNutrition] = useState({
    kcal: '',
    protein: '',
    carbs: '',
    fat: '',
    fibre: '',
    sodium: '',
  });

  // Verify stored password on mount
  useEffect(() => {
    if (adminPassword) {
      verifyPassword(adminPassword);
    }
  }, []);

  const verifyPassword = async (passwordToTest) => {
    try {
      const res = await fetch('/api/admin/verify', {
        headers: { 'x-admin-password': passwordToTest },
      });
      if (res.ok) {
        setIsAuthenticated(true);
        sessionStorage.setItem('nutrilabel_admin_pwd', passwordToTest);
        setAdminPassword(passwordToTest);
        setAuthError('');
        loadDishes(passwordToTest);
      } else {
        setIsAuthenticated(false);
        setAuthError('Invalid admin password. Access denied.');
      }
    } catch {
      setAuthError('Connection failed. Make sure the server is running.');
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!loginInput.trim()) return;
    verifyPassword(loginInput.trim());
  };

  const handleLogout = () => {
    sessionStorage.removeItem('nutrilabel_admin_pwd');
    setAdminPassword('');
    setIsAuthenticated(false);
    setLoginInput('');
  };

  // Load dishes with filters
  const loadDishes = async (pwd = adminPassword) => {
    setListLoading(true);
    setListError('');
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      if (filterOnlySample) params.set('isSample', 'true');
      if (selectedRestaurant) params.set('restaurantName', selectedRestaurant);

      const res = await fetch(`/api/admin/dishes?${params.toString()}`, {
        headers: { 'x-admin-password': pwd },
      });

      if (!res.ok) {
        throw new Error(`Failed to load dishes (HTTP ${res.status})`);
      }

      const data = await res.json();
      setDishes(data.dishes || []);
      setRestaurants(data.restaurants || []);
    } catch (err) {
      setListError(err.message);
    } finally {
      setListLoading(false);
    }
  };

  // Re-fetch dishes when filters change
  useEffect(() => {
    if (isAuthenticated) {
      loadDishes();
    }
  }, [searchQuery, filterOnlySample, selectedRestaurant]);

  // Handle source changes - Rule: When source is "weighed", automatically set confidenceLevel to "high"
  const handleSourceChange = (newSource) => {
    setFormData((prev) => ({
      ...prev,
      source: newSource,
      confidenceLevel: newSource === 'weighed' ? 'high' : prev.confidenceLevel,
    }));
  };

  // Calculate live preview per 100g from weighed nutrition
  const calculateWeighedPer100g = () => {
    const grams = Number(weighedGrams);
    if (!grams || grams <= 0) return null;

    const compute = (val) => {
      if (val === '' || val === null || isNaN(Number(val))) return null;
      return Math.round((Number(val) / grams) * 100 * 10) / 10;
    };

    return {
      kcal: compute(weighedNutrition.kcal),
      protein: compute(weighedNutrition.protein),
      carbs: compute(weighedNutrition.carbs),
      fat: compute(weighedNutrition.fat),
      fibre: compute(weighedNutrition.fibre),
      sodium: compute(weighedNutrition.sodium),
    };
  };

  const weighedPer100gPreview = calculateWeighedPer100g();

  // Apply calculated per100g preview into the main per100g form fields
  const applyWeighedToPer100g = () => {
    if (!weighedPer100gPreview) return;
    setFormData((prev) => ({
      ...prev,
      per100g: {
        ...prev.per100g,
        kcal: weighedPer100gPreview.kcal !== null ? weighedPer100gPreview.kcal : prev.per100g.kcal,
        protein: weighedPer100gPreview.protein !== null ? weighedPer100gPreview.protein : prev.per100g.protein,
        carbs: weighedPer100gPreview.carbs !== null ? weighedPer100gPreview.carbs : prev.per100g.carbs,
        fat: weighedPer100gPreview.fat !== null ? weighedPer100gPreview.fat : prev.per100g.fat,
        fibre: weighedPer100gPreview.fibre !== null ? weighedPer100gPreview.fibre : prev.per100g.fibre,
        sodium: weighedPer100gPreview.sodium !== null ? weighedPer100gPreview.sodium : prev.per100g.sodium,
      },
    }));
    setFormSuccess('Applied weighed nutrition to per 100g fields!');
    setTimeout(() => setFormSuccess(''), 2500);
  };

  // Portions handlers
  const handleAddPortion = () => {
    const newIndex = formData.portions.length + 1;
    const newKey = `portion_${newIndex}`;
    setFormData((prev) => ({
      ...prev,
      portions: [...prev.portions, { key: newKey, label: `Portion ${newIndex}`, grams: 250 }],
    }));
  };

  const handleRemovePortion = (index) => {
    setFormData((prev) => {
      const nextPortions = prev.portions.filter((_, i) => i !== index);
      const nextKey =
        prev.defaultPortionKey === prev.portions[index]?.key
          ? nextPortions[0]?.key || ''
          : prev.defaultPortionKey;
      return { ...prev, portions: nextPortions, defaultPortionKey: nextKey };
    });
  };

  // Modifiers handlers
  const handleAddModifier = () => {
    const newIndex = formData.modifiers.length + 1;
    setFormData((prev) => ({
      ...prev,
      modifiers: [
        ...prev.modifiers,
        { key: `mod_${newIndex}`, label: `Modifier ${newIndex}`, gramsDelta: 0, kcalDelta: 0, proteinDelta: 0, carbsDelta: 0, fatDelta: 0 },
      ],
    }));
  };

  const handleRemoveModifier = (index) => {
    setFormData((prev) => ({
      ...prev,
      modifiers: prev.modifiers.filter((_, i) => i !== index),
    }));
  };

  // Populate form for editing
  const startEditDish = (dish) => {
    setEditingId(dish._id);
    setFormData({
      name: dish.name || '',
      aliases: (dish.aliases || []).join(', '),
      cuisine: dish.cuisine || 'South Indian',
      region: dish.region || 'Kongu Nadu',
      isVeg: dish.isVeg ?? true,
      restaurantName: dish.restaurantName || '',
      city: dish.city || 'Coimbatore',
      source: dish.source || 'recipe',
      confidenceLevel: dish.confidenceLevel || 'low',
      variancePercent: dish.variancePercent ?? 25,
      verified: dish.verified ?? false,
      isSample: dish.isSample ?? true,
      weighedOn: dish.weighedOn ? new Date(dish.weighedOn).toISOString().slice(0, 10) : '',
      notes: dish.notes || '',
      per100g: {
        kcal: dish.per100g?.kcal ?? '',
        protein: dish.per100g?.protein ?? '',
        carbs: dish.per100g?.carbs ?? '',
        fat: dish.per100g?.fat ?? '',
        fibre: dish.per100g?.fibre ?? '',
        sugar: dish.per100g?.sugar ?? '',
        sodium: dish.per100g?.sodium ?? '',
        iron: dish.per100g?.iron ?? '',
        calcium: dish.per100g?.calcium ?? '',
        vitaminA: dish.per100g?.vitaminA ?? '',
        vitaminC: dish.per100g?.vitaminC ?? '',
        vitaminB12: dish.per100g?.vitaminB12 ?? '',
      },
      portions: dish.portions?.length ? dish.portions : [{ key: 'regular', label: 'Regular', grams: 350 }],
      defaultPortionKey: dish.defaultPortionKey || 'regular',
      modifiers: dish.modifiers || [],
    });
    setActiveTab('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Delete dish
  const handleDeleteDish = async (dish) => {
    if (!window.confirm(`Are you sure you want to delete "${dish.name}" from ${dish.restaurantName}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/dishes/${dish._id}`, {
        method: 'DELETE',
        headers: { 'x-admin-password': adminPassword },
      });

      if (!res.ok) {
        throw new Error('Failed to delete dish');
      }

      setDishes((prev) => prev.filter((d) => d._id !== dish._id));
    } catch (err) {
      alert(`Error deleting dish: ${err.message}`);
    }
  };

  // Submit create or edit form
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    setFormSuccess('');

    try {
      // Validate weighed requirements
      if (formData.source === 'weighed') {
        if (!formData.restaurantName.trim()) {
          throw new Error('Restaurant Name is required when source is "weighed".');
        }
        if (!formData.weighedOn) {
          throw new Error('Weighed On Date is required when source is "weighed".');
        }
      }

      // Convert aliases
      const aliasesArray = formData.aliases
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean);

      // Convert per100g fields (empty strings to null)
      const per100gCleaned = {};
      Object.keys(formData.per100g).forEach((k) => {
        const val = formData.per100g[k];
        per100gCleaned[k] = val === '' || val === null ? null : Number(val);
      });

      const payload = {
        ...formData,
        aliases: aliasesArray,
        per100g: per100gCleaned,
        variancePercent: Number(formData.variancePercent) || 25,
        weighedOn: formData.weighedOn ? new Date(formData.weighedOn) : null,
      };

      const url = editingId ? `/api/admin/dishes/${editingId}` : '/api/admin/dishes';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword,
        },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Failed to save dish');
      }

      setFormSuccess(
        editingId ? `Successfully updated "${payload.name}"!` : `Successfully created "${payload.name}"!`
      );
      loadDishes();

      setTimeout(() => {
        setActiveTab('list');
        setEditingId(null);
        setFormData(DEFAULT_DISH_FORM);
      }, 1200);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Export CSV
  const handleExportCsv = async () => {
    try {
      const res = await fetch('/api/admin/export-csv', {
        headers: { 'x-admin-password': adminPassword },
      });
      if (!res.ok) throw new Error('Failed to generate CSV export');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nutrilabel-dishes-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(`Export error: ${err.message}`);
    }
  };

  // If not authenticated, show password gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-theme-bg text-theme-text flex flex-col justify-center items-center px-4">
        <div className="w-full max-w-sm border-2 border-theme-border bg-theme-surface p-6 shadow-xl">
          <div className="text-center mb-6">
            <span className="bg-brand-yellow text-brand-black text-[10px] font-black uppercase px-2 py-0.5 tracking-wider rounded-sm">
              NutriLabel Administration
            </span>
            <h1 className="font-heading text-3xl font-black uppercase tracking-tight text-theme-text mt-2">
              Admin Access
            </h1>
            <p className="text-xs text-theme-text-secondary mt-1">
              Enter the system admin password to manage dishes and weighed nutrition data.
            </p>
          </div>

          {authError && (
            <div className="mb-4 p-2.5 border border-verdict-heavy bg-verdict-heavy/10 text-verdict-heavy text-xs font-bold">
              {authError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase text-theme-text-secondary mb-1">
                Admin Password
              </label>
              <input
                type="password"
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                placeholder="Enter ADMIN_PASSWORD..."
                className="w-full bg-theme-bg border border-theme-border px-3 py-2 text-sm text-theme-text font-mono focus:border-brand-yellow focus:outline-none"
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="w-full bg-brand-yellow text-brand-black font-heading font-black text-sm uppercase py-2.5 px-4 hover:bg-[#E5C000] active:scale-[0.99] transition"
            >
              Sign In to Admin
            </button>
          </form>

          <div className="mt-5 text-center">
            <Link to="/" className="text-xs text-theme-text-secondary hover:text-brand-yellow uppercase font-bold">
              ← Return to Consumer App
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text pb-20">
      {/* Top Admin Nav */}
      <header className="border-b-2 border-theme-border bg-theme-surface sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="bg-brand-yellow text-brand-black text-xs font-black uppercase px-2 py-0.5">
              Admin Portal
            </span>
            <h1 className="font-heading text-xl font-black uppercase tracking-tight text-theme-text">
              NutriLabel Data Manager
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              to="/"
              className="text-xs text-theme-text-secondary hover:text-theme-text font-bold uppercase px-2 py-1"
            >
              View Consumer App
            </Link>
            <button
              onClick={handleLogout}
              className="border border-theme-border text-xs text-theme-text-secondary hover:text-verdict-heavy px-2.5 py-1 uppercase font-bold"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Tab Controls */}
        <div className="flex items-center justify-between mb-6 border-b border-theme-border pb-3">
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setActiveTab('list');
                setEditingId(null);
              }}
              className={`px-4 py-2 text-xs font-black uppercase border transition ${
                activeTab === 'list'
                  ? 'border-brand-yellow bg-brand-yellow text-brand-black'
                  : 'border-theme-border bg-theme-surface text-theme-text hover:border-brand-yellow'
              }`}
            >
              Dish Catalog ({dishes.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('form');
                if (!editingId) setFormData(DEFAULT_DISH_FORM);
              }}
              className={`px-4 py-2 text-xs font-black uppercase border transition ${
                activeTab === 'form'
                  ? 'border-brand-yellow bg-brand-yellow text-brand-black'
                  : 'border-theme-border bg-theme-surface text-theme-text hover:border-brand-yellow'
              }`}
            >
              {editingId ? 'Edit Dish' : '+ Create New Dish'}
            </button>
          </div>

          {activeTab === 'list' && (
            <button
              onClick={handleExportCsv}
              className="border-2 border-theme-border bg-theme-surface text-theme-text text-xs font-black uppercase px-3 py-2 hover:border-brand-yellow flex items-center space-x-1.5"
            >
              <span>📥</span>
              <span>Export CSV</span>
            </button>
          )}
        </div>

        {/* VIEW 1: DISH LIST WITH FILTERS */}
        {activeTab === 'list' && (
          <div>
            {/* Filter Bar */}
            <div className="border border-theme-border bg-theme-surface p-4 mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Search query */}
                <div>
                  <label className="text-[10px] font-bold uppercase text-theme-text-secondary block mb-1">
                    Search Dish or Restaurant
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name, alias, restaurant..."
                    className="w-full bg-theme-bg border border-theme-border px-2.5 py-1.5 text-xs text-theme-text font-medium focus:border-brand-yellow focus:outline-none"
                  />
                </div>

                {/* Filter by Restaurant */}
                <div>
                  <label className="text-[10px] font-bold uppercase text-theme-text-secondary block mb-1">
                    Filter by Restaurant
                  </label>
                  <select
                    value={selectedRestaurant}
                    onChange={(e) => setSelectedRestaurant(e.target.value)}
                    className="w-full bg-theme-bg border border-theme-border px-2.5 py-1.5 text-xs text-theme-text font-medium focus:border-brand-yellow focus:outline-none"
                  >
                    <option value="">All Restaurants</option>
                    {restaurants.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filter isSample dishes */}
                <div className="flex items-center sm:pt-4">
                  <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold uppercase text-theme-text">
                    <input
                      type="checkbox"
                      checked={filterOnlySample}
                      onChange={(e) => setFilterOnlySample(e.target.checked)}
                      className="accent-brand-yellow w-4 h-4"
                    />
                    <span>Show Only Sample Data ({dishes.filter(d => d.isSample).length})</span>
                  </label>
                </div>
              </div>
            </div>

            {/* List Table / Cards */}
            {listLoading ? (
              <div className="p-8 text-center border border-theme-border bg-theme-surface">
                <span className="text-xs uppercase font-mono text-theme-text dark:text-brand-yellow animate-pulse">
                  Loading catalog...
                </span>
              </div>
            ) : dishes.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-theme-border bg-theme-surface">
                <p className="text-xs text-theme-text-secondary">No dishes match the selected filters.</p>
              </div>
            ) : (
              <div className="border border-theme-border bg-theme-surface overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b-2 border-theme-border bg-theme-bg font-heading uppercase text-theme-text text-[11px]">
                      <th className="p-3">Dish Name</th>
                      <th className="p-3">Restaurant</th>
                      <th className="p-3">Source & Conf.</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Portions</th>
                      <th className="p-3">kcal/100g</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-theme-border-subtle">
                    {dishes.map((d) => (
                      <tr key={d._id} className="hover:bg-theme-bg/50 transition">
                        <td className="p-3">
                          <div className="flex items-center space-x-1.5">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                d.isVeg ? 'bg-green-500' : 'bg-red-500'
                              }`}
                            ></span>
                            <span className="font-heading font-black text-sm text-theme-text">
                              {d.name}
                            </span>
                          </div>
                          {d.aliases?.length > 0 && (
                            <span className="text-[10px] text-theme-text-muted block truncate max-w-xs">
                              Aliases: {d.aliases.join(', ')}
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-medium text-theme-text-secondary">
                          {d.restaurantName}
                        </td>
                        <td className="p-3">
                          <span className="font-mono text-[10px] uppercase block text-theme-text">
                            {d.source}
                          </span>
                          <span
                            className={`text-[9px] font-black uppercase ${
                              d.confidenceLevel === 'high'
                                ? 'text-confidence-high'
                                : d.confidenceLevel === 'medium'
                                ? 'text-confidence-medium'
                                : 'text-confidence-low'
                            }`}
                          >
                            {d.confidenceLevel}
                          </span>
                        </td>
                        <td className="p-3">
                          {d.isSample ? (
                            <span className="bg-brand-yellow text-brand-black border border-brand-black text-[9px] font-black uppercase px-1.5 py-0.5">
                              Sample Data
                            </span>
                          ) : (
                            <span className="bg-green-900/30 text-green-400 border border-green-500/50 text-[9px] font-black uppercase px-1.5 py-0.5">
                              Weighed / Verified
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-theme-text-secondary">
                          {d.portions?.length || 0} portions
                        </td>
                        <td className="p-3 font-mono font-bold text-theme-text">
                          {d.per100g?.kcal !== null ? `${d.per100g.kcal} kcal` : '—'}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end space-x-1.5">
                            <button
                              onClick={() => startEditDish(d)}
                              className="border border-theme-border bg-theme-bg text-theme-text px-2 py-1 text-[11px] font-black uppercase hover:border-brand-yellow"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteDish(d)}
                              className="border border-theme-border bg-theme-bg text-theme-text-muted hover:text-verdict-heavy px-2 py-1 text-[11px] font-black uppercase"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: DISH CREATION / EDIT FORM */}
        {activeTab === 'form' && (
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {formError && (
              <div className="p-3 border-2 border-verdict-heavy bg-verdict-heavy/10 text-verdict-heavy text-xs font-bold">
                ⚠️ {formError}
              </div>
            )}

            {formSuccess && (
              <div className="p-3 border-2 border-confidence-high bg-confidence-high/10 text-confidence-high text-xs font-bold">
                ✓ {formSuccess}
              </div>
            )}

            {/* SECTION A: BASIC PROFILE */}
            <div className="border border-theme-border bg-theme-surface p-4">
              <h2 className="font-heading text-lg font-black uppercase text-theme-text mb-3 border-b border-theme-border-subtle pb-1">
                A. Basic Identity & Origin
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold uppercase text-theme-text-secondary block mb-1">
                    Dish Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Pallipalayam Chicken"
                    className="w-full bg-theme-bg border border-theme-border px-3 py-1.5 text-xs text-theme-text focus:border-brand-yellow focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-theme-text-secondary block mb-1">
                    Dietary Classification *
                  </label>
                  <select
                    value={formData.isVeg ? 'veg' : 'nonveg'}
                    onChange={(e) => setFormData({ ...formData, isVeg: e.target.value === 'veg' })}
                    className="w-full bg-theme-bg border border-theme-border px-3 py-1.5 text-xs text-theme-text focus:border-brand-yellow focus:outline-none"
                  >
                    <option value="veg">Vegetarian</option>
                    <option value="nonveg">Non-Vegetarian</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="text-[10px] font-bold uppercase text-theme-text-secondary block mb-1">
                    Aliases / Search Keywords (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.aliases}
                    onChange={(e) => setFormData({ ...formData, aliases: e.target.value })}
                    placeholder="e.g. Kozhi Pallipalayam, Dry Chicken Fry"
                    className="w-full bg-theme-bg border border-theme-border px-3 py-1.5 text-xs text-theme-text focus:border-brand-yellow focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-theme-text-secondary block mb-1">
                    Restaurant Name {formData.source === 'weighed' ? '*' : ''}
                  </label>
                  <input
                    type="text"
                    required={formData.source === 'weighed'}
                    value={formData.restaurantName}
                    onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                    placeholder="e.g. Kongu Kitchen"
                    className="w-full bg-theme-bg border border-theme-border px-3 py-1.5 text-xs text-theme-text focus:border-brand-yellow focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-theme-text-secondary block mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-theme-bg border border-theme-border px-3 py-1.5 text-xs text-theme-text focus:border-brand-yellow focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-theme-text-secondary block mb-1">
                    Cuisine & Region
                  </label>
                  <input
                    type="text"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full bg-theme-bg border border-theme-border px-3 py-1.5 text-xs text-theme-text focus:border-brand-yellow focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SECTION B: SOURCE, CONFIDENCE & WEIGHED CALCULATOR */}
            <div className="border border-theme-border bg-theme-surface p-4">
              <h2 className="font-heading text-lg font-black uppercase text-theme-text mb-3 border-b border-theme-border-subtle pb-1">
                B. Data Source & Weighed Laboratory Fields
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-theme-text-secondary block mb-1">
                    Source Enum *
                  </label>
                  <select
                    value={formData.source}
                    onChange={(e) => handleSourceChange(e.target.value)}
                    className="w-full bg-theme-bg border border-theme-border px-3 py-1.5 text-xs text-theme-text focus:border-brand-yellow focus:outline-none"
                  >
                    <option value="weighed">Weighed (Physical Lab Scale)</option>
                    <option value="ifct">IFCT (Food Composition Tables)</option>
                    <option value="recipe">Recipe Calculation</option>
                    <option value="estimate">Estimate</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-theme-text-secondary block mb-1">
                    Confidence Level *
                  </label>
                  <select
                    disabled={formData.source === 'weighed'}
                    value={formData.confidenceLevel}
                    onChange={(e) => setFormData({ ...formData, confidenceLevel: e.target.value })}
                    className="w-full bg-theme-bg border border-theme-border px-3 py-1.5 text-xs text-theme-text focus:border-brand-yellow focus:outline-none disabled:opacity-75"
                  >
                    <option value="high">High (Weighed by us)</option>
                    <option value="medium">Medium (Recipe/IFCT)</option>
                    <option value="low">Low (Estimate)</option>
                  </select>
                  {formData.source === 'weighed' && (
                    <span className="text-[9px] text-confidence-high font-mono mt-0.5 block">
                      Auto-locked to 'high' for weighed
                    </span>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-theme-text-secondary block mb-1">
                    Weighed On Date {formData.source === 'weighed' ? '*' : ''}
                  </label>
                  <input
                    type="date"
                    required={formData.source === 'weighed'}
                    value={formData.weighedOn}
                    onChange={(e) => setFormData({ ...formData, weighedOn: e.target.value })}
                    className="w-full bg-theme-bg border border-theme-border px-3 py-1.5 text-xs text-theme-text focus:border-brand-yellow focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-theme-text-secondary block mb-1">
                    Variance Percent (&plusmn;%)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    value={formData.variancePercent}
                    onChange={(e) => setFormData({ ...formData, variancePercent: e.target.value })}
                    className="w-full bg-theme-bg border border-theme-border px-3 py-1.5 text-xs text-theme-text focus:border-brand-yellow focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* WEIGHED MEASUREMENT CALCULATOR (Rule: grams weighed and total nutrition for that weight with preview) */}
              <div className="border-2 border-brand-yellow/80 bg-brand-yellow/10 p-3 mb-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1.5 text-xs font-black uppercase text-theme-text">
                    <span>⚖️</span>
                    <span>Laboratory Weighed Calculator & Per 100g Converter</span>
                  </div>
                  <button
                    type="button"
                    onClick={applyWeighedToPer100g}
                    className="bg-brand-yellow text-brand-black text-[11px] font-black uppercase px-2.5 py-1 hover:bg-[#E5C000] active:scale-95 shadow-sm"
                  >
                    Apply Preview to per 100g
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-7 gap-2 mb-2">
                  <div>
                    <label className="text-[9px] font-bold uppercase text-theme-text-secondary block">
                      Grams Weighed
                    </label>
                    <input
                      type="number"
                      value={weighedGrams}
                      onChange={(e) => setWeighedGrams(e.target.value)}
                      placeholder="e.g. 350"
                      className="w-full bg-theme-surface border border-theme-border px-2 py-1 text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase text-theme-text-secondary block">
                      Total kcal
                    </label>
                    <input
                      type="number"
                      value={weighedNutrition.kcal}
                      onChange={(e) => setWeighedNutrition({ ...weighedNutrition, kcal: e.target.value })}
                      placeholder="e.g. 640"
                      className="w-full bg-theme-surface border border-theme-border px-2 py-1 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase text-theme-text-secondary block">
                      Total Protein (g)
                    </label>
                    <input
                      type="number"
                      value={weighedNutrition.protein}
                      onChange={(e) => setWeighedNutrition({ ...weighedNutrition, protein: e.target.value })}
                      placeholder="e.g. 28"
                      className="w-full bg-theme-surface border border-theme-border px-2 py-1 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase text-theme-text-secondary block">
                      Total Carbs (g)
                    </label>
                    <input
                      type="number"
                      value={weighedNutrition.carbs}
                      onChange={(e) => setWeighedNutrition({ ...weighedNutrition, carbs: e.target.value })}
                      placeholder="e.g. 75"
                      className="w-full bg-theme-surface border border-theme-border px-2 py-1 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase text-theme-text-secondary block">
                      Total Fat (g)
                    </label>
                    <input
                      type="number"
                      value={weighedNutrition.fat}
                      onChange={(e) => setWeighedNutrition({ ...weighedNutrition, fat: e.target.value })}
                      placeholder="e.g. 25"
                      className="w-full bg-theme-surface border border-theme-border px-2 py-1 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase text-theme-text-secondary block">
                      Fibre (g)
                    </label>
                    <input
                      type="number"
                      value={weighedNutrition.fibre}
                      onChange={(e) => setWeighedNutrition({ ...weighedNutrition, fibre: e.target.value })}
                      placeholder="e.g. 4"
                      className="w-full bg-theme-surface border border-theme-border px-2 py-1 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase text-theme-text-secondary block">
                      Sodium (mg)
                    </label>
                    <input
                      type="number"
                      value={weighedNutrition.sodium}
                      onChange={(e) => setWeighedNutrition({ ...weighedNutrition, sodium: e.target.value })}
                      placeholder="e.g. 850"
                      className="w-full bg-theme-surface border border-theme-border px-2 py-1 text-xs font-mono"
                    />
                  </div>
                </div>

                {/* CALCULATED PREVIEW ROW */}
                <div className="bg-theme-bg p-2 text-[11px] font-mono flex flex-wrap items-center justify-between border border-theme-border-subtle">
                  <span className="font-bold text-theme-text dark:text-brand-yellow uppercase">Calculated Per 100g Preview:</span>
                  <div className="space-x-3 text-theme-text">
                    <span>kcal: <strong>{weighedPer100gPreview?.kcal ?? '—'}</strong></span>
                    <span>Protein: <strong>{weighedPer100gPreview?.protein ?? '—'}g</strong></span>
                    <span>Carbs: <strong>{weighedPer100gPreview?.carbs ?? '—'}g</strong></span>
                    <span>Fat: <strong>{weighedPer100gPreview?.fat ?? '—'}g</strong></span>
                    <span>Fibre: <strong>{weighedPer100gPreview?.fibre ?? '—'}g</strong></span>
                    <span>Sodium: <strong>{weighedPer100gPreview?.sodium ?? '—'}mg</strong></span>
                  </div>
                </div>
              </div>

              {/* Status Flags */}
              <div className="flex space-x-6 pt-2">
                <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold uppercase">
                  <input
                    type="checkbox"
                    checked={formData.isSample}
                    onChange={(e) => setFormData({ ...formData, isSample: e.target.checked })}
                    className="accent-brand-yellow w-4 h-4"
                  />
                  <span>Is Sample Data (shows "Sample data" badge)</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold uppercase">
                  <input
                    type="checkbox"
                    checked={formData.verified}
                    onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                    className="accent-brand-yellow w-4 h-4"
                  />
                  <span>Laboratory Verified</span>
                </label>
              </div>
            </div>

            {/* SECTION C: PER 100G NUTRITIONAL PROFILE */}
            <div className="border border-theme-border bg-theme-surface p-4">
              <h2 className="font-heading text-lg font-black uppercase text-theme-text mb-2 border-b border-theme-border-subtle pb-1">
                C. Per 100g Nutrition (Null if unmeasured)
              </h2>
              <p className="text-[10px] text-theme-text-muted mb-3 font-mono">
                * Rule 2: Never invent nutrition data. Leave fields blank to store as null.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.keys(formData.per100g).map((key) => (
                  <div key={key}>
                    <label className="text-[10px] font-bold uppercase text-theme-text-secondary block mb-1">
                      {key} {key === 'kcal' ? '(kcal)' : key === 'sodium' ? '(mg)' : '(g)'}
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.per100g[key]}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          per100g: { ...formData.per100g, [key]: e.target.value },
                        })
                      }
                      placeholder="null"
                      className="w-full bg-theme-bg border border-theme-border px-2.5 py-1 text-xs text-theme-text font-mono focus:border-brand-yellow focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION D: PORTIONS */}
            <div className="border border-theme-border bg-theme-surface p-4">
              <div className="flex items-center justify-between mb-3 border-b border-theme-border-subtle pb-1">
                <h2 className="font-heading text-lg font-black uppercase text-theme-text">
                  D. Portions (Pieces / Sizes)
                </h2>
                <button
                  type="button"
                  onClick={handleAddPortion}
                  className="bg-theme-bg border border-theme-border px-2.5 py-1 text-xs font-bold uppercase hover:border-brand-yellow"
                >
                  + Add Portion
                </button>
              </div>

              <div className="space-y-2">
                {formData.portions.map((portion, index) => (
                  <div
                    key={index}
                    className="flex flex-wrap items-center gap-2 border border-theme-border-subtle p-2 bg-theme-bg"
                  >
                    <div className="w-28">
                      <label className="text-[9px] text-theme-text-muted uppercase block">Key</label>
                      <input
                        type="text"
                        required
                        value={portion.key}
                        onChange={(e) => {
                          const updated = [...formData.portions];
                          updated[index].key = e.target.value;
                          setFormData({ ...formData, portions: updated });
                        }}
                        className="w-full bg-theme-surface border border-theme-border px-2 py-1 text-xs font-mono"
                      />
                    </div>

                    <div className="flex-1">
                      <label className="text-[9px] text-theme-text-muted uppercase block">Label</label>
                      <input
                        type="text"
                        required
                        value={portion.label}
                        onChange={(e) => {
                          const updated = [...formData.portions];
                          updated[index].label = e.target.value;
                          setFormData({ ...formData, portions: updated });
                        }}
                        className="w-full bg-theme-surface border border-theme-border px-2 py-1 text-xs"
                      />
                    </div>

                    <div className="w-24">
                      <label className="text-[9px] text-theme-text-muted uppercase block">Grams</label>
                      <input
                        type="number"
                        required
                        min="20"
                        max="3000"
                        value={portion.grams}
                        onChange={(e) => {
                          const updated = [...formData.portions];
                          updated[index].grams = Number(e.target.value);
                          setFormData({ ...formData, portions: updated });
                        }}
                        className="w-full bg-theme-surface border border-theme-border px-2 py-1 text-xs font-mono"
                      />
                    </div>

                    <div className="flex items-center space-x-1 pt-3">
                      <label className="text-[10px] text-theme-text-secondary flex items-center space-x-1 cursor-pointer">
                        <input
                          type="radio"
                          name="defaultPortion"
                          checked={formData.defaultPortionKey === portion.key}
                          onChange={() => setFormData({ ...formData, defaultPortionKey: portion.key })}
                          className="accent-brand-yellow"
                        />
                        <span>Default</span>
                      </label>

                      {formData.portions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePortion(index)}
                          className="text-theme-text-muted hover:text-verdict-heavy px-1.5 font-bold"
                          title="Remove portion"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION E: MODIFIERS */}
            <div className="border border-theme-border bg-theme-surface p-4">
              <div className="flex items-center justify-between mb-3 border-b border-theme-border-subtle pb-1">
                <h2 className="font-heading text-lg font-black uppercase text-theme-text">
                  E. Hidden Calorie Modifiers
                </h2>
                <button
                  type="button"
                  onClick={handleAddModifier}
                  className="bg-theme-bg border border-theme-border px-2.5 py-1 text-xs font-bold uppercase hover:border-brand-yellow"
                >
                  + Add Modifier
                </button>
              </div>

              <div className="space-y-2">
                {formData.modifiers.map((mod, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-2 sm:grid-cols-8 gap-2 border border-theme-border-subtle p-2 bg-theme-bg items-center"
                  >
                    <div className="sm:col-span-2">
                      <label className="text-[9px] text-theme-text-muted uppercase block">Key</label>
                      <input
                        type="text"
                        value={mod.key}
                        onChange={(e) => {
                          const updated = [...formData.modifiers];
                          updated[index].key = e.target.value;
                          setFormData({ ...formData, modifiers: updated });
                        }}
                        className="w-full bg-theme-surface border border-theme-border px-2 py-1 text-xs font-mono"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[9px] text-theme-text-muted uppercase block">Label</label>
                      <input
                        type="text"
                        value={mod.label}
                        onChange={(e) => {
                          const updated = [...formData.modifiers];
                          updated[index].label = e.target.value;
                          setFormData({ ...formData, modifiers: updated });
                        }}
                        className="w-full bg-theme-surface border border-theme-border px-2 py-1 text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] text-theme-text-muted uppercase block">&Delta; kcal</label>
                      <input
                        type="number"
                        value={mod.kcalDelta ?? ''}
                        onChange={(e) => {
                          const updated = [...formData.modifiers];
                          updated[index].kcalDelta = e.target.value === '' ? null : Number(e.target.value);
                          setFormData({ ...formData, modifiers: updated });
                        }}
                        className="w-full bg-theme-surface border border-theme-border px-2 py-1 text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] text-theme-text-muted uppercase block">&Delta; fat</label>
                      <input
                        type="number"
                        step="any"
                        value={mod.fatDelta ?? ''}
                        onChange={(e) => {
                          const updated = [...formData.modifiers];
                          updated[index].fatDelta = e.target.value === '' ? null : Number(e.target.value);
                          setFormData({ ...formData, modifiers: updated });
                        }}
                        className="w-full bg-theme-surface border border-theme-border px-2 py-1 text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] text-theme-text-muted uppercase block">&Delta; grams</label>
                      <input
                        type="number"
                        value={mod.gramsDelta ?? ''}
                        onChange={(e) => {
                          const updated = [...formData.modifiers];
                          updated[index].gramsDelta = e.target.value === '' ? null : Number(e.target.value);
                          setFormData({ ...formData, modifiers: updated });
                        }}
                        className="w-full bg-theme-surface border border-theme-border px-2 py-1 text-xs font-mono"
                      />
                    </div>

                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveModifier(index)}
                        className="text-theme-text-muted hover:text-verdict-heavy text-xs font-bold mt-3"
                      >
                        ✕ Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION F: NOTES & SUBMISSION */}
            <div className="border border-theme-border bg-theme-surface p-4">
              <label className="text-[10px] font-bold uppercase text-theme-text-secondary block mb-1">
                Internal Notes & Kitchen Methodology
              </label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="e.g. Kongu style seeraga samba, heavy coconut oil tempering..."
                className="w-full bg-theme-bg border border-theme-border px-3 py-2 text-xs text-theme-text mb-4"
              />

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="bg-brand-yellow text-brand-black font-heading font-black text-sm uppercase py-2.5 px-6 hover:bg-[#E5C000] active:scale-[0.99] transition"
                >
                  {formLoading ? 'Saving...' : editingId ? 'Update Dish Profile' : 'Create Dish Profile'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('list');
                    setEditingId(null);
                  }}
                  className="border border-theme-border text-theme-text font-bold text-xs uppercase px-4 py-2 hover:border-brand-yellow"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

