import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { addToCart, getEnrichedCart } from "@/lib/cart";
import { z } from "zod";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ items: [], groups: [], totalItems: 0, grandTotal: 0 });
  }

  try {
    const cart = await getEnrichedCart(session.user.id);
    return NextResponse.json(cart);
  } catch (error) {
    console.error("[GET /api/cart]", error);
    return NextResponse.json({ error: "Error al obtener el carrito" }, { status: 500 });
  }
}

const addSchema = z.object({
  listingId: z.string().min(1),
  quantity: z.number().int().min(1).max(99).default(1),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = addSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  try {
    const result = await addToCart(
      session.user.id,
      parsed.data.listingId,
      parsed.data.quantity
    );

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 409 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[POST /api/cart]", error);
    return NextResponse.json({ error: "Error al añadir al carrito" }, { status: 500 });
  }
}
