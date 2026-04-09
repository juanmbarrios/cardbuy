import { Suspense } from "react";
import type { Metadata } from "next";
import { Spinner } from "@cardbuy/ui";
import { FilterPanel } from "@/components/listings/FilterPanel";
import { ListingsGrid } from "@/components/listings/ListingsGrid";
import type { CardListingData } from "@/components/listings/CardListingCard";

interface SearchParams {
  game?: string;
  condition?: string;
  language?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  page?: string;
}

interface Props {
  searchParams: SearchParams;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const game = searchParams.game ?? "todos los juegos";
  return {
    title: `Cartas TCG en venta — ${game}`,
    description: `Compra cartas TCG de ${game}. Vendedores verificados, pago protegido.`,
  };
}

// Placeholder listings — se sustituirá por fetch real en la issue de marketplace
const PLACEHOLDER_LISTINGS: CardListingData[] = [];

export default function ListingsPage({ searchParams }: Props) {
  const gameLabel = searchParams.game
    ? searchParams.game.charAt(0).toUpperCase() + searchParams.game.slice(1)
    : "Todos los juegos";

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-white">{gameLabel}</h1>
        <p className="text-sm text-slate-400 mt-1">
          {PLACEHOLDER_LISTINGS.length} carta{PLACEHOLDER_LISTINGS.length !== 1 ? "s" : ""} disponible
          {PLACEHOLDER_LISTINGS.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Filtros */}
        <div className="w-full lg:w-56 shrink-0">
          <Suspense fallback={null}>
            <FilterPanel />
          </Suspense>
        </div>

        {/* Grid */}
        <div className="flex-1">
          <Suspense
            fallback={
              <div className="flex justify-center py-20">
                <Spinner size="lg" />
              </div>
            }
          >
            <ListingsGrid listings={PLACEHOLDER_LISTINGS} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
