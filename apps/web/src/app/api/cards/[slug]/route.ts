import { NextRequest, NextResponse } from "next/server";
import { getCardBySlug } from "@/lib/cards";

interface Params {
  params: { slug: string };
}

export async function GET(_request: NextRequest, { params }: Params) {
  const { slug } = params;

  try {
    const result = await getCardBySlug(slug);

    if (!result) {
      return NextResponse.json(
        { error: "Carta no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error(`[GET /api/cards/${slug}]`, error);
    return NextResponse.json(
      { error: "Error al obtener la carta" },
      { status: 500 }
    );
  }
}
