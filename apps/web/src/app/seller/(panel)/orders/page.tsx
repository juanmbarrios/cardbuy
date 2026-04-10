"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Package, Truck, CheckCircle } from "lucide-react";
import { Button, Input, Spinner } from "@cardbuy/ui";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import type { OrderStatus } from "@cardbuy/db";

interface SellerOrder {
  id: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  buyer: { id: string; name: string | null };
  itemCount: number;
  firstItem: Record<string, unknown> | null;
}

interface TrackingFormState {
  carrier: string;
  trackingNumber: string;
  trackingUrl: string;
}

const INITIAL_FORM: TrackingFormState = { carrier: "", trackingNumber: "", trackingUrl: "" };

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [form, setForm] = useState<TrackingFormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders?role=seller");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleSelectOrder = (orderId: string) => {
    setSelected(orderId);
    setForm(INITIAL_FORM);
    setFeedback(null);
  };

  const handleSubmitTracking = async (orderId: string) => {
    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/orders/${orderId}/tracking`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          event: {
            status: "Información de envío actualizada",
            description: `Enviado por ${form.carrier || "transportista"}. Nº de seguimiento: ${form.trackingNumber || "—"}`,
          },
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setFeedback({ ok: true, msg: "Seguimiento actualizado correctamente." });
        setSelected(null);
        setForm(INITIAL_FORM);
        fetchOrders();
      } else {
        setFeedback({ ok: false, msg: data.error ?? "Error al actualizar." });
      }
    } catch {
      setFeedback({ ok: false, msg: "Error de conexión." });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display text-2xl font-bold text-white mb-2">Mis ventas</h1>
      <p className="text-sm text-slate-400 mb-6">
        Gestiona los pedidos que has recibido y actualiza la información de envío.
      </p>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-surface-border bg-surface p-10 text-center">
          <p className="text-slate-400">Todavía no has recibido ningún pedido.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => {
            const snap = order.firstItem;
            const isSelected = selected === order.id;
            const needsShipping =
              order.status === "PAYMENT_CONFIRMED" || order.status === "PREPARING";

            return (
              <div
                key={order.id}
                className="rounded-xl border border-surface-border bg-surface overflow-hidden"
              >
                {/* Order row */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-sm font-medium text-white hover:text-brand transition-colors"
                      >
                        #{order.id.slice(0, 8).toUpperCase()}
                      </Link>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {snap?.name ? String(snap.name) : "Pedido"} ·{" "}
                      {order.buyer.name ?? "Comprador"} ·{" "}
                      {new Date(order.createdAt).toLocaleDateString("es-ES")}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-bold text-brand">
                      {order.total.toLocaleString("es-ES", {
                        style: "currency",
                        currency: "EUR",
                      })}
                    </span>

                    {needsShipping && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleSelectOrder(order.id)}
                      >
                        <Truck size={14} />
                        Añadir envío
                      </Button>
                    )}

                    {order.status === "SHIPPED" && (
                      <span className="flex items-center gap-1 text-xs text-brand">
                        <Package size={12} /> Enviado
                      </span>
                    )}

                    {(order.status === "DELIVERED" || order.status === "COMPLETED") && (
                      <span className="flex items-center gap-1 text-xs text-green-400">
                        <CheckCircle size={12} /> Completado
                      </span>
                    )}
                  </div>
                </div>

                {/* Tracking form */}
                {isSelected && (
                  <div className="border-t border-surface-border bg-bg-deep px-5 py-4 flex flex-col gap-3">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Información de envío
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Transportista</label>
                        <Input
                          placeholder="ej. Correos, MRW, SEUR"
                          value={form.carrier}
                          onChange={(e) => setForm((f) => ({ ...f, carrier: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Nº de seguimiento</label>
                        <Input
                          placeholder="ej. ES123456789"
                          value={form.trackingNumber}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, trackingNumber: e.target.value }))
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">URL de seguimiento (opcional)</label>
                      <Input
                        placeholder="https://..."
                        value={form.trackingUrl}
                        onChange={(e) => setForm((f) => ({ ...f, trackingUrl: e.target.value }))}
                      />
                    </div>

                    {feedback && (
                      <p
                        className={[
                          "text-xs px-3 py-2 rounded-lg border",
                          feedback.ok
                            ? "text-green-400 border-green-900/50 bg-green-950/30"
                            : "text-red-400 border-red-900/50 bg-red-950/30",
                        ].join(" ")}
                      >
                        {feedback.msg}
                      </p>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        loading={submitting}
                        onClick={() => handleSubmitTracking(order.id)}
                      >
                        Confirmar envío
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelected(null)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
