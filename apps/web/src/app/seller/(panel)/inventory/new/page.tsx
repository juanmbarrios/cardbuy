import { ListingForm } from "@/components/seller/ListingForm";

export const metadata = { title: "Nuevo listing — CardBuy" };

export default function NewListingPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white mb-6">Nuevo listing</h1>
      <ListingForm />
    </div>
  );
}
