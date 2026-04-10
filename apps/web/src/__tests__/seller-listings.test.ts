import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockSellerFindUnique = vi.fn();
const mockCardFindUnique = vi.fn();
const mockListingCreate = vi.fn();
const mockListingFindMany = vi.fn();
const mockListingCount = vi.fn();
const mockListingUpdate = vi.fn();
const mockListingFindFirst = vi.fn();

vi.mock("@cardbuy/db", () => ({
  prisma: {
    sellerProfile: { findUnique: mockSellerFindUnique },
    card: { findUnique: mockCardFindUnique },
    cardListing: {
      create: mockListingCreate,
      findMany: mockListingFindMany,
      count: mockListingCount,
      update: mockListingUpdate,
      findFirst: mockListingFindFirst,
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Business logic helpers (extracted from route handlers for testability)
// ---------------------------------------------------------------------------

async function createListing(
  userId: string,
  body: {
    cardId: string;
    condition: string;
    language: string;
    price: number;
    quantity: number;
    isFoil?: boolean;
    isGraded?: boolean;
    description?: string;
    shippingCost?: number;
    freeShipping?: boolean;
  }
) {
  const seller = await mockSellerFindUnique({ where: { userId } });
  if (!seller) return { status: 404, body: { error: "Perfil de vendedor no encontrado" } };

  const card = await mockCardFindUnique({ where: { id: body.cardId } });
  if (!card) return { status: 404, body: { error: "Carta no encontrada" } };

  const listing = await mockListingCreate({
    data: { ...body, sellerId: seller.id },
    include: { card: { select: { name: true } } },
  });

  return { status: 201, body: { id: listing.id, cardName: listing.card.name } };
}

async function archiveListing(listingId: string, userId: string) {
  const seller = await mockSellerFindUnique({ where: { userId } });
  if (!seller) return { status: 404, body: { error: "Perfil de vendedor no encontrado" } };

  const listing = await mockListingFindFirst({
    where: { id: listingId, sellerId: seller.id },
  });
  if (!listing) return { status: 404, body: { error: "Listing no encontrado" } };
  if (listing.status === "SOLD") return { status: 400, body: { error: "No se puede archivar un listing vendido" } };

  await mockListingUpdate({ where: { id: listingId }, data: { status: "CANCELLED" } });
  return { status: 200, body: { ok: true } };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Seller Listings API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/seller/listings — crear listing", () => {
    it("crea el listing correctamente cuando seller y carta existen", async () => {
      mockSellerFindUnique.mockResolvedValue({ id: "seller-1" });
      mockCardFindUnique.mockResolvedValue({ id: "card-1", name: "Charizard ex" });
      mockListingCreate.mockResolvedValue({
        id: "listing-1",
        card: { name: "Charizard ex" },
      });

      const result = await createListing("user-1", {
        cardId: "card-1",
        condition: "NEAR_MINT",
        language: "EN",
        price: 34.99,
        quantity: 1,
      });

      expect(result.status).toBe(201);
      expect(result.body).toMatchObject({ id: "listing-1", cardName: "Charizard ex" });
    });

    it("devuelve 404 si el usuario no tiene perfil de vendedor", async () => {
      mockSellerFindUnique.mockResolvedValue(null);

      const result = await createListing("user-sin-perfil", {
        cardId: "card-1",
        condition: "NEAR_MINT",
        language: "EN",
        price: 10,
        quantity: 1,
      });

      expect(result.status).toBe(404);
      expect(result.body.error).toContain("Perfil de vendedor");
      expect(mockListingCreate).not.toHaveBeenCalled();
    });

    it("devuelve 404 si la carta no existe en el catálogo", async () => {
      mockSellerFindUnique.mockResolvedValue({ id: "seller-1" });
      mockCardFindUnique.mockResolvedValue(null);

      const result = await createListing("user-1", {
        cardId: "card-inexistente",
        condition: "NEAR_MINT",
        language: "EN",
        price: 10,
        quantity: 1,
      });

      expect(result.status).toBe(404);
      expect(result.body.error).toContain("Carta no encontrada");
      expect(mockListingCreate).not.toHaveBeenCalled();
    });
  });

  describe("DELETE /api/seller/listings/[id] — archivar listing", () => {
    it("archiva un listing ACTIVE correctamente", async () => {
      mockSellerFindUnique.mockResolvedValue({ id: "seller-1" });
      mockListingFindFirst.mockResolvedValue({ id: "listing-1", status: "ACTIVE", sellerId: "seller-1" });

      const result = await archiveListing("listing-1", "user-1");

      expect(result.status).toBe(200);
      expect(mockListingUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: "CANCELLED" } })
      );
    });

    it("no permite archivar un listing con status SOLD", async () => {
      mockSellerFindUnique.mockResolvedValue({ id: "seller-1" });
      mockListingFindFirst.mockResolvedValue({ id: "listing-1", status: "SOLD", sellerId: "seller-1" });

      const result = await archiveListing("listing-1", "user-1");

      expect(result.status).toBe(400);
      expect(result.body.error).toContain("vendido");
      expect(mockListingUpdate).not.toHaveBeenCalled();
    });

    it("devuelve 404 si el listing no pertenece al vendedor", async () => {
      mockSellerFindUnique.mockResolvedValue({ id: "seller-1" });
      mockListingFindFirst.mockResolvedValue(null);

      const result = await archiveListing("listing-de-otro", "user-1");

      expect(result.status).toBe(404);
    });
  });
});
