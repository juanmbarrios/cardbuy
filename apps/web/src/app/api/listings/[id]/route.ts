import { NextRequest, NextResponse } from "next/server";
import { getListingById } from "@/lib/listings";

interface Params {
  params: { id: string };
}

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = params;

  try {
    const listing = await getListingById(id);

    if (!listing) {
      return NextResponse.json(
        { error: "Listing no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(listing);
  } catch (error) {
    console.error(`[GET /api/listings/${id}]`, error);
    return NextResponse.json(
      { error: "Error al obtener el listing" },
      { status: 500 }
    );
  }
}
