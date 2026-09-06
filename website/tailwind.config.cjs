/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        pakkam: {
          green: '#16a34a',
          greenDark: '#15803d',
          greenLight: '#f0fdf4',
          charcoal: '#0f172a',
          gray: '#64748b',
        },
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
