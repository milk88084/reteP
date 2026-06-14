import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#FFC93C',
          dark: '#C49300',
        },
        accent: '#FF6041',
        bg: '#FAFAF7',
        surface: '#F3EDE4',
        border: '#E8E0D5',
        ink: {
          DEFAULT: '#1E1A14',
          muted: '#9A8F82',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', '"Noto Sans TC"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
