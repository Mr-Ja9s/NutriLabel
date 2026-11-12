import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext.jsx';
import HomeScreen from './screens/HomeScreen.jsx';
import DishResultScreen from './screens/DishResultScreen.jsx';
import DailyBudgetScreen from './screens/DailyBudgetScreen.jsx';
import SettingsScreen from './screens/SettingsScreen.jsx';
import LanguagePickerScreen from './screens/LanguagePickerScreen.jsx';
import AdminScreen from './screens/AdminScreen.jsx';
import NotFoundScreen from './screens/NotFoundScreen.jsx';
import BottomNav from './components/BottomNav.jsx';
import Footer from './components/Footer.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

function AppLayout() {
  const location = useLocation();
  const [serverStatus, setServerStatus] = useState({ connected: false, checking: true });

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setServerStatus({ connected: true, checking: false });
        }
      })
      .catch(() => {
        setServerStatus({ connected: false, checking: false });
      });
  }, []);

  // Dynamic Route Page Titles
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') {
      document.title = 'NutriLabel | Coimbatore Restaurant Nutrition Facts & Calorie Estimator';
    } else if (path.startsWith('/dish/')) {
      document.title = 'Dish Nutrition Facts & Swaps | NutriLabel';
    } else if (path === '/budget') {
      document.title = 'Daily Calorie & Protein Budget | NutriLabel';
    } else if (path === '/settings') {
      document.title = 'Settings & Preferences | NutriLabel';
    } else if (path === '/language') {
      document.title = 'Select Language | NutriLabel';
    } else if (path === '/admin') {
      document.title = 'Staff Data & Weighed Nutrition Portal | NutriLabel';
    } else {
      document.title = 'Page Not Found | NutriLabel';
    }
  }, [location.pathname]);

  const hideBottomNav = location.pathname === '/language' || location.pathname === '/admin';

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text transition-colors duration-200 flex flex-col justify-between">
      {/* Background Server Health Status Badge */}
      <div className="fixed top-2 right-2 z-50 pointer-events-none">
        <div className="inline-flex items-center space-x-1 px-2 py-0.5 bg-theme-surface/90 border border-theme-border text-[9px] font-mono rounded shadow-sm backdrop-blur-sm">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              serverStatus.connected ? 'bg-confidence-high animate-pulse' : 'bg-verdict-heavy'
            }`}
          ></span>
          <span>{serverStatus.connected ? 'API: ONLINE' : 'API: OFFLINE'}</span>
        </div>
      </div>

      {/* Screen Routes Wrapped in Error Boundary */}
      <main className="flex-1 w-full">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/dish/:id" element={<DishResultScreen />} />
            <Route path="/budget" element={<DailyBudgetScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
            <Route path="/language" element={<LanguagePickerScreen />} />
            <Route path="/admin" element={<AdminScreen />} />
            {/* Friendly 404 Fallback */}
            <Route path="*" element={<NotFoundScreen />} />
          </Routes>
        </ErrorBoundary>
      </main>

      {/* Disclaimer in the Footer */}
      <Footer />

      {/* Docked Mobile Bottom Navigation */}
      {!hideBottomNav && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </AppProvider>
    </ErrorBoundary>
  );
}
