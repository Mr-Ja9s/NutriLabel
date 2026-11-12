import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

export default function LanguagePickerScreen() {
  const navigate = useNavigate();
  const { language, setLanguage } = useApp();

  const languages = [
    {
      code: 'en',
      nativeName: 'English',
      englishName: 'English (India / US)',
      script: 'Latin',
      region: 'Universal',
    },
    {
      code: 'ta',
      nativeName: 'தமிழ்',
      englishName: 'Tamil',
      script: 'Tamil',
      region: 'Coimbatore & Kongu Region',
      recommended: true,
    },
    {
      code: 'hi',
      nativeName: 'हिन्दी',
      englishName: 'Hindi',
      script: 'Devanagari',
      region: 'Pan-India',
    },
    {
      code: 'es',
      nativeName: 'Español',
      englishName: 'Spanish',
      script: 'Latin',
      region: 'International',
    },
    {
      code: 'ar',
      nativeName: 'العربية',
      englishName: 'Arabic',
      script: 'Arabic (RTL)',
      region: 'Middle East',
    },
  ];

  const handleSelect = (code) => {
    setLanguage(code);
    navigate(-1); // Return to previous screen
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 pt-3 pb-28">
      {/* Top Disclaimer Banner - Rule 7 */}
      <div className="mb-3 text-center py-1 px-3 border border-dashed border-theme-border-subtle bg-theme-surface rounded text-[10px] uppercase tracking-wider text-theme-text-secondary font-bold">
        Estimates only, not medical advice.
      </div>

      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-theme-border pb-3 mb-4">
        <div>
          <span className="bg-brand-yellow text-brand-black text-[10px] font-black uppercase px-2 py-0.5 tracking-wider rounded-sm">
            Localization
          </span>
          <h1 className="font-heading text-3xl font-black uppercase tracking-tight text-theme-text mt-1">
            Select Language
          </h1>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="text-xs font-bold uppercase text-theme-text-secondary hover:text-theme-text"
        >
          ✕ Back
        </button>
      </div>

      <p className="text-xs text-theme-text-secondary mb-4">
        Choose your preferred language for dish nutrition information, portion units, and goal recommendations:
      </p>

      {/* Language List with Native Names */}
      <div className="space-y-2.5">
        {languages.map((item) => {
          const isSelected = language === item.code;
          return (
            <div
              key={item.code}
              role="button"
              tabIndex={0}
              aria-label={`Select ${item.englishName} (${item.nativeName})`}
              aria-pressed={isSelected}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelect(item.code);
                }
              }}
              onClick={() => handleSelect(item.code)}
              className={`border-2 p-3.5 min-h-[52px] cursor-pointer transition flex items-center justify-between ${
                isSelected
                  ? 'border-brand-yellow bg-theme-surface shadow-label-night'
                  : 'border-theme-border bg-theme-surface hover:border-theme-border-subtle'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'border-brand-yellow bg-brand-yellow' : 'border-theme-border'
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-brand-black"></div>}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-heading text-xl font-black text-theme-text">
                      {item.nativeName}
                    </span>
                    {item.recommended && (
                      <span className="bg-brand-yellow text-brand-black text-[9px] font-black uppercase px-1.5 py-0.2">
                        Coimbatore Local
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-theme-text-secondary">
                    {item.englishName} &bull; <span className="font-mono">{item.region}</span>
                  </div>
                </div>
              </div>

              <div className="text-xs font-mono text-theme-text-muted uppercase">
                {item.script}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
