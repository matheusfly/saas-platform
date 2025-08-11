/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/pages/schedule-manager/**/*.{js,ts,jsx,tsx}",
    "./src/pages/base_business-intelligence-dashboard/**/*.{js,ts,jsx,tsx}",
    "./src/pages/painel-cliente-360/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-accent': '#9EFF00',
        'brand-neutral-dark': '#1E1E1E',
        'army-olive': '#4F512D',
        'army-olive-light': '#656B4B',
        'background-primary': '#F5F5F5',
        'sage': '#A3B899',
      },
      backgroundImage: {
        'camo-bg': "url('/img/b_bg - Editado.png')",
        'camo-pattern': "url('/img/logo_pattern.png')",
      }
    },
  },
  plugins: [],
}
