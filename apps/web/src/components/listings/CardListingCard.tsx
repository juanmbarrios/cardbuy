import Link from "next/link";
import { Badge } from "@cardbuy/ui";

export interface CardListingData {
  id: string;
  title: string;
  price: number;
  condition: string;
  language: string;
  game: string;
  sellerName: string;
  imageUrl?: string;
  stock: number;
  sellerRating: number;
  sellerReviewCount: number;
  isVerified: boolean;
}

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

function StockIndicator({ stock }: { stock: number }) {
  if (stock === 0) {
    return <Badge variant="danger">Agotado</Badge>;
  }
  if (stock === 1) {
    return <Badge variant="warning">Última unidad</Badge>;
  }
  return <Badge variant="success">En stock ({stock})</Badge>;
}

function SellerInfo({
  name,
  rating,
  reviewCount,
  isVerified,
}: {
  name: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <span className="text-xs text-slate-400 truncate max-w-[90px]">{name}</span>
      {isVerified && (
        <span
          title="Vendedor verificado"
          className="text-brand shrink-0 text-[10px] font-bold leading-none"
        >
          ✓
        </span>
      )}
      <span className="text-xs text-amber-400 shrink-0">★ {rating.toFixed(1)}</span>
      <span className="text-xs text-slate-600 shrink-0">({reviewCount})</span>
    </div>
  );
}

interface Props {
  listing: CardListingData;
}

export function CardListingCard({ listing }: Props) {
  const isOutOfStock = listing.stock === 0;

  const cardContent = (
    <>
      {/* Imagen */}
      <div className="aspect-[3/4] bg-bg-deep relative overflow-hidden">
        {listing.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className={[
              "h-full w-full object-cover transition-transform duration-300",
              !isOutOfStock && "group-hover:scale-105",
            ]
              .filter(Boolean)
              .join(" ")}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-700 text-4xl">
            🃏
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-bg-deep/70 flex items-center justify-center">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Agotado
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1.5">
        {/* Precio — elemento dominante */}
        <div className="flex items-baseline justify-between gap-1">
          <span
            className={[
              "text-xl font-bold leading-none",
              isOutOfStock ? "text-slate-500" : "text-brand",
            ].join(" ")}
          >
            {listing.price.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
          </span>
          <StockIndicator stock={listing.stock} />
        </div>

        {/* Título */}
        <h3 className="text-xs font-medium text-slate-300 line-clamp-2 leading-tight">
          {listing.title}
        </h3>

        {/* Condición + idioma */}
        <div className="flex items-center gap-1 flex-wrap">
          <Badge variant={CONDITION_VARIANTS[listing.condition] ?? "default"}>
            {CONDITION_LABELS[listing.condition] ?? listing.condition}
          </Badge>
          <Badge variant="outline">{listing.language}</Badge>
        </div>

        {/* Vendedor */}
        <SellerInfo
          name={listing.sellerName}
          rating={listing.sellerRating}
          reviewCount={listing.sellerReviewCount}
          isVerified={listing.isVerified}
        />
      </div>
    </>
  );

  if (isOutOfStock) {
    return (
      <div
        className="flex flex-col rounded-xl border border-surface-border bg-surface overflow-hidden opacity-50 cursor-not-allowed"
        aria-disabled="true"
        data-testid="listing-card-disabled"
      >
        {cardContent}
      </div>
    );
  }

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group flex flex-col rounded-xl border border-surface-border bg-surface overflow-hidden transition-all duration-200 hover:border-brand/40 hover:shadow-glow-card hover:-translate-y-0.5"
      data-testid="listing-card"
    >
      {cardContent}
    </Link>
  );
}
