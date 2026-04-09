import { prisma, CardRarity, ListingStatus, Prisma } from "@cardbuy/db";
import {
  mapDbToGame,
  mapDbToCondition,
  mapDbToLanguage,
} from "@/lib/listings";
import type { CardListingData } from "@/components/listings/CardListingCard";

// ---------------------------------------------------------------------------
// Tipos públicos
// ---------------------------------------------------------------------------

export interface CardDetail {
  id: string;
  slug: string;
  name: string;
  game: string;
  rarity: string;
  number: string;
  imageUrl?: string;
  setName: string;
  setCode: string;
  setSlug: string;
  avgMarketPrice?: number;
}

export interface CardOffer extends CardListingData {
  isFoil: boolean;
  isGraded: boolean;
  freeShipping: boolean;
  shippingCost: number;
  shippingDays: number;
}

export interface CardWithOffers {
  card: CardDetail;
  offers: CardOffer[];
  total: number;
}

// ---------------------------------------------------------------------------
// Rarity display map
// ---------------------------------------------------------------------------

export const RARITY_LABELS: Record<string, string> = {
  [CardRarity.COMMON]:                 "Común",
  [CardRarity.UNCOMMON]:               "Infrecuente",
  [CardRarity.RARE]:                   "Rara",
  [CardRarity.DOUBLE_RARE]:            "Doble Rara",
  [CardRarity.ULTRA_RARE]:             "Ultra Rara",
  [CardRarity.SECRET_RARE]:            "Secret Rare",
  [CardRarity.HYPER_RARE]:             "Hyper Rare",
  [CardRarity.RAINBOW_RARE]:           "Rainbow Rare",
  [CardRarity.FULL_ART]:               "Full Art",
  [CardRarity.SPECIAL_ILLUSTRATION]:   "Special Illustration",
  [CardRarity.PROMO]:                  "Promo",
  [CardRarity.TOKEN]:                  "Token",
};

// ---------------------------------------------------------------------------
// Prisma select shape
// ---------------------------------------------------------------------------

const cardWithOffersInclude = Prisma.validator<Prisma.CardDefaultArgs>()({
  include: {
    set: true,
    listings: {
      where: { status: ListingStatus.ACTIVE, quantity: { gt: 0 } },
      orderBy: { price: "asc" },
      include: { seller: true },
    },
  },
});

type DbCardWithOffers = Prisma.CardGetPayload<typeof cardWithOffersInclude>;

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

function mapDbToCardDetail(card: DbCardWithOffers): CardDetail {
  return {
    id:             card.id,
    slug:           card.slug,
    name:           card.name,
    game:           mapDbToGame(card.game),
    rarity:         RARITY_LABELS[card.rarity] ?? card.rarity,
    number:         card.number,
    imageUrl:       card.imageUrl ?? undefined,
    setName:        card.set.name,
    setCode:        card.set.code,
    setSlug:        card.set.slug,
    avgMarketPrice: card.avgMarketPrice ? Number(card.avgMarketPrice) : undefined,
  };
}

function mapDbToCardOffer(
  listing: DbCardWithOffers["listings"][number]
): CardOffer {
  return {
    id:               listing.id,
    title:            listing.card?.name ?? "",
    price:            Number(listing.price),
    condition:        mapDbToCondition(listing.condition),
    language:         mapDbToLanguage(listing.language),
    game:             "",           // no needed in offer row context
    sellerName:       listing.seller.shopName,
    imageUrl:         undefined,    // offers use card image, not listing image
    stock:            listing.quantity,
    sellerRating:     listing.seller.averageRating,
    sellerReviewCount: listing.seller.totalReviews,
    isVerified:       listing.seller.stripeOnboarded,
    isFoil:           listing.isFoil,
    isGraded:         listing.isGraded,
    freeShipping:     listing.freeShipping,
    shippingCost:     Number(listing.shippingCost),
    shippingDays:     listing.shippingDays,
  };
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export async function getCardBySlug(slug: string): Promise<CardWithOffers | null> {
  const card = await prisma.card.findUnique({
    where: { slug },
    include: {
      set: true,
      listings: {
        where: { status: ListingStatus.ACTIVE, quantity: { gt: 0 } },
        orderBy: { price: "asc" },
        include: {
          seller: true,
          card: false,      // avoid circular — card is already the parent
        },
      },
    },
  });

  if (!card) return null;

  // listings don't have card included here; mapDbToCardOffer accesses listing.card
  // We cast and patch the card reference manually
  const offers: CardOffer[] = card.listings.map((listing) => ({
    id:               listing.id,
    title:            card.name,
    price:            Number(listing.price),
    condition:        mapDbToCondition(listing.condition),
    language:         mapDbToLanguage(listing.language),
    game:             mapDbToGame(card.game),
    sellerName:       listing.seller.shopName,
    imageUrl:         undefined,
    stock:            listing.quantity,
    sellerRating:     listing.seller.averageRating,
    sellerReviewCount: listing.seller.totalReviews,
    isVerified:       listing.seller.stripeOnboarded,
    isFoil:           listing.isFoil,
    isGraded:         listing.isGraded,
    freeShipping:     listing.freeShipping,
    shippingCost:     Number(listing.shippingCost),
    shippingDays:     listing.shippingDays,
  }));

  return {
    card: {
      id:             card.id,
      slug:           card.slug,
      name:           card.name,
      game:           mapDbToGame(card.game),
      rarity:         RARITY_LABELS[card.rarity] ?? card.rarity,
      number:         card.number,
      imageUrl:       card.imageUrl ?? undefined,
      setName:        card.set.name,
      setCode:        card.set.code,
      setSlug:        card.set.slug,
      avgMarketPrice: card.avgMarketPrice ? Number(card.avgMarketPrice) : undefined,
    },
    offers,
    total: offers.length,
  };
}
