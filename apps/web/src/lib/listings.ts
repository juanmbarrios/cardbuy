import { prisma, Game, CardCondition, CardLanguage, ListingStatus, Prisma } from "@cardbuy/db";
import type { CardListingData } from "@/components/listings/CardListingCard";

// ---------------------------------------------------------------------------
// Tipos públicos
// ---------------------------------------------------------------------------

export interface ListingsFilters {
  game?: string;
  condition?: string;
  language?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: "price_asc" | "price_desc" | "newest";
  page?: number;
  limit?: number;
  /** Incluir listings agotados (stock = 0 / quantity = 0) */
  includeOutOfStock?: boolean;
}

export interface PaginatedListings {
  listings: CardListingData[];
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
}

export interface ListingDetail extends CardListingData {
  description?: string;
  setName?: string;
  setCode?: string;
  isFoil: boolean;
  isGraded: boolean;
  shippingCost: number;
  freeShipping: boolean;
  shippingDays: number;
}

// ---------------------------------------------------------------------------
// Mappers — UI strings ↔ Prisma enums
// ---------------------------------------------------------------------------

const GAME_TO_DB: Record<string, Game> = {
  pokemon:          Game.POKEMON,
  magic:            Game.MAGIC_THE_GATHERING,
  mtg:              Game.MAGIC_THE_GATHERING,
  yugioh:           Game.YUGIOH,
  onepiece:         Game.ONE_PIECE,
  lorcana:          Game.LORCANA,
  dragonball:       Game.DRAGON_BALL,
  "flesh-and-blood": Game.FLESH_AND_BLOOD,
  fab:              Game.FLESH_AND_BLOOD,
  digimon:          Game.DIGIMON,
  vanguard:         Game.VANGUARD,
};

const DB_TO_GAME: Record<Game, string> = {
  [Game.POKEMON]:            "pokemon",
  [Game.MAGIC_THE_GATHERING]:"magic",
  [Game.YUGIOH]:             "yugioh",
  [Game.ONE_PIECE]:          "onepiece",
  [Game.LORCANA]:            "lorcana",
  [Game.DRAGON_BALL]:        "dragonball",
  [Game.FLESH_AND_BLOOD]:    "flesh-and-blood",
  [Game.DIGIMON]:            "digimon",
  [Game.VANGUARD]:           "vanguard",
};

const CONDITION_TO_DB: Record<string, CardCondition> = {
  NM:  CardCondition.NEAR_MINT,
  LP:  CardCondition.LIGHTLY_PLAYED,
  MP:  CardCondition.MODERATELY_PLAYED,
  HP:  CardCondition.HEAVILY_PLAYED,
  DMG: CardCondition.DAMAGED,
};

const DB_TO_CONDITION: Record<CardCondition, string> = {
  [CardCondition.NEAR_MINT]:          "NM",
  [CardCondition.LIGHTLY_PLAYED]:     "LP",
  [CardCondition.MODERATELY_PLAYED]:  "MP",
  [CardCondition.HEAVILY_PLAYED]:     "HP",
  [CardCondition.DAMAGED]:            "DMG",
};

// Note: UI uses "JP", DB uses CardLanguage.JA
const LANGUAGE_TO_DB: Record<string, CardLanguage> = {
  ES: CardLanguage.ES,
  EN: CardLanguage.EN,
  FR: CardLanguage.FR,
  DE: CardLanguage.DE,
  IT: CardLanguage.IT,
  PT: CardLanguage.PT,
  JP: CardLanguage.JA,
  JA: CardLanguage.JA,
  KO: CardLanguage.KO,
  ZH: CardLanguage.ZH,
};

const DB_TO_LANGUAGE: Record<CardLanguage, string> = {
  [CardLanguage.ES]: "ES",
  [CardLanguage.EN]: "EN",
  [CardLanguage.FR]: "FR",
  [CardLanguage.DE]: "DE",
  [CardLanguage.IT]: "IT",
  [CardLanguage.PT]: "PT",
  [CardLanguage.JA]: "JP",
  [CardLanguage.KO]: "KO",
  [CardLanguage.ZH]: "ZH",
};

export function mapGameToDb(game: string): Game | undefined {
  return GAME_TO_DB[game.toLowerCase()];
}

export function mapConditionToDb(condition: string): CardCondition | undefined {
  return CONDITION_TO_DB[condition.toUpperCase()];
}

export function mapLanguageToDb(language: string): CardLanguage | undefined {
  return LANGUAGE_TO_DB[language.toUpperCase()];
}

export function mapDbToGame(game: Game): string {
  return DB_TO_GAME[game] ?? game.toLowerCase();
}

export function mapDbToCondition(condition: CardCondition): string {
  return DB_TO_CONDITION[condition] ?? condition;
}

export function mapDbToLanguage(language: CardLanguage): string {
  return DB_TO_LANGUAGE[language] ?? language;
}

// ---------------------------------------------------------------------------
// Tipo resultado de la query Prisma (inferido)
// ---------------------------------------------------------------------------

const listingWithRelations = Prisma.validator<Prisma.CardListingDefaultArgs>()({
  include: {
    card: { include: { set: true } },
    seller: true,
  },
});

type DbListingWithRelations = Prisma.CardListingGetPayload<typeof listingWithRelations>;

// ---------------------------------------------------------------------------
// Mapper DB → CardListingData
// ---------------------------------------------------------------------------

export function mapDbToCardListingData(listing: DbListingWithRelations): CardListingData {
  return {
    id:               listing.id,
    title:            listing.card.name,
    price:            Number(listing.price),
    condition:        mapDbToCondition(listing.condition),
    language:         mapDbToLanguage(listing.language),
    game:             mapDbToGame(listing.card.game),
    sellerName:       listing.seller.shopName,
    imageUrl:         listing.card.imageUrl ?? undefined,
    stock:            listing.quantity,
    sellerRating:     listing.seller.averageRating,
    sellerReviewCount: listing.seller.totalReviews,
    // Vendedor verificado si ha completado onboarding de Stripe
    isVerified:       listing.seller.stripeOnboarded,
  };
}

export function mapDbToListingDetail(listing: DbListingWithRelations): ListingDetail {
  return {
    ...mapDbToCardListingData(listing),
    description:  listing.description ?? undefined,
    setName:      listing.card.set.name,
    setCode:      listing.card.set.code,
    isFoil:       listing.isFoil,
    isGraded:     listing.isGraded,
    shippingCost: Number(listing.shippingCost),
    freeShipping: listing.freeShipping,
    shippingDays: listing.shippingDays,
  };
}

// ---------------------------------------------------------------------------
// Service — queries Prisma
// ---------------------------------------------------------------------------

export async function getListings(filters: ListingsFilters): Promise<PaginatedListings> {
  const page  = Math.max(1, filters.page  ?? 1);
  const limit = Math.min(100, Math.max(1, filters.limit ?? 20));
  const skip  = (page - 1) * limit;

  // Construir where
  const where: Prisma.CardListingWhereInput = {
    status: ListingStatus.ACTIVE,
    ...(filters.includeOutOfStock ? {} : { quantity: { gt: 0 } }),
  };

  if (filters.game) {
    const dbGame = mapGameToDb(filters.game);
    if (dbGame) where.card = { game: dbGame };
  }

  if (filters.condition) {
    const dbCondition = mapConditionToDb(filters.condition);
    if (dbCondition) where.condition = dbCondition;
  }

  if (filters.language) {
    const dbLanguage = mapLanguageToDb(filters.language);
    if (dbLanguage) where.language = dbLanguage;
  }

  if (filters.minPrice ?? filters.maxPrice) {
    where.price = {};
    if (filters.minPrice) where.price.gte = new Prisma.Decimal(filters.minPrice);
    if (filters.maxPrice) where.price.lte = new Prisma.Decimal(filters.maxPrice);
  }

  // Ordenación
  let orderBy: Prisma.CardListingOrderByWithRelationInput;
  switch (filters.sort) {
    case "price_asc":  orderBy = { price: "asc" }; break;
    case "price_desc": orderBy = { price: "desc" }; break;
    case "newest":
    default:           orderBy = { createdAt: "desc" };
  }

  const [items, total] = await Promise.all([
    prisma.cardListing.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        card: { include: { set: true } },
        seller: true,
      },
    }),
    prisma.cardListing.count({ where }),
  ]);

  return {
    listings:    items.map(mapDbToCardListingData),
    total,
    page,
    limit,
    hasNextPage: page * limit < total,
  };
}

export async function getListingById(id: string): Promise<ListingDetail | null> {
  const listing = await prisma.cardListing.findUnique({
    where: { id },
    include: {
      card: { include: { set: true } },
      seller: true,
    },
  });

  if (!listing) return null;
  return mapDbToListingDetail(listing);
}
