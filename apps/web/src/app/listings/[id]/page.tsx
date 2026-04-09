import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge, Button } from "@cardbuy/ui";
import type { ListingDetail } from "@/lib/listings";

// ---------------------------------------------------------------------------
// Condition / language display maps (mirrors CardListingCard)
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
  pokemon:          "Pokémon",
  magic:            "Magic: The Gathering",
  yugioh:           "Yu-Gi-Oh!",
  onepiece:         "One Piece",
  lorcana:          "Lorcana",
  dragonball:       "Dragon Ball",
  "flesh-and-blood": "Flesh and Blood",
  digimon:          "Digimon",
  vanguard:         "Vanguard",
};

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

async function fetchListing(id: string): Promise<ListingDetail | null> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  try {
    const res = await fetch(`${baseUrl}/api/listings/${id}`, {
      cache: "no-store",
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json() as Promise<ListingDetail>;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const listing = await fetchListing(params.id);
  if (!listing) return { title: "Carta no encontrada" };
  return {
    title: `${listing.title} — CardBuy`,
    description: `Compra ${listing.title} por ${listing.price.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}. Vendedor: ${listing.sellerName}.`,
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function ListingDetailPage({ params }: Props) {
  const listing = await fetchListing(params.id);

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
        {listing.setName && (
          <>
            <span className="text-slate-500">{listing.setName}</span>
            <span>/</span>
          </>
        )}
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
          {/* Juego + set */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              {GAME_LABELS[listing.game] ?? listing.game}
            </span>
            {listing.setName && (
              <span className="text-xs text-slate-600">· {listing.setName}</span>
            )}
          </div>

          {/* Título */}
          <h1 className="font-display text-2xl font-bold text-white leading-tight">
            {listing.title}
          </h1>

          {/* Precio */}
          <div className="flex items-baseline gap-3 flex-wrap">
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

          {/* Condición, idioma, foil */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={CONDITION_VARIANTS[listing.condition] ?? "default"}>
              {CONDITION_LABELS[listing.condition] ?? listing.condition}
            </Badge>
            <Badge variant="outline">{listing.language}</Badge>
            {listing.isFoil && <Badge variant="default">Foil</Badge>}
            {listing.isGraded && <Badge variant="default">Gradada</Badge>}
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

          {/* Envío */}
          <div className="text-sm text-slate-400">
            {listing.freeShipping ? (
              <span className="text-green-400 font-medium">Envío gratuito</span>
            ) : (
              <span>
                Envío:{" "}
                {listing.shippingCost.toLocaleString("es-ES", {
                  style: "currency",
                  currency: "EUR",
                })}
              </span>
            )}
            <span className="ml-2 text-slate-600">
              · Entrega en {listing.shippingDays} días hábiles
            </span>
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-2">
            <Button
              variant="primary"
              size="lg"
              disabled={isOutOfStock}
              className="w-full"
            >
              {isOutOfStock ? "No disponible" : "Añadir al carrito"}
            </Button>
            {!isOutOfStock && (
              <p className="text-xs text-center text-slate-500">
                Pago protegido · Devoluciones en 14 días
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
