/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cosmic: {
          900: '#0B0B1A',
          800: '#151532',
          700: '#2A1F52',
          gold: '#FFD700',
          accent: '#A958FF'
        }
      }
    },
  },
  plugins: [],
}
