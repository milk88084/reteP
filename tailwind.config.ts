import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#BDF2DE",
          dark: "#C49300",
        },
        accent: "#B6B9FE",
        bg: "#0D0B09",
        surface: "#1A1714",
        border: "#2A2520",
        ink: {
          DEFAULT: "#EDE8E0",
          muted: "#7A6F65",
        },
      },
      fontFamily: {
        sans: [
          '"DM Sans"',
          '"Noto Sans TC"',
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        shimmer: "shimmer 1.5s infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
