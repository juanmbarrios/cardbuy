import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@cardbuy/ui";
import { prisma } from "@cardbuy/db";
import { AddToCartButton } from "@/components/listings/AddToCartButton";

const CONDITION_LABELS: Record<string, string> = {
  NEAR_MINT: "Near Mint",
  LIGHTLY_PLAYED: "Lightly Played",
  MODERATELY_PLAYED: "Moderately Played",
  HEAVILY_PLAYED: "Heavily Played",
  DAMAGED: "Damaged",
};

const CONDITION_SHORT: Record<string, string> = {
  NEAR_MINT: "NM",
  LIGHTLY_PLAYED: "LP",
  MODERATELY_PLAYED: "MP",
  HEAVILY_PLAYED: "HP",
  DAMAGED: "DMG",
};

const CONDITION_VARIANTS: Record<string, "success" | "warning" | "danger" | "default"> = {
  NEAR_MINT: "success",
  LIGHTLY_PLAYED: "success",
  MODERATELY_PLAYED: "warning",
  HEAVILY_PLAYED: "danger",
  DAMAGED: "danger",
};

const GAME_LABELS: Record<string, string> = {
  POKEMON: "Pokémon",
  MAGIC_THE_GATHERING: "Magic: The Gathering",
  YUGIOH: "Yu-Gi-Oh!",
  ONE_PIECE: "One Piece",
  LORCANA: "Lorcana",
  DRAGON_BALL: "Dragon Ball",
  FLESH_AND_BLOOD: "Flesh and Blood",
  DIGIMON: "Digimon",
  VANGUARD: "Vanguard",
};

interface Props {
  params: { id: string };
}

async function getListing(id: string) {
  return prisma.cardListing.findUnique({
    where: { id },
    include: {
      card: { select: { name: true, game: true, rarity: true } },
      seller: {
        select: {
          shopName: true,
          averageRating: true,
          totalReviews: true,
          stripeOnboarded: true,
        },
      },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const listing = await getListing(params.id);
  if (!listing) return { title: "Carta no encontrada" };
  return {
    title: `${listing.card.name} — CardBuy`,
    description: `Compra ${listing.card.name} en ${Number(listing.price).toLocaleString("es-ES", { style: "currency", currency: "EUR" })}. Vendedor: ${listing.seller.shopName}.`,
  };
}

export default async function ListingDetailPage({ params }: Props) {
  const listing = await getListing(params.id);

  if (!listing || listing.status === "CANCELLED" || listing.status === "EXPIRED") notFound();

  const isOutOfStock = listing.quantity === 0 || listing.status === "SOLD";
  const condition = listing.condition as string;
  const game = listing.card.game as string;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-slate-400">
        <Link href="/listings" className="hover:text-white transition-colors">
          Cartas
        </Link>
        <span>/</span>
        <span className="text-slate-300 truncate max-w-[240px]">{listing.card.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Imagen */}
        <div className="flex items-start justify-center">
          <div className="relative w-full max-w-xs aspect-[3/4] rounded-2xl overflow-hidden bg-bg-deep border border-surface-border">
            {listing.imageUrls?.[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={listing.imageUrls[0]}
                alt={listing.card.name}
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
            {GAME_LABELS[game] ?? game}
          </span>

          {/* Título */}
          <h1 className="font-display text-2xl font-bold text-white leading-tight">
            {listing.card.name}
          </h1>

          {/* Precio */}
          <div className="flex items-baseline gap-3">
            <span
              className={[
                "text-4xl font-bold leading-none",
                isOutOfStock ? "text-slate-500" : "text-brand",
              ].join(" ")}
            >
              {Number(listing.price).toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
            </span>
            {listing.quantity === 1 && !isOutOfStock && (
              <Badge variant="warning">Última unidad</Badge>
            )}
            {listing.quantity > 1 && !isOutOfStock && (
              <Badge variant="success">En stock ({listing.quantity})</Badge>
            )}
            {isOutOfStock && <Badge variant="danger">Agotado</Badge>}
          </div>

          {/* Condición e idioma */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={CONDITION_VARIANTS[condition] ?? "default"}>
              {CONDITION_SHORT[condition] ?? condition} — {CONDITION_LABELS[condition] ?? condition}
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
              {listing.seller.shopName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-white">{listing.seller.shopName}</span>
                {listing.seller.stripeOnboarded && (
                  <span title="Vendedor verificado" className="text-brand text-xs font-bold leading-none">
                    ✓
                  </span>
                )}
              </div>
              {listing.seller.totalReviews > 0 && (
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-amber-400 text-xs">★</span>
                  <span className="text-xs text-white font-medium">
                    {listing.seller.averageRating.toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-500">
                    ({listing.seller.totalReviews} valoraciones)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* CTA */}
          <AddToCartButton listingId={params.id} isOutOfStock={isOutOfStock} />
        </div>
      </div>
    </div>
  );
}
