import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        paper: "rgb(var(--paper) / <alpha-value>)",
        "paper-2": "rgb(var(--paper-2) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        emerald: "rgb(var(--emerald) / <alpha-value>)",
        gold: "rgb(var(--gold) / <alpha-value>)",
        "gold-soft": "rgb(var(--gold-soft) / <alpha-value>)",
        clay: "rgb(var(--clay) / <alpha-value>)",
        water: "rgb(var(--water) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
        amiri: ["var(--font-amiri)", "serif"],
        arabic: ["var(--font-arabic)", "serif"],
      },
      boxShadow: {
        lift: "0 18px 50px rgb(28 36 32 / 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
