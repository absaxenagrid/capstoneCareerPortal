/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        forge: {
          blue: '#0F52BA',
          'blue-dark': '#0A3D8F',
          'blue-light': '#3B82F6',
          navy: '#0D1B2A',
          slate: '#1E2D40',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    }
  },
  plugins: []
}
