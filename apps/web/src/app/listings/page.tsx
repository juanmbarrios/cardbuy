import { Suspense } from "react";
import type { Metadata } from "next";
import { FilterPanel } from "@/components/listings/FilterPanel";
import { ListingsGrid } from "@/components/listings/ListingsGrid";
import { ListingsGridSkeleton } from "@/components/listings/ListingsGridSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import type { PaginatedListings } from "@/lib/listings";

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

async function fetchListings(searchParams: SearchParams): Promise<PaginatedListings | null> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const params = new URLSearchParams();

  if (searchParams.game)      params.set("game",      searchParams.game);
  if (searchParams.condition) params.set("condition", searchParams.condition);
  if (searchParams.language)  params.set("language",  searchParams.language);
  if (searchParams.minPrice)  params.set("minPrice",  searchParams.minPrice);
  if (searchParams.maxPrice)  params.set("maxPrice",  searchParams.maxPrice);
  if (searchParams.sort)      params.set("sort",      searchParams.sort);
  if (searchParams.page)      params.set("page",      searchParams.page);

  try {
    const res = await fetch(`${baseUrl}/api/listings?${params.toString()}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json() as Promise<PaginatedListings>;
  } catch {
    return null;
  }
}

async function ListingsSection({ searchParams }: { searchParams: SearchParams }) {
  const data = await fetchListings(searchParams);

  if (!data) {
    return (
      <ErrorState
        title="No se pudo cargar el catálogo"
        description="Ocurrió un error al conectar con el servidor. Inténtalo de nuevo."
      />
    );
  }

  const gameLabel = searchParams.game
    ? searchParams.game.charAt(0).toUpperCase() + searchParams.game.slice(1)
    : "Todos los juegos";

  return (
    <>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-white">{gameLabel}</h1>
        <p className="text-sm text-slate-400 mt-1">
          {data.total} carta{data.total !== 1 ? "s" : ""} disponible
          {data.total !== 1 ? "s" : ""}
        </p>
      </div>
      <ListingsGrid listings={data.listings} searchQuery={searchParams.q} />
    </>
  );
}

export default function ListingsPage({ searchParams }: Props) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
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
            <ListingsSection searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
