import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@cardbuy/ui";
import { CardOffersTable } from "@/components/cards/CardOffersTable";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { Suspense } from "react";
import type { CardWithOffers } from "@/lib/cards";

// ---------------------------------------------------------------------------
// Rarity badge colour
// ---------------------------------------------------------------------------

const RARITY_VARIANT: Record<string, "success" | "warning" | "danger" | "default" | "gold" | "outline"> = {
  "Común":                  "default",
  "Infrecuente":            "success",
  "Rara":                   "outline",
  "Doble Rara":             "outline",
  "Ultra Rara":             "warning",
  "Secret Rare":            "warning",
  "Hyper Rare":             "gold",
  "Rainbow Rare":           "gold",
  "Full Art":               "gold",
  "Special Illustration":   "gold",
  "Promo":                  "default",
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
// Data fetch
// ---------------------------------------------------------------------------

async function fetchCard(slug: string): Promise<CardWithOffers | null> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  try {
    const res = await fetch(`${baseUrl}/api/cards/${slug}`, { cache: "no-store" });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json() as Promise<CardWithOffers>;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const result = await fetchCard(params.slug);
  if (!result) return { title: "Carta no encontrada — CardBuy" };
  const { card } = result;
  return {
    title:       `${card.name} — ${card.setName} | CardBuy`,
    description: `Compara ${result.total} oferta${result.total !== 1 ? "s" : ""} de ${card.name} (${card.setCode} · ${card.rarity}). Vendedores verificados, pago protegido.`,
    openGraph: {
      title:       `${card.name} — ${card.setName}`,
      description: `${result.total} oferta${result.total !== 1 ? "s" : ""} disponibles en CardBuy`,
      images:      card.imageUrl ? [{ url: card.imageUrl }] : [],
    },
  };
}

// ---------------------------------------------------------------------------
// Skeleton fallback
// ---------------------------------------------------------------------------

function CardPageSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
        <Skeleton className="aspect-[3/4] w-full max-w-[280px] rounded-2xl" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-5 w-40" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <div className="mt-6 flex flex-col gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page content
// ---------------------------------------------------------------------------

async function CardPageContent({ slug }: { slug: string }) {
  const result = await fetchCard(slug);

  if (!result) {
    return (
      <ErrorState
        title="Carta no encontrada"
        description="Esta carta no existe o ha sido eliminada del catálogo."
      />
    );
  }

  const { card, offers, total } = result;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-slate-400 flex-wrap">
        <Link href="/listings" className="hover:text-white transition-colors">
          Cartas
        </Link>
        <span>/</span>
        <Link
          href={`/listings?game=${card.game}`}
          className="hover:text-white transition-colors"
        >
          {GAME_LABELS[card.game] ?? card.game}
        </Link>
        <span>/</span>
        <span className="text-slate-300 truncate max-w-[200px]">{card.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
        {/* Imagen */}
        <div className="flex justify-center lg:justify-start">
          <div className="w-full max-w-[280px] aspect-[3/4] rounded-2xl overflow-hidden bg-bg-deep border border-surface-border">
            {card.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={card.imageUrl}
                alt={card.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-7xl text-slate-700">
                🃏
              </div>
            )}
          </div>
        </div>

        {/* Info + ofertas */}
        <div className="flex flex-col gap-5">
          {/* Juego + set */}
          <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
            <span className="font-medium uppercase tracking-wider">
              {GAME_LABELS[card.game] ?? card.game}
            </span>
            <span>·</span>
            <span>{card.setName}</span>
            <span className="text-slate-700">({card.setCode})</span>
            <span>·</span>
            <span>#{card.number}</span>
          </div>

          {/* Nombre */}
          <h1 className="font-display text-3xl font-bold text-white leading-tight">
            {card.name}
          </h1>

          {/* Rareza + precio de referencia */}
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant={RARITY_VARIANT[card.rarity] ?? "default"}>
              {card.rarity}
            </Badge>
            {card.avgMarketPrice && (
              <span className="text-sm text-slate-400">
                Precio de mercado:{" "}
                <span className="text-white font-medium">
                  {card.avgMarketPrice.toLocaleString("es-ES", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </span>
              </span>
            )}
          </div>

          {/* Contador de ofertas */}
          <p className="text-sm text-slate-400">
            <span className="font-semibold text-white">{total}</span>{" "}
            oferta{total !== 1 ? "s" : ""} disponible{total !== 1 ? "s" : ""}
          </p>

          {/* Tabla de ofertas */}
          <CardOffersTable offers={offers} cardName={card.name} cardSlug={card.slug} />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Default export
// ---------------------------------------------------------------------------

export default function CardPage({ params }: Props) {
  return (
    <Suspense fallback={<CardPageSkeleton />}>
      <CardPageContent slug={params.slug} />
    </Suspense>
  );
}
