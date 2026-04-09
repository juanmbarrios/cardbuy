import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@cardbuy/db";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import type { OrderStatus } from "@cardbuy/db";

export const metadata: Metadata = {
  title: "Mis pedidos — CardBuy",
};

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { buyerId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      seller: { select: { name: true } },
      items: {
        select: { quantity: true, cardSnapshot: true },
        take: 1,
      },
    },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display text-2xl font-bold text-white mb-6">Mis pedidos</h1>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-surface-border bg-surface p-10 text-center">
          <p className="text-slate-400">Todavía no has realizado ningún pedido.</p>
          <Link
            href="/listings"
            className="mt-4 inline-block text-sm text-brand hover:text-brand-light transition-colors"
          >
            Explorar cartas →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => {
            const snapshot = order.items[0]?.cardSnapshot as Record<string, unknown> | null;
            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-surface-border bg-surface px-5 py-4 hover:border-brand/40 hover:bg-surface-hover transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-white truncate">
                      {snapshot?.name ? String(snapshot.name) : "Pedido"}
                    </span>
                    {order.items.reduce((s, i) => s + i.quantity, 0) > 1 && (
                      <span className="text-xs text-slate-500">
                        +{order.items.reduce((s, i) => s + i.quantity, 0) - 1} más
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {order.seller.name ?? "Vendedor"} ·{" "}
                    {new Date(order.createdAt).toLocaleDateString("es-ES")}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <OrderStatusBadge status={order.status as OrderStatus} />
                  <span className="text-sm font-bold text-brand">
                    {Number(order.total).toLocaleString("es-ES", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
