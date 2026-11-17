module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: '#1f4d3d',
        ochre: '#c98d39',
        terracotta: '#c76a4a',
        moss: '#e1e6d4',
        earth: '#f7f0e6',
      },
      boxShadow: {
        soft: '0 10px 28px rgba(33, 52, 42, 0.12)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
