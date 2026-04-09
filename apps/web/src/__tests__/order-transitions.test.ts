import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockOrderUpdate = vi.fn();
const mockOrderFindUnique = vi.fn();
const mockTrackingUpsert = vi.fn();
const mockTrackingFindUnique = vi.fn();

vi.mock("@cardbuy/db", () => ({
  prisma: {
    order: {
      findUnique: mockOrderFindUnique,
      update: mockOrderUpdate,
    },
    orderTracking: {
      findUnique: mockTrackingFindUnique,
      upsert: mockTrackingUpsert,
    },
  },
}));

// ---------------------------------------------------------------------------
// Logic under test — PATCH /api/orders/[orderId]/tracking business rules
// ---------------------------------------------------------------------------

async function updateTracking(
  orderId: string,
  requestingUserId: string,
  body: {
    carrier?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    estimatedDate?: string;
    event?: { status: string; description: string };
  }
): Promise<{ ok: boolean; error?: string; statusCode: number }> {
  const order = await mockOrderFindUnique({ where: { id: orderId } });
  if (!order) return { ok: false, error: "Pedido no encontrado", statusCode: 404 };
  if (order.sellerId !== requestingUserId) {
    return { ok: false, error: "No autorizado", statusCode: 403 };
  }

  const existing = await mockTrackingFindUnique({ where: { orderId } });
  const currentEvents = (existing?.events ?? []) as Array<Record<string, unknown>>;
  const updatedEvents = body.event
    ? [...currentEvents, { ...body.event, timestamp: new Date().toISOString() }]
    : currentEvents;

  await mockTrackingUpsert({
    where: { orderId },
    create: {
      orderId,
      carrier: body.carrier ?? null,
      trackingNumber: body.trackingNumber ?? null,
      trackingUrl: body.trackingUrl ?? null,
      estimatedDate: body.estimatedDate ? new Date(body.estimatedDate) : null,
      events: updatedEvents,
    },
    update: {
      ...(body.carrier !== undefined && { carrier: body.carrier }),
      ...(body.trackingNumber !== undefined && { trackingNumber: body.trackingNumber }),
      ...(body.trackingUrl !== undefined && { trackingUrl: body.trackingUrl }),
      ...(body.estimatedDate !== undefined && { estimatedDate: new Date(body.estimatedDate) }),
      events: updatedEvents,
    },
  });

  // Transition to SHIPPED when tracking number is provided and order is not yet shipped
  if (body.trackingNumber && (order.status === "PAYMENT_CONFIRMED" || order.status === "PREPARING")) {
    await mockOrderUpdate({
      where: { id: orderId },
      data: { status: "SHIPPED", shippedAt: new Date() },
    });
  }

  return { ok: true, statusCode: 200 };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Order tracking — state transitions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTrackingFindUnique.mockResolvedValue(null);
    mockTrackingUpsert.mockResolvedValue({ orderId: "order-1" });
  });

  it("transitions order to SHIPPED when tracking number is added on PAYMENT_CONFIRMED", async () => {
    mockOrderFindUnique.mockResolvedValue({
      id: "order-1",
      sellerId: "seller-1",
      status: "PAYMENT_CONFIRMED",
    });

    const result = await updateTracking("order-1", "seller-1", {
      carrier: "Correos",
      trackingNumber: "ES123456789",
    });

    expect(result.ok).toBe(true);
    expect(mockOrderUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "SHIPPED" }),
      })
    );
  });

  it("transitions order to SHIPPED when tracking number is added on PREPARING", async () => {
    mockOrderFindUnique.mockResolvedValue({
      id: "order-1",
      sellerId: "seller-1",
      status: "PREPARING",
    });

    const result = await updateTracking("order-1", "seller-1", {
      trackingNumber: "ES987654321",
    });

    expect(result.ok).toBe(true);
    expect(mockOrderUpdate).toHaveBeenCalledOnce();
  });

  it("does NOT transition to SHIPPED when already SHIPPED", async () => {
    mockOrderFindUnique.mockResolvedValue({
      id: "order-1",
      sellerId: "seller-1",
      status: "SHIPPED",
    });

    const result = await updateTracking("order-1", "seller-1", {
      trackingNumber: "ES111222333",
    });

    expect(result.ok).toBe(true);
    expect(mockOrderUpdate).not.toHaveBeenCalled();
  });

  it("does NOT transition to SHIPPED without a tracking number", async () => {
    mockOrderFindUnique.mockResolvedValue({
      id: "order-1",
      sellerId: "seller-1",
      status: "PAYMENT_CONFIRMED",
    });

    await updateTracking("order-1", "seller-1", { carrier: "MRW" });

    expect(mockOrderUpdate).not.toHaveBeenCalled();
  });

  it("rejects update from non-seller user with 403", async () => {
    mockOrderFindUnique.mockResolvedValue({
      id: "order-1",
      sellerId: "seller-1",
      status: "PAYMENT_CONFIRMED",
    });

    const result = await updateTracking("order-1", "other-user", {
      trackingNumber: "ES000000000",
    });

    expect(result.ok).toBe(false);
    expect(result.statusCode).toBe(403);
    expect(mockTrackingUpsert).not.toHaveBeenCalled();
  });

  it("returns 404 when order does not exist", async () => {
    mockOrderFindUnique.mockResolvedValue(null);

    const result = await updateTracking("non-existent", "seller-1", {
      trackingNumber: "ES000000000",
    });

    expect(result.ok).toBe(false);
    expect(result.statusCode).toBe(404);
  });

  it("appends tracking events to the events array", async () => {
    const existingEvents = [{ status: "Procesando", description: "Pedido recibido", timestamp: "2026-04-01T10:00:00Z" }];
    mockTrackingFindUnique.mockResolvedValue({ events: existingEvents });
    mockOrderFindUnique.mockResolvedValue({
      id: "order-1",
      sellerId: "seller-1",
      status: "PAYMENT_CONFIRMED",
    });

    await updateTracking("order-1", "seller-1", {
      carrier: "SEUR",
      trackingNumber: "ES555666777",
      event: { status: "Enviado", description: "El paquete ha salido del almacén" },
    });

    const upsertCall = mockTrackingUpsert.mock.calls[0][0];
    expect(upsertCall.update.events).toHaveLength(2);
    expect(upsertCall.update.events[1]).toMatchObject({
      status: "Enviado",
      description: "El paquete ha salido del almacén",
    });
  });
});
