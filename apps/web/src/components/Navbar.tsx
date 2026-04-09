"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Button } from "@cardbuy/ui";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";

const NAV_LINKS = [
  { label: "Cartas", href: "/listings" },
  { label: "Pokémon", href: "/listings?game=pokemon" },
  { label: "Magic", href: "/listings?game=magic" },
  { label: "Yu-Gi-Oh!", href: "/listings?game=yugioh" },
];

export function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const { totalItems } = useCart();

  return (
    <nav className="sticky top-0 z-50 border-b border-surface-border bg-bg/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-display text-xl font-bold text-brand group-hover:text-brand-light transition-colors">
              CardBuy
            </span>
          </Link>

          {/* Links principales */}
          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || pathname?.startsWith(link.href.split("?")[0]);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={[
                    "px-3 py-1.5 text-sm font-medium rounded-md transition-colors relative",
                    isActive
                      ? "text-white after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-accent after:rounded-full"
                      : "text-slate-400 hover:text-white hover:bg-surface",
                  ].join(" ")}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Carrito + Auth */}
          <div className="flex items-center gap-3">
            {session && (
              <Link
                href="/cart"
                className="relative flex items-center text-slate-400 hover:text-white transition-colors"
                aria-label="Carrito"
              >
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white leading-none">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </Link>
            )}

            {status === "loading" ? null : session ? (
              <>
                <span className="hidden text-sm text-slate-400 sm:block">
                  {session.user?.name ?? session.user?.email}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Salir
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Iniciar sesión
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">Registrarse</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
