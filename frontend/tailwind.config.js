/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Zambian Flag Colors
        zambia: {
          green: {
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac',
            400: '#4ade80',
            500: '#22c55e', // Main Zambian Green
            600: '#16a34a',
            700: '#15803d',
            800: '#166534',
            900: '#14532d',
          },
          red: {
            50: '#fef2f2',
            100: '#fee2e2',
            200: '#fecaca',
            300: '#fca5a5',
            400: '#f87171',
            500: '#ef4444', // Zambian Red
            600: '#dc2626',
            700: '#b91c1c',
            800: '#991b1b',
            900: '#7f1d1d',
          },
          black: {
            50: '#f8fafc',
            100: '#f1f5f9',
            200: '#e2e8f0',
            300: '#cbd5e1',
            400: '#94a3b8',
            500: '#64748b',
            600: '#475569',
            700: '#334155',
            800: '#1e293b', // Zambian Black
            900: '#0f172a',
          },
          orange: {
            50: '#fff7ed',
            100: '#ffedd5',
            200: '#fed7aa',
            300: '#fdba74',
            400: '#fb923c',
            500: '#f97316', // Zambian Orange
            600: '#ea580c',
            700: '#c2410c',
            800: '#9a3412',
            900: '#7c2d12',
          }
        },
        // Professional color scheme using Zambian colors
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e', // Zambian Green
          600: '#16a34a',
          700: '#15803d',
        },
        secondary: {
          50: '#fff7ed',
          100: '#ffedd5',
          500: '#f97316', // Zambian Orange
          600: '#ea580c',
          700: '#c2410c',
        },
        accent: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444', // Zambian Red
          600: '#dc2626',
          700: '#b91c1c',
        },
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b', // Zambian Black
          900: '#0f172a',
        }
      }
    },
  },
  plugins: [],
}
