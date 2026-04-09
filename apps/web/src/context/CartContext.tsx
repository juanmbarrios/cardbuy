"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { CartItem, CartGroup } from "@/lib/cart";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CartState {
  items: CartItem[];
  groups: CartGroup[];
  totalItems: number;
  grandTotal: number;
  loading: boolean;
}

interface CartContextValue extends CartState {
  addItem: (listingId: string, quantity?: number) => Promise<{ ok: boolean; error?: string }>;
  removeItem: (listingId: string) => Promise<void>;
  updateQuantity: (listingId: string, quantity: number) => Promise<{ ok: boolean; error?: string }>;
  refresh: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CartState>({
    items: [],
    groups: [],
    totalItems: 0,
    grandTotal: 0,
    loading: true,
  });

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setState((prev) => ({ ...prev, ...data, loading: false }));
      } else {
        setState((prev) => ({ ...prev, loading: false }));
      }
    } catch {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = useCallback(
    async (listingId: string, quantity = 1): Promise<{ ok: boolean; error?: string }> => {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, quantity }),
      });
      const data = await res.json();
      if (data.ok) await refresh();
      return data;
    },
    [refresh]
  );

  const removeItem = useCallback(
    async (listingId: string): Promise<void> => {
      await fetch(`/api/cart/${listingId}`, { method: "DELETE" });
      await refresh();
    },
    [refresh]
  );

  const updateQuantity = useCallback(
    async (listingId: string, quantity: number): Promise<{ ok: boolean; error?: string }> => {
      const res = await fetch(`/api/cart/${listingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      const data = await res.json();
      if (data.ok) await refresh();
      return data;
    },
    [refresh]
  );

  return (
    <CartContext.Provider value={{ ...state, addItem, removeItem, updateQuantity, refresh }}>
      {children}
    </CartContext.Provider>
  );
}
