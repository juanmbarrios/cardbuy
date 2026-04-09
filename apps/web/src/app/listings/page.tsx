import { Suspense } from "react";
import type { Metadata } from "next";
import { FilterPanel } from "@/components/listings/FilterPanel";
import { ListingsGrid } from "@/components/listings/ListingsGrid";
import { ListingsGridSkeleton } from "@/components/listings/ListingsGridSkeleton";
import type { CardListingData } from "@/components/listings/CardListingCard";

interface SearchParams {
  game?: string;
  condition?: string;
  language?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  page?: string;
  q?: string;
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
const PLACEHOLDER_LISTINGS: CardListingData[] = [
  {
    id: "1",
    title: "Charizard ex — Obsidian Flames",
    price: 34.99,
    condition: "NM",
    language: "EN",
    game: "pokemon",
    sellerName: "CardShark",
    stock: 3,
    sellerRating: 4.9,
    sellerReviewCount: 218,
    isVerified: true,
  },
  {
    id: "2",
    title: "Black Lotus — Alpha",
    price: 4999.0,
    condition: "LP",
    language: "EN",
    game: "mtg",
    sellerName: "MTGVault",
    stock: 1,
    sellerRating: 4.7,
    sellerReviewCount: 85,
    isVerified: true,
  },
  {
    id: "3",
    title: "Blue-Eyes White Dragon — LOB-001",
    price: 12.5,
    condition: "MP",
    language: "ES",
    game: "yugioh",
    sellerName: "DuelStore",
    stock: 0,
    sellerRating: 4.2,
    sellerReviewCount: 43,
    isVerified: false,
  },
  {
    id: "4",
    title: "Monkey D. Luffy — OP01-001",
    price: 8.0,
    condition: "NM",
    language: "JP",
    game: "onepiece",
    sellerName: "GrandLine",
    stock: 7,
    sellerRating: 4.8,
    sellerReviewCount: 130,
    isVerified: true,
  },
];

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
        <div className="flex-1 min-w-0">
          <Suspense fallback={<ListingsGridSkeleton count={10} />}>
            <ListingsGrid
              listings={PLACEHOLDER_LISTINGS}
              searchQuery={searchParams.q}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
