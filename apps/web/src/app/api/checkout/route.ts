import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getEnrichedCart } from "@/lib/cart";
import { stripe } from "@/lib/stripe";
import { redis, pendingCheckoutKey } from "@/lib/redis";

const PLATFORM_FEE_PERCENT = 0.05; // 5%
const CHECKOUT_TTL = 60 * 60 * 24; // 24 hours

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? req.nextUrl.origin ?? "http://localhost:3000";

  try {
    const cart = await getEnrichedCart(session.user.id);

    if (cart.items.length === 0) {
      return NextResponse.json({ error: "El carrito está vacío" }, { status: 400 });
    }

    if (cart.items.some((i) => !i.available)) {
      return NextResponse.json(
        { error: "Algunos artículos ya no están disponibles" },
        { status: 409 }
      );
    }

    // Build Stripe line items from cart
    const lineItems: Parameters<typeof stripe.checkout.sessions.create>[0]["line_items"] =
      cart.items.map((item) => ({
        price_data: {
          currency: "eur",
          product_data: {
            name: item.cardName,
            description: `${item.condition} · ${item.language} · Vendedor: ${item.sellerName}`,
            images: item.cardImageUrl ? [item.cardImageUrl] : [],
            metadata: { listingId: item.listingId },
          },
          unit_amount: Math.round(item.price * 100), // cents
        },
        quantity: item.quantity,
      }));

    // Add shipping line items per seller group
    for (const group of cart.groups) {
      if (group.shippingCost > 0) {
        lineItems.push({
          price_data: {
            currency: "eur",
            product_data: {
              name: `Envío — ${group.sellerName}`,
              description: "Coste de envío",
            },
            unit_amount: Math.round(group.shippingCost * 100),
          },
          quantity: 1,
        });
      }
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      shipping_address_collection: {
        allowed_countries: ["ES", "PT", "FR", "DE", "IT", "GB"],
      },
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
      metadata: { userId: session.user.id },
    });

    // Store pending checkout data in Redis (webhook will read this)
    const pendingData = {
      userId: session.user.id,
      userName: session.user.name ?? session.user.email ?? "Comprador",
      groups: cart.groups.map((g) => ({
        sellerUserId: g.sellerUserId,
        sellerName: g.sellerName,
        items: g.items.map((i) => ({
          listingId: i.listingId,
          quantity: i.quantity,
          unitPrice: i.price,
          total: i.price * i.quantity,
          cardSnapshot: {
            name: i.cardName,
            slug: i.cardSlug,
            condition: i.condition,
            language: i.language,
          },
        })),
        subtotal: g.subtotal,
        shippingCost: g.shippingCost,
        platformFee: Number((g.subtotal * PLATFORM_FEE_PERCENT).toFixed(2)),
        total: g.total,
      })),
    };

    await redis.set(
      pendingCheckoutKey(checkoutSession.id),
      JSON.stringify(pendingData),
      "EX",
      CHECKOUT_TTL
    );

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("[POST /api/checkout]", error);
    return NextResponse.json({ error: "Error al crear la sesión de pago" }, { status: 500 });
  }
}
