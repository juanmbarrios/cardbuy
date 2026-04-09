import { CardListingCard, type CardListingData } from "./CardListingCard";

interface Props {
  listings: CardListingData[];
}

export function ListingsGrid({ listings }: Props) {
  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-5xl mb-4">🃏</span>
        <h3 className="text-lg font-semibold text-white">No hay cartas disponibles</h3>
        <p className="mt-1 text-sm text-slate-400">
          Prueba a cambiar los filtros o vuelve más tarde.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {listings.map((listing) => (
        <CardListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
