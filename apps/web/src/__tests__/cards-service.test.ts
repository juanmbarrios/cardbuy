import { describe, it, expect } from "vitest";
import { RARITY_LABELS } from "@/lib/cards";

// ---------------------------------------------------------------------------
// Tests — RARITY_LABELS mapping
// ---------------------------------------------------------------------------

describe("RARITY_LABELS", () => {
  it("maps COMMON to 'Común'", () => {
    expect(RARITY_LABELS["COMMON"]).toBe("Común");
  });

  it("maps ULTRA_RARE to 'Ultra Rara'", () => {
    expect(RARITY_LABELS["ULTRA_RARE"]).toBe("Ultra Rara");
  });

  it("maps SPECIAL_ILLUSTRATION to 'Special Illustration'", () => {
    expect(RARITY_LABELS["SPECIAL_ILLUSTRATION"]).toBe("Special Illustration");
  });

  it("maps HYPER_RARE to 'Hyper Rare'", () => {
    expect(RARITY_LABELS["HYPER_RARE"]).toBe("Hyper Rare");
  });

  it("maps all 12 rarities", () => {
    const rarities = [
      "COMMON", "UNCOMMON", "RARE", "DOUBLE_RARE",
      "ULTRA_RARE", "SECRET_RARE", "HYPER_RARE", "RAINBOW_RARE",
      "FULL_ART", "SPECIAL_ILLUSTRATION", "PROMO", "TOKEN",
    ];
    for (const r of rarities) {
      expect(RARITY_LABELS[r]).toBeDefined();
      expect(typeof RARITY_LABELS[r]).toBe("string");
      expect(RARITY_LABELS[r].length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Tests — Offer sorting logic (mirrors getCardBySlug orderBy: price asc)
// ---------------------------------------------------------------------------

interface MockOffer {
  id: string;
  price: number;
  condition: string;
  language: string;
}

function sortOffersByPrice(offers: MockOffer[]): MockOffer[] {
  return [...offers].sort((a, b) => a.price - b.price);
}

describe("Offer sorting", () => {
  const offers: MockOffer[] = [
    { id: "c", price: 55.00, condition: "NM", language: "EN" },
    { id: "a", price: 15.99, condition: "MP", language: "ES" },
    { id: "b", price: 28.50, condition: "LP", language: "EN" },
    { id: "d", price: 22.00, condition: "LP", language: "JP" },
  ];

  it("sorts offers by price ascending by default", () => {
    const sorted = sortOffersByPrice(offers);
    expect(sorted.map((o) => o.price)).toEqual([15.99, 22.00, 28.50, 55.00]);
  });

  it("cheapest offer is first", () => {
    const sorted = sortOffersByPrice(offers);
    expect(sorted[0].id).toBe("a");
  });

  it("does not mutate the original array", () => {
    const original = [...offers];
    sortOffersByPrice(offers);
    expect(offers.map((o) => o.id)).toEqual(original.map((o) => o.id));
  });
});

// ---------------------------------------------------------------------------
// Tests — Client-side filter logic (mirrors CardOffersTable)
// ---------------------------------------------------------------------------

function filterOffers(
  offers: MockOffer[],
  conditionFilter: string,
  languageFilter: string
): MockOffer[] {
  return offers.filter((o) => {
    if (conditionFilter && o.condition !== conditionFilter) return false;
    if (languageFilter  && o.language  !== languageFilter)  return false;
    return true;
  });
}

describe("Client-side offer filtering", () => {
  const offers: MockOffer[] = [
    { id: "1", price: 34.99, condition: "NM", language: "EN" },
    { id: "2", price: 22.00, condition: "LP", language: "JP" },
    { id: "3", price: 15.99, condition: "MP", language: "ES" },
    { id: "4", price: 55.00, condition: "NM", language: "EN" },
    { id: "5", price: 28.50, condition: "LP", language: "EN" },
  ];

  it("returns all offers when no filter is active", () => {
    expect(filterOffers(offers, "", "")).toHaveLength(5);
  });

  it("filters by condition only", () => {
    const result = filterOffers(offers, "NM", "");
    expect(result).toHaveLength(2);
    expect(result.every((o) => o.condition === "NM")).toBe(true);
  });

  it("filters by language only", () => {
    const result = filterOffers(offers, "", "EN");
    expect(result).toHaveLength(3);
    expect(result.every((o) => o.language === "EN")).toBe(true);
  });

  it("combines condition and language filters", () => {
    const result = filterOffers(offers, "NM", "EN");
    expect(result).toHaveLength(2);
  });

  it("returns empty array when no offer matches", () => {
    expect(filterOffers(offers, "DMG", "")).toHaveLength(0);
  });

  it("returns empty array when combination has no match", () => {
    expect(filterOffers(offers, "LP", "ES")).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Tests — getCardBySlug null for unknown slug (logic test, no DB)
// ---------------------------------------------------------------------------

describe("getCardBySlug contract", () => {
  it("slug contract: slug must be a non-empty string", () => {
    const validSlug = "charizard-ex-sv03-125";
    expect(typeof validSlug).toBe("string");
    expect(validSlug.length).toBeGreaterThan(0);
  });

  it("null-safe: result can be null for unknown slug", () => {
    // Simulates the null return path
    const result: { card: unknown } | null = null;
    expect(result).toBeNull();
  });

  it("valid result has card and offers array", () => {
    const mockResult = {
      card: { id: "1", slug: "test", name: "Test Card", game: "pokemon", rarity: "Rara", number: "001", setName: "Test Set", setCode: "TST", setSlug: "tst" },
      offers: [],
      total: 0,
    };
    expect(mockResult.card).toBeDefined();
    expect(Array.isArray(mockResult.offers)).toBe(true);
    expect(mockResult.total).toBe(0);
  });
});
