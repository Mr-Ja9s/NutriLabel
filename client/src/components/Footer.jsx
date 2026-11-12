import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="w-full border-t-2 border-theme-border bg-theme-surface mt-10 py-6 px-4">
      <div className="max-w-md mx-auto text-center space-y-2">
        {/* Brand pill */}
        <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 bg-brand-yellow text-brand-black text-[10px] font-heading font-black uppercase tracking-wider rounded-sm">
          <span>⚠️</span>
          <span>{t('legal.disclaimerTitle', 'Legal Disclaimer')}</span>
        </div>

        {/* Primary Disclaimer - Rule 7 */}
        <p className="text-xs font-bold uppercase tracking-wide text-theme-text-secondary">
          {t('disclaimer', 'Estimates only, not medical advice.')}
        </p>

        {/* Extended detail */}
        <p className="text-[11px] text-theme-text-muted leading-relaxed max-w-sm mx-auto">
          NutriLabel estimates nutritional ranges using standard Kongu and South Indian restaurant recipes, IFCT databases, and sample kitchen weighings. Actual calories and macros vary based on cooking oil, salna absorption, and serving size.
        </p>

        {/* Bottom copyright / location stamp */}
        <div className="pt-2 border-t border-theme-border-subtle flex items-center justify-between text-[10px] text-theme-text-muted font-mono">
          <span>COIMBATORE, TN</span>
          <span>NUTRILABEL &copy; {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}

