import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { removeFromCart, updateCartItemQuantity } from "@/lib/cart";
import { z } from "zod";

interface Params {
  params: { listingId: string };
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    await removeFromCart(session.user.id, params.listingId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/cart/:listingId]", error);
    return NextResponse.json({ error: "Error al eliminar del carrito" }, { status: 500 });
  }
}

const patchSchema = z.object({
  quantity: z.number().int().min(0).max(99),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Cantidad inválida" }, { status: 400 });
  }

  try {
    const result = await updateCartItemQuantity(
      session.user.id,
      params.listingId,
      parsed.data.quantity
    );

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 409 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[PATCH /api/cart/:listingId]", error);
    return NextResponse.json({ error: "Error al actualizar el carrito" }, { status: 500 });
  }
}
