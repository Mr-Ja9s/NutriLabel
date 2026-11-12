import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundScreen() {
  useEffect(() => {
    document.title = '404 Not Found | NutriLabel';
  }, []);

  return (
    <div className="w-full max-w-md mx-auto px-4 pt-10 pb-28 text-center">
      {/* 404 Banner */}
      <div className="border-4 border-brand-black bg-theme-surface p-8 shadow-label-night">
        <span className="bg-brand-yellow text-brand-black text-xs font-black uppercase px-2.5 py-1 tracking-widest rounded-sm inline-block mb-3">
          Error 404
        </span>

        <h1 className="font-heading text-6xl font-black uppercase tracking-tight text-theme-text mb-2">
          Dish Not Found
        </h1>

        <div className="h-1 bg-brand-yellow w-24 mx-auto mb-4"></div>

        <p className="text-sm font-medium text-theme-text-secondary leading-relaxed mb-6">
          The plate or link you are looking for isn&apos;t on the NutriLabel menu or has been moved.
        </p>

        <div className="space-y-3">
          <Link
            to="/"
            className="block w-full bg-brand-yellow text-brand-black font-heading font-black text-sm uppercase py-3 px-6 hover:bg-[#E5C000] active:scale-[0.99] transition border-2 border-brand-black shadow-sm"
          >
            ← Back to Coimbatore Menu
          </Link>

          <Link
            to="/budget"
            className="block w-full border-2 border-theme-border bg-theme-surface text-theme-text font-bold text-xs uppercase py-2.5 px-4 hover:border-brand-yellow transition"
          >
            View Today&apos;s Calorie Budget
          </Link>
        </div>

        <div className="mt-8 pt-4 border-t border-theme-border-subtle">
          <p className="text-[10px] uppercase font-bold tracking-wider text-theme-text-muted">
            Estimates only, not medical advice.
          </p>
        </div>
      </div>
    </div>
  );
}

