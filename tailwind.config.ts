import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ElevenLabs-inspired warm minimalist palette
        ink: "#0a0a0a",         // near-black text / primary CTAs
        paper: "#ffffff",       // cards
        canvas: "#faf9f6",      // warm off-white app background
        subtle: "#f4f2ec",      // warm cream surfaces (sidebar, inactive pills)
        line: "#e8e4dc",        // warm beige borders
        muted: "#6b6357",       // warm muted text
        accent: "#10a37f",      // success / online green
        ai: "#6d56e0",          // violet - reserved for AI-driven features
        warn: "#b45309",        // amber - SLA warnings
        danger: "#b91c1c",      // red - breaches
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "-apple-system",
          "BlinkMacSystemFont",
          "\"Segoe UI\"",
          "Inter",
          "Roboto",
          "\"Helvetica Neue\"",
          "Arial",
          "sans-serif",
        ],
      },
      letterSpacing: {
        tight: "-0.015em",
      },
    },
  },
  plugins: [],
};

export default config;
