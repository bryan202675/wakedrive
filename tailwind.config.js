/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        cream: {
          50: '#fcfbf9',
          100: '#f7f5f0',
          200: '#efece4',
          300: '#e3dfd3',
          400: '#cfc9b8',
        },
        card: {
          light: '#ffffff',
          lightMuted: '#fbfaf8',
          dark: '#14161d',
          darkMuted: '#191c25',
        }
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem',
        '5xl': '2.75rem',
      },
      boxShadow: {
        'soft': '0 20px 45px -10px rgba(0, 0, 0, 0.04), 0 10px 20px -5px rgba(0, 0, 0, 0.02)',
        'float': '0 30px 60px -15px rgba(0, 0, 0, 0.08), 0 0 1px 1px rgba(0, 0, 0, 0.02)',
        'card': '0 12px 32px -8px rgba(0, 0, 0, 0.05)',
        'glow-lime': '0 0 25px rgba(163, 230, 53, 0.45)',
        'glow-red': '0 0 35px rgba(239, 68, 68, 0.5)',
      }
    },
  },
  plugins: [],
}
