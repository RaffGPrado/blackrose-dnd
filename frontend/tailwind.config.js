/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Fraunces Variable"', 'Georgia', 'serif'],
        sans: ['"Inter Variable"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // Codex Editorial Tokens (Automatic Light Parchment / Dark Grimoire)
        paper: 'rgb(var(--paper) / <alpha-value>)',
        card: 'rgb(var(--card) / <alpha-value>)',
        elevated: 'rgb(var(--elevated) / <alpha-value>)',
        ink: {
          DEFAULT: 'rgb(var(--ink) / <alpha-value>)',
          soft: 'rgb(var(--ink-soft) / <alpha-value>)',
          faint: 'rgb(var(--ink-faint) / <alpha-value>)',
        },
        rule: {
          DEFAULT: 'rgb(var(--rule) / <alpha-value>)',
          strong: 'rgb(var(--rule-strong) / <alpha-value>)',
        },
        rose: {
          DEFAULT: 'rgb(var(--rose) / <alpha-value>)',
          soft: 'rgb(var(--rose-soft) / <alpha-value>)',
        },
        heal: {
          DEFAULT: 'rgb(var(--heal) / <alpha-value>)',
          soft: 'rgb(var(--heal-soft) / <alpha-value>)',
        },
        gold: {
          DEFAULT: 'rgb(var(--gold) / <alpha-value>)',
          soft: 'rgb(var(--gold-soft) / <alpha-value>)',
        },

        // Legacy dnd.* tokens mapped to Codex palette for seamless compatibility across all pages
        dnd: {
          dark: 'rgb(var(--paper) / <alpha-value>)',
          surface: 'rgb(var(--card) / <alpha-value>)',
          elevated: 'rgb(var(--elevated) / <alpha-value>)',
          highlight: 'rgb(var(--rule) / <alpha-value>)',
          border: 'rgb(var(--rule) / <alpha-value>)',
          'border-focus': 'rgb(var(--rose) / <alpha-value>)',
          text: 'rgb(var(--ink) / <alpha-value>)',
          muted: 'rgb(var(--ink-soft) / <alpha-value>)',
          dim: 'rgb(var(--ink-faint) / <alpha-value>)',

          rose: {
            DEFAULT: '#e11d48',
            light: '#fb7185',
            dark: '#881337',
            faint: 'rgba(225, 29, 72, 0.15)',
          },
          gold: {
            DEFAULT: '#f59e0b',
            light: '#fde68a',
            faint: 'rgba(245, 158, 11, 0.15)',
          },
          emerald: {
            DEFAULT: '#10b981',
            light: '#6ee7b7',
            faint: 'rgba(16, 185, 129, 0.15)',
          },
          blue: {
            DEFAULT: '#3b82f6',
            light: '#93c5fd',
            faint: 'rgba(59, 130, 246, 0.15)',
          },
          purple: {
            DEFAULT: '#9333ea',
            light: '#c084fc',
            faint: 'rgba(147, 51, 234, 0.15)',
          },
        },
      },
      minHeight: {
        tap: '48px',
      },
      minWidth: {
        tap: '48px',
      },
      screens: {
        'xs': '380px',
      },
      boxShadow: {
        'dnd-glow': '0 0 20px -5px rgba(225, 29, 72, 0.3)',
        'dnd-card': '0 4px 20px -2px rgba(0, 0, 0, 0.25)',
      },
    },
  },
  plugins: [],
};
