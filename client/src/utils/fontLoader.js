/**
 * Dynamic Font Loader
 * Loads the Tamil, Devanagari, and Arabic fonts ONLY when that language is selected.
 */
const FONT_MAP = {
  ta: {
    id: 'font-google-tamil',
    href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;600;700&display=swap',
  },
  hi: {
    id: 'font-google-devanagari',
    href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700&display=swap',
  },
  ar: {
    id: 'font-google-arabic',
    href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;600;700&display=swap',
  },
};

export function loadLanguageFont(lang) {
  const fontConfig = FONT_MAP[lang];
  if (!fontConfig) return;

  if (!document.getElementById(fontConfig.id)) {
    const link = document.createElement('link');
    link.id = fontConfig.id;
    link.rel = 'stylesheet';
    link.href = fontConfig.href;
    document.head.appendChild(link);
    console.log(`[FontLoader] Dynamically loaded font for language: ${lang}`);
  }
}

