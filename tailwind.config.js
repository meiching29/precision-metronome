/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['DM Mono', 'monospace'],
        body: ['DM Sans', 'sans-serif'],
      },
      colors: {
        obsidian: {
          50:  '#f5f5f0',
          100: '#e8e8e0',
          200: '#d0d0c4',
          300: '#adadA0',
          400: '#888878',
          500: '#6e6e5e',
          600: '#575748',
          700: '#45453a',
          800: '#3a3a30',
          900: '#242420',
          950: '#141410',
        },
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
        }
      },
      animation: {
        'pulse-beat': 'pulse-beat 0.12s ease-out',
        'glow': 'glow 2s ease-in-out infinite',
        'spin-slow': 'spin 4s linear infinite',
      },
      keyframes: {
        'pulse-beat': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.15)', opacity: '0.9' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(251,191,36,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(251,191,36,0.6)' },
        },
      },
    },
  },
  plugins: [],
}
