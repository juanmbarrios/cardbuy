import { redis, cartKey, CART_TTL } from "@/lib/redis";
import { prisma, ListingStatus } from "@cardbuy/db";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RedisCartItem {
  listingId: string;
  quantity: number;
  addedAt: string;
}

export interface CartItem extends RedisCartItem {
  cardName: string;
  cardSlug: string;
  cardImageUrl: string | null;
  price: number;
  condition: string;
  language: string;
  sellerId: string;       // SellerProfile.id
  sellerUserId: string;   // User.id of the seller
  sellerName: string;
  shippingCost: number;
  freeShipping: boolean;
  stock: number;
  available: boolean;
}

export interface CartGroup {
  sellerId: string;       // SellerProfile.id
  sellerUserId: string;
  sellerName: string;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
}

// ---------------------------------------------------------------------------
// Raw Redis operations
// ---------------------------------------------------------------------------

async function getRawItems(userId: string): Promise<RedisCartItem[]> {
  const raw = await redis.get(cartKey(userId));
  if (!raw) return [];
  try {
    return JSON.parse(raw) as RedisCartItem[];
  } catch {
    return [];
  }
}

async function setRawItems(userId: string, items: RedisCartItem[]): Promise<void> {
  await redis.set(cartKey(userId), JSON.stringify(items), "EX", CART_TTL);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function addToCart(
  userId: string,
  listingId: string,
  quantity: number = 1
): Promise<{ ok: boolean; error?: string }> {
  const listing = await prisma.cardListing.findUnique({
    where: { id: listingId },
    select: { id: true, status: true, quantity: true },
  });

  if (!listing || listing.status !== ListingStatus.ACTIVE) {
    return { ok: false, error: "El anuncio no está disponible" };
  }

  const items = await getRawItems(userId);
  const existing = items.find((i) => i.listingId === listingId);

  const currentQty = existing?.quantity ?? 0;
  const requestedQty = currentQty + quantity;

  if (requestedQty > listing.quantity) {
    return { ok: false, error: `Solo quedan ${listing.quantity} unidades disponibles` };
  }

  if (existing) {
    existing.quantity = requestedQty;
  } else {
    items.push({ listingId, quantity, addedAt: new Date().toISOString() });
  }

  await setRawItems(userId, items);
  return { ok: true };
}

export async function removeFromCart(userId: string, listingId: string): Promise<void> {
  const items = await getRawItems(userId);
  await setRawItems(
    userId,
    items.filter((i) => i.listingId !== listingId)
  );
}

export async function updateCartItemQuantity(
  userId: string,
  listingId: string,
  quantity: number
): Promise<{ ok: boolean; error?: string }> {
  if (quantity <= 0) {
    await removeFromCart(userId, listingId);
    return { ok: true };
  }

  const listing = await prisma.cardListing.findUnique({
    where: { id: listingId },
    select: { quantity: true, status: true },
  });

  if (!listing || listing.status !== ListingStatus.ACTIVE) {
    return { ok: false, error: "El anuncio no está disponible" };
  }

  if (quantity > listing.quantity) {
    return { ok: false, error: `Solo quedan ${listing.quantity} unidades` };
  }

  const items = await getRawItems(userId);
  const item = items.find((i) => i.listingId === listingId);
  if (item) item.quantity = quantity;
  await setRawItems(userId, items);
  return { ok: true };
}

export async function clearCart(userId: string): Promise<void> {
  await redis.del(cartKey(userId));
}

export async function getEnrichedCart(userId: string): Promise<{
  items: CartItem[];
  groups: CartGroup[];
  totalItems: number;
  grandTotal: number;
}> {
  const rawItems = await getRawItems(userId);

  if (rawItems.length === 0) {
    return { items: [], groups: [], totalItems: 0, grandTotal: 0 };
  }

  const listingIds = rawItems.map((i) => i.listingId);

  const listings = await prisma.cardListing.findMany({
    where: { id: { in: listingIds } },
    include: {
      card: { select: { name: true, slug: true, imageUrl: true } },
      seller: { select: { id: true, userId: true, shopName: true } },
    },
  });

  const listingMap = new Map(listings.map((l) => [l.id, l]));

  const items: CartItem[] = rawItems
    .map((raw) => {
      const listing = listingMap.get(raw.listingId);
      if (!listing) return null;

      return {
        listingId: raw.listingId,
        quantity: raw.quantity,
        addedAt: raw.addedAt,
        cardName: listing.card.name,
        cardSlug: listing.card.slug,
        cardImageUrl: listing.card.imageUrl,
        price: Number(listing.price),
        condition: listing.condition,
        language: listing.language,
        sellerId: listing.seller.id,
        sellerUserId: listing.seller.userId,
        sellerName: listing.seller.shopName,
        shippingCost: Number(listing.shippingCost),
        freeShipping: listing.freeShipping,
        stock: listing.quantity,
        available: listing.status === ListingStatus.ACTIVE,
      } satisfies CartItem;
    })
    .filter((item): item is CartItem => item !== null);

  // Group by seller
  const sellerMap = new Map<string, CartGroup>();
  for (const item of items) {
    if (!sellerMap.has(item.sellerId)) {
      sellerMap.set(item.sellerId, {
        sellerId: item.sellerId,
        sellerUserId: item.sellerUserId,
        sellerName: item.sellerName,
        items: [],
        subtotal: 0,
        shippingCost: item.freeShipping ? 0 : item.shippingCost,
        total: 0,
      });
    }
    const group = sellerMap.get(item.sellerId)!;
    group.items.push(item);
    group.subtotal += item.price * item.quantity;
  }

  // Finalize group totals
  for (const group of sellerMap.values()) {
    group.total = group.subtotal + group.shippingCost;
  }

  const groups = Array.from(sellerMap.values());
  const grandTotal = groups.reduce((sum, g) => sum + g.total, 0);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return { items, groups, totalItems, grandTotal };
}
