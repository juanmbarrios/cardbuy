import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@cardbuy/db";
import { Badge } from "@cardbuy/ui";

export const metadata = { title: "Panel de vendedor — CardBuy" };

async function getSellerData(userId: string) {
  const seller = await prisma.sellerProfile.findUnique({
    where: { userId },
    select: {
      id: true,
      shopName: true,
      shopSlug: true,
      totalSales: true,
      totalRevenue: true,
      averageRating: true,
      totalReviews: true,
      stripeOnboarded: true,
      stripeAccountId: true,
      isActive: true,
    },
  });
  if (!seller) return null;

  const [activeListings, recentOrders] = await Promise.all([
    prisma.cardListing.count({ where: { sellerId: seller.id, status: "ACTIVE" } }),
    prisma.order.findMany({
      where: { sellerId: userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        buyer: { select: { name: true } },
        items: { select: { quantity: true, unitPrice: true, cardSnapshot: true }, take: 1 },
      },
    }),
  ]);

  return { seller, activeListings, recentOrders };
}

export default async function SellerDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const data = await getSellerData(session.user.id);
  if (!data) redirect("/seller/onboarding");

  const { seller, activeListings, recentOrders } = data;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">{seller.shopName}</h1>
          <p className="text-sm text-slate-400 mt-0.5">cardbuy.com/seller/{seller.shopSlug}</p>
        </div>
        {!seller.stripeOnboarded && (
          <StripeOnboardButton hasAccount={!!seller.stripeAccountId} />
        )}
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Ventas totales" value={seller.totalSales.toString()} />
        <MetricCard
          label="Ingresos"
          value={Number(seller.totalRevenue).toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
        />
        <MetricCard label="Listings activos" value={activeListings.toString()} />
        <MetricCard
          label="Valoración"
          value={seller.totalReviews > 0 ? `★ ${seller.averageRating.toFixed(1)}` : "Sin valoraciones"}
          sub={seller.totalReviews > 0 ? `${seller.totalReviews} reseñas` : undefined}
        />
      </div>

      {/* Accesos rápidos */}
      <div className="flex gap-3 mb-8 flex-wrap">
        <Link
          href="/seller/inventory/new"
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-light transition-colors"
        >
          + Nuevo listing
        </Link>
        <Link
          href="/seller/inventory"
          className="inline-flex items-center gap-2 rounded-lg border border-surface-border bg-surface px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
        >
          Ver inventario
        </Link>
        <Link
          href="/seller/orders"
          className="inline-flex items-center gap-2 rounded-lg border border-surface-border bg-surface px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
        >
          Ver pedidos
        </Link>
      </div>

      {/* Pedidos recientes */}
      {recentOrders.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Pedidos recientes
          </h2>
          <div className="flex flex-col gap-2">
            {recentOrders.map((order) => {
              const snap = order.items[0]?.cardSnapshot as Record<string, unknown> | null;
              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="flex items-center justify-between rounded-xl border border-surface-border bg-surface px-4 py-3 hover:border-brand/30 transition-colors"
                >
                  <div>
                    <p className="text-sm text-white font-medium">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-slate-500">
                      {snap?.name ? String(snap.name) : "Pedido"} ·{" "}
                      {order.buyer.name ?? "Comprador"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-brand">
                      {Number(order.total ?? 0).toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
                    </span>
                    <Badge variant="default">{order.status}</Badge>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-surface-border bg-surface p-4">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="text-xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
}

function StripeOnboardButton({ hasAccount }: { hasAccount: boolean }) {
  return (
    <form action="/api/seller/stripe/onboard" method="POST">
      <button
        type="submit"
        className="rounded-lg border border-amber-500/50 bg-amber-950/30 px-4 py-2 text-sm font-medium text-amber-400 hover:bg-amber-950/50 transition-colors"
      >
        {hasAccount ? "Continuar con Stripe" : "Activar cobros →"}
      </button>
    </form>
  );
}
