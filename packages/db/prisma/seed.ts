import { PrismaClient, Game, CardRarity, CardCondition, CardLanguage, ListingStatus, UserRole, KYCStatus } from "@prisma/client";
import { createHash } from "crypto";

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function fakeHash(pw: string): string {
  // SOLO para seed/dev — nunca en producción
  return createHash("sha256").update(pw).digest("hex");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("🌱 Seeding CardBuy database...");

  // -------------------------------------------------------------------------
  // 1. Usuarios
  // -------------------------------------------------------------------------

  const buyer = await prisma.user.upsert({
    where: { email: "buyer@cardbuy.dev" },
    update: {},
    create: {
      email: "buyer@cardbuy.dev",
      name: "Ana Compradora",
      passwordHash: fakeHash("buyer1234"),
      role: UserRole.BUYER,
      emailVerified: new Date(),
    },
  });

  const sellerUser1 = await prisma.user.upsert({
    where: { email: "seller1@cardbuy.dev" },
    update: {},
    create: {
      email: "seller1@cardbuy.dev",
      name: "Carlos Vendedor",
      passwordHash: fakeHash("seller1234"),
      role: UserRole.SELLER,
      emailVerified: new Date(),
    },
  });

  const sellerUser2 = await prisma.user.upsert({
    where: { email: "seller2@cardbuy.dev" },
    update: {},
    create: {
      email: "seller2@cardbuy.dev",
      name: "Laura Magic",
      passwordHash: fakeHash("seller1234"),
      role: UserRole.SELLER,
      emailVerified: new Date(),
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@cardbuy.dev" },
    update: {},
    create: {
      email: "admin@cardbuy.dev",
      name: "Admin CardBuy",
      passwordHash: fakeHash("admin1234"),
      role: UserRole.ADMIN,
      emailVerified: new Date(),
    },
  });

  console.log("✓ Usuarios creados");

  // -------------------------------------------------------------------------
  // 2. SellerProfiles
  // -------------------------------------------------------------------------

  const seller1 = await prisma.sellerProfile.upsert({
    where: { userId: sellerUser1.id },
    update: {},
    create: {
      userId:          sellerUser1.id,
      shopName:        "CardShark TCG",
      shopSlug:        "cardshark-tcg",
      description:     "Especialistas en Pokémon y One Piece. Envío en 24h.",
      averageRating:   4.9,
      totalReviews:    218,
      totalSales:      340,
      kybStatus:       KYCStatus.VERIFIED,
      stripeOnboarded: true,
      isActive:        true,
    },
  });

  const seller2 = await prisma.sellerProfile.upsert({
    where: { userId: sellerUser2.id },
    update: {},
    create: {
      userId:          sellerUser2.id,
      shopName:        "MTGVault",
      shopSlug:        "mtgvault",
      description:     "Tu tienda de Magic: The Gathering de confianza.",
      averageRating:   4.7,
      totalReviews:    85,
      totalSales:      120,
      kybStatus:       KYCStatus.VERIFIED,
      stripeOnboarded: true,
      isActive:        true,
    },
  });

  console.log("✓ SellerProfiles creados");

  // -------------------------------------------------------------------------
  // 3. CardSets
  // -------------------------------------------------------------------------

  const obsidianFlames = await prisma.cardSet.upsert({
    where: { slug: "sv03-obsidian-flames" },
    update: {},
    create: {
      game:        Game.POKEMON,
      name:        "Obsidian Flames",
      code:        "SV03",
      slug:        "sv03-obsidian-flames",
      releaseDate: new Date("2023-08-11"),
      totalCards:  230,
    },
  });

  const scarletViolet = await prisma.cardSet.upsert({
    where: { slug: "sv01-scarlet-violet" },
    update: {},
    create: {
      game:        Game.POKEMON,
      name:        "Scarlet & Violet",
      code:        "SV01",
      slug:        "sv01-scarlet-violet",
      releaseDate: new Date("2023-03-31"),
      totalCards:  258,
    },
  });

  const lotV = await prisma.cardSet.upsert({
    where: { slug: "op01-romance-dawn" },
    update: {},
    create: {
      game:        Game.ONE_PIECE,
      name:        "Romance Dawn",
      code:        "OP01",
      slug:        "op01-romance-dawn",
      releaseDate: new Date("2022-07-08"),
      totalCards:  121,
    },
  });

  const mh3 = await prisma.cardSet.upsert({
    where: { slug: "mh3-modern-horizons-3" },
    update: {},
    create: {
      game:        Game.MAGIC_THE_GATHERING,
      name:        "Modern Horizons 3",
      code:        "MH3",
      slug:        "mh3-modern-horizons-3",
      releaseDate: new Date("2024-06-14"),
      totalCards:  290,
    },
  });

  const lob = await prisma.cardSet.upsert({
    where: { slug: "lob-legend-of-blue-eyes" },
    update: {},
    create: {
      game:        Game.YUGIOH,
      name:        "Legend of Blue Eyes White Dragon",
      code:        "LOB",
      slug:        "lob-legend-of-blue-eyes",
      releaseDate: new Date("2002-03-08"),
      totalCards:  126,
    },
  });

  console.log("✓ CardSets creados");

  // -------------------------------------------------------------------------
  // 4. Cards
  // -------------------------------------------------------------------------

  const charizardEx = await prisma.card.upsert({
    where: { slug: "charizard-ex-sv03-125" },
    update: {},
    create: {
      game:     Game.POKEMON,
      setId:    obsidianFlames.id,
      name:     "Charizard ex",
      nameEn:   "Charizard ex",
      number:   "125/197",
      slug:     "charizard-ex-sv03-125",
      rarity:   CardRarity.DOUBLE_RARE,
      imageUrl: "https://images.pokemontcg.io/sv3/125_hires.png",
    },
  });

  const mewTwo = await prisma.card.upsert({
    where: { slug: "mewtwo-ex-sv01-193" },
    update: {},
    create: {
      game:     Game.POKEMON,
      setId:    scarletViolet.id,
      name:     "Mewtwo ex",
      nameEn:   "Mewtwo ex",
      number:   "193/198",
      slug:     "mewtwo-ex-sv01-193",
      rarity:   CardRarity.SPECIAL_ILLUSTRATION,
      imageUrl: "https://images.pokemontcg.io/sv1/193_hires.png",
    },
  });

  const luffy = await prisma.card.upsert({
    where: { slug: "monkey-d-luffy-op01-001" },
    update: {},
    create: {
      game:     Game.ONE_PIECE,
      setId:    lotV.id,
      name:     "Monkey D. Luffy",
      nameEn:   "Monkey D. Luffy",
      number:   "OP01-001",
      slug:     "monkey-d-luffy-op01-001",
      rarity:   CardRarity.SECRET_RARE,
    },
  });

  const lotusField = await prisma.card.upsert({
    where: { slug: "lotus-field-mh3-038" },
    update: {},
    create: {
      game:     Game.MAGIC_THE_GATHERING,
      setId:    mh3.id,
      name:     "Nadu, Winged Wisdom",
      nameEn:   "Nadu, Winged Wisdom",
      number:   "038/290",
      slug:     "lotus-field-mh3-038",
      rarity:   CardRarity.RARE,
    },
  });

  const blueEyes = await prisma.card.upsert({
    where: { slug: "blue-eyes-white-dragon-lob-001" },
    update: {},
    create: {
      game:     Game.YUGIOH,
      setId:    lob.id,
      name:     "Blue-Eyes White Dragon",
      nameEn:   "Blue-Eyes White Dragon",
      number:   "LOB-001",
      slug:     "blue-eyes-white-dragon-lob-001",
      rarity:   CardRarity.ULTRA_RARE,
    },
  });

  console.log("✓ Cards creadas");

  // -------------------------------------------------------------------------
  // 5. CardListings
  // -------------------------------------------------------------------------

  const listings = [
    // Charizard ex — CardShark (3 units, NM, EN)
    {
      cardId:       charizardEx.id,
      sellerId:     seller1.id,
      condition:    CardCondition.NEAR_MINT,
      language:     CardLanguage.EN,
      price:        34.99,
      quantity:     3,
      status:       ListingStatus.ACTIVE,
      description:  "Charizard ex en perfecto estado. Sin marcas, directo del sobre. Envío en toploader rígido.",
      freeShipping: false,
      shippingCost: 2.5,
      shippingDays: 3,
    },
    // Charizard ex — CardShark (1 unit, LP, JP)
    {
      cardId:       charizardEx.id,
      sellerId:     seller1.id,
      condition:    CardCondition.LIGHTLY_PLAYED,
      language:     CardLanguage.JA,
      price:        22.00,
      quantity:     1,
      status:       ListingStatus.ACTIVE,
      description:  "Versión japonesa, LP. Pequeñas marcas en los bordes.",
      freeShipping: false,
      shippingCost: 2.5,
      shippingDays: 3,
    },
    // Mewtwo ex — CardShark
    {
      cardId:       mewTwo.id,
      sellerId:     seller1.id,
      condition:    CardCondition.NEAR_MINT,
      language:     CardLanguage.EN,
      price:        89.50,
      quantity:     1,
      status:       ListingStatus.ACTIVE,
      description:  "Special Illustration Rare. NM, direct from booster.",
      freeShipping: true,
      shippingCost: 0,
      shippingDays: 2,
      isFoil:       true,
    },
    // Luffy — CardShark
    {
      cardId:       luffy.id,
      sellerId:     seller1.id,
      condition:    CardCondition.NEAR_MINT,
      language:     CardLanguage.JA,
      price:        8.00,
      quantity:     7,
      status:       ListingStatus.ACTIVE,
      description:  "Monkey D. Luffy Leader japonés. Near Mint, del booster.",
      freeShipping: false,
      shippingCost: 1.5,
      shippingDays: 4,
    },
    // Nadu MTG — MTGVault
    {
      cardId:       lotusField.id,
      sellerId:     seller2.id,
      condition:    CardCondition.NEAR_MINT,
      language:     CardLanguage.EN,
      price:        45.00,
      quantity:     2,
      status:       ListingStatus.ACTIVE,
      description:  "Nadu, Winged Wisdom. Carta baneada en Modern. NM.",
      freeShipping: true,
      shippingCost: 0,
      shippingDays: 2,
    },
    // Blue-Eyes — MTGVault (agotado, para probar ese estado)
    {
      cardId:       blueEyes.id,
      sellerId:     seller2.id,
      condition:    CardCondition.MODERATELY_PLAYED,
      language:     CardLanguage.ES,
      price:        12.50,
      quantity:     0,
      status:       ListingStatus.SOLD,
      description:  "Blue-Eyes White Dragon primera edición española.",
      freeShipping: false,
      shippingCost: 3.0,
      shippingDays: 5,
    },
    // Charizard ex foil — MTGVault
    {
      cardId:       charizardEx.id,
      sellerId:     seller2.id,
      condition:    CardCondition.NEAR_MINT,
      language:     CardLanguage.EN,
      price:        55.00,
      quantity:     1,
      status:       ListingStatus.ACTIVE,
      description:  "Versión ETB exclusiva. NM.",
      freeShipping: true,
      shippingCost: 0,
      shippingDays: 2,
      isFoil:       true,
    },
    // === Variantes adicionales para comparador (issue #23) ===

    // Charizard ex — CardShark (MP, ES) — tercera variante card 1
    {
      cardId:       charizardEx.id,
      sellerId:     seller1.id,
      condition:    CardCondition.MODERATELY_PLAYED,
      language:     CardLanguage.ES,
      price:        15.99,
      quantity:     2,
      status:       ListingStatus.ACTIVE,
      description:  "Charizard ex en español, MP. Marcas visibles pero carta completa.",
      freeShipping: false,
      shippingCost: 1.99,
      shippingDays: 5,
    },
    // Charizard ex — MTGVault (LP, EN) — cuarta variante card 1
    {
      cardId:       charizardEx.id,
      sellerId:     seller2.id,
      condition:    CardCondition.LIGHTLY_PLAYED,
      language:     CardLanguage.EN,
      price:        28.50,
      quantity:     1,
      status:       ListingStatus.ACTIVE,
      description:  "LP inglés, buen estado general.",
      freeShipping: false,
      shippingCost: 2.0,
      shippingDays: 3,
    },

    // Mewtwo ex — MTGVault (LP, EN) — segunda variante card 2
    {
      cardId:       mewTwo.id,
      sellerId:     seller2.id,
      condition:    CardCondition.LIGHTLY_PLAYED,
      language:     CardLanguage.EN,
      price:        72.00,
      quantity:     1,
      status:       ListingStatus.ACTIVE,
      description:  "Mewtwo ex SIR, LP. Pequeñas marcas en las esquinas.",
      freeShipping: false,
      shippingCost: 3.0,
      shippingDays: 3,
    },
    // Mewtwo ex — CardShark (NM, JA) — tercera variante card 2
    {
      cardId:       mewTwo.id,
      sellerId:     seller1.id,
      condition:    CardCondition.NEAR_MINT,
      language:     CardLanguage.JA,
      price:        65.00,
      quantity:     2,
      status:       ListingStatus.ACTIVE,
      description:  "Versión japonesa NM. Directo del sobre.",
      freeShipping: true,
      shippingCost: 0,
      shippingDays: 2,
    },
    // Mewtwo ex — MTGVault (MP, ES) — cuarta variante card 2
    {
      cardId:       mewTwo.id,
      sellerId:     seller2.id,
      condition:    CardCondition.MODERATELY_PLAYED,
      language:     CardLanguage.ES,
      price:        48.00,
      quantity:     1,
      status:       ListingStatus.ACTIVE,
      description:  "Español MP, precio reducido. Marcas de juego.",
      freeShipping: false,
      shippingCost: 2.5,
      shippingDays: 4,
    },
  ];

  for (const data of listings) {
    await prisma.cardListing.create({ data: data as Parameters<typeof prisma.cardListing.create>[0]["data"] });
  }

  console.log(`✓ ${listings.length} CardListings creados`);

  // -------------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------------

  const counts = {
    users:    await prisma.user.count(),
    sellers:  await prisma.sellerProfile.count(),
    sets:     await prisma.cardSet.count(),
    cards:    await prisma.card.count(),
    listings: await prisma.cardListing.count(),
  };

  console.log("\n📊 Estado de la BD:");
  console.table(counts);
  console.log("\n✅ Seed completado.");
  console.log("   Credenciales de acceso:");
  console.log("   buyer@cardbuy.dev   / buyer1234");
  console.log("   seller1@cardbuy.dev / seller1234  (CardShark TCG)");
  console.log("   seller2@cardbuy.dev / seller1234  (MTGVault)");
  console.log("   admin@cardbuy.dev   / admin1234");
}

main()
  .catch((e) => {
    console.error("❌ Seed falló:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
