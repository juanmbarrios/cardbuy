import Link from "next/link";
import type { Metadata } from "next";
import { Button, Badge } from "@cardbuy/ui";
import { auth } from "@/lib/auth";
import { SearchBar } from "@/components/home/SearchBar";
import { GamesGrid } from "@/components/home/GamesGrid";
import { RecentListings } from "@/components/home/RecentListings";
import { TrendingSection } from "@/components/home/TrendingSection";

export const metadata: Metadata = {
  title: "CardBuy — Marketplace TCG de confianza",
  description:
    "Compra y vende cartas TCG con seguridad. Vendedores verificados, pago protegido y gestión de disputas. Pokémon, Magic: The Gathering, Yu-Gi-Oh! y más.",
  openGraph: {
    title: "CardBuy — Marketplace TCG de confianza",
    description:
      "Compra y vende cartas TCG con seguridad. Vendedores verificados, pago protegido y gestión de disputas.",
    type: "website",
    locale: "es_ES",
    siteName: "CardBuy",
  },
};

export default async function HomePage() {
  const session = await auth();

  return (
    <>
      {/* Hero */}
      <section className="relative bg-hero-gradient py-20 px-4 overflow-hidden">
        {/* Glow decorativo */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-brand/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-1/4 w-[300px] h-[300px] bg-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-3xl text-center">
          <Badge variant="gold" className="mb-5">
            Marketplace TCG de confianza
          </Badge>
          <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Compra y vende cartas TCG{" "}
            <span className="text-brand">con seguridad</span>
          </h1>
          <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
            Vendedores verificados, pago protegido y gestión de disputas. El marketplace
            para coleccionistas y jugadores de Pokémon, Magic, Yu-Gi-Oh! y más.
          </p>

          {/* Barra de búsqueda global */}
          <div className="mt-8 flex justify-center">
            <SearchBar />
          </div>

          {/* CTAs diferenciados según estado de autenticación */}
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            {session ? (
              <>
                <Link href="/orders">
                  <Button variant="primary" size="lg">Mis compras</Button>
                </Link>
                <Link href="/seller/dashboard">
                  <Button variant="secondary" size="lg">Mis ventas</Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/listings">
                  <Button variant="primary" size="lg">Ver cartas en venta</Button>
                </Link>
                <Link href="/register">
                  <Button variant="secondary" size="lg">Vender mis cartas</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Explora por juego */}
      <section className="py-14 px-4">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-xl font-bold text-white text-center mb-8">
            Explora por juego
          </h2>
          <GamesGrid />
        </div>
      </section>

      {/* Recién publicadas */}
      <section className="py-14 px-4 border-t border-surface-border">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-xl font-bold text-white">
              Recién publicadas
            </h2>
            <Link
              href="/listings"
              className="text-sm text-brand hover:text-brand-light transition-colors"
            >
              Ver todas →
            </Link>
          </div>
          <RecentListings />
        </div>
      </section>

      {/* En tendencia */}
      <section className="py-14 px-4 border-t border-surface-border">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-xl font-bold text-white">
              En tendencia
            </h2>
            <Link
              href="/listings"
              className="text-sm text-brand hover:text-brand-light transition-colors"
            >
              Ver más →
            </Link>
          </div>
          <TrendingSection />
        </div>
      </section>

      {/* Trust signals */}
      <section className="py-14 px-4 border-t border-surface-border">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-brand/15 flex items-center justify-center text-2xl">
                ✓
              </div>
              <h3 className="font-semibold text-white">Vendedores verificados</h3>
              <p className="text-sm text-slate-500">KYC obligatorio para todos los vendedores</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent/15 flex items-center justify-center text-2xl">
                🔒
              </div>
              <h3 className="font-semibold text-white">Pago protegido</h3>
              <p className="text-sm text-slate-500">El dinero se libera al confirmar la recepción</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-brand/15 flex items-center justify-center text-2xl">
                ⭐
              </div>
              <h3 className="font-semibold text-white">Sistema de reputación</h3>
              <p className="text-sm text-slate-500">Valoraciones verificadas de compradores reales</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
