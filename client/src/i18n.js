import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import ta from './locales/ta.json';
import hi from './locales/hi.json';
import es from './locales/es.json';
import ar from './locales/ar.json';
import { loadLanguageFont } from './utils/fontLoader.js';

// Custom detector options
const detectorOptions = {
  order: ['localStorage', 'navigator'],
  lookupLocalStorage: 'nutrilabel_language',
  caches: ['localStorage'],
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ta: { translation: ta },
      hi: { translation: hi },
      es: { translation: es },
      ar: { translation: ar },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'ta', 'hi', 'es', 'ar'],
    detection: detectorOptions,
    interpolation: {
      escapeValue: false,
    },
  });

// Handle RTL direction and dynamic font loading on language change
i18n.on('languageChanged', (lng) => {
  const isRtl = lng === 'ar';
  document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
  document.documentElement.setAttribute('lang', lng);
  loadLanguageFont(lng);
});

// Initial font & direction setup
const initialLang = i18n.language || 'en';
document.documentElement.setAttribute('dir', initialLang === 'ar' ? 'rtl' : 'ltr');
document.documentElement.setAttribute('lang', initialLang);
loadLanguageFont(initialLang);

export default i18n;

