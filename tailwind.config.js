/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'mali': ['Mali', 'cursive'],
      },
      colors: {
        'brand': {
          'blue': '#4153C8',
          'red': '#E42D1C', 
          'yellow': '#FFEC0F',
          'green': '#36AD42',
          'pink': '#FD7BCC',
          'dark': '#073B4C',
        }
      }
    },
  },
  plugins: [],
}