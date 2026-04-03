/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",       // ← ajoute aussi ton index.html ici
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        georgia: ['Georgia', 'serif'],
      },
      colors: {
        certusBlue: '#1e3a8a', 
        certusGray: '#1f2937',
      },
    },
  },
  plugins: [],
}
