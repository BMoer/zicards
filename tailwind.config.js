/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1A1A1A',
        paper: '#FAFAF7',
        terracotta: '#C4553A',
        sage: '#5A7A60',
      },
      fontFamily: {
        hanzi: ['"Noto Serif SC"', 'serif'],
      },
    },
  },
  plugins: [],
}
