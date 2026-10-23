/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#0B0F19',
          900: '#0F131D',
          850: '#141824',
          800: '#171B26',
          750: '#1C1F2A',
          700: '#262A35',
          600: '#313540',
        },
        surface: {
          DEFAULT: '#0F131D',
          container: '#1C1F2A',
          'container-lowest': '#0A0E18',
          'container-low': '#171B26',
          'container-high': '#262A35',
          'container-highest': '#313540',
        },
        brand: {
          indigo: '#6366F1',
          'indigo-glow': '#8083FF',
          amber: '#F59E0B',
          emerald: '#10B981',
          cyan: '#06B6D4',
          purple: '#8B5CF6',
          rose: '#EF4444',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-primary': '0 0 24px -4px rgba(99, 102, 241, 0.4)',
        'glow-amber': '0 0 20px -4px rgba(245, 158, 11, 0.25)',
        'glow-emerald': '0 0 20px -4px rgba(16, 185, 129, 0.25)',
        'glow-cyan': '0 0 20px -4px rgba(6, 182, 212, 0.25)',
        'glow-purple': '0 0 20px -4px rgba(139, 92, 246, 0.25)',
      }
    },
  },
  plugins: [],
}
