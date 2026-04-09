import { describe, it, expect } from "vitest";
import {
  mapGameToDb,
  mapConditionToDb,
  mapLanguageToDb,
  mapDbToGame,
  mapDbToCondition,
  mapDbToLanguage,
} from "@/lib/listings";
import { Game, CardCondition, CardLanguage } from "@cardbuy/db";

// ---------------------------------------------------------------------------
// Tests — mapGameToDb
// ---------------------------------------------------------------------------

describe("mapGameToDb", () => {
  it("maps 'pokemon' to Game.POKEMON", () => {
    expect(mapGameToDb("pokemon")).toBe(Game.POKEMON);
  });

  it("maps 'magic' to Game.MAGIC_THE_GATHERING", () => {
    expect(mapGameToDb("magic")).toBe(Game.MAGIC_THE_GATHERING);
  });

  it("maps 'mtg' alias to Game.MAGIC_THE_GATHERING", () => {
    expect(mapGameToDb("mtg")).toBe(Game.MAGIC_THE_GATHERING);
  });

  it("maps 'yugioh' to Game.YUGIOH", () => {
    expect(mapGameToDb("yugioh")).toBe(Game.YUGIOH);
  });

  it("maps 'onepiece' to Game.ONE_PIECE", () => {
    expect(mapGameToDb("onepiece")).toBe(Game.ONE_PIECE);
  });

  it("maps 'flesh-and-blood' to Game.FLESH_AND_BLOOD", () => {
    expect(mapGameToDb("flesh-and-blood")).toBe(Game.FLESH_AND_BLOOD);
  });

  it("maps 'fab' alias to Game.FLESH_AND_BLOOD", () => {
    expect(mapGameToDb("fab")).toBe(Game.FLESH_AND_BLOOD);
  });

  it("returns undefined for unknown game", () => {
    expect(mapGameToDb("unknown-game")).toBeUndefined();
  });

  it("is case-insensitive", () => {
    expect(mapGameToDb("POKEMON")).toBe(Game.POKEMON);
    expect(mapGameToDb("Magic")).toBe(Game.MAGIC_THE_GATHERING);
  });
});

// ---------------------------------------------------------------------------
// Tests — mapDbToGame (reverse)
// ---------------------------------------------------------------------------

describe("mapDbToGame", () => {
  it("maps Game.POKEMON back to 'pokemon'", () => {
    expect(mapDbToGame(Game.POKEMON)).toBe("pokemon");
  });

  it("maps Game.MAGIC_THE_GATHERING back to 'magic'", () => {
    expect(mapDbToGame(Game.MAGIC_THE_GATHERING)).toBe("magic");
  });

  it("maps Game.ONE_PIECE back to 'onepiece'", () => {
    expect(mapDbToGame(Game.ONE_PIECE)).toBe("onepiece");
  });
});

// ---------------------------------------------------------------------------
// Tests — mapConditionToDb
// ---------------------------------------------------------------------------

describe("mapConditionToDb", () => {
  it("maps 'NM' to NEAR_MINT", () => {
    expect(mapConditionToDb("NM")).toBe(CardCondition.NEAR_MINT);
  });

  it("maps 'LP' to LIGHTLY_PLAYED", () => {
    expect(mapConditionToDb("LP")).toBe(CardCondition.LIGHTLY_PLAYED);
  });

  it("maps 'MP' to MODERATELY_PLAYED", () => {
    expect(mapConditionToDb("MP")).toBe(CardCondition.MODERATELY_PLAYED);
  });

  it("maps 'HP' to HEAVILY_PLAYED", () => {
    expect(mapConditionToDb("HP")).toBe(CardCondition.HEAVILY_PLAYED);
  });

  it("maps 'DMG' to DAMAGED", () => {
    expect(mapConditionToDb("DMG")).toBe(CardCondition.DAMAGED);
  });

  it("is case-insensitive", () => {
    expect(mapConditionToDb("nm")).toBe(CardCondition.NEAR_MINT);
    expect(mapConditionToDb("lp")).toBe(CardCondition.LIGHTLY_PLAYED);
  });

  it("returns undefined for unknown condition", () => {
    expect(mapConditionToDb("EXCELLENT")).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Tests — mapDbToCondition (reverse)
// ---------------------------------------------------------------------------

describe("mapDbToCondition", () => {
  it("maps NEAR_MINT back to 'NM'", () => {
    expect(mapDbToCondition(CardCondition.NEAR_MINT)).toBe("NM");
  });

  it("maps DAMAGED back to 'DMG'", () => {
    expect(mapDbToCondition(CardCondition.DAMAGED)).toBe("DMG");
  });

  it("round-trips for all conditions", () => {
    const conditions = ["NM", "LP", "MP", "HP", "DMG"];
    for (const c of conditions) {
      const dbVal = mapConditionToDb(c);
      expect(dbVal).toBeDefined();
      expect(mapDbToCondition(dbVal!)).toBe(c);
    }
  });
});

// ---------------------------------------------------------------------------
// Tests — mapLanguageToDb
// ---------------------------------------------------------------------------

describe("mapLanguageToDb", () => {
  it("maps 'EN' to CardLanguage.EN", () => {
    expect(mapLanguageToDb("EN")).toBe(CardLanguage.EN);
  });

  it("maps 'ES' to CardLanguage.ES", () => {
    expect(mapLanguageToDb("ES")).toBe(CardLanguage.ES);
  });

  it("maps UI 'JP' to DB CardLanguage.JA", () => {
    expect(mapLanguageToDb("JP")).toBe(CardLanguage.JA);
  });

  it("maps 'JA' directly to CardLanguage.JA", () => {
    expect(mapLanguageToDb("JA")).toBe(CardLanguage.JA);
  });

  it("is case-insensitive", () => {
    expect(mapLanguageToDb("en")).toBe(CardLanguage.EN);
    expect(mapLanguageToDb("jp")).toBe(CardLanguage.JA);
  });

  it("returns undefined for unknown language", () => {
    expect(mapLanguageToDb("XX")).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Tests — mapDbToLanguage (reverse) — JA → JP (UI convention)
// ---------------------------------------------------------------------------

describe("mapDbToLanguage", () => {
  it("maps CardLanguage.EN back to 'EN'", () => {
    expect(mapDbToLanguage(CardLanguage.EN)).toBe("EN");
  });

  it("maps CardLanguage.JA back to 'JP' (UI convention)", () => {
    expect(mapDbToLanguage(CardLanguage.JA)).toBe("JP");
  });

  it("round-trips for all supported UI languages (except JA→JP asymmetry)", () => {
    const langs = ["EN", "ES", "FR", "DE", "IT", "PT"];
    for (const l of langs) {
      const dbVal = mapLanguageToDb(l);
      expect(dbVal).toBeDefined();
      expect(mapDbToLanguage(dbVal!)).toBe(l);
    }
  });
});
