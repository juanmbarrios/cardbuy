"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, useCallback, Suspense } from "react";

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function NavSearchBarInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [mobileOpen, setMobileOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  useEffect(() => {
    if (mobileOpen) {
      mobileInputRef.current?.focus();
    }
  }, [mobileOpen]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && mobileOpen) setMobileOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = query.trim();
      const params = new URLSearchParams();
      if (trimmed) params.set("q", trimmed);
      const game = searchParams.get("game");
      const condition = searchParams.get("condition");
      const language = searchParams.get("language");
      if (game) params.set("game", game);
      if (condition) params.set("condition", condition);
      if (language) params.set("language", language);
      router.push(`/listings?${params.toString()}`);
      setMobileOpen(false);
    },
    [query, searchParams, router]
  );

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block">
        <form role="search" aria-label="Búsqueda de cartas" onSubmit={handleSubmit} className="relative flex items-center">
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar carta, set..."
            className="w-48 lg:w-64 rounded-lg border border-surface-border bg-surface px-3 py-1.5 pr-8 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand/50 transition-all duration-200"
          />
          <button type="submit" aria-label="Buscar" className="absolute right-2 text-slate-400 hover:text-brand transition-colors">
            <SearchIcon />
          </button>
        </form>
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <button
          type="button"
          aria-label="Abrir búsqueda"
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-surface transition-colors"
        >
          <SearchIcon />
        </button>

        {mobileOpen && (
          <div className="fixed inset-x-0 top-0 z-[60] bg-bg/95 backdrop-blur-md border-b border-surface-border px-4 py-3 flex items-center gap-3">
            <form role="search" aria-label="Búsqueda de cartas" onSubmit={handleSubmit} className="flex-1 relative">
              <input
                ref={mobileInputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar carta, set o vendedor..."
                className="w-full rounded-lg border border-surface-border bg-surface px-4 py-2.5 pr-10 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand/50 transition-colors"
              />
              <button type="submit" aria-label="Buscar" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand transition-colors">
                <SearchIcon />
              </button>
            </form>
            <button
              type="button"
              aria-label="Cerrar búsqueda"
              onClick={() => setMobileOpen(false)}
              className="shrink-0 p-1 text-slate-400 hover:text-white transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export function NavSearchBar() {
  return (
    <Suspense fallback={<div className="hidden md:block w-48 lg:w-64 h-8 rounded-lg bg-surface animate-pulse" />}>
      <NavSearchBarInner />
    </Suspense>
  );
}
