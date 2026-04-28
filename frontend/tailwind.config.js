/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#edfafa',
          100: '#c6f2f2',
          200: '#83e4e4',
          300: '#3dcece',
          400: '#13b0b0',
          500: '#0a9090',
          600: '#087474',
          700: '#065858',
          800: '#044040',
          900: '#022828',
        },
        ink: {
          50:  '#f0f0ff',
          100: '#d8d8f8',
          200: '#b0b0f0',
          300: '#8888e8',
          400: '#6060d0',
          500: '#4040b8',
          600: '#2828a0',
          700: '#181888',
          800: '#0c0c60',
          900: '#060630',
        },
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'gradient': 'gradient 8s ease infinite',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-20px)' },
        },
        gradient: {
          '0%,100%': { backgroundPosition: '0% 50%' },
          '50%':     { backgroundPosition: '100% 50%' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
