/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f3f8fb',
          100: '#e6f0f7',
          200: '#cfe1ee',
          300: '#a3c6dd',
          400: '#6ea3c7',
          500: '#3f7fae',
          600: '#2f6690',
          700: '#235784',
          800: '#1d4468',
          900: '#16324f',
          950: '#0d1b2a',
        },
      },
      boxShadow: {
        brand: '0 12px 40px rgba(13, 27, 42, 0.10)',
      },
    },
  },
  plugins: [],
};