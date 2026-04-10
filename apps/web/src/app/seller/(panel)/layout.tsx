import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@cardbuy/db";

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  // Usuarios sin rol SELLER van al onboarding
  if (user?.role !== "SELLER") redirect("/seller/onboarding");

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Subnav del panel */}
      <nav className="mb-8 flex items-center gap-1 border-b border-surface-border pb-4">
        <Link
          href="/seller/dashboard"
          className="px-3 py-1.5 text-sm font-medium rounded-md text-slate-400 hover:text-white hover:bg-surface transition-colors"
        >
          Panel
        </Link>
        <Link
          href="/seller/inventory"
          className="px-3 py-1.5 text-sm font-medium rounded-md text-slate-400 hover:text-white hover:bg-surface transition-colors"
        >
          Inventario
        </Link>
        <Link
          href="/seller/orders"
          className="px-3 py-1.5 text-sm font-medium rounded-md text-slate-400 hover:text-white hover:bg-surface transition-colors"
        >
          Pedidos
        </Link>
      </nav>
      {children}
    </div>
  );
}
