/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Core Brand Tokens (Rule 10)
        brand: {
          black: '#0A0A0A',
          yellow: '#FFD500',
          white: '#FAFAFA',
        },
        // Dynamic Night/Day Semantic Tokens
        theme: {
          bg: 'var(--color-bg)',
          surface: 'var(--color-surface)',
          'surface-raised': 'var(--color-surface-raised)',
          border: 'var(--color-border)',
          'border-subtle': 'var(--color-border-subtle)',
          'border-heavy': 'var(--color-border-heavy)',
          text: 'var(--color-text-primary)',
          'text-secondary': 'var(--color-text-secondary)',
          'text-muted': 'var(--color-text-muted)',
        },
        // Goal Verdict Tokens (Reserved strictly for verdict badges)
        verdict: {
          good: '#16A34A',
          okay: '#F59E0B',
          heavy: '#DC2626',
        },
        // Confidence Level Tokens
        confidence: {
          high: '#22C55E',
          medium: '#3B82F6',
          low: '#EAB308',
        },
      },
      fontFamily: {
        heading: [
          'Barlow Condensed',
          'Noto Sans Tamil',
          'Noto Sans Devanagari',
          'Noto Sans Arabic',
          'sans-serif',
        ],
        body: [
          'Noto Sans',
          'Noto Sans Tamil',
          'Noto Sans Devanagari',
          'Noto Sans Arabic',
          'sans-serif',
        ],
      },
      borderWidth: {
        hairline: '1px',
        medium: '2px',
        frame: '3px',
        heavy: '8px', // Iconic calorie rule bar
      },
      boxShadow: {
        'label-night': '3px 3px 0px #FFD500',
        'label-day': '3px 3px 0px #0A0A0A',
      },
      borderRadius: {
        label: '3px',
      },
    },
  },
  plugins: [],
}
