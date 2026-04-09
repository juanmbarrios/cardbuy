import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@cardbuy/ui";
import { AddToCartButton } from "@/components/listings/AddToCartButton";
import type { CardListingData } from "@/components/listings/CardListingCard";

// ---------------------------------------------------------------------------
// Mock data — se sustituirá por fetch real desde la API / DB
// ---------------------------------------------------------------------------

const MOCK_LISTINGS: Record<string, CardListingData & { description?: string }> = {
  "1": {
    id: "1",
    title: "Charizard ex — Obsidian Flames",
    price: 34.99,
    condition: "NM",
    language: "EN",
    game: "pokemon",
    sellerName: "CardShark",
    imageUrl: undefined,
    stock: 3,
    sellerRating: 4.9,
    sellerReviewCount: 218,
    isVerified: true,
    description:
      "Charizard ex en condición Near Mint, sin marcas ni rayaduras visibles. Envío con protector rígido y embolsado individual.",
  },
  "2": {
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
    description:
      "Black Lotus original de la edición Alpha (1993). Condición Lightly Played — pequeñas marcas de juego en los bordes. Autenticado por PSA.",
  },
  "3": {
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
    description: "Blue-Eyes White Dragon primera edición española. Moderately Played.",
  },
  "4": {
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
    description: "Monkey D. Luffy Leader en japonés, Near Mint. Directamente del booster.",
  },
};

// ---------------------------------------------------------------------------

const CONDITION_LABELS: Record<string, string> = {
  NM: "Near Mint",
  LP: "Lightly Played",
  MP: "Moderately Played",
  HP: "Heavily Played",
  DMG: "Damaged",
};

const CONDITION_VARIANTS: Record<string, "success" | "warning" | "danger" | "default"> = {
  NM: "success",
  LP: "success",
  MP: "warning",
  HP: "danger",
  DMG: "danger",
};

const GAME_LABELS: Record<string, string> = {
  pokemon: "Pokémon",
  mtg: "Magic: The Gathering",
  yugioh: "Yu-Gi-Oh!",
  onepiece: "One Piece",
  lorcana: "Lorcana",
  dragonball: "Dragon Ball",
  fab: "Flesh and Blood",
  digimon: "Digimon",
  vanguard: "Vanguard",
};

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const listing = MOCK_LISTINGS[params.id];
  if (!listing) return { title: "Carta no encontrada" };
  return {
    title: `${listing.title} — CardBuy`,
    description: `Compra ${listing.title} en ${listing.price.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}. Vendedor: ${listing.sellerName}.`,
  };
}

export default function ListingDetailPage({ params }: Props) {
  const listing = MOCK_LISTINGS[params.id];

  if (!listing) notFound();

  const isOutOfStock = listing.stock === 0;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-slate-400">
        <Link href="/listings" className="hover:text-white transition-colors">
          Cartas
        </Link>
        <span>/</span>
        <span className="text-slate-300 truncate max-w-[240px]">{listing.title}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Imagen */}
        <div className="flex items-start justify-center">
          <div className="relative w-full max-w-xs aspect-[3/4] rounded-2xl overflow-hidden bg-bg-deep border border-surface-border">
            {listing.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={listing.imageUrl}
                alt={listing.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-7xl text-slate-700">
                🃏
              </div>
            )}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-bg-deep/70 flex items-center justify-center">
                <span className="text-sm font-semibold text-slate-400 uppercase tracking-widest">
                  Agotado
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Detalle */}
        <div className="flex flex-col gap-5">
          {/* Juego */}
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
            {GAME_LABELS[listing.game] ?? listing.game}
          </span>

          {/* Título */}
          <h1 className="font-display text-2xl font-bold text-white leading-tight">
            {listing.title}
          </h1>

          {/* Precio */}
          <div className="flex items-baseline gap-3">
            <span
              className={[
                "text-4xl font-bold leading-none",
                isOutOfStock ? "text-slate-500" : "text-brand",
              ].join(" ")}
            >
              {listing.price.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
            </span>
            {listing.stock === 1 && <Badge variant="warning">Última unidad</Badge>}
            {listing.stock > 1 && <Badge variant="success">En stock ({listing.stock})</Badge>}
            {isOutOfStock && <Badge variant="danger">Agotado</Badge>}
          </div>

          {/* Condición e idioma */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={CONDITION_VARIANTS[listing.condition] ?? "default"}>
              {CONDITION_LABELS[listing.condition] ?? listing.condition}
            </Badge>
            <Badge variant="outline">{listing.language}</Badge>
          </div>

          {/* Descripción */}
          {listing.description && (
            <p className="text-sm text-slate-300 leading-relaxed">{listing.description}</p>
          )}

          {/* Vendedor */}
          <div className="rounded-xl border border-surface-border bg-surface p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-surface-raised flex items-center justify-center text-slate-400 font-bold text-sm shrink-0">
              {listing.sellerName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-white">{listing.sellerName}</span>
                {listing.isVerified && (
                  <span
                    title="Vendedor verificado"
                    className="text-brand text-xs font-bold leading-none"
                  >
                    ✓
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-amber-400 text-xs">★</span>
                <span className="text-xs text-white font-medium">
                  {listing.sellerRating.toFixed(1)}
                </span>
                <span className="text-xs text-slate-500">
                  ({listing.sellerReviewCount} valoraciones)
                </span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <AddToCartButton listingId={params.id} isOutOfStock={isOutOfStock} />
        </div>
      </div>
    </div>
  );
}
