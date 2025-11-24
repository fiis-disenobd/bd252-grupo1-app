/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#7a3b11',
        secondary: '#efe8df',
        accent: '#b3621b',
      },
      boxShadow: {
        card: '0 8px 30px rgba(0,0,0,0.08)',
      },
      borderRadius: {
        xl: '1.25rem',
      },
    },
  },
  plugins: [],
};
