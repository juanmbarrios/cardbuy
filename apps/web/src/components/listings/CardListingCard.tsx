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

interface Props {
  listing: CardListingData;
}

export function CardListingCard({ listing }: Props) {
  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group flex flex-col rounded-xl border border-gray-200 bg-white overflow-hidden transition-shadow hover:shadow-md"
    >
      {/* Imagen */}
      <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden">
        {listing.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300 text-4xl">
            🃏
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1.5">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight">
          {listing.title}
        </h3>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant={CONDITION_VARIANTS[listing.condition] ?? "default"}>
            {CONDITION_LABELS[listing.condition] ?? listing.condition}
          </Badge>
          <Badge variant="outline">{listing.language}</Badge>
        </div>

        <div className="flex items-center justify-between mt-1">
          <span className="text-base font-bold text-gray-900">
            {listing.price.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
          </span>
          <span className="text-xs text-gray-400 truncate max-w-[80px]">
            {listing.sellerName}
          </span>
        </div>
      </div>
    </Link>
  );
}
