import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@cardbuy/db";
import { z } from "zod";

const createSchema = z.object({
  cardId: z.string().min(1),
  condition: z.enum(["NEAR_MINT", "LIGHTLY_PLAYED", "MODERATELY_PLAYED", "HEAVILY_PLAYED", "DAMAGED"]),
  language: z.enum(["ES", "EN", "FR", "DE", "IT", "PT", "JA", "KO", "ZH"]),
  price: z.number().positive().max(99999),
  quantity: z.number().int().min(1).max(999),
  isFoil: z.boolean().default(false),
  isGraded: z.boolean().default(false),
  description: z.string().max(2000).optional(),
  imageUrls: z.array(z.string().url()).max(5).optional(),
  shippingCost: z.number().min(0).default(0),
  freeShipping: z.boolean().default(false),
});

async function getSellerProfile(userId: string) {
  return prisma.sellerProfile.findUnique({ where: { userId } });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const seller = await getSellerProfile(session.user.id);
  if (!seller) return NextResponse.json({ error: "Perfil de vendedor no encontrado" }, { status: 404 });

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status") ?? "ACTIVE";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = 20;

  const where = {
    sellerId: seller.id,
    ...(status !== "ALL" ? { status } : {}),
  };

  const [listings, total] = await Promise.all([
    prisma.cardListing.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { card: { select: { name: true, game: true } } },
    }),
    prisma.cardListing.count({ where }),
  ]);

  return NextResponse.json({
    listings: listings.map((l) => ({
      id: l.id,
      cardName: l.card.name,
      game: l.card.game,
      condition: l.condition,
      language: l.language,
      price: Number(l.price),
      quantity: l.quantity,
      status: l.status,
      isFoil: l.isFoil,
      views: l.views,
      createdAt: l.createdAt.toISOString(),
    })),
    total,
    page,
    pages: Math.ceil(total / limit),
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const seller = await getSellerProfile(session.user.id);
  if (!seller) return NextResponse.json({ error: "Perfil de vendedor no encontrado" }, { status: 404 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
  }

  // Verificar que la carta existe
  const card = await prisma.card.findUnique({ where: { id: parsed.data.cardId } });
  if (!card) return NextResponse.json({ error: "Carta no encontrada" }, { status: 404 });

  const listing = await prisma.cardListing.create({
    data: {
      cardId: parsed.data.cardId,
      sellerId: seller.id,
      condition: parsed.data.condition,
      language: parsed.data.language,
      price: parsed.data.price,
      quantity: parsed.data.quantity,
      isFoil: parsed.data.isFoil,
      isGraded: parsed.data.isGraded,
      description: parsed.data.description,
      imageUrls: parsed.data.imageUrls ?? [],
      shippingCost: parsed.data.shippingCost,
      freeShipping: parsed.data.freeShipping,
    },
    include: { card: { select: { name: true } } },
  });

  return NextResponse.json({ id: listing.id, cardName: listing.card.name }, { status: 201 });
}
