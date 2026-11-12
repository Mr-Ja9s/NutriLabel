import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { loggedDishes } = useApp();

  const navItems = [
    { path: '/', label: 'Dishes', icon: '🍽️' },
    { path: '/dish/sample-1', label: 'Nutrition', icon: '🏷️' },
    { path: '/budget', label: 'Budget', icon: '📊', badge: loggedDishes.length },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  const currentPath = location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-theme-surface border-t-2 border-theme-border shadow-2xl safe-bottom">
      <div className="max-w-md mx-auto flex items-center justify-around py-1.5 px-2">
        {navItems.map((item) => {
          const isActive =
            item.path === '/'
              ? currentPath === '/'
              : currentPath.startsWith(item.path.split('/')[1] ? `/${item.path.split('/')[1]}` : item.path);

          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-3 rounded transition-all active:scale-95 ${
                isActive
                  ? 'text-brand-yellow font-black'
                  : 'text-theme-text-secondary hover:text-theme-text'
              }`}
            >
              <span className="text-lg leading-none mb-0.5">{item.icon}</span>
              <span className="font-heading text-[11px] uppercase tracking-wider font-bold">
                {item.label}
              </span>

              {/* Added Items Count Badge */}
              {item.badge > 0 && (
                <span className="absolute top-0 right-2 w-4 h-4 bg-brand-yellow text-brand-black text-[9px] font-black rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}

              {/* Active Indicator Bar */}
              {isActive && (
                <div className="w-5 h-0.5 bg-brand-yellow mt-0.5 rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
