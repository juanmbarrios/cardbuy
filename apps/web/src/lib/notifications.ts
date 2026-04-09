import { prisma } from "@cardbuy/db";

interface CreateNotificationInput {
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export async function createNotification(input: CreateNotificationInput) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      data: input.data ?? {},
    },
  });
}

export async function notifyOrderConfirmed(
  buyerId: string,
  orderId: string,
  sellerName: string
) {
  return createNotification({
    userId: buyerId,
    type: "order_confirmed",
    title: "Pago confirmado",
    body: `Tu pedido a ${sellerName} ha sido confirmado. El vendedor tiene hasta 3 días hábiles para enviarlo.`,
    data: { orderId },
  });
}

export async function notifyNewOrder(
  sellerId: string,
  orderId: string,
  buyerName: string
) {
  return createNotification({
    userId: sellerId,
    type: "new_order",
    title: "Nuevo pedido recibido",
    body: `${buyerName} ha comprado en tu tienda. Prepara el envío en los próximos 3 días hábiles.`,
    data: { orderId },
  });
}
