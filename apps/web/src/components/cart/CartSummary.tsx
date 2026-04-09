"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@cardbuy/ui";
import type { CartGroup } from "@/lib/cart";

interface Props {
  groups: CartGroup[];
  grandTotal: number;
}

export function CartSummary({ groups, grandTotal }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al iniciar el pago");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const subtotal = groups.reduce((s, g) => s + g.subtotal, 0);
  const shipping = groups.reduce((s, g) => s + g.shippingCost, 0);

  return (
    <div className="rounded-xl border border-surface-border bg-surface p-5 flex flex-col gap-4 sticky top-24">
      <h2 className="font-display text-lg font-bold text-white">Resumen del pedido</h2>

      {/* Per-seller breakdown */}
      {groups.map((group) => (
        <div key={group.sellerId} className="flex flex-col gap-1 pb-3 border-b border-surface-border last:border-0 last:pb-0">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {group.sellerName}
          </p>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Artículos</span>
            <span className="text-white">
              {group.subtotal.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Envío estimado</span>
            <span className={group.shippingCost === 0 ? "text-green-400" : "text-white"}>
              {group.shippingCost === 0
                ? "Gratis"
                : group.shippingCost.toLocaleString("es-ES", {
                    style: "currency",
                    currency: "EUR",
                  })}
            </span>
          </div>
        </div>
      ))}

      {/* Totals */}
      <div className="flex flex-col gap-1.5 pt-1">
        <div className="flex justify-between text-sm text-slate-400">
          <span>Subtotal</span>
          <span>{subtotal.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</span>
        </div>
        <div className="flex justify-between text-sm text-slate-400">
          <span>Envío total</span>
          <span>
            {shipping === 0
              ? "Gratis"
              : shipping.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
          </span>
        </div>
        <div className="flex justify-between font-bold text-white text-lg pt-2 border-t border-surface-border">
          <span>Total</span>
          <span className="text-brand">
            {grandTotal.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
          </span>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-400 rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2">
          {error}
        </p>
      )}

      <Button
        variant="primary"
        size="lg"
        loading={loading}
        onClick={handleCheckout}
        className="w-full"
      >
        Proceder al pago
      </Button>

      <p className="text-xs text-center text-slate-500">
        Pago seguro con Stripe · Devoluciones en 14 días
      </p>
    </div>
  );
}
