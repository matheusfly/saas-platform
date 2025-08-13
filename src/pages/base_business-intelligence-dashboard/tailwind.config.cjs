/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-accent': '#9EFF00',
        'brand-neutral-dark': '#1E1E1E',
        'army-olive': '#4F512D',
        'army-olive-light': '#656B4B',
        'background-primary': '#F5F5F5',
        'text-main': '#000000',
      },
      backgroundImage: {
        'camo-bg': "url('/img/b_bg - Editado.png')",
        'camo-pattern': "url('/img/logo_pattern.png')",
      }
    },
  },
  plugins: [],
}
