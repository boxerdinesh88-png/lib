import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563EB",
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
        },
        secondary: { DEFAULT: "#0F172A", 800: "#1E293B", 900: "#0F172A", 950: "#020617" },
        accent: { DEFAULT: "#14B8A6", 400: "#2DD4BF", 600: "#0D9488" },
        surface: { DEFAULT: "#F8FAFC", dark: "#020617" },
        glass: { light: "rgba(255,255,255,0.65)", dark: "rgba(15,23,42,0.6)" },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.12)",
        "glass-lg": "0 12px 48px 0 rgba(31, 38, 135, 0.18)",
        soft: "0 4px 24px rgba(2, 6, 23, 0.08)",
        "soft-lg": "0 16px 48px rgba(2, 6, 23, 0.12)",
        glow: "0 0 32px rgba(37, 99, 235, 0.45)",
        "glow-accent": "0 0 32px rgba(20, 184, 166, 0.45)",
      },
      backdropBlur: {
        xs: "2px",
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        display: ["var(--font-space-grotesk)", "Space Grotesk", "sans-serif"],
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-468px 0" },
          "100%": { backgroundPosition: "468px 0" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.8)", opacity: "0.7" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
        gradient: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 1.6s linear infinite",
        "pulse-ring": "pulse-ring 1.8s ease-out infinite",
        gradient: "gradient 8s ease infinite",
      },
    },
  },
  plugins: [],
};
export default config;
