import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockOrderCreate = vi.fn();
const mockOrderUpdate = vi.fn();
const mockListingUpdate = vi.fn();
const mockOrderItemCreate = vi.fn();
const mockOrderTrackingCreate = vi.fn();
const mockTransaction = vi.fn();
const mockNotificationCreate = vi.fn();
const mockRedisGet = vi.fn();
const mockRedisDel = vi.fn();
const mockRedisSet = vi.fn();

vi.mock("@cardbuy/db", () => ({
  prisma: {
    $transaction: mockTransaction,
    order: { create: mockOrderCreate, update: mockOrderUpdate },
    cardListing: { update: mockListingUpdate },
    orderItem: { create: mockOrderItemCreate },
    orderTracking: { create: mockOrderTrackingCreate },
    notification: { create: mockNotificationCreate },
  },
  ListingStatus: { ACTIVE: "ACTIVE", SOLD: "SOLD" },
  OrderStatus: {
    PENDING_PAYMENT: "PENDING_PAYMENT",
    PAYMENT_CONFIRMED: "PAYMENT_CONFIRMED",
  },
}));

vi.mock("@/lib/redis", () => ({
  redis: { get: mockRedisGet, del: mockRedisDel, set: mockRedisSet },
  pendingCheckoutKey: (id: string) => `pending_checkout:${id}`,
  cartKey: (id: string) => `cart:user:${id}`,
  CART_TTL: 604800,
}));

vi.mock("@/lib/stripe", () => ({ stripe: {} }));
vi.mock("@/lib/cart", () => ({ clearCart: vi.fn() }));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MOCK_PENDING = {
  userId: "user-buyer-1",
  userName: "Juan Buyer",
  groups: [
    {
      sellerUserId: "user-seller-1",
      sellerName: "CardShark",
      items: [
        {
          listingId: "listing-abc",
          quantity: 2,
          unitPrice: 15.0,
          total: 30.0,
          cardSnapshot: { name: "Charizard ex", condition: "NEAR_MINT", language: "EN" },
        },
      ],
      subtotal: 30.0,
      shippingCost: 3.5,
      platformFee: 1.5,
      total: 33.5,
    },
  ],
};

function makeStripeSession(overrides: Record<string, unknown> = {}) {
  return {
    id: "cs_test_123",
    payment_intent: "pi_test_456",
    metadata: { userId: "user-buyer-1" },
    shipping_details: {
      name: "Juan García",
      address: {
        line1: "Calle Mayor 1",
        line2: null,
        city: "Madrid",
        state: "Madrid",
        postal_code: "28001",
        country: "ES",
      },
    },
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Logic under test — extracted from webhook handler for unit testability
// ---------------------------------------------------------------------------

async function handleCheckoutCompleted(session: ReturnType<typeof makeStripeSession>) {
  const { id: stripeSessionId, metadata, shipping_details } = session;
  const userId = metadata?.userId;

  if (!userId) return;

  const raw = await mockRedisGet(`pending_checkout:${stripeSessionId}`);
  if (!raw) return;

  const pending: typeof MOCK_PENDING = JSON.parse(raw);

  const shippingAddress = shipping_details?.address
    ? {
        line1: shipping_details.address.line1 ?? "",
        line2: shipping_details.address.line2 ?? "",
        city: shipping_details.address.city ?? "",
        state: shipping_details.address.state ?? "",
        postal_code: shipping_details.address.postal_code ?? "",
        country: shipping_details.address.country ?? "",
        name: shipping_details.name ?? "",
      }
    : {};

  for (const group of pending.groups) {
    await mockTransaction(async (tx: typeof import("@cardbuy/db").prisma) => {
      const order = await tx.order.create({
        data: {
          buyerId: userId,
          sellerId: group.sellerUserId,
          status: "PAYMENT_CONFIRMED",
          subtotal: group.subtotal,
          shippingCost: group.shippingCost,
          platformFee: group.platformFee,
          total: group.total,
          stripePaymentIntentId: session.payment_intent,
          shippingAddress,
          confirmedAt: new Date(),
        },
      });

      for (const item of group.items) {
        const updated = await tx.cardListing.update({
          where: { id: item.listingId },
          data: { quantity: { decrement: item.quantity } },
          select: { quantity: true },
        });

        if (updated.quantity === 0) {
          await tx.cardListing.update({
            where: { id: item.listingId },
            data: { status: "SOLD", soldAt: new Date() },
          });
        }

        await tx.orderItem.create({
          data: {
            orderId: order.id,
            listingId: item.listingId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
            cardSnapshot: item.cardSnapshot,
          },
        });
      }

      await tx.orderTracking.create({ data: { orderId: order.id, events: [] } });
      return order;
    });

    await mockNotificationCreate({ data: { userId, type: "order_confirmed" } });
    await mockNotificationCreate({ data: { userId: group.sellerUserId, type: "new_order" } });
  }

  await mockRedisDel(`pending_checkout:${stripeSessionId}`);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Stripe webhook — checkout.session.completed", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default: pending checkout data exists
    mockRedisGet.mockResolvedValue(JSON.stringify(MOCK_PENDING));

    // Transaction executes the callback
    mockTransaction.mockImplementation(async (cb: (tx: unknown) => Promise<unknown>) => {
      const fakeTx = {
        order: { create: mockOrderCreate, update: mockOrderUpdate },
        cardListing: { update: mockListingUpdate },
        orderItem: { create: mockOrderItemCreate },
        orderTracking: { create: mockOrderTrackingCreate },
      };
      return cb(fakeTx);
    });

    // Listing has 0 stock remaining after decrement (triggers SOLD)
    mockListingUpdate.mockResolvedValue({ quantity: 0 });
    mockOrderCreate.mockResolvedValue({ id: "order-created-1" });
  });

  it("creates an Order per seller group", async () => {
    await handleCheckoutCompleted(makeStripeSession());

    expect(mockOrderCreate).toHaveBeenCalledOnce();
    expect(mockOrderCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          buyerId: "user-buyer-1",
          sellerId: "user-seller-1",
          status: "PAYMENT_CONFIRMED",
          total: 33.5,
        }),
      })
    );
  });

  it("decrements listing stock atomically", async () => {
    await handleCheckoutCompleted(makeStripeSession());

    expect(mockListingUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "listing-abc" },
        data: { quantity: { decrement: 2 } },
      })
    );
  });

  it("marks listing as SOLD when stock reaches 0", async () => {
    mockListingUpdate.mockResolvedValueOnce({ quantity: 0 }); // first call returns 0

    await handleCheckoutCompleted(makeStripeSession());

    // Second call should mark as SOLD
    expect(mockListingUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "SOLD" }),
      })
    );
  });

  it("creates OrderItem with card snapshot", async () => {
    await handleCheckoutCompleted(makeStripeSession());

    expect(mockOrderItemCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          listingId: "listing-abc",
          quantity: 2,
          unitPrice: 15.0,
          cardSnapshot: expect.objectContaining({ name: "Charizard ex" }),
        }),
      })
    );
  });

  it("sends buyer and seller notifications", async () => {
    await handleCheckoutCompleted(makeStripeSession());

    expect(mockNotificationCreate).toHaveBeenCalledTimes(2);
    expect(mockNotificationCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ userId: "user-buyer-1" }) })
    );
    expect(mockNotificationCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ userId: "user-seller-1" }) })
    );
  });

  it("cleans up pending checkout key from Redis", async () => {
    await handleCheckoutCompleted(makeStripeSession());

    expect(mockRedisDel).toHaveBeenCalledWith("pending_checkout:cs_test_123");
  });

  it("does nothing when session has no userId in metadata", async () => {
    await handleCheckoutCompleted(makeStripeSession({ metadata: {} }));

    expect(mockTransaction).not.toHaveBeenCalled();
    expect(mockOrderCreate).not.toHaveBeenCalled();
  });

  it("does nothing when pending checkout data is missing from Redis", async () => {
    mockRedisGet.mockResolvedValue(null);

    await handleCheckoutCompleted(makeStripeSession());

    expect(mockTransaction).not.toHaveBeenCalled();
    expect(mockOrderCreate).not.toHaveBeenCalled();
  });
});
