"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@cardbuy/ui";

export function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-brand-700">CardBuy</span>
          </Link>

          {/* Links principales */}
          <div className="hidden items-center gap-6 md:flex">
            <Link
              href="/listings"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              Cartas
            </Link>
            <Link
              href="/listings?game=pokemon"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              Pokémon
            </Link>
            <Link
              href="/listings?game=magic"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              Magic
            </Link>
            <Link
              href="/listings?game=yugioh"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              Yu-Gi-Oh!
            </Link>
          </div>

          {/* Auth */}
          <div className="flex items-center gap-3">
            {status === "loading" ? null : session ? (
              <>
                <span className="hidden text-sm text-gray-600 sm:block">
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
                  <Button size="sm">Registrarse</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
