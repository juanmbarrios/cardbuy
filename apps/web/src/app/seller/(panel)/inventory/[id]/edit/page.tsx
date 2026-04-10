import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@cardbuy/db";
import { ListingForm } from "@/components/seller/ListingForm";

export const metadata = { title: "Editar listing — CardBuy" };

interface Props {
  params: { id: string };
}

export default async function EditListingPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const seller = await prisma.sellerProfile.findUnique({ where: { userId: session.user.id } });
  if (!seller) redirect("/seller/onboarding");

  const listing = await prisma.cardListing.findFirst({
    where: { id: params.id, sellerId: seller.id },
    include: { card: { select: { name: true } } },
  });

  if (!listing) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white mb-2">Editar listing</h1>
      <p className="text-sm text-slate-400 mb-6">{listing.card.name}</p>
      <ListingForm
        listingId={listing.id}
        initialData={{
          cardId: listing.cardId,
          cardName: listing.card.name,
          condition: listing.condition,
          language: listing.language,
          price: String(Number(listing.price)),
          quantity: String(listing.quantity),
          isFoil: listing.isFoil,
          isGraded: listing.isGraded,
          description: listing.description ?? "",
          shippingCost: String(Number(listing.shippingCost)),
          freeShipping: listing.freeShipping,
        }}
      />
    </div>
  );
}
