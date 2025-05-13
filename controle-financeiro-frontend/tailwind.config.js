/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",               // ✅ necessário para detectar as classes no HTML
    "./src/**/*.{js,jsx,ts,tsx}", // ✅ necessário para detectar as classes nos componentes
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
