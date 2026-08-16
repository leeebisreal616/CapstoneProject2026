/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        'g-dark': '#085041',
        'g-mid': '#0F6E56',
        'g-light': '#1D9E75',
        'g-pale': '#E1F5EE',
        'g-border': '#9FE1CB',
      }
    },
  },
  plugins: [],
}