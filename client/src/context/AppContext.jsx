import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n from '../i18n.js';

// Sample fallback dishes in case backend is loading
export const FALLBACK_DISHES = [
  {
    _id: 'sample-1',
    name: 'Chicken Biryani',
    aliases: ['Kovai Chicken Biryani', 'Kongu Chicken Biryani'],
    restaurantName: 'Kongu Kitchen',
    cuisine: 'South Indian',
    isVeg: false,
    confidenceLevel: 'low',
    source: 'recipe',
    isSample: true,
    variancePercent: 25,
    per100g: {
      kcal: 185,
      protein: 8.5,
      carbs: 22.0,
      fat: 7.2,
      fibre: 1.1,
      sodium: 380,
    },
    portions: [
      { key: 'small', label: 'Small Box', grams: 250 },
      { key: 'regular', label: 'Regular Plate', grams: 350 },
      { key: 'large', label: 'Large Box', grams: 600 },
    ],
    defaultPortionKey: 'regular',
    modifiers: [
      { key: 'less_oil', label: 'Less Oil', gramsDelta: 0, kcalDelta: -65, proteinDelta: 0, carbsDelta: 0, fatDelta: -7.2 },
      { key: 'extra_gravy', label: 'Extra Salna / Gravy', gramsDelta: 75, kcalDelta: 85, proteinDelta: 1.2, carbsDelta: 3.5, fatDelta: 7.5 },
      { key: 'with_raita', label: 'With Onion Raita', gramsDelta: 50, kcalDelta: 45, proteinDelta: 1.5, carbsDelta: 2.0, fatDelta: 3.0 },
    ],
  },
  {
    _id: 'sample-2',
    name: 'Parotta',
    aliases: ['Malabar Parotta', 'Kerala Parotta'],
    restaurantName: 'Kongu Kitchen',
    cuisine: 'South Indian',
    isVeg: true,
    confidenceLevel: 'low',
    source: 'recipe',
    isSample: true,
    variancePercent: 25,
    per100g: {
      kcal: 330,
      protein: 6.2,
      carbs: 48.0,
      fat: 12.8,
      fibre: 2.0,
      sodium: 410,
    },
    portions: [
      { key: '1_piece', label: '1 Parotta', grams: 75 },
      { key: '2_pieces', label: '2 Parottas (Set)', grams: 150 },
      { key: '3_pieces', label: '3 Parottas', grams: 225 },
    ],
    defaultPortionKey: '2_pieces',
    modifiers: [
      { key: 'less_oil', label: 'Less Oil on Tawa', gramsDelta: 0, kcalDelta: -50, proteinDelta: 0, carbsDelta: 0, fatDelta: -5.5 },
      { key: 'extra_salna', label: 'Extra Salna', gramsDelta: 80, kcalDelta: 95, proteinDelta: 1.5, carbsDelta: 4.0, fatDelta: 8.0 },
    ],
  },
  {
    _id: 'sample-3',
    name: 'Chicken 65',
    aliases: ['Kovai Chicken 65', 'Spicy Fried Chicken'],
    restaurantName: 'Kongu Kitchen',
    cuisine: 'South Indian',
    isVeg: false,
    confidenceLevel: 'low',
    source: 'recipe',
    isSample: true,
    variancePercent: 25,
    per100g: {
      kcal: 260,
      protein: 19.5,
      carbs: 8.2,
      fat: 16.5,
      fibre: 0.5,
      sodium: 520,
    },
    portions: [
      { key: 'quarter', label: 'Quarter Plate', grams: 150 },
      { key: 'half', label: 'Half Plate', grams: 300 },
    ],
    defaultPortionKey: 'quarter',
    modifiers: [
      { key: 'no_deep_fry_skin', label: 'Blotted Oil', gramsDelta: -5, kcalDelta: -45, proteinDelta: 0, carbsDelta: 0, fatDelta: -5.0 },
      { key: 'extra_fried_chilli_onion', label: 'Extra Fried Onion', gramsDelta: 25, kcalDelta: 35, proteinDelta: 0.5, carbsDelta: 2.5, fatDelta: 2.8 },
    ],
  },
  {
    _id: 'sample-4',
    name: 'Kambu Koozh',
    aliases: ['Bajra Porridge', 'Millet Porridge'],
    restaurantName: 'Kongu Kitchen',
    cuisine: 'South Indian',
    isVeg: true,
    confidenceLevel: 'low',
    source: 'recipe',
    isSample: true,
    variancePercent: 25,
    per100g: {
      kcal: 65,
      protein: 2.1,
      carbs: 12.0,
      fat: 0.9,
      fibre: 1.8,
      sodium: 140,
    },
    portions: [
      { key: 'regular', label: '1 Glass (300ml)', grams: 300 },
      { key: 'pot', label: 'Clay Pot (500ml)', grams: 500 },
    ],
    defaultPortionKey: 'regular',
    modifiers: [
      { key: 'extra_buttermilk', label: 'Extra Buttermilk', gramsDelta: 50, kcalDelta: 30, proteinDelta: 1.6, carbsDelta: 2.0, fatDelta: 1.5 },
      { key: 'extra_shallots', label: 'Extra Chinna Vengayam', gramsDelta: 30, kcalDelta: 12, proteinDelta: 0.3, carbsDelta: 2.6, fatDelta: 0.1 },
    ],
  },
  {
    _id: 'sample-5',
    name: 'Idli',
    aliases: ['Steamed Idli', 'Rice Idli'],
    restaurantName: 'Annapoorna Grand',
    cuisine: 'South Indian',
    isVeg: true,
    confidenceLevel: 'low',
    source: 'recipe',
    isSample: true,
    variancePercent: 25,
    per100g: {
      kcal: 135,
      protein: 4.2,
      carbs: 28.5,
      fat: 0.5,
      fibre: 1.4,
      sodium: 190,
    },
    portions: [
      { key: '2_pieces', label: '2 Idlis', grams: 130 },
      { key: '3_pieces', label: '3 Idlis', grams: 195 },
      { key: '4_pieces', label: '4 Idlis', grams: 260 },
    ],
    defaultPortionKey: '2_pieces',
    modifiers: [
      { key: 'no_chutney', label: 'No Coconut Chutney', gramsDelta: -40, kcalDelta: -80, proteinDelta: -1.0, carbsDelta: -2.0, fatDelta: -7.5 },
      { key: 'extra_ghee', label: 'With 1 tsp Ghee', gramsDelta: 5, kcalDelta: 45, proteinDelta: 0, carbsDelta: 0, fatDelta: 5.0 },
    ],
  },
  {
    _id: 'sample-6',
    name: 'Dosa',
    aliases: ['Plain Roast', 'Crispy Dosa'],
    restaurantName: 'Annapoorna Grand',
    cuisine: 'South Indian',
    isVeg: true,
    confidenceLevel: 'low',
    source: 'recipe',
    isSample: true,
    variancePercent: 25,
    per100g: {
      kcal: 175,
      protein: 3.8,
      carbs: 26.5,
      fat: 6.0,
      fibre: 1.3,
      sodium: 230,
    },
    portions: [
      { key: 'single_roast', label: '1 Plain Roast', grams: 140 },
      { key: 'ghee_roast', label: '1 Ghee Roast', grams: 165 },
    ],
    defaultPortionKey: 'single_roast',
    modifiers: [
      { key: 'less_oil', label: 'Less Oil Roast', gramsDelta: 0, kcalDelta: -45, proteinDelta: 0, carbsDelta: 0, fatDelta: -5.0 },
      { key: 'extra_sambar', label: 'Extra Sambar', gramsDelta: 100, kcalDelta: 60, proteinDelta: 2.2, carbsDelta: 9.0, fatDelta: 1.8 },
    ],
  },
  {
    _id: 'sample-7',
    name: 'Grilled Chicken',
    aliases: ['Tandoori Chicken', 'Rotisserie'],
    restaurantName: 'Kovai Express',
    cuisine: 'South Indian',
    isVeg: false,
    confidenceLevel: 'low',
    source: 'recipe',
    isSample: true,
    variancePercent: 25,
    per100g: {
      kcal: 195,
      protein: 24.5,
      carbs: 1.5,
      fat: 10.2,
      fibre: 0.2,
      sodium: 460,
    },
    portions: [
      { key: 'quarter', label: 'Quarter Chicken', grams: 250 },
      { key: 'half', label: 'Half Chicken', grams: 500 },
      { key: 'full', label: 'Full Chicken', grams: 950 },
    ],
    defaultPortionKey: 'quarter',
    modifiers: [
      { key: 'without_mayo', label: 'Without Mayonnaise', gramsDelta: -30, kcalDelta: -120, proteinDelta: -0.3, carbsDelta: -1.0, fatDelta: -13.0 },
      { key: 'skinless', label: 'Skin Removed', gramsDelta: -25, kcalDelta: -75, proteinDelta: -1.0, carbsDelta: 0, fatDelta: -7.8 },
    ],
  },
  {
    _id: 'sample-8',
    name: 'Paneer Butter Masala',
    aliases: ['PBM', 'Butter Paneer'],
    restaurantName: 'Kovai Express',
    cuisine: 'North Indian',
    isVeg: true,
    confidenceLevel: 'low',
    source: 'recipe',
    isSample: true,
    variancePercent: 25,
    per100g: {
      kcal: 220,
      protein: 6.8,
      carbs: 8.5,
      fat: 18.2,
      fibre: 1.4,
      sodium: 390,
    },
    portions: [
      { key: 'small', label: 'Small Cup (200g)', grams: 200 },
      { key: 'regular', label: 'Regular Bowl (350g)', grams: 350 },
    ],
    defaultPortionKey: 'regular',
    modifiers: [
      { key: 'less_butter_cream', label: 'Less Butter / Cream', gramsDelta: -10, kcalDelta: -85, proteinDelta: 0, carbsDelta: -0.5, fatDelta: -9.2 },
      { key: 'extra_paneer_cubes', label: 'Extra Paneer (+50g)', gramsDelta: 50, kcalDelta: 130, proteinDelta: 9.0, carbsDelta: 1.5, fatDelta: 10.0 },
    ],
  },
];

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Theme state
  const [themeMode, setThemeModeState] = useState(() => {
    return localStorage.getItem('nutrilabel_theme') || 'system';
  });

  const setThemeMode = (mode) => {
    setThemeModeState(mode);
    try {
      localStorage.setItem('nutrilabel_theme', mode);
    } catch {}
  };

  // Language state
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('nutrilabel_language') || 'en';
  });

  const setLanguage = (lng) => {
    setLanguageState(lng);
    try {
      localStorage.setItem('nutrilabel_language', lng);
    } catch {}
  };

  // Units (kcal/kJ and g/oz) saved in localStorage
  const [energyUnit, setEnergyUnitState] = useState(() => {
    try {
      return localStorage.getItem('nutrilabel_energy_unit') || 'kcal';
    } catch {
      return 'kcal';
    }
  });

  const [weightUnit, setWeightUnitState] = useState(() => {
    try {
      return localStorage.getItem('nutrilabel_weight_unit') || 'g';
    } catch {
      return 'g';
    }
  });

  const setEnergyUnit = (unit) => {
    setEnergyUnitState(unit);
    try {
      localStorage.setItem('nutrilabel_energy_unit', unit);
    } catch (e) {}
  };

  const setWeightUnit = (unit) => {
    setWeightUnitState(unit);
    try {
      localStorage.setItem('nutrilabel_weight_unit', unit);
    } catch (e) {}
  };

  // Goal mode
  const [goalMode, setGoalModeState] = useState(() => {
    return localStorage.getItem('nutrilabel_goal_mode') || 'weight_loss';
  });

  const setGoalMode = (mode) => {
    setGoalModeState(mode);
    try {
      localStorage.setItem('nutrilabel_goal_mode', mode);
    } catch {}
  };

  // 2. Daily Budget: Editable targets in localStorage
  const [dailyBudget, setDailyBudgetState] = useState(() => {
    try {
      const saved = localStorage.getItem('nutrilabel_daily_budget');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { targetKcal: 2000, targetProtein: 120 };
  });

  const setDailyBudget = (budget) => {
    setDailyBudgetState(budget);
    try {
      localStorage.setItem('nutrilabel_daily_budget', JSON.stringify(budget));
    } catch {}
  };

  // 2. Daily Logged Dishes: Reset automatically each new day
  const [loggedDishes, setLoggedDishes] = useState(() => {
    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      const storedDate = localStorage.getItem('nutrilabel_budget_date');
      if (storedDate !== todayStr) {
        // New day! Reset
        localStorage.setItem('nutrilabel_budget_date', todayStr);
        localStorage.setItem('nutrilabel_logged_dishes', JSON.stringify([]));
        return [];
      }
      const saved = localStorage.getItem('nutrilabel_logged_dishes');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Sync logged dishes to localStorage
  const saveLoggedDishes = (newDishes) => {
    setLoggedDishes(newDishes);
    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      localStorage.setItem('nutrilabel_budget_date', todayStr);
      localStorage.setItem('nutrilabel_logged_dishes', JSON.stringify(newDishes));
    } catch {}
  };

  // Theme effect (sets .dark, .theme-night, .theme-day on html)
  useEffect(() => {
    let isDark = false;
    if (themeMode === 'system') {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      isDark = themeMode === 'night';
    }

    if (isDark) {
      document.documentElement.classList.add('dark', 'theme-night');
      document.documentElement.classList.remove('theme-day');
    } else {
      document.documentElement.classList.remove('dark', 'theme-night');
      document.documentElement.classList.add('theme-day');
    }
  }, [themeMode]);

  // Language & RTL effect (sets lang and dir attributes on <html>, loads language fonts)
  useEffect(() => {
    const isRtl = language === 'ar';
    document.documentElement.setAttribute('lang', language);
    document.documentElement.lang = language;
    document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
    if (i18n && i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language]);

  // Add dish to today
  const addDishToToday = (item) => {
    const updated = [
      ...loggedDishes,
      {
        id: `logged-${Date.now()}`,
        ...item,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
    saveLoggedDishes(updated);
  };

  // Remove dish from today
  const removeDishFromToday = (id) => {
    const updated = loggedDishes.filter((d) => d.id !== id);
    saveLoggedDishes(updated);
  };

  return (
    <AppContext.Provider
      value={{
        themeMode,
        setThemeMode,
        language,
        setLanguage,
        energyUnit,
        setEnergyUnit,
        weightUnit,
        setWeightUnit,
        goalMode,
        setGoalMode,
        dailyBudget,
        setDailyBudget,
        loggedDishes,
        addDishToToday,
        removeDishFromToday,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
