import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";
import { auth } from "@/lib/auth";
import { getOrderById, ORDER_STATUS_LABELS } from "@/lib/orders";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { OrderTrackingTimeline } from "@/components/orders/OrderTrackingTimeline";
import type { OrderStatus } from "@cardbuy/db";

interface Props {
  params: { orderId: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `Pedido ${params.orderId.slice(0, 8).toUpperCase()} — CardBuy` };
}

export default async function OrderDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const order = await getOrderById(params.orderId, session.user.id);
  if (!order) notFound();

  const isBuyer = order.buyer.id === session.user.id;
  const shippingAddr = order.shippingAddress;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-slate-400">
        <Link href="/orders" className="hover:text-white transition-colors flex items-center gap-1">
          <ArrowLeft size={14} />
          Mis pedidos
        </Link>
        <span>/</span>
        <span className="text-slate-300">#{params.orderId.slice(0, 8).toUpperCase()}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">
            Pedido #{params.orderId.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Realizado el{" "}
            {new Date(order.createdAt).toLocaleDateString("es-ES", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <OrderStatusBadge status={order.status as OrderStatus} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_280px]">
        {/* Main content */}
        <div className="flex flex-col gap-5">
          {/* Items */}
          <section className="rounded-xl border border-surface-border bg-surface overflow-hidden">
            <div className="px-5 py-3 border-b border-surface-border flex items-center gap-2">
              <Package size={16} className="text-brand" />
              <h2 className="text-sm font-semibold text-white">Artículos</h2>
            </div>
            <div className="divide-y divide-surface-border">
              {order.items.map((item) => {
                const snap = item.cardSnapshot;
                return (
                  <div key={item.id} className="flex items-center gap-4 px-5 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {String(snap.name ?? "Carta")}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {String(snap.condition ?? "")} · {String(snap.language ?? "")}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-white">
                        {item.unitPrice.toLocaleString("es-ES", {
                          style: "currency",
                          currency: "EUR",
                        })}
                      </p>
                      <p className="text-xs text-slate-500">× {item.quantity}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Tracking */}
          <section className="rounded-xl border border-surface-border bg-surface p-5">
            <h2 className="text-sm font-semibold text-white mb-4">Seguimiento del envío</h2>
            {order.tracking ? (
              <OrderTrackingTimeline
                carrier={order.tracking.carrier}
                trackingNumber={order.tracking.trackingNumber}
                trackingUrl={order.tracking.trackingUrl}
                estimatedDate={order.tracking.estimatedDate}
                events={order.tracking.events}
              />
            ) : (
              <p className="text-sm text-slate-500">
                El seguimiento estará disponible cuando el vendedor confirme el envío.
              </p>
            )}
          </section>

          {/* Seller update link */}
          {!isBuyer && (
            <Link
              href="/seller/orders"
              className="text-sm text-brand hover:text-brand-light transition-colors"
            >
              Gestionar envío desde el panel de vendedor →
            </Link>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Price breakdown */}
          <div className="rounded-xl border border-surface-border bg-surface p-4 flex flex-col gap-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Resumen
            </h3>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Subtotal</span>
              <span className="text-white">
                {order.subtotal.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Envío</span>
              <span className="text-white">
                {order.shippingCost === 0
                  ? "Gratis"
                  : order.shippingCost.toLocaleString("es-ES", {
                      style: "currency",
                      currency: "EUR",
                    })}
              </span>
            </div>
            <div className="flex justify-between font-bold text-white border-t border-surface-border pt-2 mt-1">
              <span>Total</span>
              <span className="text-brand">
                {order.total.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
              </span>
            </div>
          </div>

          {/* Seller / Buyer info */}
          <div className="rounded-xl border border-surface-border bg-surface p-4 flex flex-col gap-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              {isBuyer ? "Vendedor" : "Comprador"}
            </h3>
            <p className="text-sm text-white">
              {isBuyer ? (order.seller.name ?? order.seller.email) : (order.buyer.name ?? order.buyer.email)}
            </p>
          </div>

          {/* Shipping address */}
          {shippingAddr && Object.keys(shippingAddr).length > 0 && (
            <div className="rounded-xl border border-surface-border bg-surface p-4 flex flex-col gap-1">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Dirección de entrega
              </h3>
              {shippingAddr.name && (
                <p className="text-sm text-white">{shippingAddr.name}</p>
              )}
              <p className="text-sm text-slate-400">
                {shippingAddr.line1}
                {shippingAddr.line2 ? `, ${shippingAddr.line2}` : ""}
              </p>
              <p className="text-sm text-slate-400">
                {shippingAddr.postal_code} {shippingAddr.city}
              </p>
              <p className="text-sm text-slate-400">{shippingAddr.country}</p>
            </div>
          )}

          {/* Status history */}
          <div className="rounded-xl border border-surface-border bg-surface p-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Estado actual
            </h3>
            <p className="text-sm text-white">
              {ORDER_STATUS_LABELS[order.status as OrderStatus]}
            </p>
            {order.confirmedAt && (
              <p className="text-xs text-slate-500 mt-1">
                Confirmado: {new Date(order.confirmedAt).toLocaleDateString("es-ES")}
              </p>
            )}
            {order.shippedAt && (
              <p className="text-xs text-slate-500 mt-0.5">
                Enviado: {new Date(order.shippedAt).toLocaleDateString("es-ES")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
