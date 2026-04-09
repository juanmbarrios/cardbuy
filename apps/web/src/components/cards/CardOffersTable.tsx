"use client";

import { useState, useMemo } from "react";
import type { CardOffer } from "@/lib/cards";
import { CardOfferRow } from "./CardOfferRow";
import { EmptyState } from "@/components/ui/EmptyState";

const CONDITIONS = ["", "NM", "LP", "MP", "HP", "DMG"] as const;
const CONDITION_LABELS: Record<string, string> = {
  "":    "Todas",
  NM:   "Near Mint",
  LP:   "LP",
  MP:   "MP",
  HP:   "HP",
  DMG:  "Dañada",
};

interface Props {
  offers: CardOffer[];
  cardName: string;
  cardSlug: string;
}

export function CardOffersTable({ offers, cardName, cardSlug }: Props) {
  const [conditionFilter, setConditionFilter] = useState<string>("");
  const [languageFilter,  setLanguageFilter]  = useState<string>("");

  // Collect unique languages present in offers
  const availableLanguages = useMemo(() => {
    const langs = Array.from(new Set(offers.map((o) => o.language))).sort();
    return ["", ...langs];
  }, [offers]);

  const filtered = useMemo(() => {
    return offers.filter((o) => {
      if (conditionFilter && o.condition !== conditionFilter) return false;
      if (languageFilter  && o.language  !== languageFilter)  return false;
      return true;
    });
  }, [offers, conditionFilter, languageFilter]);

  if (offers.length === 0) {
    return (
      <EmptyState
        icon="📦"
        title="Sin ofertas disponibles"
        description={`No hay vendedores con "${cardName}" en stock ahora mismo.`}
        action={{ label: "Buscar en el catálogo", href: `/listings?q=${encodeURIComponent(cardName)}` }}
      />
    );
  }

  return (
    <section>
      {/* Filtros rápidos */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
          Filtrar:
        </span>

        {/* Condición */}
        <div className="flex flex-wrap gap-1.5">
          {CONDITIONS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setConditionFilter(c)}
              className={[
                "min-h-[36px] rounded-lg border px-3 py-1 text-xs font-medium transition-colors",
                conditionFilter === c
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-surface-border text-slate-400 hover:border-brand/50 hover:text-slate-200",
              ].join(" ")}
            >
              {CONDITION_LABELS[c]}
            </button>
          ))}
        </div>

        {/* Idioma */}
        {availableLanguages.length > 2 && (
          <div className="flex flex-wrap gap-1.5">
            {availableLanguages.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLanguageFilter(l)}
                className={[
                  "min-h-[36px] rounded-lg border px-3 py-1 text-xs font-medium transition-colors",
                  languageFilter === l
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-surface-border text-slate-400 hover:border-brand/50 hover:text-slate-200",
                ].join(" ")}
              >
                {l === "" ? "Todos los idiomas" : l}
              </button>
            ))}
          </div>
        )}

        <span className="ml-auto text-xs text-slate-500">
          {filtered.length} oferta{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Lista de ofertas */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="Sin resultados para este filtro"
          description="Prueba otra condición o idioma."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((offer) => (
            <CardOfferRow key={offer.id} offer={offer} />
          ))}
        </div>
      )}
    </section>
  );
}
