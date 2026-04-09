import { NextRequest, NextResponse } from "next/server";
import { getListings } from "@/lib/listings";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const pageRaw  = searchParams.get("page");
  const limitRaw = searchParams.get("limit");
  const sortRaw  = searchParams.get("sort");

  const validSorts = ["price_asc", "price_desc", "newest"] as const;
  type ValidSort = (typeof validSorts)[number];
  const sort = validSorts.includes(sortRaw as ValidSort)
    ? (sortRaw as ValidSort)
    : undefined;

  try {
    const result = await getListings({
      game:             searchParams.get("game")      ?? undefined,
      condition:        searchParams.get("condition") ?? undefined,
      language:         searchParams.get("language")  ?? undefined,
      minPrice:         searchParams.get("minPrice")  ?? undefined,
      maxPrice:         searchParams.get("maxPrice")  ?? undefined,
      sort,
      page:  pageRaw  ? Math.max(1, parseInt(pageRaw,  10)) : undefined,
      limit: limitRaw ? Math.max(1, parseInt(limitRaw, 10)) : undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[GET /api/listings]", error);
    return NextResponse.json(
      { error: "Error al obtener los listings" },
      { status: 500 }
    );
  }
}
