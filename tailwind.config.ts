import type { Config } from "tailwindcss";

/** Colours resolve to the CSS tokens in globals.css, so both themes share one set of names. */
const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        paper: token("paper"),
        "paper-2": token("paper-2"),
        "paper-3": token("paper-3"),
        ink: token("ink"),
        "ink-2": token("ink-2"),
        muted: token("muted"),
        faint: token("faint"),
        line: token("line"),
        "line-strong": token("line-strong"),
        control: token("control"),
        emerald: token("emerald"),
        "emerald-ink": token("emerald-ink"),
        gold: token("gold"),
        "gold-soft": token("gold-soft"),
        clay: token("clay"),
        water: token("water"),
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
        amiri: ["var(--font-amiri)", "serif"],
        arabic: ["var(--font-arabic)", "serif"],
      },
      maxWidth: {
        reading: "40rem",
        page: "72rem",
      },
      boxShadow: {
        lift: "0 1px 2px rgb(30 33 30 / 0.05), 0 8px 24px rgb(30 33 30 / 0.06)",
        cover: "0 1px 1px rgb(20 24 20 / 0.08), 0 6px 18px rgb(20 24 20 / 0.14)",
      },
    },
  },
  plugins: [],
};

export default config;
