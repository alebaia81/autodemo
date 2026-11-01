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
        gz: {
          bg: '#0F1015',
          card: '#16181F',
          surface: '#1C1E26',
          border: '#272A34',
          gold: '#E5A93C',
          'gold-light': '#F59E0B',
          silver: '#94A3B8',
          text: '#FFFFFF',
          badge: {
            available: '#10B981',
            negotiating: '#F59E0B',
            sold: '#64748B',
            neopatentati: '#38BDF8',
          }
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      }
    },
  },
  plugins: [],
};
