"use client";

import Link from "next/link";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import { Button } from "@cardbuy/ui";
import { useCart } from "@/context/CartContext";
import { CartItemRow } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { Spinner } from "@cardbuy/ui";

export default function CartPage() {
  const { items, groups, totalItems, grandTotal, loading } = useCart();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center gap-6 text-center">
        <div className="text-6xl text-slate-700">
          <ShoppingCart size={64} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Tu carrito está vacío</h1>
          <p className="mt-2 text-slate-400">
            Explora el marketplace y añade cartas a tu carrito.
          </p>
        </div>
        <Link href="/listings">
          <Button variant="primary" size="lg">
            Ver cartas disponibles
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/listings" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-display text-2xl font-bold text-white">
          Carrito
          <span className="ml-2 text-base font-normal text-slate-400">
            ({totalItems} {totalItems === 1 ? "artículo" : "artículos"})
          </span>
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        {/* Cart items grouped by seller */}
        <div className="flex flex-col gap-6">
          {groups.map((group) => (
            <div key={group.sellerId} className="flex flex-col gap-2">
              <div className="flex items-center gap-2 px-1">
                <div className="h-7 w-7 rounded-full bg-surface-raised flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">
                  {group.sellerName.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-white">{group.sellerName}</span>
                {group.shippingCost === 0 ? (
                  <span className="text-xs text-green-400 ml-auto">Envío gratis</span>
                ) : (
                  <span className="text-xs text-slate-500 ml-auto">
                    +
                    {group.shippingCost.toLocaleString("es-ES", {
                      style: "currency",
                      currency: "EUR",
                    })}{" "}
                    envío
                  </span>
                )}
              </div>
              {group.items.map((item) => (
                <CartItemRow key={item.listingId} item={item} />
              ))}
            </div>
          ))}
        </div>

        {/* Summary sidebar */}
        <CartSummary groups={groups} grandTotal={grandTotal} />
      </div>
    </div>
  );
}
