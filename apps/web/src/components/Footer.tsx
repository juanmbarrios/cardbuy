import Link from "next/link";

const games = [
  { label: "Pokémon", href: "/listings?game=pokemon" },
  { label: "Magic: The Gathering", href: "/listings?game=magic" },
  { label: "Yu-Gi-Oh!", href: "/listings?game=yugioh" },
  { label: "One Piece", href: "/listings?game=onepiece" },
  { label: "Lorcana", href: "/listings?game=lorcana" },
];

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Marca */}
          <div>
            <span className="text-lg font-bold text-brand-700">CardBuy</span>
            <p className="mt-2 text-sm text-gray-500">
              El marketplace de cartas coleccionables de confianza. Compra y vende con seguridad.
            </p>
          </div>

          {/* Juegos */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
              Juegos
            </h3>
            <ul className="space-y-2">
              {games.map((game) => (
                <li key={game.href}>
                  <Link
                    href={game.href}
                    className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    {game.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Términos de uso
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Privacidad
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6 text-center">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} CardBuy. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
