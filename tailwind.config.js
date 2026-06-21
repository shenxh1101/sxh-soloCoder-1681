/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        'space': {
          900: '#0A1628',
          800: '#0F1E37',
          700: '#152A49',
          600: '#1C385E',
        },
        'cyber': {
          500: '#00D4FF',
          400: '#33DFFF',
          300: '#66E9FF',
        },
        'alert': {
          500: '#FF4757',
          400: '#FF6B78',
        },
        'success': {
          500: '#2ED573',
          400: '#5AE091',
        },
        'radar': {
          500: '#7B68EE',
          400: '#9D8FF2',
        },
      },
      fontFamily: {
        'orbitron': ['Orbitron', 'sans-serif'],
        'noto': ['"Noto Sans SC"', 'sans-serif'],
      },
      keyframes: {
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 212, 255, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 212, 255, 0.8)' },
        },
        'alert-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 71, 87, 0.4), inset 0 0 20px rgba(255,71,87,0.1)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 71, 87, 0.8), inset 0 0 30px rgba(255,71,87,0.2)' },
        },
        'float-up': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'scan-line': 'scan-line 2s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'alert-pulse': 'alert-pulse 1.2s ease-in-out infinite',
        'float-up': 'float-up 3s ease-in-out infinite',
        'spin-slow': 'spin-slow 8s linear infinite',
      },
      backgroundImage: {
        'glass': 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
        'grid-pattern': 'linear-gradient(rgba(0,212,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.05) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid-size': '40px 40px',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
