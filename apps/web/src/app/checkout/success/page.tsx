import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@cardbuy/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "¡Pago completado! — CardBuy",
};

export default function CheckoutSuccessPage() {
  return (
    <div className="mx-auto max-w-lg px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center gap-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 border border-green-500/20">
        <CheckCircle size={40} className="text-green-400" />
      </div>

      <div>
        <h1 className="font-display text-3xl font-bold text-white">¡Pago completado!</h1>
        <p className="mt-3 text-slate-400 leading-relaxed">
          Tu compra ha sido procesada correctamente. Los vendedores han sido notificados y
          prepararán tu pedido en los próximos días hábiles.
        </p>
      </div>

      <div className="w-full rounded-xl border border-surface-border bg-surface px-5 py-4 text-sm text-slate-400 text-left flex flex-col gap-2">
        <p>✓ Recibirás un email de confirmación con los detalles.</p>
        <p>✓ Puedes hacer seguimiento de tu pedido en Mis Pedidos.</p>
        <p>✓ El vendedor dispone de 3 días hábiles para enviarlo.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <Link href="/orders" className="flex-1">
          <Button variant="primary" size="lg" className="w-full">
            Ver mis pedidos
          </Button>
        </Link>
        <Link href="/listings" className="flex-1">
          <Button variant="secondary" size="lg" className="w-full">
            Seguir comprando
          </Button>
        </Link>
      </div>
    </div>
  );
}
