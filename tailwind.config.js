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
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"SF Mono"', '"JetBrains Mono"', 'ui-monospace', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        display: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        apple: {
          bg: '#f5f5f7',
          darkBg: '#09090b',
          card: '#ffffff',
          darkCard: '#18181b',
          secondary: '#86868b',
          accent: '#0071e3',
          border: 'rgba(0, 0, 0, 0.08)',
          darkBorder: 'rgba(255, 255, 255, 0.08)',
        },
        card: {
          light: '#ffffff',
          lightMuted: '#fbfbfd',
          dark: '#18181b',
          darkMuted: '#141416',
        }
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'apple-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'apple-card': '0 2px 10px -2px rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02)',
        'apple-float': '0 12px 30px -4px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.04)',
        'soft': '0 10px 30px -10px rgba(0, 0, 0, 0.04)',
        'card': '0 2px 10px -2px rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02)',
      }
    },
  },
  plugins: [],
}
