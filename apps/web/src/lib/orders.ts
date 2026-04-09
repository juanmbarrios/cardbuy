import { prisma, OrderStatus } from "@cardbuy/db";

export interface OrderDetail {
  id: string;
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  platformFee: number;
  total: number;
  buyerNote: string | null;
  sellerNote: string | null;
  shippingAddress: Record<string, string>;
  createdAt: string;
  confirmedAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  completedAt: string | null;
  seller: { id: string; name: string | null; email: string };
  buyer: { id: string; name: string | null; email: string };
  items: Array<{
    id: string;
    quantity: number;
    unitPrice: number;
    total: number;
    cardSnapshot: Record<string, unknown>;
  }>;
  tracking: {
    carrier: string | null;
    trackingNumber: string | null;
    trackingUrl: string | null;
    estimatedDate: string | null;
    events: unknown[];
  } | null;
}

export async function getOrderById(
  orderId: string,
  requestingUserId: string
): Promise<OrderDetail | null> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      seller: { select: { id: true, name: true, email: true } },
      buyer: { select: { id: true, name: true, email: true } },
      items: true,
      tracking: true,
    },
  });

  if (!order) return null;

  // Only buyer or seller can view the order
  if (order.buyerId !== requestingUserId && order.sellerId !== requestingUserId) {
    return null;
  }

  return {
    id: order.id,
    status: order.status,
    subtotal: Number(order.subtotal),
    shippingCost: Number(order.shippingCost),
    platformFee: Number(order.platformFee),
    total: Number(order.total),
    buyerNote: order.buyerNote,
    sellerNote: order.sellerNote,
    shippingAddress: order.shippingAddress as Record<string, string>,
    createdAt: order.createdAt.toISOString(),
    confirmedAt: order.confirmedAt?.toISOString() ?? null,
    shippedAt: order.shippedAt?.toISOString() ?? null,
    deliveredAt: order.deliveredAt?.toISOString() ?? null,
    completedAt: order.completedAt?.toISOString() ?? null,
    seller: order.seller,
    buyer: order.buyer,
    items: order.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      total: Number(item.total),
      cardSnapshot: item.cardSnapshot as Record<string, unknown>,
    })),
    tracking: order.tracking
      ? {
          carrier: order.tracking.carrier,
          trackingNumber: order.tracking.trackingNumber,
          trackingUrl: order.tracking.trackingUrl,
          estimatedDate: order.tracking.estimatedDate?.toISOString() ?? null,
          events: order.tracking.events,
        }
      : null,
  };
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Pago pendiente",
  PAYMENT_CONFIRMED: "Pago confirmado",
  PREPARING: "Preparando envío",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  COMPLETED: "Completado",
  DISPUTED: "En disputa",
  REFUNDED: "Reembolsado",
  CANCELLED: "Cancelado",
};
