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
        // Paleta oscura principal — dark navy TCG
        brand: {
          DEFAULT: "#f0a500",   // gold ámbar — logo y acentos de marca
          light:   "#f5c842",   // gold claro — hover de elementos dorados
          dark:    "#c47f00",   // gold oscuro — estados pressed
        },
        accent: {
          DEFAULT: "#e85d04",   // naranja — CTA primario
          hover:   "#d44f00",   // naranja oscuro — hover
          light:   "#ff7520",   // naranja claro — glow
        },
        surface: {
          DEFAULT: "#131f35",   // panel oscuro
          hover:   "#1a2a45",   // panel hover
          raised:  "#1e2f4a",   // panel elevado (modales, dropdowns)
          border:  "#1e3050",   // borde sutil
        },
        bg: {
          DEFAULT: "#0d1525",   // fondo base
          deep:    "#080f1c",   // fondo más oscuro (footer)
        },
        // Raridades TCG — ajustadas para tema oscuro
        rarity: {
          common:   "#94a3b8",
          uncommon: "#34d399",
          rare:     "#60a5fa",
          ultraRare:"#a78bfa",
          secret:   "#fbbf24",
          hyper:    "#f87171",
        },
        // Condiciones de carta
        condition: {
          nm:  "#34d399",   // Near Mint — verde esmeralda
          lp:  "#4ade80",   // Lightly Played
          mp:  "#fbbf24",   // Moderately Played — ámbar
          hp:  "#fb923c",   // Heavily Played — naranja
          dmg: "#f87171",   // Damaged — rojo
        },
      },
      fontFamily: {
        sans:    ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "glow-gold":   "0 0 20px rgba(240, 165, 0, 0.25)",
        "glow-accent": "0 0 20px rgba(232, 93, 4, 0.3)",
        "glow-card":   "0 0 12px rgba(240, 165, 0, 0.15)",
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(135deg, #0d1525 0%, #0f1e38 50%, #0d1525 100%)",
        "card-gradient": "linear-gradient(to top, rgba(13,21,37,0.95) 0%, transparent 60%)",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
};

export default config;
