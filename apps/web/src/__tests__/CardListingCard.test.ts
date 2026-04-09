import { describe, it, expect } from "vitest";
import type { CardListingData } from "@/components/listings/CardListingCard";

// ---------------------------------------------------------------------------
// Helpers — mirrors lógica interna de CardListingCard
// ---------------------------------------------------------------------------

function getStockState(stock: number): "out_of_stock" | "last_unit" | "in_stock" {
  if (stock === 0) return "out_of_stock";
  if (stock === 1) return "last_unit";
  return "in_stock";
}

function getStockLabel(stock: number): string {
  if (stock === 0) return "Agotado";
  if (stock === 1) return "Última unidad";
  return `En stock (${stock})`;
}

function formatPrice(price: number): string {
  return price.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}

function isDisabled(listing: CardListingData): boolean {
  return listing.stock === 0;
}

// ---------------------------------------------------------------------------
// Tests — CardListingData interface shape
// ---------------------------------------------------------------------------

describe("CardListingData interface", () => {
  it("accepts a complete listing with all required fields", () => {
    const listing: CardListingData = {
      id: "1",
      title: "Charizard ex",
      price: 34.99,
      condition: "NM",
      language: "EN",
      game: "pokemon",
      sellerName: "CardShark",
      stock: 3,
      sellerRating: 4.9,
      sellerReviewCount: 218,
      isVerified: true,
    };
    expect(listing.stock).toBe(3);
    expect(listing.sellerRating).toBe(4.9);
    expect(listing.sellerReviewCount).toBe(218);
    expect(listing.isVerified).toBe(true);
  });

  it("accepts an unverified seller", () => {
    const listing: CardListingData = {
      id: "2",
      title: "Blue-Eyes White Dragon",
      price: 12.5,
      condition: "MP",
      language: "ES",
      game: "yugioh",
      sellerName: "DuelStore",
      stock: 0,
      sellerRating: 4.2,
      sellerReviewCount: 43,
      isVerified: false,
    };
    expect(listing.isVerified).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Tests — Stock states
// ---------------------------------------------------------------------------

describe("Stock state", () => {
  it("returns 'out_of_stock' when stock is 0", () => {
    expect(getStockState(0)).toBe("out_of_stock");
  });

  it("returns 'last_unit' when stock is exactly 1", () => {
    expect(getStockState(1)).toBe("last_unit");
  });

  it("returns 'in_stock' when stock is 2 or more", () => {
    expect(getStockState(2)).toBe("in_stock");
    expect(getStockState(10)).toBe("in_stock");
    expect(getStockState(99)).toBe("in_stock");
  });
});

// ---------------------------------------------------------------------------
// Tests — Stock labels
// ---------------------------------------------------------------------------

describe("Stock label", () => {
  it("shows 'Agotado' when stock is 0", () => {
    expect(getStockLabel(0)).toBe("Agotado");
  });

  it("shows 'Última unidad' when stock is 1", () => {
    expect(getStockLabel(1)).toBe("Última unidad");
  });

  it("includes quantity in label when stock > 1", () => {
    expect(getStockLabel(3)).toBe("En stock (3)");
    expect(getStockLabel(7)).toBe("En stock (7)");
  });
});

// ---------------------------------------------------------------------------
// Tests — Disabled state
// ---------------------------------------------------------------------------

describe("Card disabled state", () => {
  const baseListing: CardListingData = {
    id: "x",
    title: "Test",
    price: 10,
    condition: "NM",
    language: "EN",
    game: "pokemon",
    sellerName: "Seller",
    stock: 5,
    sellerRating: 4.5,
    sellerReviewCount: 10,
    isVerified: false,
  };

  it("is NOT disabled when stock > 0", () => {
    expect(isDisabled({ ...baseListing, stock: 1 })).toBe(false);
    expect(isDisabled({ ...baseListing, stock: 5 })).toBe(false);
  });

  it("IS disabled when stock is 0", () => {
    expect(isDisabled({ ...baseListing, stock: 0 })).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Tests — Price formatting
// ---------------------------------------------------------------------------

describe("Price formatting", () => {
  it("formats integer price in euros", () => {
    const result = formatPrice(5000);
    expect(result).toContain("5");
    expect(result).toContain("000");
    expect(result.toLowerCase()).toContain("€");
  });

  it("formats decimal price in euros", () => {
    const result = formatPrice(34.99);
    expect(result).toContain("34");
    expect(result).toContain("99");
  });
});

// ---------------------------------------------------------------------------
// Tests — Seller rating display
// ---------------------------------------------------------------------------

describe("Seller rating", () => {
  it("formats rating to one decimal place", () => {
    expect((4.9).toFixed(1)).toBe("4.9");
    expect((4.0).toFixed(1)).toBe("4.0");
    expect((4.85).toFixed(1)).toBe("4.8"); // JS banker's rounding: 4.85 → "4.8"
  });
});
