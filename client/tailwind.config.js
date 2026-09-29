/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gate: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc7fb',
          400: '#36aaf5',
          500: '#0c8fe4',
          600: '#0271c3',
          700: '#035a9e',
          800: '#074c82',
          900: '#0c406d',
          950: '#082947',
        },
        exam: {
          answered: '#22c55e',      // Green
          unanswered: '#ef4444',    // Red
          marked: '#a855f7',        // Purple
          markedAnswered: '#3b82f6',// Blue with indicator
          notVisited: '#e2e8f0',    // Gray
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      }
    },
  },
  plugins: [],
}
