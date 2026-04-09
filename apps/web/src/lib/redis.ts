import Redis from "ioredis";

const globalForRedis = globalThis as unknown as { redis: Redis | undefined };

export const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

// ---------------------------------------------------------------------------
// Cart helpers — key conventions
// ---------------------------------------------------------------------------

export const CART_TTL = 60 * 60 * 24 * 7; // 7 days in seconds

export function cartKey(userId: string): string {
  return `cart:user:${userId}`;
}

export function pendingCheckoutKey(stripeSessionId: string): string {
  return `pending_checkout:${stripeSessionId}`;
}
