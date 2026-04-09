import { CardListingCard, type CardListingData } from "./CardListingCard";
import { EmptyState } from "@/components/ui/EmptyState";

interface Props {
  listings: CardListingData[];
  searchQuery?: string;
}

export function ListingsGrid({ listings, searchQuery }: Props) {
  if (listings.length === 0) {
    return (
      <EmptyState
        icon="🔍"
        title={searchQuery ? `Sin resultados para "${searchQuery}"` : "No hay cartas disponibles"}
        description={
          searchQuery
            ? "Prueba con otros términos o elimina algunos filtros."
            : "Prueba a cambiar los filtros o vuelve más tarde."
        }
        action={{ label: "Ver todas las cartas", href: "/listings" }}
      />
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
