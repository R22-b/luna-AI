/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './src/index.html'],
  theme: {
    extend: {
      colors: {
        luna: {
          primary: '#7c3aed',
          bg: '#000000',
          surface: '#07070f',
          border: '#1a1a2e',
          accent: '#1e8fa0',
          'text-primary': '#c4c4d4',
          'text-muted': '#4a4a6a',
          'surface-hover': '#0d0d1a',
          'surface-active': '#12072a',
          glow: 'rgba(124, 58, 237, 0.2)',
        },
      },
      fontFamily: { inter: ['Inter', 'system-ui', 'sans-serif'] },
      borderRadius: { luna: '12px', 'luna-sm': '8px', 'luna-lg': '16px' },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        glow: 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(124,58,237,0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(124,58,237,0.4)' },
        },
      },
    },
  },
  plugins: [],
};
