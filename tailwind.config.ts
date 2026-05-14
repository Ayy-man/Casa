import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{ts,tsx,js,jsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
    },
    extend: {
      colors: {
        ink: "#1A1A1A",
        paper: "#FFFFFF",
        rule: "#E5E5E5",
        accent: "#1E5FBF",
        softgray: "#F7F7F6",
        background: "#FFFFFF",
        foreground: "#1A1A1A",
        border: "#E5E5E5",
        input: "#E5E5E5",
        ring: "#1A1A1A",
        muted: { DEFAULT: "#F7F7F6", foreground: "#737373" },
        primary: { DEFAULT: "#1A1A1A", foreground: "#FFFFFF" },
        secondary: { DEFAULT: "#F7F7F6", foreground: "#1A1A1A" },
        destructive: { DEFAULT: "#8A2B1F", foreground: "#FFFFFF" },
        popover: { DEFAULT: "#FFFFFF", foreground: "#1A1A1A" },
        card: { DEFAULT: "#FFFFFF", foreground: "#1A1A1A" },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        display: ["var(--font-playfair)", "Georgia", "serif"],
      },
      letterSpacing: {
        eyebrow: "0.18em",
        wordmark: "0.32em",
      },
      borderRadius: {
        lg: "4px",
        md: "2px",
        sm: "2px",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
