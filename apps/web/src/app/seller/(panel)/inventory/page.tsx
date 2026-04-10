"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button, Badge, Spinner } from "@cardbuy/ui";

interface SellerListing {
  id: string;
  cardName: string;
  game: string;
  condition: string;
  language: string;
  price: number;
  quantity: number;
  status: string;
  isFoil: boolean;
  views: number;
  createdAt: string;
}

const CONDITION_SHORT: Record<string, string> = {
  NEAR_MINT: "NM",
  LIGHTLY_PLAYED: "LP",
  MODERATELY_PLAYED: "MP",
  HEAVILY_PLAYED: "HP",
  DAMAGED: "DMG",
};

const STATUS_TABS = [
  { value: "ACTIVE", label: "Activos" },
  { value: "SOLD", label: "Vendidos" },
  { value: "CANCELLED", label: "Archivados" },
];

export default function SellerInventoryPage() {
  const [listings, setListings] = useState<SellerListing[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [status, setStatus] = useState("ACTIVE");
  const [loading, setLoading] = useState(true);
  const [archiving, setArchiving] = useState<string | null>(null);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/seller/listings?status=${status}&page=${page}`);
    if (res.ok) {
      const data = await res.json();
      setListings(data.listings);
      setTotal(data.total);
      setPages(data.pages);
    }
    setLoading(false);
  }, [status, page]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleArchive = async (id: string) => {
    if (!confirm("¿Archivar este listing? Dejará de estar visible para los compradores.")) return;
    setArchiving(id);
    await fetch(`/api/seller/listings/${id}`, { method: "DELETE" });
    setArchiving(null);
    fetchListings();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Inventario</h1>
          <p className="text-sm text-slate-400 mt-0.5">{total} listing{total !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/seller/inventory/new">
          <Button variant="primary" size="sm">+ Nuevo listing</Button>
        </Link>
      </div>

      {/* Filtros de estado */}
      <div className="flex gap-1 mb-6 border-b border-surface-border pb-4">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setStatus(tab.value); setPage(1); }}
            className={[
              "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
              status === tab.value
                ? "bg-surface text-white"
                : "text-slate-400 hover:text-white",
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : listings.length === 0 ? (
        <div className="rounded-xl border border-surface-border bg-surface p-10 text-center">
          <p className="text-slate-400">No hay listings en esta categoría.</p>
          {status === "ACTIVE" && (
            <Link href="/seller/inventory/new" className="inline-block mt-4">
              <Button variant="primary" size="sm">Crear tu primer listing</Button>
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            {listings.map((l) => (
              <div
                key={l.id}
                className="flex items-center gap-4 rounded-xl border border-surface-border bg-surface px-4 py-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{l.cardName}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {CONDITION_SHORT[l.condition] ?? l.condition} · {l.language}
                    {l.isFoil && " · Foil"}
                    {" · "}{l.views} visitas
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-sm font-bold text-brand">
                    {l.price.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
                  </span>
                  <Badge variant="default">{l.quantity} uds.</Badge>
                  {l.status === "ACTIVE" && (
                    <div className="flex gap-2">
                      <Link href={`/seller/inventory/${l.id}/edit`}>
                        <Button variant="secondary" size="sm">Editar</Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        loading={archiving === l.id}
                        onClick={() => handleArchive(l.id)}
                      >
                        Archivar
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button variant="secondary" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                Anterior
              </Button>
              <span className="text-sm text-slate-400 self-center">{page} / {pages}</span>
              <Button variant="secondary" size="sm" onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}>
                Siguiente
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
