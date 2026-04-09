import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { redis, pendingCheckoutKey } from "@/lib/redis";
import { clearCart } from "@/lib/cart";
import { prisma } from "@cardbuy/db";
import { notifyOrderConfirmed, notifyNewOrder } from "@/lib/notifications";
import type Stripe from "stripe";

// Disable body parsing — Stripe requires raw body for signature verification
export const runtime = "nodejs";

interface PendingCheckoutGroup {
  sellerUserId: string;
  sellerName: string;
  items: Array<{
    listingId: string;
    quantity: number;
    unitPrice: number;
    total: number;
    cardSnapshot: Record<string, unknown>;
  }>;
  subtotal: number;
  shippingCost: number;
  platformFee: number;
  total: number;
}

interface PendingCheckoutData {
  userId: string;
  userName: string;
  groups: PendingCheckoutGroup[];
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { id: stripeSessionId, metadata, shipping_details } = session;
  const userId = metadata?.userId;

  if (!userId) {
    console.error("[Stripe Webhook] Missing userId in session metadata", stripeSessionId);
    return;
  }

  const raw = await redis.get(pendingCheckoutKey(stripeSessionId));
  if (!raw) {
    console.error("[Stripe Webhook] No pending checkout data for session", stripeSessionId);
    return;
  }

  const pending: PendingCheckoutData = JSON.parse(raw);

  // Build shipping address snapshot from Stripe
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

  // Process each seller group in a transaction
  for (const group of pending.groups) {
    await prisma.$transaction(async (tx) => {
      // Create order
      const order = await tx.order.create({
        data: {
          buyerId: userId,
          sellerId: group.sellerUserId,
          status: "PAYMENT_CONFIRMED",
          subtotal: group.subtotal,
          shippingCost: group.shippingCost,
          platformFee: group.platformFee,
          total: group.total,
          stripePaymentIntentId: session.payment_intent as string | null,
          shippingAddress,
          confirmedAt: new Date(),
        },
      });

      // Create order items and decrement stock atomically
      for (const item of group.items) {
        // Decrement stock — will throw if quantity goes negative (Prisma constraint)
        const updated = await tx.cardListing.update({
          where: { id: item.listingId },
          data: { quantity: { decrement: item.quantity } },
          select: { quantity: true },
        });

        // If stock is now 0, mark as SOLD
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

      // Create empty tracking record
      await tx.orderTracking.create({
        data: { orderId: order.id, events: [] },
      });

      return order;
    }).then(async (order) => {
      // Notifications (outside transaction — non-critical)
      await Promise.allSettled([
        notifyOrderConfirmed(userId, order.id, group.sellerName),
        notifyNewOrder(group.sellerUserId, order.id, pending.userName),
      ]);
    });
  }

  // Clean up
  await Promise.allSettled([
    clearCart(userId),
    redis.del(pendingCheckoutKey(stripeSessionId)),
  ]);
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[Stripe Webhook] STRIPE_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("[Stripe Webhook] Invalid signature:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      default:
        // Unhandled event type — still return 200 so Stripe doesn't retry
        break;
    }
  } catch (error) {
    console.error(`[Stripe Webhook] Error handling ${event.type}:`, error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
