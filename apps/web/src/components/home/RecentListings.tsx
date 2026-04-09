import { CardListingCard, type CardListingData } from "@/components/listings/CardListingCard";

// Placeholder listings — se sustituirá por fetch real desde packages/db en issue de marketplace
const RECENT_LISTINGS: CardListingData[] = [];

export function RecentListings() {
  if (RECENT_LISTINGS.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-dashed border-surface-border">
        <span className="text-4xl mb-3">🃏</span>
        <p className="text-sm text-slate-500">
          Pronto aparecerán aquí las últimas cartas publicadas.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {RECENT_LISTINGS.map((listing) => (
        <CardListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
