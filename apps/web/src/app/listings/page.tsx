import { Suspense } from "react";
import type { Metadata } from "next";

interface SearchParams {
  game?: string;
  condition?: string;
  language?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  page?: string;
}

interface Props {
  searchParams: SearchParams;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const game = searchParams.game ?? "todos los juegos";
  return {
    title: `Cartas TCG en venta — ${game} | CardBuy`,
    description: `Compra cartas TCG de ${game}. Vendedores verificados, pago protegido.`,
  };
}

export default function ListingsPage({ searchParams }: Props) {
  return (
    <Suspense fallback={<div>Cargando listados...</div>}>
      <div>
        <h1>Listados — {searchParams.game ?? "Todos los juegos"}</h1>
        {/* TODO: ListingsGrid, FilterPanel — issue #1 */}
      </div>
    </Suspense>
  );
}
