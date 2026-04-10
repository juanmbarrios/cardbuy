import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@cardbuy/db";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const seller = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!seller) return NextResponse.json({ error: "Perfil de vendedor no encontrado" }, { status: 404 });

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const appUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  // Si no hay clave de Stripe real configurada, devolver stub
  if (!stripeSecretKey || stripeSecretKey.startsWith("sk_test_...")) {
    return NextResponse.json({
      url: null,
      stub: true,
      message: "Stripe Connect no configurado. Añade STRIPE_SECRET_KEY y STRIPE_CONNECT_CLIENT_ID en .env.local",
    });
  }

  try {
    const stripe = (await import("stripe")).default;
    const client = new stripe(stripeSecretKey, { apiVersion: "2024-04-10" });

    let accountId = seller.stripeAccountId;

    if (!accountId) {
      const account = await client.accounts.create({ type: "express" });
      accountId = account.id;
      await prisma.sellerProfile.update({
        where: { id: seller.id },
        data: { stripeAccountId: accountId },
      });
    }

    const link = await client.accountLinks.create({
      account: accountId,
      refresh_url: `${appUrl}/seller/dashboard?stripe=refresh`,
      return_url: `${appUrl}/seller/dashboard?stripe=success`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: link.url });
  } catch (err) {
    console.error("[POST /api/seller/stripe/onboard]", err);
    return NextResponse.json({ error: "Error al conectar con Stripe" }, { status: 500 });
  }
}
