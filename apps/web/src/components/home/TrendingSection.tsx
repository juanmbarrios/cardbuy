import Link from "next/link";
import { Badge } from "@cardbuy/ui";

interface TrendingCard {
  id: string;
  name: string;
  game: string;
  gameLabel: string;
  priceRange: string;
  trend: "up" | "hot";
  badgeVariant: "success" | "warning" | "danger" | "info" | "gold";
}

// Mock trending cards — se sustituirá por datos reales de PriceHistory/búsquedas en issue de pricing
const TRENDING_CARDS: TrendingCard[] = [
  { id: "1", name: "Charizard ex", game: "pokemon", gameLabel: "Pokémon", priceRange: "30–120 €", trend: "hot", badgeVariant: "danger" },
  { id: "2", name: "Black Lotus", game: "magic", gameLabel: "Magic", priceRange: "800–5000 €", trend: "up", badgeVariant: "gold" },
  { id: "3", name: "Blue-Eyes White Dragon", game: "yugioh", gameLabel: "Yu-Gi-Oh!", priceRange: "15–80 €", trend: "up", badgeVariant: "info" },
  { id: "4", name: "Monkey D. Luffy", game: "onepiece", gameLabel: "One Piece", priceRange: "20–60 €", trend: "hot", badgeVariant: "danger" },
  { id: "5", name: "Elsa — Spirit of Winter", game: "lorcana", gameLabel: "Lorcana", priceRange: "10–45 €", trend: "up", badgeVariant: "success" },
  { id: "6", name: "Son Goku, Saiyan Raised on Earth", game: "dragonball", gameLabel: "Dragon Ball", priceRange: "8–30 €", trend: "up", badgeVariant: "warning" },
];

export function TrendingSection() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {TRENDING_CARDS.map((card) => (
        <Link
          key={card.id}
          href={`/listings?game=${card.game}&q=${encodeURIComponent(card.name)}`}
          className="flex flex-col gap-2 rounded-xl border border-surface-border bg-surface p-4 transition-all duration-200 hover:border-brand/40 hover:bg-surface-hover hover:shadow-glow-card hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between gap-1">
            <Badge variant={card.badgeVariant} className="text-[10px]">
              {card.trend === "hot" ? "🔥 Hot" : "↑ Subiendo"}
            </Badge>
          </div>
          <p className="text-sm font-medium text-slate-200 leading-tight line-clamp-2">
            {card.name}
          </p>
          <div className="mt-auto space-y-1">
            <p className="text-xs text-slate-500">{card.gameLabel}</p>
            <p className="text-sm font-bold text-brand">{card.priceRange}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
