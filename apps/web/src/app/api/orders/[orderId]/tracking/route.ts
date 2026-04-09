import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@cardbuy/db";
import { z } from "zod";

interface Params {
  params: { orderId: string };
}

const trackingSchema = z.object({
  carrier: z.string().min(1).optional(),
  trackingNumber: z.string().min(1).optional(),
  trackingUrl: z.string().url().optional(),
  estimatedDate: z.string().datetime().optional(),
  event: z.object({
    status: z.string().min(1),
    description: z.string().min(1),
  }).optional(),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Verify that the requesting user is the seller of this order
  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    select: { sellerId: true, status: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }

  if (order.sellerId !== session.user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = trackingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const { carrier, trackingNumber, trackingUrl, estimatedDate, event } = parsed.data;

    const existing = await prisma.orderTracking.findUnique({
      where: { orderId: params.orderId },
    });

    const currentEvents = (existing?.events ?? []) as Array<Record<string, unknown>>;

    const updatedEvents = event
      ? [...currentEvents, { ...event, timestamp: new Date().toISOString() }]
      : currentEvents;

    const tracking = await prisma.orderTracking.upsert({
      where: { orderId: params.orderId },
      create: {
        orderId: params.orderId,
        carrier: carrier ?? null,
        trackingNumber: trackingNumber ?? null,
        trackingUrl: trackingUrl ?? null,
        estimatedDate: estimatedDate ? new Date(estimatedDate) : null,
        events: updatedEvents,
      },
      update: {
        ...(carrier !== undefined && { carrier }),
        ...(trackingNumber !== undefined && { trackingNumber }),
        ...(trackingUrl !== undefined && { trackingUrl }),
        ...(estimatedDate !== undefined && { estimatedDate: new Date(estimatedDate) }),
        events: updatedEvents,
      },
    });

    // If tracking number added for first time, mark order as SHIPPED
    if (trackingNumber && order.status === "PAYMENT_CONFIRMED" || order.status === "PREPARING") {
      await prisma.order.update({
        where: { id: params.orderId },
        data: { status: "SHIPPED", shippedAt: new Date() },
      });
    }

    return NextResponse.json({ ok: true, tracking });
  } catch (error) {
    console.error(`[PATCH /api/orders/${params.orderId}/tracking]`, error);
    return NextResponse.json({ error: "Error al actualizar el seguimiento" }, { status: 500 });
  }
}
