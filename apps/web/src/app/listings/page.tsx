import { Suspense } from "react";
import type { Metadata } from "next";
import { Spinner } from "@cardbuy/ui";
import { prisma } from "@cardbuy/db";
import { FilterPanel } from "@/components/listings/FilterPanel";
import { ListingsGrid } from "@/components/listings/ListingsGrid";
import type { CardListingData } from "@/components/listings/CardListingCard";

interface SearchParams {
  q?: string;
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

const CONDITION_SHORT: Record<string, string> = {
  NEAR_MINT: "NM",
  LIGHTLY_PLAYED: "LP",
  MODERATELY_PLAYED: "MP",
  HEAVILY_PLAYED: "HP",
  DAMAGED: "DMG",
};

const GAME_FILTER: Record<string, string> = {
  pokemon: "POKEMON",
  magic: "MAGIC_THE_GATHERING",
  yugioh: "YUGIOH",
  onepiece: "ONE_PIECE",
  lorcana: "LORCANA",
  dragonball: "DRAGON_BALL",
  fab: "FLESH_AND_BLOOD",
  digimon: "DIGIMON",
  vanguard: "VANGUARD",
};

async function getListings(searchParams: SearchParams): Promise<CardListingData[]> {
  const where: Record<string, unknown> = { status: "ACTIVE" };

  if (searchParams.game && GAME_FILTER[searchParams.game]) {
    where.card = { game: GAME_FILTER[searchParams.game] };
  }

  if (searchParams.q) {
    where.card = {
      ...(where.card as object ?? {}),
      name: { contains: searchParams.q, mode: "insensitive" },
    };
  }

  if (searchParams.condition) {
    where.condition = searchParams.condition.toUpperCase();
  }

  if (searchParams.language) {
    where.language = searchParams.language.toUpperCase();
  }

  if (searchParams.minPrice || searchParams.maxPrice) {
    where.price = {
      ...(searchParams.minPrice ? { gte: parseFloat(searchParams.minPrice) } : {}),
      ...(searchParams.maxPrice ? { lte: parseFloat(searchParams.maxPrice) } : {}),
    };
  }

  const orderBy: Record<string, string> =
    searchParams.sort === "price_asc"
      ? { price: "asc" }
      : searchParams.sort === "price_desc"
      ? { price: "desc" }
      : searchParams.sort === "newest"
      ? { createdAt: "desc" }
      : { createdAt: "desc" };

  const listings = await prisma.cardListing.findMany({
    where,
    orderBy,
    take: 48,
    include: {
      card: { select: { name: true, game: true } },
      seller: { select: { shopName: true } },
    },
  });

  return listings.map((l) => ({
    id: l.id,
    title: l.card.name,
    price: Number(l.price),
    condition: CONDITION_SHORT[l.condition] ?? l.condition,
    language: l.language,
    game: l.card.game,
    sellerName: l.seller.shopName,
    imageUrl: l.imageUrls?.[0] ?? undefined,
  }));
}

export default async function ListingsPage({ searchParams }: Props) {
  const listings = await getListings(searchParams);

  const gameLabel = searchParams.game
    ? searchParams.game.charAt(0).toUpperCase() + searchParams.game.slice(1)
    : "Todos los juegos";

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-white">{gameLabel}</h1>
        <p className="text-sm text-slate-400 mt-1">
          {listings.length} carta{listings.length !== 1 ? "s" : ""} disponible
          {listings.length !== 1 ? "s" : ""}
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
            <ListingsGrid listings={listings} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
