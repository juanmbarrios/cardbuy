import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@cardbuy/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const role = searchParams.get("role") ?? "buyer"; // "buyer" | "seller"

  const where =
    role === "seller"
      ? { sellerId: session.user.id }
      : { buyerId: session.user.id };

  try {
    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        seller: { select: { id: true, name: true } },
        buyer: { select: { id: true, name: true } },
        items: {
          select: {
            id: true,
            quantity: true,
            unitPrice: true,
            cardSnapshot: true,
          },
        },
      },
    });

    return NextResponse.json(
      orders.map((o) => ({
        id: o.id,
        status: o.status,
        total: Number(o.total),
        createdAt: o.createdAt.toISOString(),
        seller: o.seller,
        buyer: o.buyer,
        itemCount: o.items.reduce((sum, i) => sum + i.quantity, 0),
        firstItem: o.items[0]?.cardSnapshot ?? null,
      }))
    );
  } catch (error) {
    console.error("[GET /api/orders]", error);
    return NextResponse.json({ error: "Error al obtener los pedidos" }, { status: 500 });
  }
}
