"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const GAMES = [
  { value: "", label: "Todos los juegos" },
  { value: "pokemon", label: "Pokémon" },
  { value: "magic", label: "Magic: The Gathering" },
  { value: "yugioh", label: "Yu-Gi-Oh!" },
  { value: "onepiece", label: "One Piece" },
  { value: "lorcana", label: "Lorcana" },
  { value: "dragonball", label: "Dragon Ball" },
  { value: "flesh-and-blood", label: "Flesh and Blood" },
  { value: "digimon", label: "Digimon" },
  { value: "vanguard", label: "Vanguard" },
];

const CONDITIONS = [
  { value: "", label: "Cualquier condición" },
  { value: "NM", label: "Near Mint" },
  { value: "LP", label: "Lightly Played" },
  { value: "MP", label: "Moderately Played" },
  { value: "HP", label: "Heavily Played" },
  { value: "DMG", label: "Damaged" },
];

const LANGUAGES = [
  { value: "", label: "Cualquier idioma" },
  { value: "ES", label: "Español" },
  { value: "EN", label: "Inglés" },
  { value: "JP", label: "Japonés" },
  { value: "DE", label: "Alemán" },
  { value: "FR", label: "Francés" },
  { value: "IT", label: "Italiano" },
  { value: "PT", label: "Portugués" },
];

export function FilterPanel() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const selectClass =
    "w-full min-h-[44px] rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-slate-200 " +
    "focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand/50 " +
    "transition-colors [&>option]:bg-surface [&>option]:text-slate-200";

  return (
    <aside className="space-y-4">
      <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
        Filtros
      </h2>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Juego</label>
        <select
          className={selectClass}
          value={searchParams.get("game") ?? ""}
          onChange={(e) => updateFilter("game", e.target.value)}
        >
          {GAMES.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Condición</label>
        <select
          className={selectClass}
          value={searchParams.get("condition") ?? ""}
          onChange={(e) => updateFilter("condition", e.target.value)}
        >
          {CONDITIONS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Idioma</label>
        <select
          className={selectClass}
          value={searchParams.get("language") ?? ""}
          onChange={(e) => updateFilter("language", e.target.value)}
        >
          {LANGUAGES.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
      </div>
    </aside>
  );
}
