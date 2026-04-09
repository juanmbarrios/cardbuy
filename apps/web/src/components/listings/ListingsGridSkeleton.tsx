import { CardListingCardSkeleton } from "./CardListingCardSkeleton";

interface Props {
  count?: number;
}

export function ListingsGridSkeleton({ count = 10 }: Props) {
  return (
    <div
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
      aria-label="Cargando cartas…"
      aria-busy="true"
    >
      {Array.from({ length: count }).map((_, i) => (
        <CardListingCardSkeleton key={i} />
      ))}
    </div>
  );
}
