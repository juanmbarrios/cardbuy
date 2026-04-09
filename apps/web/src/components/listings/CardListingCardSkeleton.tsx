import { Skeleton } from "@/components/ui/Skeleton";

export function CardListingCardSkeleton() {
  return (
    <div
      className="flex flex-col rounded-xl border border-surface-border bg-surface overflow-hidden"
      aria-hidden="true"
      data-testid="listing-card-skeleton"
    >
      {/* Imagen placeholder */}
      <Skeleton className="aspect-[3/4] w-full rounded-none" />

      {/* Info */}
      <div className="p-3 flex flex-col gap-2">
        {/* Precio + stock */}
        <div className="flex items-center justify-between gap-1">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>

        {/* Título */}
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-3/4" />

        {/* Badges condición/idioma */}
        <div className="flex gap-1">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-8 rounded-full" />
        </div>

        {/* Vendedor */}
        <Skeleton className="h-3.5 w-24" />
      </div>
    </div>
  );
}
