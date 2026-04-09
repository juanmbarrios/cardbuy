import { Badge } from "@cardbuy/ui";
import type { OrderStatus } from "@cardbuy/db";

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; variant: "default" | "success" | "warning" | "danger" | "outline" | "gold" }
> = {
  PENDING_PAYMENT:   { label: "Pago pendiente",    variant: "warning" },
  PAYMENT_CONFIRMED: { label: "Pago confirmado",   variant: "success" },
  PREPARING:         { label: "Preparando envío",  variant: "default" },
  SHIPPED:           { label: "Enviado",            variant: "gold" },
  DELIVERED:         { label: "Entregado",          variant: "success" },
  COMPLETED:         { label: "Completado",         variant: "success" },
  DISPUTED:          { label: "En disputa",         variant: "danger" },
  REFUNDED:          { label: "Reembolsado",        variant: "outline" },
  CANCELLED:         { label: "Cancelado",          variant: "danger" },
};

interface Props {
  status: OrderStatus;
}

export function OrderStatusBadge({ status }: Props) {
  const config = STATUS_CONFIG[status] ?? { label: status, variant: "default" as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
