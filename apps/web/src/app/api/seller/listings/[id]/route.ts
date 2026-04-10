import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@cardbuy/db";
import { z } from "zod";

const updateSchema = z.object({
  price: z.number().positive().max(99999).optional(),
  quantity: z.number().int().min(0).max(999).optional(),
  condition: z.enum(["NEAR_MINT", "LIGHTLY_PLAYED", "MODERATELY_PLAYED", "HEAVILY_PLAYED", "DAMAGED"]).optional(),
  language: z.enum(["ES", "EN", "FR", "DE", "IT", "PT", "JA", "KO", "ZH"]).optional(),
  description: z.string().max(2000).optional(),
  imageUrls: z.array(z.string().url()).max(5).optional(),
  shippingCost: z.number().min(0).optional(),
  freeShipping: z.boolean().optional(),
  status: z.enum(["ACTIVE", "CANCELLED"]).optional(),
});

async function getSellerListing(listingId: string, userId: string) {
  const seller = await prisma.sellerProfile.findUnique({ where: { userId } });
  if (!seller) return null;
  return prisma.cardListing.findFirst({
    where: { id: listingId, sellerId: seller.id },
    include: { card: { select: { name: true, game: true } } },
  });
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const listing = await getSellerListing(params.id, session.user.id);
  if (!listing) return NextResponse.json({ error: "Listing no encontrado" }, { status: 404 });

  return NextResponse.json({
    id: listing.id,
    cardId: listing.cardId,
    cardName: listing.card.name,
    game: listing.card.game,
    condition: listing.condition,
    language: listing.language,
    price: Number(listing.price),
    quantity: listing.quantity,
    status: listing.status,
    isFoil: listing.isFoil,
    isGraded: listing.isGraded,
    description: listing.description,
    imageUrls: listing.imageUrls,
    shippingCost: Number(listing.shippingCost),
    freeShipping: listing.freeShipping,
  });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const listing = await getSellerListing(params.id, session.user.id);
  if (!listing) return NextResponse.json({ error: "Listing no encontrado" }, { status: 404 });

  if (listing.status === "SOLD") {
    return NextResponse.json({ error: "No se puede editar un listing vendido" }, { status: 400 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
  }

  const updated = await prisma.cardListing.update({
    where: { id: params.id },
    data: parsed.data,
  });

  return NextResponse.json({ id: updated.id, status: updated.status });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const listing = await getSellerListing(params.id, session.user.id);
  if (!listing) return NextResponse.json({ error: "Listing no encontrado" }, { status: 404 });

  if (listing.status === "SOLD") {
    return NextResponse.json({ error: "No se puede archivar un listing vendido" }, { status: 400 });
  }

  await prisma.cardListing.update({
    where: { id: params.id },
    data: { status: "CANCELLED" },
  });

  return NextResponse.json({ ok: true });
}
