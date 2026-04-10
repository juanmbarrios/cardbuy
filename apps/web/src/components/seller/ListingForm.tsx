"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@cardbuy/ui";

interface CardResult {
  id: string;
  name: string;
  game: string;
  imageUrl: string | null;
}

interface ListingFormData {
  cardId: string;
  cardName: string;
  condition: string;
  language: string;
  price: string;
  quantity: string;
  isFoil: boolean;
  isGraded: boolean;
  description: string;
  shippingCost: string;
  freeShipping: boolean;
}

const EMPTY: ListingFormData = {
  cardId: "",
  cardName: "",
  condition: "NEAR_MINT",
  language: "EN",
  price: "",
  quantity: "1",
  isFoil: false,
  isGraded: false,
  description: "",
  shippingCost: "0",
  freeShipping: false,
};

const CONDITIONS = [
  { value: "NEAR_MINT", label: "Near Mint (NM)" },
  { value: "LIGHTLY_PLAYED", label: "Lightly Played (LP)" },
  { value: "MODERATELY_PLAYED", label: "Moderately Played (MP)" },
  { value: "HEAVILY_PLAYED", label: "Heavily Played (HP)" },
  { value: "DAMAGED", label: "Damaged (DMG)" },
];

const LANGUAGES = [
  { value: "EN", label: "Inglés" },
  { value: "ES", label: "Español" },
  { value: "JA", label: "Japonés" },
  { value: "FR", label: "Francés" },
  { value: "DE", label: "Alemán" },
  { value: "IT", label: "Italiano" },
  { value: "PT", label: "Portugués" },
  { value: "KO", label: "Coreano" },
  { value: "ZH", label: "Chino" },
];

interface Props {
  initialData?: Partial<ListingFormData>;
  listingId?: string; // si existe → modo edición
}

export function ListingForm({ initialData, listingId }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<ListingFormData>({ ...EMPTY, ...initialData });
  const [cardSearch, setCardSearch] = useState(initialData?.cardName ?? "");
  const [cardResults, setCardResults] = useState<CardResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchCards = useCallback(async (q: string) => {
    if (q.length < 2) { setCardResults([]); return; }
    setSearching(true);
    const res = await fetch(`/api/seller/cards/search?q=${encodeURIComponent(q)}`);
    if (res.ok) setCardResults(await res.json());
    setSearching(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => searchCards(cardSearch), 300);
    return () => clearTimeout(t);
  }, [cardSearch, searchCards]);

  const selectCard = (card: CardResult) => {
    setForm((f) => ({ ...f, cardId: card.id, cardName: card.name }));
    setCardSearch(card.name);
    setCardResults([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.cardId) { setError("Selecciona una carta del listado."); return; }
    setLoading(true);
    setError(null);

    const body = {
      cardId: form.cardId,
      condition: form.condition,
      language: form.language,
      price: parseFloat(form.price),
      quantity: parseInt(form.quantity, 10),
      isFoil: form.isFoil,
      isGraded: form.isGraded,
      description: form.description || undefined,
      shippingCost: parseFloat(form.shippingCost) || 0,
      freeShipping: form.freeShipping,
    };

    const res = listingId
      ? await fetch(`/api/seller/listings/${listingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      : await fetch("/api/seller/listings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error ?? "Error al guardar."); return; }
    router.push("/seller/inventory");
  };

  const field = (key: keyof ListingFormData, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-2xl">
      {/* Búsqueda de carta */}
      {!listingId && (
        <div className="relative">
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Carta *</label>
          <Input
            placeholder="Buscar por nombre..."
            value={cardSearch}
            onChange={(e) => { setCardSearch(e.target.value); field("cardId", ""); }}
          />
          {searching && <p className="text-xs text-slate-500 mt-1">Buscando...</p>}
          {cardResults.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-xl border border-surface-border bg-bg shadow-lg overflow-hidden">
              {cardResults.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => selectCard(c)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-surface transition-colors"
                >
                  <span className="text-sm text-slate-200">{c.name}</span>
                  <span className="text-xs text-slate-500 ml-auto">{c.game}</span>
                </button>
              ))}
            </div>
          )}
          {form.cardId && (
            <p className="text-xs text-brand mt-1">✓ {form.cardName} seleccionada</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Condición */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Condición *</label>
          <select
            value={form.condition}
            onChange={(e) => field("condition", e.target.value)}
            className="w-full rounded-lg border border-surface-border bg-bg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand/50"
          >
            {CONDITIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        {/* Idioma */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Idioma *</label>
          <select
            value={form.language}
            onChange={(e) => field("language", e.target.value)}
            className="w-full rounded-lg border border-surface-border bg-bg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand/50"
          >
            {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>

        {/* Precio */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Precio (€) *</label>
          <Input
            type="number"
            min="0.01"
            max="99999"
            step="0.01"
            placeholder="0.00"
            value={form.price}
            onChange={(e) => field("price", e.target.value)}
            required
          />
        </div>

        {/* Cantidad */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Cantidad *</label>
          <Input
            type="number"
            min="1"
            max="999"
            placeholder="1"
            value={form.quantity}
            onChange={(e) => field("quantity", e.target.value)}
            required
          />
        </div>
      </div>

      {/* Opciones */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isFoil}
            onChange={(e) => field("isFoil", e.target.checked)}
            className="rounded border-surface-border"
          />
          <span className="text-sm text-slate-300">Foil</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isGraded}
            onChange={(e) => field("isGraded", e.target.checked)}
            className="rounded border-surface-border"
          />
          <span className="text-sm text-slate-300">Gradada</span>
        </label>
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Descripción (opcional)</label>
        <textarea
          value={form.description}
          onChange={(e) => field("description", e.target.value)}
          placeholder="Estado, características especiales, notas de envío..."
          maxLength={2000}
          rows={3}
          className="w-full rounded-lg border border-surface-border bg-bg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand/50 resize-none"
        />
      </div>

      {/* Envío */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Gastos de envío (€)</label>
          <Input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={form.shippingCost}
            onChange={(e) => field("shippingCost", e.target.value)}
            disabled={form.freeShipping}
          />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.freeShipping}
              onChange={(e) => {
                field("freeShipping", e.target.checked);
                if (e.target.checked) field("shippingCost", "0");
              }}
              className="rounded border-surface-border"
            />
            <span className="text-sm text-slate-300">Envío gratuito</span>
          </label>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-400 border border-red-900/50 bg-red-950/30 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Button variant="primary" type="submit" loading={loading}>
          {listingId ? "Guardar cambios" : "Publicar listing"}
        </Button>
        <Button variant="ghost" type="button" onClick={() => router.push("/seller/inventory")}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
