"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback, Suspense } from "react";

function HeroSearchBarInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = query.trim();
      const params = new URLSearchParams();
      if (trimmed) params.set("q", trimmed);
      router.push(`/listings?${params.toString()}`);
    },
    [query, router]
  );

  return (
    <form
      role="search"
      aria-label="Búsqueda principal de cartas"
      onSubmit={handleSubmit}
      className="relative w-full max-w-xl"
    >
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar carta, set o vendedor..."
        className={[
          "w-full rounded-xl border border-surface-border bg-surface",
          "px-5 py-3.5 pr-24 text-sm text-slate-200 placeholder:text-slate-500",
          "focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand/50",
          "transition-colors",
        ].join(" ")}
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-bg hover:bg-brand-light transition-colors"
      >
        Buscar
      </button>
    </form>
  );
}

export function SearchBar() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-xl h-[52px] rounded-xl bg-surface animate-pulse" />
    }>
      <HeroSearchBarInner />
    </Suspense>
  );
}
