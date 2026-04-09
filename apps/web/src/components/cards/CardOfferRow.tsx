import Link from "next/link";
import { Badge } from "@cardbuy/ui";
import type { CardOffer } from "@/lib/cards";

const CONDITION_LABELS: Record<string, string> = {
  NM:  "Near Mint",
  LP:  "Lightly Played",
  MP:  "Moderately Played",
  HP:  "Heavily Played",
  DMG: "Damaged",
};

const CONDITION_VARIANTS: Record<string, "success" | "warning" | "danger" | "default"> = {
  NM:  "success",
  LP:  "success",
  MP:  "warning",
  HP:  "danger",
  DMG: "danger",
};

interface Props {
  offer: CardOffer;
}

export function CardOfferRow({ offer }: Props) {
  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-surface-border bg-surface px-4 py-3 hover:border-brand/40 hover:bg-surface-hover transition-colors"
      data-testid="card-offer-row"
    >
      {/* Condición + idioma + badges */}
      <div className="flex items-center gap-2 flex-wrap sm:w-48 shrink-0">
        <Badge variant={CONDITION_VARIANTS[offer.condition] ?? "default"}>
          {CONDITION_LABELS[offer.condition] ?? offer.condition}
        </Badge>
        <Badge variant="outline">{offer.language}</Badge>
        {offer.isFoil    && <Badge variant="default">Foil</Badge>}
        {offer.isGraded  && <Badge variant="default">Gradada</Badge>}
      </div>

      {/* Vendedor */}
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        <span className="text-sm text-slate-300 truncate">{offer.sellerName}</span>
        {offer.isVerified && (
          <span title="Vendedor verificado" className="text-brand text-[10px] font-bold shrink-0">
            ✓
          </span>
        )}
        <span className="text-xs text-amber-400 shrink-0">★ {offer.sellerRating.toFixed(1)}</span>
        <span className="hidden sm:inline text-xs text-slate-600 shrink-0">
          ({offer.sellerReviewCount})
        </span>
      </div>

      {/* Envío */}
      <div className="hidden md:block text-xs text-slate-400 w-28 shrink-0 text-right">
        {offer.freeShipping ? (
          <span className="text-green-400">Envío gratis</span>
        ) : (
          <span>
            +{offer.shippingCost.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
          </span>
        )}
      </div>

      {/* Stock */}
      <div className="hidden md:block text-xs text-slate-500 w-20 shrink-0 text-right">
        {offer.stock === 1 ? (
          <span className="text-amber-400">Última ud.</span>
        ) : (
          <span>{offer.stock} uds.</span>
        )}
      </div>

      {/* Precio + CTA */}
      <div className="flex items-center gap-3 sm:ml-auto shrink-0">
        <span className="text-xl font-bold text-brand leading-none">
          {offer.price.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
        </span>
        <Link
          href={`/listings/${offer.id}`}
          className="inline-flex min-h-[44px] items-center rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white shadow-glow-accent hover:bg-accent-hover transition-colors whitespace-nowrap"
        >
          Comprar
        </Link>
      </div>
    </div>
  );
}
