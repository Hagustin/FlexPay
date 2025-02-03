/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      screens: {},
      colors: {},
      width: {
        breakpoint: '1096px',
      },
      outline: {},
      fontSize: {
        'medium-text': '50px',
        'small-text': '25px',
        'large-text': '96px',
      },
      fontFamily: {
        ivy: ['Ivy Mode', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
