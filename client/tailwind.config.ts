import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        syne: ["var(--font-syne)", "sans-serif"]
      },
      colors: {
        brand: {
          blue: "#2563EB",
          teal: "#14B8A6",
          green: "#22C55E",
          orange: "#F97316",
          purple: "#7C3AED"
        }
      },
      boxShadow: {
        soft: "0 10px 30px rgba(2, 6, 23, 0.08)"
      }
    }
  },
  plugins: []
} satisfies Config;

