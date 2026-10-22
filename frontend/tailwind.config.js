/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dnd: {
          // Layered surfaces (Elevation system)
          dark: '#0a0a0f',       // App Canvas / background
          surface: '#12131d',    // Main cards, headers, containers
          elevated: '#181a26',   // Nested cards, inputs, secondary blocks
          highlight: '#202334',  // Hover states, active elements
          border: '#26293a',     // Subtle contrast border
          'border-focus': '#e11d48',
          
          // Semantic text tokens
          text: '#f3f4f6',
          muted: '#9ca3af',
          dim: '#6b7280',

          // Black Rose Brand Accents
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
      screens: {
        'xs': '380px',
      },
      boxShadow: {
        'dnd-glow': '0 0 20px -5px rgba(225, 29, 72, 0.3)',
        'dnd-card': '0 4px 20px -2px rgba(0, 0, 0, 0.45)',
      },
    },
  },
  plugins: [],
}
