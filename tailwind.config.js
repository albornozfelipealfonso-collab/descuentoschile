/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Geist Variable"', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono Variable"', 'ui-monospace', 'monospace']
      },
      colors: {
        // Interfaz oscura tipo consola: fondos casi negros, líneas finas y un
        // único color de acento ("volt") para lo importante.
        ink: {
          950: '#060708',
          900: '#0b0d10',
          850: '#111418',
          800: '#171b20'
        },
        line: {
          DEFAULT: '#1f242b',
          strong: '#2e343d'
        },
        fg: {
          DEFAULT: '#eceef1',
          muted: '#8d94a0',
          dim: '#5b626d'
        },
        volt: {
          DEFAULT: '#d4ff3a',
          dim: '#d4ff3a1f'
        },
        alerta: '#ff5f4a'
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out both',
        'slide-up': 'slideUp 0.25s ease-out',
        'parpadeo': 'parpadeo 2.4s ease-in-out infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        parpadeo: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        }
      }
    },
  },
  plugins: [],
}
