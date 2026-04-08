import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors CardBuy
        brand: {
          50: "#f0f4ff",
          100: "#e0e9ff",
          500: "#3b5bdb",
          600: "#2f4ac7",
          700: "#2340b0",
          900: "#1a2f80",
        },
        // Raridades TCG (colores semánticos)
        rarity: {
          common: "#6b7280",
          uncommon: "#059669",
          rare: "#2563eb",
          ultraRare: "#7c3aed",
          secret: "#d97706",
          hyper: "#dc2626",
        },
        // Condiciones de carta
        condition: {
          nm: "#059669",    // Near Mint
          lp: "#16a34a",    // Lightly Played
          mp: "#ca8a04",    // Moderately Played
          hp: "#ea580c",    // Heavily Played
          dmg: "#dc2626",   // Damaged
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-cal-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
};

export default config;
