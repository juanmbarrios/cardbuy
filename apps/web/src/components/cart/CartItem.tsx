"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@cardbuy/ui";
import { Trash2, Minus, Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import type { CartItem as CartItemType } from "@/lib/cart";

const CONDITION_LABELS: Record<string, string> = {
  NEAR_MINT: "Near Mint",
  LIGHTLY_PLAYED: "Lightly Played",
  MODERATELY_PLAYED: "Mod. Played",
  HEAVILY_PLAYED: "Heavily Played",
  DAMAGED: "Damaged",
};

const CONDITION_VARIANTS: Record<string, "success" | "warning" | "danger" | "default"> = {
  NEAR_MINT: "success",
  LIGHTLY_PLAYED: "success",
  MODERATELY_PLAYED: "warning",
  HEAVILY_PLAYED: "danger",
  DAMAGED: "danger",
};

interface Props {
  item: CartItemType;
}

export function CartItemRow({ item }: Props) {
  const { removeItem, updateQuantity } = useCart();
  const [busy, setBusy] = useState(false);

  const handleRemove = async () => {
    setBusy(true);
    await removeItem(item.listingId);
    setBusy(false);
  };

  const handleQtyChange = async (delta: number) => {
    const next = item.quantity + delta;
    if (next <= 0) return handleRemove();
    setBusy(true);
    await updateQuantity(item.listingId, next);
    setBusy(false);
  };

  return (
    <div
      className={[
        "flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-surface-border bg-surface px-4 py-3 transition-opacity",
        busy ? "opacity-50 pointer-events-none" : "",
        !item.available ? "border-red-900/40 bg-red-950/20" : "",
      ].join(" ")}
    >
      {/* Card image */}
      <div className="h-14 w-10 shrink-0 rounded-md overflow-hidden bg-bg-deep border border-surface-border flex items-center justify-center">
        {item.cardImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.cardImageUrl} alt={item.cardName} className="h-full w-full object-cover" />
        ) : (
          <span className="text-2xl text-slate-700">🃏</span>
        )}
      </div>

      {/* Card info */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/cards/${item.cardSlug}`}
          className="text-sm font-medium text-white hover:text-brand transition-colors line-clamp-1"
        >
          {item.cardName}
        </Link>
        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
          <Badge variant={CONDITION_VARIANTS[item.condition] ?? "default"} >
            {CONDITION_LABELS[item.condition] ?? item.condition}
          </Badge>
          <Badge variant="outline">{item.language}</Badge>
          {!item.available && (
            <Badge variant="danger">No disponible</Badge>
          )}
        </div>
        <p className="mt-0.5 text-xs text-slate-500">{item.sellerName}</p>
      </div>

      {/* Price */}
      <div className="hidden sm:block text-sm font-semibold text-brand w-20 text-right shrink-0">
        {(item.price * item.quantity).toLocaleString("es-ES", {
          style: "currency",
          currency: "EUR",
        })}
      </div>

      {/* Quantity controls */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => handleQtyChange(-1)}
          className="h-7 w-7 rounded-md border border-surface-border flex items-center justify-center text-slate-400 hover:text-white hover:border-brand/50 transition-colors"
          aria-label="Reducir cantidad"
        >
          <Minus size={12} />
        </button>
        <span className="w-6 text-center text-sm font-medium text-white">{item.quantity}</span>
        <button
          onClick={() => handleQtyChange(1)}
          disabled={item.quantity >= item.stock}
          className="h-7 w-7 rounded-md border border-surface-border flex items-center justify-center text-slate-400 hover:text-white hover:border-brand/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Aumentar cantidad"
        >
          <Plus size={12} />
        </button>
      </div>

      {/* Remove */}
      <button
        onClick={handleRemove}
        className="text-slate-600 hover:text-red-400 transition-colors shrink-0"
        aria-label="Eliminar del carrito"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
