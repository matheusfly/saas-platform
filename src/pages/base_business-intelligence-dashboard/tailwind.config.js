/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'background-primary': '#9A9873',
        'surface-header': '#1E1E1E',
        'surface-sidebar': '#353B37',
        'surface-card': '#FAF9F0',
        'text-main': '#1E1E1E',
        'text-muted': '#858360',
        'text-on-accent': '#1E1E1E',
        'text-on-dark': '#FAF9F0',
        'accent-primary': '#B0D236',
        'accent-primary-hover': '#A1C02F',
        'accent-secondary': '#6F6C4B',
        'accent-positive': '#B0D236',
        'accent-warning': '#BDB58A',
        'accent-negative': '#D9534F',
        'brand-border': '#656B4B',
      },
      transitionProperty: {
        'width': 'width',
        'spacing': 'margin, padding',
      },
      minHeight: {
        'screen-75': '75vh',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.scrollbar-hide': {
          /* IE and Edge */
          '-ms-overflow-style': 'none',
          /* Firefox */
          'scrollbar-width': 'none',
          /* Safari and Chrome */
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        '.safe-top': {
          paddingTop: 'env(safe-area-inset-top)',
        },
        '.safe-bottom': {
          paddingBottom: 'env(safe-area-inset-bottom)',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}
