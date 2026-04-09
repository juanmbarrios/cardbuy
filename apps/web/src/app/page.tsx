import Link from "next/link";
import { Button, Badge } from "@cardbuy/ui";

const GAMES = [
  { name: "Pokémon", href: "/listings?game=pokemon", emoji: "🔴" },
  { name: "Magic: The Gathering", href: "/listings?game=magic", emoji: "🟣" },
  { name: "Yu-Gi-Oh!", href: "/listings?game=yugioh", emoji: "🟡" },
  { name: "One Piece", href: "/listings?game=onepiece", emoji: "🔵" },
  { name: "Lorcana", href: "/listings?game=lorcana", emoji: "🟢" },
  { name: "Dragon Ball", href: "/listings?game=dragonball", emoji: "🟠" },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-hero-gradient py-24 px-4 overflow-hidden">
        {/* Glow decorativo */}
        <div className="absolute inset-0 pointer-events-none">
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
          <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto">
            Vendedores verificados, pago protegido y gestión de disputas. El marketplace
            para coleccionistas y jugadores de Pokémon, Magic, Yu-Gi-Oh! y más.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/listings">
              <Button variant="primary" size="lg">Ver cartas en venta</Button>
            </Link>
            <Link href="/register">
              <Button variant="secondary" size="lg">
                Vender mis cartas
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Juegos */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-2xl font-bold text-white text-center mb-10">
            Explora por juego
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {GAMES.map((game) => (
              <Link
                key={game.href}
                href={game.href}
                className="flex flex-col items-center gap-2 rounded-xl border border-surface-border bg-surface p-4 text-center transition-all duration-200 hover:border-brand/40 hover:bg-surface-hover hover:shadow-glow-card"
              >
                <span className="text-3xl">{game.emoji}</span>
                <span className="text-sm font-medium text-slate-300 group-hover:text-white">{game.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="py-16 px-4 border-t border-surface-border">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-brand/15 flex items-center justify-center text-2xl">✓</div>
              <h3 className="font-semibold text-white">Vendedores verificados</h3>
              <p className="text-sm text-slate-500">KYC obligatorio para todos los vendedores</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent/15 flex items-center justify-center text-2xl">🔒</div>
              <h3 className="font-semibold text-white">Pago protegido</h3>
              <p className="text-sm text-slate-500">El dinero se libera al confirmar la recepción</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-brand/15 flex items-center justify-center text-2xl">⭐</div>
              <h3 className="font-semibold text-white">Sistema de reputación</h3>
              <p className="text-sm text-slate-500">Valoraciones verificadas de compradores reales</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
