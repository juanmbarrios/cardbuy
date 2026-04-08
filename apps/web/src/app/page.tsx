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
      <section className="bg-gradient-to-b from-brand-50 to-white py-20 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="info" className="mb-4">
            Marketplace TCG de confianza
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Compra y vende cartas TCG{" "}
            <span className="text-brand-600">con seguridad</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600">
            Vendedores verificados, pago protegido y gestión de disputas. El marketplace
            para coleccionistas y jugadores de Pokémon, Magic, Yu-Gi-Oh! y más.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/listings">
              <Button size="lg">Ver cartas en venta</Button>
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
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
            Explora por juego
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {GAMES.map((game) => (
              <Link
                key={game.href}
                href={game.href}
                className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 text-center transition-shadow hover:shadow-md hover:border-brand-200"
              >
                <span className="text-3xl">{game.emoji}</span>
                <span className="text-sm font-medium text-gray-700">{game.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 text-center">
            <div>
              <div className="text-3xl font-bold text-brand-600">✓</div>
              <h3 className="mt-2 font-semibold text-gray-900">Vendedores verificados</h3>
              <p className="mt-1 text-sm text-gray-500">KYC obligatorio para todos los vendedores</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-brand-600">🔒</div>
              <h3 className="mt-2 font-semibold text-gray-900">Pago protegido</h3>
              <p className="mt-1 text-sm text-gray-500">El dinero se libera al confirmar la recepción</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-brand-600">⭐</div>
              <h3 className="mt-2 font-semibold text-gray-900">Sistema de reputación</h3>
              <p className="mt-1 text-sm text-gray-500">Valoraciones verificadas de compradores reales</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
