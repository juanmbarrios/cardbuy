import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getOrderById } from "@/lib/orders";

interface Params {
  params: { orderId: string };
}

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const order = await getOrderById(params.orderId, session.user.id);

    if (!order) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error(`[GET /api/orders/${params.orderId}]`, error);
    return NextResponse.json({ error: "Error al obtener el pedido" }, { status: 500 });
  }
}
