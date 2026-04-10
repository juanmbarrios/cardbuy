import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@cardbuy/db";
import { z } from "zod";

const schema = z.object({
  shopName: z.string().min(3).max(50),
  shopSlug: z.string().min(3).max(40).regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
  }

  const { shopName, shopSlug, description } = parsed.data;

  try {
    // Verificar que no tenga ya un perfil
    const existing = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (existing) {
      return NextResponse.json({ error: "Ya tienes un perfil de vendedor" }, { status: 409 });
    }

    // Crear perfil y promover rol en una transacción
    await prisma.$transaction([
      prisma.sellerProfile.create({
        data: {
          userId: session.user.id,
          shopName,
          shopSlug,
          description,
        },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: { role: "SELLER" },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("Unique constraint")) {
      if (msg.includes("shopName")) {
        return NextResponse.json({ error: "Ese nombre de tienda ya está en uso" }, { status: 409 });
      }
      if (msg.includes("shopSlug")) {
        return NextResponse.json({ error: "Esa URL ya está en uso" }, { status: 409 });
      }
    }
    console.error("[POST /api/seller/become]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
